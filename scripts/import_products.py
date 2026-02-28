"""
Product Importer — Scrape product pages from URLs or import from CSV.

Usage:
    python scripts/import_products.py --urls "url1,url2,url3"
    python scripts/import_products.py --csv data/products.csv
    python scripts/import_products.py  # uses config/brand.json product_urls
"""

import argparse
import csv
import hashlib
import json
import os
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
PRODUCTS_FILE = DATA_DIR / "products.json"
CONFIG_DIR = PROJECT_ROOT / "config"


def load_existing_products() -> dict:
    """Load existing products keyed by id for deduplication."""
    if PRODUCTS_FILE.exists():
        with open(PRODUCTS_FILE, "r", encoding="utf-8") as f:
            products = json.load(f)
        return {p["id"]: p for p in products}
    return {}


def save_products(products_dict: dict):
    """Save products dict back to JSON file."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    products_list = list(products_dict.values())
    with open(PRODUCTS_FILE, "w", encoding="utf-8") as f:
        json.dump(products_list, f, indent=2, ensure_ascii=False)


def generate_product_id(name: str, sku: str = "") -> str:
    """Generate a stable product ID from name + sku."""
    key = f"{name.strip().lower()}:{sku.strip().lower()}"
    return hashlib.md5(key.encode()).hexdigest()[:12]


def load_tools_config() -> dict:
    """Load tools.json for scraper settings."""
    tools_path = CONFIG_DIR / "tools.json"
    if tools_path.exists():
        with open(tools_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"scraper": {"timeout": 30}}


def scrape_product_url(url: str, timeout: int = 30) -> dict | None:
    """Scrape a single product page and extract structured data."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                          "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        resp = requests.get(url, headers=headers, timeout=timeout)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        # Extract product name — try common selectors
        name = ""
        for selector in ["h1", "[data-product-title]", ".product-title", ".product-name",
                         '[itemprop="name"]', ".product__title"]:
            el = soup.select_one(selector)
            if el and el.get_text(strip=True):
                name = el.get_text(strip=True)
                break

        if not name:
            # Fallback to page title
            title_tag = soup.find("title")
            name = title_tag.get_text(strip=True) if title_tag else urlparse(url).path.split("/")[-1]

        # Extract price
        price = ""
        for selector in ['[itemprop="price"]', ".price", ".product-price", "[data-product-price]",
                         ".product__price", ".current-price"]:
            el = soup.select_one(selector)
            if el:
                price_text = el.get("content", "") or el.get_text(strip=True)
                if price_text:
                    price = price_text.strip()
                    break

        # Extract description
        description = ""
        for selector in ['[itemprop="description"]', ".product-description", ".product__description",
                         '[data-product-description]', ".description"]:
            el = soup.select_one(selector)
            if el:
                description = el.get_text(strip=True)[:500]
                break

        if not description:
            meta_desc = soup.find("meta", attrs={"name": "description"})
            if meta_desc and meta_desc.get("content"):
                description = meta_desc["content"][:500]

        # Extract main image
        image_url = ""
        for selector in ['[itemprop="image"]', ".product-image img", ".product__image img",
                         "[data-product-image]", ".product-featured-image img",
                         'meta[property="og:image"]']:
            el = soup.select_one(selector)
            if el:
                if el.name == "meta":
                    image_url = el.get("content", "")
                elif el.name == "img":
                    image_url = el.get("src", "") or el.get("data-src", "")
                else:
                    img = el.find("img") if el.name != "img" else el
                    if img:
                        image_url = img.get("src", "") or img.get("data-src", "")
                if image_url:
                    # Make absolute URL
                    if image_url.startswith("//"):
                        image_url = "https:" + image_url
                    elif image_url.startswith("/"):
                        parsed = urlparse(url)
                        image_url = f"{parsed.scheme}://{parsed.netloc}{image_url}"
                    break

        # Extract SKU
        sku = ""
        sku_el = soup.select_one('[itemprop="sku"]')
        if sku_el:
            sku = sku_el.get("content", "") or sku_el.get_text(strip=True)

        # Detect category from breadcrumbs or meta
        category = ""
        breadcrumbs = soup.select(".breadcrumb a, .breadcrumbs a, [itemtype*='BreadcrumbList'] a")
        if len(breadcrumbs) >= 2:
            category = breadcrumbs[-2].get_text(strip=True) if breadcrumbs[-1].get_text(strip=True) == name else breadcrumbs[-1].get_text(strip=True)

        product_id = generate_product_id(name, sku)

        return {
            "id": product_id,
            "name": name,
            "sku": sku,
            "category": category,
            "price": price,
            "description": description,
            "image_url": image_url,
            "source_url": url,
            "source": "url_scrape",
            "enhanced_images": [],
            "lifestyle_images": [],
        }

    except requests.RequestException as e:
        print(f"  [ERROR] Failed to scrape {url}: {e}")
        return None
    except Exception as e:
        print(f"  [ERROR] Unexpected error scraping {url}: {e}")
        return None


def import_from_urls(urls: list[str], timeout: int = 30) -> list[dict]:
    """Scrape products from a list of URLs."""
    products = []
    total = len(urls)

    for i, url in enumerate(urls, 1):
        url = url.strip()
        if not url:
            continue

        print(f"  [{i}/{total}] Scraping: {url}")
        product = scrape_product_url(url, timeout=timeout)
        if product:
            products.append(product)
            print(f"    -> {product['name']} (${product['price']})")
        else:
            print(f"    -> SKIPPED (scrape failed)")

        # Rate limiting
        if i < total:
            time.sleep(1)

    return products


def import_from_csv(csv_path: str) -> list[dict]:
    """Import products from a CSV file.

    Expected columns: sku, name, category, price, description, image_url
    """
    products = []
    csv_file = Path(csv_path)

    if not csv_file.exists():
        print(f"  [ERROR] CSV file not found: {csv_path}")
        return products

    with open(csv_file, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)

        # Normalize column headers (lowercase, strip whitespace)
        if reader.fieldnames:
            reader.fieldnames = [h.strip().lower().replace(" ", "_") for h in reader.fieldnames]

        for i, row in enumerate(reader, 1):
            name = row.get("name", "").strip()
            if not name:
                print(f"  [WARN] Row {i}: missing product name, skipping")
                continue

            sku = row.get("sku", "").strip()
            product_id = generate_product_id(name, sku)

            product = {
                "id": product_id,
                "name": name,
                "sku": sku,
                "category": row.get("category", "").strip(),
                "price": row.get("price", "").strip(),
                "description": row.get("description", "").strip(),
                "image_url": row.get("image_url", "").strip(),
                "source_url": "",
                "source": "csv_import",
                "enhanced_images": [],
                "lifestyle_images": [],
            }
            products.append(product)

    print(f"  Read {len(products)} products from CSV")
    return products


def main():
    parser = argparse.ArgumentParser(description="Import products from URLs or CSV")
    parser.add_argument("--urls", type=str, help="Comma-separated product URLs")
    parser.add_argument("--csv", type=str, help="Path to CSV file with product data")
    args = parser.parse_args()

    tools_config = load_tools_config()
    timeout = tools_config.get("scraper", {}).get("timeout", 30)

    existing = load_existing_products()
    url_count = 0
    csv_count = 0

    print("\n=== Product Importer ===\n")

    # Import from URLs
    if args.urls:
        urls = [u.strip() for u in args.urls.split(",") if u.strip()]
        print(f"Scraping {len(urls)} URLs...")
        url_products = import_from_urls(urls, timeout=timeout)
        for p in url_products:
            existing[p["id"]] = p
            url_count += 1
    else:
        # Check config for product_urls
        brand_path = CONFIG_DIR / "brand.json"
        if brand_path.exists():
            with open(brand_path, "r", encoding="utf-8") as f:
                brand = json.load(f)
            product_urls = brand.get("product_urls", [])
            if product_urls:
                print(f"Scraping {len(product_urls)} URLs from config/brand.json...")
                url_products = import_from_urls(product_urls, timeout=timeout)
                for p in url_products:
                    existing[p["id"]] = p
                    url_count += 1

    # Import from CSV
    if args.csv:
        print(f"\nImporting from CSV: {args.csv}")
        csv_products = import_from_csv(args.csv)
        for p in csv_products:
            existing[p["id"]] = p
            csv_count += 1

    # Save
    save_products(existing)

    total = url_count + csv_count
    print(f"\n--- Summary ---")
    print(f"Imported {total} products ({url_count} from URLs, {csv_count} from CSV)")
    print(f"Total products in catalog: {len(existing)}")
    print(f"Saved to: {PRODUCTS_FILE}")


if __name__ == "__main__":
    main()
