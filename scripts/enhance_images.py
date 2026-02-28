"""
Image Enhancer — Remove backgrounds and generate lifestyle scenes for product images.

Integrates with:
- Photoroom API for background removal
- Pebblely API for lifestyle scene generation

Usage:
    python scripts/enhance_images.py
    python scripts/enhance_images.py --product-id abc123  # single product
    python scripts/enhance_images.py --skip-backgrounds    # only lifestyle scenes
    python scripts/enhance_images.py --skip-lifestyle      # only background removal
"""

import argparse
import base64
import json
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
IMAGES_DIR = DATA_DIR / "images"
PRODUCTS_FILE = DATA_DIR / "products.json"
CONFIG_DIR = PROJECT_ROOT / "config"


def load_products() -> list[dict]:
    """Load products from data/products.json."""
    if not PRODUCTS_FILE.exists():
        print("[ERROR] No products.json found. Run import_products.py first.")
        return []
    with open(PRODUCTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_products(products: list[dict]):
    """Save updated products back to data/products.json."""
    with open(PRODUCTS_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)


def load_tools_config() -> dict:
    """Load tools.json config."""
    tools_path = CONFIG_DIR / "tools.json"
    if tools_path.exists():
        with open(tools_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def download_image(url: str, save_path: Path) -> bool:
    """Download an image from URL to local path."""
    try:
        resp = requests.get(url, timeout=30, stream=True)
        resp.raise_for_status()
        save_path.parent.mkdir(parents=True, exist_ok=True)
        with open(save_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"    [ERROR] Failed to download image: {e}")
        return False


def remove_background_photoroom(image_path: Path, output_path: Path, api_key: str) -> bool:
    """Use Photoroom API to remove image background."""
    try:
        with open(image_path, "rb") as f:
            image_data = f.read()

        resp = requests.post(
            "https://sdk.photoroom.com/v1/segment",
            headers={"x-api-key": api_key},
            files={"image_file": ("product.jpg", image_data, "image/jpeg")},
            timeout=60,
        )
        resp.raise_for_status()

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "wb") as f:
            f.write(resp.content)

        return True
    except requests.RequestException as e:
        print(f"    [ERROR] Photoroom API failed: {e}")
        return False


def generate_lifestyle_pebblely(image_path: Path, output_dir: Path,
                                 scenes_count: int, api_key: str) -> list[str]:
    """Use Pebblely API to generate lifestyle scene images."""
    generated = []
    themes = [
        "clean white marble surface with soft natural lighting",
        "modern kitchen countertop with plants in background",
        "minimalist wooden desk with warm ambient light",
        "outdoor garden table with greenery and sunlight",
        "luxury bathroom shelf with candles and towels",
    ]

    try:
        with open(image_path, "rb") as f:
            image_b64 = base64.b64encode(f.read()).decode("utf-8")

        for i in range(min(scenes_count, len(themes))):
            theme = themes[i]
            try:
                resp = requests.post(
                    "https://api.pebblely.com/api/v1/create-background",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "image": image_b64,
                        "theme": theme,
                        "size": "original",
                    },
                    timeout=120,
                )
                resp.raise_for_status()

                result = resp.json()
                image_data = result.get("data", "")
                if image_data:
                    out_path = output_dir / f"lifestyle_{i + 1}.png"
                    out_path.parent.mkdir(parents=True, exist_ok=True)
                    with open(out_path, "wb") as f:
                        f.write(base64.b64decode(image_data))
                    generated.append(str(out_path))
                    print(f"      Scene {i + 1}/{scenes_count}: {theme[:50]}...")
                else:
                    # Pebblely may return a URL instead
                    image_url = result.get("url", "")
                    if image_url:
                        out_path = output_dir / f"lifestyle_{i + 1}.png"
                        if download_image(image_url, out_path):
                            generated.append(str(out_path))
                            print(f"      Scene {i + 1}/{scenes_count}: {theme[:50]}...")

                # Rate limiting between API calls
                time.sleep(2)

            except requests.RequestException as e:
                print(f"      [ERROR] Scene {i + 1} failed: {e}")
                continue

    except Exception as e:
        print(f"    [ERROR] Pebblely processing failed: {e}")

    return generated


def main():
    parser = argparse.ArgumentParser(description="Enhance product images")
    parser.add_argument("--product-id", type=str, help="Process a single product by ID")
    parser.add_argument("--skip-backgrounds", action="store_true", help="Skip background removal")
    parser.add_argument("--skip-lifestyle", action="store_true", help="Skip lifestyle scene generation")
    args = parser.parse_args()

    tools = load_tools_config()
    products = load_products()
    if not products:
        return

    # Check API keys
    photoroom_key = os.getenv("PHOTOROOM_API_KEY", "")
    pebblely_key = os.getenv("PEBBLELY_API_KEY", "")

    bg_enabled = (tools.get("image_enhancement", {}).get("enabled", False)
                  and photoroom_key
                  and not args.skip_backgrounds)
    lifestyle_enabled = (tools.get("lifestyle_scenes", {}).get("enabled", False)
                         and pebblely_key
                         and not args.skip_lifestyle)
    scenes_per_product = tools.get("lifestyle_scenes", {}).get("scenes_per_product", 3)

    if not bg_enabled and not lifestyle_enabled:
        print("\n=== Image Enhancer ===\n")
        print("[WARN] No image enhancement tools configured or API keys missing.")
        print("  - Set PHOTOROOM_API_KEY in .env for background removal")
        print("  - Set PEBBLELY_API_KEY in .env for lifestyle scenes")
        print("  - Enable in config/tools.json")
        return

    print("\n=== Image Enhancer ===\n")
    print(f"Background removal: {'ON' if bg_enabled else 'OFF'}")
    print(f"Lifestyle scenes: {'ON' if lifestyle_enabled else 'OFF'} ({scenes_per_product} per product)")

    # Filter to target product if specified
    if args.product_id:
        products = [p for p in products if p["id"] == args.product_id]
        if not products:
            print(f"[ERROR] Product {args.product_id} not found")
            return

    clean_count = 0
    lifestyle_count = 0
    processed = 0
    total = len(products)

    all_products = load_products()
    products_by_id = {p["id"]: p for p in all_products}

    for i, product in enumerate(products, 1):
        pid = product["id"]
        name = product["name"]
        image_url = product.get("image_url", "")

        if not image_url:
            print(f"  [{i}/{total}] {name}: No image URL, skipping")
            continue

        print(f"  [{i}/{total}] {name}")
        product_img_dir = IMAGES_DIR / pid

        # Download original image
        original_path = product_img_dir / "original.jpg"
        if not original_path.exists():
            print(f"    Downloading original image...")
            if not download_image(image_url, original_path):
                continue

        # Background removal
        if bg_enabled:
            clean_path = product_img_dir / "clean.png"
            if not clean_path.exists():
                print(f"    Removing background (Photoroom)...")
                if remove_background_photoroom(original_path, clean_path, photoroom_key):
                    clean_count += 1
                    if pid in products_by_id:
                        products_by_id[pid].setdefault("enhanced_images", [])
                        if str(clean_path) not in products_by_id[pid]["enhanced_images"]:
                            products_by_id[pid]["enhanced_images"].append(str(clean_path))
            else:
                print(f"    Clean image already exists, skipping")
                clean_count += 1

        # Lifestyle scene generation
        if lifestyle_enabled:
            # Use clean image if available, otherwise original
            source_img = product_img_dir / "clean.png"
            if not source_img.exists():
                source_img = original_path

            lifestyle_dir = product_img_dir / "lifestyle"
            existing_lifestyle = list(lifestyle_dir.glob("*.png")) if lifestyle_dir.exists() else []

            if len(existing_lifestyle) >= scenes_per_product:
                print(f"    {len(existing_lifestyle)} lifestyle scenes already exist, skipping")
                lifestyle_count += len(existing_lifestyle)
            else:
                remaining = scenes_per_product - len(existing_lifestyle)
                print(f"    Generating {remaining} lifestyle scenes (Pebblely)...")
                new_scenes = generate_lifestyle_pebblely(
                    source_img, lifestyle_dir, remaining, pebblely_key
                )
                lifestyle_count += len(new_scenes)

                if pid in products_by_id:
                    products_by_id[pid].setdefault("lifestyle_images", [])
                    for scene_path in new_scenes:
                        if scene_path not in products_by_id[pid]["lifestyle_images"]:
                            products_by_id[pid]["lifestyle_images"].append(scene_path)

        processed += 1

        # Rate limiting between products
        if i < total:
            time.sleep(1)

    # Save updated products
    save_products(list(products_by_id.values()))

    print(f"\n--- Summary ---")
    print(f"Processed {processed}/{total} products")
    print(f"Enhanced {clean_count} product images (clean backgrounds)")
    print(f"Generated {lifestyle_count} lifestyle scenes")
    print(f"Images saved to: {IMAGES_DIR}")


if __name__ == "__main__":
    main()
