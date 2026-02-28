"""
UGC Video Generator — Generate AI UGC videos from scripts using Creatify API.

Takes generated UGC scripts and product images, sends them to Creatify
for AI avatar video generation.

Usage:
    python scripts/generate_ugc_videos.py
    python scripts/generate_ugc_videos.py --product-id abc123
    python scripts/generate_ugc_videos.py --dry-run  # preview without API calls
"""

import argparse
import hashlib
import json
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
UGC_SCRIPTS_FILE = DATA_DIR / "ugc_scripts.json"
UGC_VIDEOS_FILE = DATA_DIR / "ugc_videos.json"
PRODUCTS_FILE = DATA_DIR / "products.json"
CONFIG_DIR = PROJECT_ROOT / "config"

# Polling config for video generation
POLL_INTERVAL_SECONDS = 15
MAX_POLL_ATTEMPTS = 60  # 15 minutes max wait per video


def load_json(path: Path) -> dict | list:
    """Load a JSON file."""
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_json(path: Path, data):
    """Save data to JSON file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def script_to_text(script: dict) -> str:
    """Flatten a UGC script into plain text for the video API."""
    parts = []
    hook = script.get("hook", "")
    if hook:
        parts.append(hook)

    for scene in script.get("scenes", []):
        dialogue = scene.get("dialogue", "")
        if dialogue:
            parts.append(dialogue)

    cta = script.get("cta", "")
    if cta:
        parts.append(cta)

    return " ".join(parts)


def create_creatify_video(script_text: str, product_image_url: str,
                           avatar_id: str, api_key: str, api_base: str) -> dict | None:
    """Submit a video generation request to Creatify API."""
    try:
        payload = {
            "script": script_text,
            "avatar_id": avatar_id if avatar_id else None,
            "visual_style": "ugc",
        }

        if product_image_url:
            payload["media_url"] = product_image_url

        # Remove None values
        payload = {k: v for k, v in payload.items() if v is not None}

        resp = requests.post(
            f"{api_base}/videos",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=60,
        )
        resp.raise_for_status()
        return resp.json()

    except requests.RequestException as e:
        print(f"      [ERROR] Creatify create failed: {e}")
        if hasattr(e, "response") and e.response is not None:
            try:
                print(f"      Response: {e.response.json()}")
            except Exception:
                print(f"      Status: {e.response.status_code}")
        return None


def poll_creatify_video(video_id: str, api_key: str, api_base: str) -> dict | None:
    """Poll Creatify API until video is ready or timeout."""
    for attempt in range(MAX_POLL_ATTEMPTS):
        try:
            resp = requests.get(
                f"{api_base}/videos/{video_id}",
                headers={"Authorization": f"Bearer {api_key}"},
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()

            status = data.get("status", "unknown")

            if status in ("completed", "done", "ready"):
                return data
            elif status in ("failed", "error"):
                print(f"      [ERROR] Video generation failed: {data.get('error', 'unknown')}")
                return None
            else:
                # Still processing
                if attempt % 4 == 0:  # Print every ~60s
                    print(f"      Still rendering ({attempt * POLL_INTERVAL_SECONDS}s)...")
                time.sleep(POLL_INTERVAL_SECONDS)

        except requests.RequestException as e:
            print(f"      [ERROR] Poll failed: {e}")
            time.sleep(POLL_INTERVAL_SECONDS)

    print(f"      [ERROR] Timed out waiting for video (>{MAX_POLL_ATTEMPTS * POLL_INTERVAL_SECONDS}s)")
    return None


def generate_video_id(script_id: str) -> str:
    """Generate a unique video ID from the script ID."""
    return hashlib.md5(f"video:{script_id}".encode()).hexdigest()[:12]


def main():
    parser = argparse.ArgumentParser(description="Generate UGC videos from scripts")
    parser.add_argument("--product-id", type=str, help="Generate for a single product")
    parser.add_argument("--dry-run", action="store_true", help="Preview scripts without making API calls")
    args = parser.parse_args()

    # Load configs
    tools_config = load_json(CONFIG_DIR / "tools.json")
    ugc_config = tools_config.get("ugc_video", {})
    products = load_json(PRODUCTS_FILE)
    scripts = load_json(UGC_SCRIPTS_FILE)

    if isinstance(products, dict):
        products = [products]
    if isinstance(scripts, dict):
        scripts = [scripts]

    if not scripts:
        print("\n[ERROR] No UGC scripts found. Run generate_ugc_scripts.py first.")
        return

    # Check if Creatify is enabled
    if not ugc_config.get("enabled", False):
        print("\n[WARN] UGC video generation is disabled in config/tools.json")
        print("  Set ugc_video.enabled = true to enable.")
        return

    # Check API key
    api_key = os.getenv("CREATIFY_API_KEY", "")
    if not api_key and not args.dry_run:
        print("\n[ERROR] CREATIFY_API_KEY not set in .env")
        print("  Get a key at https://creatify.ai")
        return

    api_base = ugc_config.get("api_base", "https://api.creatify.ai/api")
    avatar_id = ugc_config.get("avatar_id", "")

    # Build product lookup
    products_by_id = {p.get("id", ""): p for p in products if isinstance(p, dict)}

    # Filter scripts if needed
    if args.product_id:
        scripts = [s for s in scripts if s.get("product_id") == args.product_id]
        if not scripts:
            print(f"\n[ERROR] No scripts found for product {args.product_id}")
            return

    # Load existing videos for deduplication
    existing_videos = load_json(UGC_VIDEOS_FILE)
    if isinstance(existing_videos, dict):
        existing_videos = []
    existing_ids = {v.get("id") for v in existing_videos}

    print("\n=== UGC Video Generator ===\n")
    if args.dry_run:
        print("[DRY RUN MODE — no API calls will be made]\n")
    print(f"Scripts to process: {len(scripts)}")
    print(f"Avatar ID: {avatar_id or '(default)'}")
    print()

    generated_count = 0
    skipped_count = 0
    error_count = 0

    for si, script in enumerate(scripts, 1):
        script_id = script.get("id", "")
        video_id = generate_video_id(script_id)
        pid = script.get("product_id", "")
        pname = script.get("product_name", "Unknown")
        ugc_type = script.get("ugc_type", "unknown")

        if video_id in existing_ids:
            skipped_count += 1
            continue

        print(f"  [{si}/{len(scripts)}] {pname} ({ugc_type})")

        # Get script text
        script_text = script_to_text(script)
        if not script_text:
            print(f"    [WARN] Empty script text, skipping")
            error_count += 1
            continue

        # Get product image
        product = products_by_id.get(pid, {})
        product_image = product.get("image_url", "")

        # Check for enhanced image
        enhanced = product.get("enhanced_images", [])
        if enhanced:
            product_image = enhanced[0]

        if args.dry_run:
            print(f"    Script ({len(script_text)} chars): \"{script_text[:100]}...\"")
            print(f"    Image: {product_image[:80] if product_image else '(none)'}")
            print(f"    Would generate video via Creatify")
            generated_count += 1
            continue

        # Create video
        print(f"    Submitting to Creatify...", end=" ", flush=True)
        create_result = create_creatify_video(
            script_text, product_image, avatar_id, api_key, api_base
        )

        if not create_result:
            error_count += 1
            print("FAILED")
            continue

        creatify_video_id = create_result.get("id", "")
        if not creatify_video_id:
            print(f"    [ERROR] No video ID in response: {create_result}")
            error_count += 1
            continue

        print(f"submitted (ID: {creatify_video_id})")
        print(f"    Waiting for render...", end=" ", flush=True)

        # Poll for completion
        video_result = poll_creatify_video(creatify_video_id, api_key, api_base)

        if video_result:
            video_url = video_result.get("video_url", "") or video_result.get("output_url", "")
            video_entry = {
                "id": video_id,
                "script_id": script_id,
                "product_id": pid,
                "product_name": pname,
                "ugc_type": ugc_type,
                "creatify_video_id": creatify_video_id,
                "video_url": video_url,
                "status": "completed",
                "duration_seconds": video_result.get("duration", script.get("total_duration_seconds", 0)),
            }
            existing_videos.append(video_entry)
            existing_ids.add(video_id)
            generated_count += 1
            print(f"DONE")
            if video_url:
                print(f"    URL: {video_url}")
        else:
            error_count += 1
            print("FAILED")

        # Rate limiting between video generations
        time.sleep(2)

    # Save all videos
    save_json(UGC_VIDEOS_FILE, existing_videos)

    print(f"\n--- Summary ---")
    if args.dry_run:
        print(f"[DRY RUN] Would generate {generated_count} videos")
    else:
        print(f"Generated {generated_count} UGC videos")
    print(f"Skipped {skipped_count} (already exist)")
    print(f"Failed {error_count}")
    print(f"Total UGC videos: {len(existing_videos)}")
    print(f"Saved to: {UGC_VIDEOS_FILE}")


if __name__ == "__main__":
    main()
