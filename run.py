"""
PPC + UGC Ad Generator — Main Orchestrator

Runs the full ad generation pipeline:
1. Import products (from URLs and/or CSV)
2. Enhance images (background removal + lifestyle scenes)
3. Generate PPC ad copy (per platform)
4. Generate UGC scripts (per angle)
5. Generate UGC videos (from scripts)
6. Export results (CSV/JSON/Google Sheets)

Usage:
    python run.py
    python run.py --skip-images     # skip image enhancement
    python run.py --skip-videos     # skip UGC video generation
    python run.py --ads-only        # only generate ad copy
    python run.py --scripts-only    # only generate UGC scripts
    python run.py --export-only     # only export existing data
"""

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

PROJECT_ROOT = Path(__file__).parent
CONFIG_DIR = PROJECT_ROOT / "config"
DATA_DIR = PROJECT_ROOT / "data"
SCRIPTS_DIR = PROJECT_ROOT / "scripts"


def load_json(path: Path) -> dict | list:
    """Load a JSON file."""
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def run_step(step_name: str, script_path: Path, extra_args: list[str] = None) -> bool:
    """Run a pipeline step as a subprocess."""
    print(f"\n{'='*60}")
    print(f"  STEP: {step_name}")
    print(f"{'='*60}")

    if not script_path.exists():
        print(f"  [ERROR] Script not found: {script_path}")
        return False

    cmd = [sys.executable, str(script_path)]
    if extra_args:
        cmd.extend(extra_args)

    try:
        result = subprocess.run(
            cmd,
            cwd=str(PROJECT_ROOT),
            timeout=600,  # 10 minute timeout per step
        )
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        print(f"  [ERROR] Step timed out after 10 minutes")
        return False
    except Exception as e:
        print(f"  [ERROR] Step failed: {e}")
        return False


def validate_config() -> bool:
    """Check that minimum config exists."""
    brand = load_json(CONFIG_DIR / "brand.json")
    if isinstance(brand, dict) and not brand.get("business_name"):
        print("\n[WARN] config/brand.json has no business_name set.")
        print("  Run Claude Code setup (Phase 1) or manually edit config/brand.json")
        print("  Continuing with defaults...\n")
    return True


def print_pre_run_summary():
    """Show what will be processed before starting."""
    brand = load_json(CONFIG_DIR / "brand.json")
    platforms = load_json(CONFIG_DIR / "platforms.json")
    tools = load_json(CONFIG_DIR / "tools.json")

    if isinstance(brand, dict):
        business = brand.get("business_name", "(not set)")
        tone = brand.get("tone", "friendly-professional")
    else:
        business = "(not set)"
        tone = "friendly-professional"

    if isinstance(platforms, dict):
        enabled = [name for name, cfg in platforms.get("platforms", {}).items() if cfg.get("enabled")]
        ugc_types = platforms.get("ugc_types", [])
        output_format = platforms.get("output_format", "csv")
    else:
        enabled = []
        ugc_types = []
        output_format = "csv"

    if isinstance(tools, dict):
        bg_tool = tools.get("image_enhancement", {}).get("provider", "none")
        bg_enabled = tools.get("image_enhancement", {}).get("enabled", False)
        scene_tool = tools.get("lifestyle_scenes", {}).get("provider", "none")
        scene_enabled = tools.get("lifestyle_scenes", {}).get("enabled", False)
        video_tool = tools.get("ugc_video", {}).get("provider", "none")
        video_enabled = tools.get("ugc_video", {}).get("enabled", False)
    else:
        bg_tool = bg_enabled = scene_tool = scene_enabled = video_tool = video_enabled = False

    # Check existing products
    products_file = DATA_DIR / "products.json"
    product_count = 0
    if products_file.exists():
        products = load_json(products_file)
        product_count = len(products) if isinstance(products, list) else 0

    print("\n" + "="*60)
    print("  PPC + UGC Ad Generator")
    print("="*60)
    print(f"\n  Brand:      {business}")
    print(f"  Tone:       {tone}")
    print(f"  Products:   {product_count} in catalog")
    print(f"  Platforms:  {', '.join(enabled) if enabled else '(none enabled)'}")
    print(f"  UGC types:  {', '.join(ugc_types) if ugc_types else '(none)'}")
    print(f"  Images:     bg={bg_tool if bg_enabled else 'OFF'}, scenes={scene_tool if scene_enabled else 'OFF'}")
    print(f"  Videos:     {video_tool if video_enabled else 'OFF'}")
    print(f"  Export:     {output_format}")
    print()


def main():
    parser = argparse.ArgumentParser(description="PPC + UGC Ad Generator Pipeline")
    parser.add_argument("--skip-images", action="store_true", help="Skip image enhancement step")
    parser.add_argument("--skip-videos", action="store_true", help="Skip UGC video generation step")
    parser.add_argument("--ads-only", action="store_true", help="Only generate ad copy (skip images, UGC, videos)")
    parser.add_argument("--scripts-only", action="store_true", help="Only generate UGC scripts")
    parser.add_argument("--export-only", action="store_true", help="Only export existing data")
    parser.add_argument("--urls", type=str, help="Product URLs to import (comma-separated)")
    parser.add_argument("--csv", type=str, help="CSV file path for product import")
    args = parser.parse_args()

    start_time = time.time()

    validate_config()
    print_pre_run_summary()

    results = {}

    # Determine which steps to run
    run_import = not args.export_only
    run_images = not args.skip_images and not args.ads_only and not args.scripts_only and not args.export_only
    run_ads = not args.scripts_only and not args.export_only
    run_ugc_scripts = not args.ads_only and not args.export_only
    run_ugc_videos = (not args.skip_videos and not args.ads_only
                      and not args.scripts_only and not args.export_only)
    run_export = True  # always export at the end

    # Step 1: Import Products
    if run_import:
        import_args = []
        if args.urls:
            import_args.extend(["--urls", args.urls])
        if args.csv:
            import_args.extend(["--csv", args.csv])

        success = run_step("Import Products", SCRIPTS_DIR / "import_products.py", import_args)
        results["import"] = "OK" if success else "FAILED"

        if not success and not (DATA_DIR / "products.json").exists():
            print("\n[FATAL] No products to work with. Stopping pipeline.")
            return

    # Step 2: Enhance Images
    if run_images:
        success = run_step("Enhance Images", SCRIPTS_DIR / "enhance_images.py")
        results["images"] = "OK" if success else "SKIPPED"
    else:
        results["images"] = "SKIPPED"

    # Step 3: Generate Ad Copy
    if run_ads:
        success = run_step("Generate Ad Copy", SCRIPTS_DIR / "generate_ads.py")
        results["ads"] = "OK" if success else "FAILED"
    else:
        results["ads"] = "SKIPPED"

    # Step 4: Generate UGC Scripts
    if run_ugc_scripts:
        success = run_step("Generate UGC Scripts", SCRIPTS_DIR / "generate_ugc_scripts.py")
        results["ugc_scripts"] = "OK" if success else "FAILED"
    else:
        results["ugc_scripts"] = "SKIPPED"

    # Step 5: Generate UGC Videos
    if run_ugc_videos:
        success = run_step("Generate UGC Videos", SCRIPTS_DIR / "generate_ugc_videos.py")
        results["ugc_videos"] = "OK" if success else "FAILED"
    else:
        results["ugc_videos"] = "SKIPPED"

    # Step 6: Export
    if run_export:
        success = run_step("Export Results", SCRIPTS_DIR / "export.py")
        results["export"] = "OK" if success else "FAILED"

    # Final summary
    elapsed = time.time() - start_time
    minutes = int(elapsed // 60)
    seconds = int(elapsed % 60)

    print("\n" + "="*60)
    print("  PIPELINE COMPLETE")
    print("="*60)
    print(f"\n  Time: {minutes}m {seconds}s\n")
    print("  Results:")
    for step, status in results.items():
        icon = "[+]" if status == "OK" else "[-]" if status == "SKIPPED" else "[!]"
        print(f"    {icon} {step}: {status}")

    # Count outputs
    ads = load_json(DATA_DIR / "ad_copies.json")
    scripts = load_json(DATA_DIR / "ugc_scripts.json")
    videos = load_json(DATA_DIR / "ugc_videos.json")

    ad_count = len(ads) if isinstance(ads, list) else 0
    script_count = len(scripts) if isinstance(scripts, list) else 0
    video_count = len(videos) if isinstance(videos, list) else 0

    print(f"\n  Outputs:")
    print(f"    Ad copies:    {ad_count}")
    print(f"    UGC scripts:  {script_count}")
    print(f"    UGC videos:   {video_count}")
    print(f"\n  Data directory: {DATA_DIR}")

    # Check for failures
    failures = [step for step, status in results.items() if status == "FAILED"]
    if failures:
        print(f"\n  [!] {len(failures)} step(s) had errors: {', '.join(failures)}")
        print("  Re-run individual steps to retry failed ones.")
    else:
        print("\n  All steps completed successfully.")


if __name__ == "__main__":
    main()
