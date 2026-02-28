"""
Ad Copy Generator — Generate platform-ready PPC ad copy using AI.

Generates ad variations for each product x platform combination,
respecting character limits and brand voice.

Usage:
    python scripts/generate_ads.py
    python scripts/generate_ads.py --product-id abc123
    python scripts/generate_ads.py --platform meta
"""

import argparse
import hashlib
import json
import os
import sys
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
PRODUCTS_FILE = DATA_DIR / "products.json"
AD_COPIES_FILE = DATA_DIR / "ad_copies.json"
CONFIG_DIR = PROJECT_ROOT / "config"


def load_json(path: Path) -> dict | list:
    """Load a JSON file, return empty dict/list on error."""
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_json(path: Path, data):
    """Save data to JSON file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_platform_prompt(platform: str, char_limits: dict, brand: dict, product: dict,
                        variation_num: int) -> str:
    """Build the ad copy generation prompt for a specific platform."""
    tone_descriptions = {
        "friendly-professional": "Warm and approachable but credible. Conversational yet trustworthy.",
        "casual-bold": "Playful, punchy, internet-native. Use slang where appropriate. High energy.",
        "luxury-minimal": "Understated elegance. Less is more. Sophisticated word choice.",
        "technical-authority": "Data-driven and expert. Lead with specs, results, and proof.",
    }

    tone = brand.get("tone", "friendly-professional")
    tone_desc = tone_descriptions.get(tone, tone_descriptions["friendly-professional"])

    words_to_avoid = brand.get("words_to_avoid", [])
    avoid_str = ", ".join(words_to_avoid) if words_to_avoid else "none specified"

    competitors = brand.get("competitors", [])
    competitors_str = ", ".join(competitors) if competitors else "not specified"

    # Platform-specific formatting instructions
    platform_formats = {
        "meta": f"""Generate a Meta (Facebook/Instagram) ad with these fields:
- headline: max {char_limits.get('headline', 40)} characters
- primary_text: max {char_limits.get('primary_text', 125)} characters
- description: max {char_limits.get('description', 30)} characters
- cta: one of [Shop Now, Learn More, Sign Up, Buy Now, Get Offer]

The primary_text should hook attention immediately. Use emotional triggers.
Headlines should be benefit-driven, not feature-driven.""",

        "google": f"""Generate a Google Ads text ad with these fields:
- headline: max {char_limits.get('headline', 30)} characters
- description_line_1: max {char_limits.get('description_line_1', 90)} characters
- description_line_2: max {char_limits.get('description_line_2', 90)} characters
- cta: embedded naturally in description (no separate CTA field)

Headlines must be punchy and keyword-rich. Use power words.
Descriptions should include a clear value proposition and call to action.""",

        "tiktok": f"""Generate a TikTok ad with these fields:
- ad_text: max {char_limits.get('ad_text', 100)} characters
- caption: max {char_limits.get('caption', 150)} characters
- cta: one of [Shop Now, Learn More, Download, Sign Up]

Keep it casual and native to TikTok. Use trending language patterns.
The ad_text should feel like organic content, not an ad.""",

        "pinterest": f"""Generate a Pinterest ad with these fields:
- title: max {char_limits.get('title', 100)} characters
- description: max {char_limits.get('description', 500)} characters
- cta: one of [Shop, Learn More, Visit, Save]

Focus on aspiration and discovery. Pinterest users are planners.
Use descriptive, search-friendly language. Include relevant lifestyle context.""",
    }

    angles = [
        "benefit-focused (lead with what the customer gains)",
        "problem-solution (name the pain, offer the fix)",
        "social-proof (imply popularity or trust)",
        "urgency (limited time, scarcity, FOMO)",
        "curiosity (tease a result without revealing everything)",
        "lifestyle (paint a picture of life with this product)",
    ]
    angle = angles[(variation_num - 1) % len(angles)]

    return f"""You are an expert PPC ad copywriter. Generate ONE ad variation.

BRAND CONTEXT:
- Brand: {brand.get('business_name', 'the brand')}
- Tone: {tone_desc}
- USP: {brand.get('usp', 'not specified')}
- Target audience: {brand.get('target_audience', 'not specified')}
- Competitors to differentiate from: {competitors_str}
- Words to NEVER use: {avoid_str}

PRODUCT:
- Name: {product.get('name', '')}
- Price: {product.get('price', '')}
- Category: {product.get('category', '')}
- Description: {product.get('description', '')}

PLATFORM & FORMAT:
{platform_formats.get(platform, platform_formats['meta'])}

ANGLE FOR THIS VARIATION:
Use a {angle} approach.

RULES:
1. Strictly respect ALL character limits. Count characters carefully.
2. Never use any words from the "words to avoid" list.
3. Match the brand tone exactly.
4. Make it platform-native (Meta ads feel different from Google ads).
5. This is variation #{variation_num} — make it distinct from other variations.

Return ONLY valid JSON with the ad fields. No explanation, no markdown fences."""


def call_openrouter(prompt: str, model: str, api_key: str) -> dict | None:
    """Call OpenRouter API to generate ad copy."""
    try:
        resp = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": "You are an expert PPC ad copywriter. Always return valid JSON only."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.8,
                "max_tokens": 500,
            },
            timeout=60,
        )
        resp.raise_for_status()
        result = resp.json()
        content = result["choices"][0]["message"]["content"].strip()

        # Strip markdown code fences if present
        if content.startswith("```"):
            lines = content.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            content = "\n".join(lines)

        return json.loads(content)
    except json.JSONDecodeError as e:
        print(f"      [ERROR] Invalid JSON from API: {e}")
        return None
    except requests.RequestException as e:
        print(f"      [ERROR] OpenRouter API failed: {e}")
        return None
    except (KeyError, IndexError) as e:
        print(f"      [ERROR] Unexpected API response format: {e}")
        return None


def generate_ad_id(product_id: str, platform: str, variation: int) -> str:
    """Generate a unique ad copy ID."""
    key = f"{product_id}:{platform}:{variation}"
    return hashlib.md5(key.encode()).hexdigest()[:12]


def main():
    parser = argparse.ArgumentParser(description="Generate PPC ad copy")
    parser.add_argument("--product-id", type=str, help="Generate for a single product")
    parser.add_argument("--platform", type=str, help="Generate for a single platform")
    args = parser.parse_args()

    # Load configs
    brand = load_json(CONFIG_DIR / "brand.json")
    platforms_config = load_json(CONFIG_DIR / "platforms.json")
    tools_config = load_json(CONFIG_DIR / "tools.json")
    products = load_json(PRODUCTS_FILE)

    if not products:
        print("\n[ERROR] No products found. Run import_products.py first.")
        return

    if isinstance(products, dict):
        products = [products]

    # Check API key
    api_key = os.getenv("OPENROUTER_API_KEY", "")
    if not api_key:
        print("\n[ERROR] OPENROUTER_API_KEY not set in .env")
        print("  Get a key at https://openrouter.ai/keys")
        return

    model = tools_config.get("ad_copy", {}).get("model", "deepseek/deepseek-chat")

    # Filter platforms and products
    all_platforms = platforms_config.get("platforms", {})
    enabled_platforms = {
        name: config for name, config in all_platforms.items()
        if config.get("enabled", False) and (not args.platform or name == args.platform)
    }

    if not enabled_platforms:
        print("\n[ERROR] No platforms enabled in config/platforms.json")
        return

    if args.product_id:
        products = [p for p in products if p.get("id") == args.product_id]
        if not products:
            print(f"\n[ERROR] Product {args.product_id} not found")
            return

    # Load existing ad copies for deduplication
    existing_ads = load_json(AD_COPIES_FILE)
    if isinstance(existing_ads, dict):
        existing_ads = []
    existing_ids = {ad.get("id") for ad in existing_ads}

    print("\n=== Ad Copy Generator ===\n")
    print(f"Model: {model}")
    print(f"Products: {len(products)}")
    print(f"Platforms: {', '.join(enabled_platforms.keys())}")

    total_variations = sum(
        p_config.get("variations_per_product", 4)
        for p_config in enabled_platforms.values()
    ) * len(products)
    print(f"Total ad copies to generate: {total_variations}")
    print()

    generated_count = 0
    skipped_count = 0
    error_count = 0

    for pi, product in enumerate(products, 1):
        pid = product.get("id", "")
        pname = product.get("name", "Unknown")

        print(f"Product [{pi}/{len(products)}]: {pname}")

        for platform_name, platform_config in enabled_platforms.items():
            variations = platform_config.get("variations_per_product", 4)
            char_limits = platform_config.get("char_limits", {})

            for v in range(1, variations + 1):
                ad_id = generate_ad_id(pid, platform_name, v)

                if ad_id in existing_ids:
                    skipped_count += 1
                    continue

                print(f"  {platform_name} v{v}...", end=" ", flush=True)

                prompt = get_platform_prompt(
                    platform_name, char_limits, brand, product, v
                )
                result = call_openrouter(prompt, model, api_key)

                if result:
                    ad_entry = {
                        "id": ad_id,
                        "product_id": pid,
                        "product_name": pname,
                        "platform": platform_name,
                        "variation": v,
                        "status": "generated",
                        **result,
                    }
                    existing_ads.append(ad_entry)
                    existing_ids.add(ad_id)
                    generated_count += 1
                    print("OK")

                    # Show a sample of what was generated
                    if "headline" in result:
                        print(f"    headline: {result['headline']}")
                    if "primary_text" in result:
                        print(f"    text: {result['primary_text'][:80]}...")
                    elif "description_line_1" in result:
                        print(f"    desc: {result['description_line_1'][:80]}...")
                else:
                    error_count += 1
                    print("FAILED")

                # Rate limiting
                time.sleep(0.5)

    # Save all ad copies
    save_json(AD_COPIES_FILE, existing_ads)

    print(f"\n--- Summary ---")
    print(f"Generated {generated_count} new ad copies")
    print(f"Skipped {skipped_count} (already exist)")
    print(f"Failed {error_count}")
    print(f"Total ad copies: {len(existing_ads)}")
    platforms_used = len(enabled_platforms)
    print(f"Across {platforms_used} platforms for {len(products)} products")
    print(f"Saved to: {AD_COPIES_FILE}")


if __name__ == "__main__":
    main()
