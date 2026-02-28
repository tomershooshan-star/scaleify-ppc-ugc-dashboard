"""
Exporter — Export generated ad copies and UGC scripts to CSV, JSON, or Google Sheets.

Output format is determined by platforms.json "output_format" setting.

Usage:
    python scripts/export.py
    python scripts/export.py --format csv
    python scripts/export.py --format json
    python scripts/export.py --format google_sheets
"""

import argparse
import csv
import json
import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
EXPORTS_DIR = DATA_DIR / "exports"
AD_COPIES_FILE = DATA_DIR / "ad_copies.json"
UGC_SCRIPTS_FILE = DATA_DIR / "ugc_scripts.json"
UGC_VIDEOS_FILE = DATA_DIR / "ugc_videos.json"
CONFIG_DIR = PROJECT_ROOT / "config"


def load_json(path: Path) -> list:
    """Load a JSON file, return empty list on error."""
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    return []


def export_ads_to_csv(ads: list[dict], output_dir: Path) -> list[str]:
    """Export ad copies to separate CSV files per platform."""
    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    files_created = []

    # Group ads by platform
    by_platform: dict[str, list[dict]] = {}
    for ad in ads:
        platform = ad.get("platform", "unknown")
        by_platform.setdefault(platform, []).append(ad)

    # Platform-specific column mappings
    platform_columns = {
        "meta": ["product_name", "headline", "primary_text", "description", "cta", "variation", "status"],
        "google": ["product_name", "headline", "description_line_1", "description_line_2", "variation", "status"],
        "tiktok": ["product_name", "ad_text", "caption", "cta", "variation", "status"],
        "pinterest": ["product_name", "title", "description", "cta", "variation", "status"],
    }

    for platform, platform_ads in by_platform.items():
        filename = f"ads_{platform}_{timestamp}.csv"
        filepath = output_dir / filename

        columns = platform_columns.get(platform, ["product_name", "headline", "description", "cta", "variation", "status"])

        with open(filepath, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore")
            writer.writeheader()
            for ad in platform_ads:
                writer.writerow(ad)

        files_created.append(str(filepath))
        print(f"  {platform}: {len(platform_ads)} ads -> {filename}")

    return files_created


def export_ugc_scripts_to_csv(scripts: list[dict], output_dir: Path) -> str | None:
    """Export UGC scripts to a single CSV file."""
    if not scripts:
        return None

    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"ugc_scripts_{timestamp}.csv"
    filepath = output_dir / filename

    columns = ["product_name", "ugc_type", "hook", "cta", "total_duration_seconds",
               "scene_count", "full_script", "music_suggestion", "status"]

    with open(filepath, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()

        for script in scripts:
            scenes = script.get("scenes", [])
            # Flatten scenes into readable text
            scene_texts = []
            for scene in scenes:
                s_num = scene.get("scene_number", "")
                s_dialogue = scene.get("dialogue", "")
                s_desc = scene.get("description", "")
                scene_texts.append(f"[Scene {s_num}] {s_desc} | Dialogue: {s_dialogue}")

            row = {
                "product_name": script.get("product_name", ""),
                "ugc_type": script.get("ugc_type", ""),
                "hook": script.get("hook", ""),
                "cta": script.get("cta", ""),
                "total_duration_seconds": script.get("total_duration_seconds", ""),
                "scene_count": len(scenes),
                "full_script": " || ".join(scene_texts),
                "music_suggestion": script.get("music_suggestion", ""),
                "status": script.get("status", ""),
            }
            writer.writerow(row)

    print(f"  UGC scripts: {len(scripts)} scripts -> {filename}")
    return str(filepath)


def export_ugc_videos_to_csv(videos: list[dict], output_dir: Path) -> str | None:
    """Export UGC video metadata to CSV."""
    if not videos:
        return None

    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"ugc_videos_{timestamp}.csv"
    filepath = output_dir / filename

    columns = ["product_name", "ugc_type", "video_url", "duration_seconds", "status"]

    with open(filepath, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        for video in videos:
            writer.writerow({
                "product_name": video.get("product_name", ""),
                "ugc_type": video.get("ugc_type", ""),
                "video_url": video.get("video_url", ""),
                "duration_seconds": video.get("duration_seconds", ""),
                "status": video.get("status", ""),
            })

    print(f"  UGC videos: {len(videos)} videos -> {filename}")
    return str(filepath)


def export_to_json(ads: list[dict], scripts: list[dict], videos: list[dict],
                   output_dir: Path) -> str:
    """Export everything to a single consolidated JSON file."""
    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"full_export_{timestamp}.json"
    filepath = output_dir / filename

    export_data = {
        "exported_at": datetime.now().isoformat(),
        "summary": {
            "total_ad_copies": len(ads),
            "total_ugc_scripts": len(scripts),
            "total_ugc_videos": len(videos),
            "platforms": list(set(ad.get("platform", "") for ad in ads)),
            "ugc_types": list(set(s.get("ugc_type", "") for s in scripts)),
        },
        "ad_copies": ads,
        "ugc_scripts": scripts,
        "ugc_videos": videos,
    }

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False)

    print(f"  Full export -> {filename}")
    return str(filepath)


def export_to_google_sheets(ads: list[dict], scripts: list[dict], videos: list[dict]) -> bool:
    """Export to Google Sheets (requires credentials)."""
    creds_path = os.getenv("GOOGLE_SHEETS_CREDENTIALS", "")
    if not creds_path or not Path(creds_path).exists():
        print("  [ERROR] Google Sheets export requires GOOGLE_SHEETS_CREDENTIALS in .env")
        print("  Set GOOGLE_SHEETS_CREDENTIALS=path/to/credentials.json")
        return False

    try:
        # Optional dependency — only import if needed
        import gspread
        from google.oauth2.service_account import Credentials
    except ImportError:
        print("  [ERROR] Google Sheets export requires: pip install gspread google-auth")
        return False

    try:
        scopes = [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive",
        ]
        creds = Credentials.from_service_account_file(creds_path, scopes=scopes)
        gc = gspread.authorize(creds)

        # Create a new spreadsheet
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        sheet_title = f"Ad Generation Export - {timestamp}"
        spreadsheet = gc.create(sheet_title)

        # Ad copies sheet
        if ads:
            ws_ads = spreadsheet.sheet1
            ws_ads.update_title("Ad Copies")

            # Determine all unique keys from ads
            all_keys = []
            for ad in ads:
                for key in ad.keys():
                    if key not in all_keys and key not in ("id", "product_id"):
                        all_keys.append(key)

            # Write header
            ws_ads.update("A1", [all_keys])

            # Write data
            rows = []
            for ad in ads:
                row = [str(ad.get(k, "")) for k in all_keys]
                rows.append(row)
            if rows:
                ws_ads.update(f"A2:Z{len(rows) + 1}", rows)

        # UGC scripts sheet
        if scripts:
            ws_scripts = spreadsheet.add_worksheet("UGC Scripts", rows=len(scripts) + 1, cols=10)
            headers = ["product_name", "ugc_type", "hook", "cta", "total_duration_seconds", "status"]
            ws_scripts.update("A1", [headers])

            rows = []
            for s in scripts:
                row = [str(s.get(k, "")) for k in headers]
                rows.append(row)
            if rows:
                ws_scripts.update(f"A2:Z{len(rows) + 1}", rows)

        # UGC videos sheet
        if videos:
            ws_videos = spreadsheet.add_worksheet("UGC Videos", rows=len(videos) + 1, cols=10)
            headers = ["product_name", "ugc_type", "video_url", "duration_seconds", "status"]
            ws_videos.update("A1", [headers])

            rows = []
            for v in videos:
                row = [str(v.get(k, "")) for k in headers]
                rows.append(row)
            if rows:
                ws_videos.update(f"A2:Z{len(rows) + 1}", rows)

        print(f"  Google Sheet created: {spreadsheet.url}")
        return True

    except Exception as e:
        print(f"  [ERROR] Google Sheets export failed: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Export generated ad content")
    parser.add_argument("--format", type=str, choices=["csv", "json", "google_sheets"],
                        help="Override output format from config")
    args = parser.parse_args()

    # Load config
    platforms_config = load_json(CONFIG_DIR / "platforms.json")
    if isinstance(platforms_config, list):
        platforms_config = {}
    output_format = args.format or platforms_config.get("output_format", "csv")

    # Load data
    ads = load_json(AD_COPIES_FILE)
    scripts = load_json(UGC_SCRIPTS_FILE)
    videos = load_json(UGC_VIDEOS_FILE)

    if not ads and not scripts and not videos:
        print("\n[ERROR] No data to export. Run generate_ads.py and/or generate_ugc_scripts.py first.")
        return

    print("\n=== Exporter ===\n")
    print(f"Format: {output_format}")
    print(f"Ad copies: {len(ads)}")
    print(f"UGC scripts: {len(scripts)}")
    print(f"UGC videos: {len(videos)}")
    print()

    files_created = []

    if output_format == "csv":
        if ads:
            ad_files = export_ads_to_csv(ads, EXPORTS_DIR)
            files_created.extend(ad_files)
        if scripts:
            script_file = export_ugc_scripts_to_csv(scripts, EXPORTS_DIR)
            if script_file:
                files_created.append(script_file)
        if videos:
            video_file = export_ugc_videos_to_csv(videos, EXPORTS_DIR)
            if video_file:
                files_created.append(video_file)

    elif output_format == "json":
        json_file = export_to_json(ads, scripts, videos, EXPORTS_DIR)
        files_created.append(json_file)

    elif output_format == "google_sheets":
        success = export_to_google_sheets(ads, scripts, videos)
        if not success:
            # Fallback to CSV
            print("\n  Falling back to CSV export...")
            if ads:
                ad_files = export_ads_to_csv(ads, EXPORTS_DIR)
                files_created.extend(ad_files)
            if scripts:
                script_file = export_ugc_scripts_to_csv(scripts, EXPORTS_DIR)
                if script_file:
                    files_created.append(script_file)

    print(f"\n--- Summary ---")
    print(f"Exported to {output_format}: {len(files_created)} file(s)")
    for fp in files_created:
        print(f"  -> {fp}")


if __name__ == "__main__":
    main()
