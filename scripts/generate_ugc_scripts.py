"""
UGC Script Generator — Generate UGC video scripts across multiple angles.

Supported UGC types:
- review: Product review with genuine reaction
- unboxing: First-look unboxing experience
- problem-solution: Pain point → product fix
- tutorial: How-to / getting started
- comparison: This vs that
- lifestyle: Day-in-the-life featuring the product

Usage:
    python scripts/generate_ugc_scripts.py
    python scripts/generate_ugc_scripts.py --product-id abc123
    python scripts/generate_ugc_scripts.py --type review
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
PRODUCTS_FILE = DATA_DIR / "products.json"
UGC_SCRIPTS_FILE = DATA_DIR / "ugc_scripts.json"
CONFIG_DIR = PROJECT_ROOT / "config"


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


def get_ugc_prompt(ugc_type: str, brand: dict, product: dict) -> str:
    """Build the UGC script generation prompt for a specific angle."""
    tone_descriptions = {
        "friendly-professional": "Warm, genuine, conversational. Like a trusted friend recommending something.",
        "casual-bold": "Energetic, expressive, internet-native. Like a popular creator being real.",
        "luxury-minimal": "Calm, aspirational, refined. Like an influencer curating their lifestyle.",
        "technical-authority": "Knowledgeable, detailed, credible. Like an expert doing a deep dive.",
    }

    tone = brand.get("tone", "friendly-professional")
    tone_desc = tone_descriptions.get(tone, tone_descriptions["friendly-professional"])

    type_instructions = {
        "review": """Create a PRODUCT REVIEW UGC script.
Structure:
1. Hook (3-5 seconds): Grab attention with a bold claim or reaction
2. First impression (5-10 seconds): Initial reaction to the product
3. Key features (15-20 seconds): 2-3 standout features with demonstrations
4. Personal experience (10-15 seconds): How it fits into their life
5. Verdict + CTA (5-10 seconds): Final recommendation

Total target: 45-60 seconds
Style: Authentic, unscripted feel. Use "I" perspective. Show real reactions.""",

        "unboxing": """Create an UNBOXING UGC script.
Structure:
1. Hook (3-5 seconds): Excitement/anticipation before opening
2. First look (10-15 seconds): Opening and initial reaction
3. Closer look (15-20 seconds): Examining details, texture, quality
4. First use (10-15 seconds): Trying it out for the first time
5. Final thoughts + CTA (5-10 seconds): Quick verdict

Total target: 45-60 seconds
Style: Genuine surprise and discovery. Camera should be close-up for details.""",

        "problem-solution": """Create a PROBLEM/SOLUTION UGC script.
Structure:
1. Hook - The Problem (5-8 seconds): State a relatable pain point dramatically
2. Failed solutions (5-10 seconds): Brief mention of things that didn't work
3. Discovery (5 seconds): "Then I found [product]"
4. Solution demo (15-20 seconds): Show how the product solves the problem
5. Results + CTA (10 seconds): Before/after or outcome

Total target: 45-60 seconds
Style: Storytelling arc. Start frustrated, end satisfied. Make the problem feel real.""",

        "tutorial": """Create a TUTORIAL/HOW-TO UGC script.
Structure:
1. Hook (3-5 seconds): "Here's how to [achieve result] with [product]"
2. Step 1 (10 seconds): First step with visual demonstration
3. Step 2 (10 seconds): Second step
4. Step 3 (10 seconds): Third step / final result
5. Results + CTA (10 seconds): Show the finished outcome

Total target: 40-50 seconds
Style: Clear, instructional, but still personality-driven. Show don't just tell.""",

        "comparison": """Create a COMPARISON UGC script.
Structure:
1. Hook (5 seconds): "I compared [product] to [alternative] and..."
2. Side by side (15-20 seconds): Direct comparison on 2-3 key factors
3. Winner reveal (10 seconds): Which one won and why
4. Final take + CTA (5-10 seconds): Recommendation

Total target: 40-50 seconds
Style: Fair but with a clear winner. Use split-screen visuals where possible.""",

        "lifestyle": """Create a LIFESTYLE/DAY-IN-THE-LIFE UGC script.
Structure:
1. Hook (3-5 seconds): Setting the scene (morning routine, workspace, etc.)
2. Natural integration (15-20 seconds): Product used naturally in daily life
3. Why it matters (10 seconds): How it improves their routine
4. Soft CTA (5 seconds): Casual mention of where to get it

Total target: 35-45 seconds
Style: Aesthetic, cinematic feel. Product placement should feel organic, not forced.""",
    }

    return f"""You are an expert UGC (User-Generated Content) script writer for social media ads.

BRAND CONTEXT:
- Brand: {brand.get('business_name', 'the brand')}
- Tone: {tone_desc}
- USP: {brand.get('usp', 'not specified')}
- Target audience: {brand.get('target_audience', 'not specified')}

PRODUCT:
- Name: {product.get('name', '')}
- Price: {product.get('price', '')}
- Category: {product.get('category', '')}
- Description: {product.get('description', '')}

SCRIPT TYPE:
{type_instructions.get(ugc_type, type_instructions['review'])}

RULES:
1. Write dialogue that sounds natural, not scripted. Real people don't speak in perfect sentences.
2. Include visual/action notes for each scene (what the creator should be doing/showing).
3. Match the brand tone throughout.
4. Include specific product details from the description — don't be vague.
5. The hook MUST stop a scroller in the first 3 seconds.

Return valid JSON with this structure:
{{
  "hook": "The opening line/action (first 3-5 seconds)",
  "scenes": [
    {{
      "scene_number": 1,
      "duration_seconds": 5,
      "description": "What's happening visually",
      "dialogue": "What the creator says",
      "visual_notes": "Camera angle, props, actions"
    }}
  ],
  "cta": "The closing call to action",
  "total_duration_seconds": 45,
  "music_suggestion": "Type of background music"
}}

Return ONLY the JSON. No explanation, no markdown fences."""


def call_openrouter(prompt: str, model: str, api_key: str) -> dict | None:
    """Call OpenRouter API to generate a UGC script."""
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
                    {
                        "role": "system",
                        "content": "You are an expert UGC script writer. Always return valid JSON only.",
                    },
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.85,
                "max_tokens": 1200,
            },
            timeout=90,
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
        print(f"      [ERROR] Unexpected API response: {e}")
        return None


def generate_script_id(product_id: str, ugc_type: str) -> str:
    """Generate a unique script ID."""
    key = f"{product_id}:{ugc_type}"
    return hashlib.md5(key.encode()).hexdigest()[:12]


def main():
    parser = argparse.ArgumentParser(description="Generate UGC video scripts")
    parser.add_argument("--product-id", type=str, help="Generate for a single product")
    parser.add_argument("--type", type=str, help="Generate a specific UGC type only")
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
        return

    model = tools_config.get("ad_copy", {}).get("model", "deepseek/deepseek-chat")
    ugc_types = platforms_config.get("ugc_types", ["review", "unboxing", "problem-solution"])

    # Filter UGC types if specified
    if args.type:
        if args.type in ugc_types:
            ugc_types = [args.type]
        else:
            print(f"\n[ERROR] UGC type '{args.type}' not in config. Available: {ugc_types}")
            return

    # Filter products if specified
    if args.product_id:
        products = [p for p in products if p.get("id") == args.product_id]
        if not products:
            print(f"\n[ERROR] Product {args.product_id} not found")
            return

    # Load existing scripts for deduplication
    existing_scripts = load_json(UGC_SCRIPTS_FILE)
    if isinstance(existing_scripts, dict):
        existing_scripts = []
    existing_ids = {s.get("id") for s in existing_scripts}

    print("\n=== UGC Script Generator ===\n")
    print(f"Model: {model}")
    print(f"Products: {len(products)}")
    print(f"UGC types: {', '.join(ugc_types)}")
    print(f"Total scripts to generate: {len(products) * len(ugc_types)}")
    print()

    generated_count = 0
    skipped_count = 0
    error_count = 0

    for pi, product in enumerate(products, 1):
        pid = product.get("id", "")
        pname = product.get("name", "Unknown")

        print(f"Product [{pi}/{len(products)}]: {pname}")

        for ugc_type in ugc_types:
            script_id = generate_script_id(pid, ugc_type)

            if script_id in existing_ids:
                print(f"  {ugc_type}: already exists, skipping")
                skipped_count += 1
                continue

            print(f"  {ugc_type}...", end=" ", flush=True)

            prompt = get_ugc_prompt(ugc_type, brand, product)
            result = call_openrouter(prompt, model, api_key)

            if result:
                script_entry = {
                    "id": script_id,
                    "product_id": pid,
                    "product_name": pname,
                    "ugc_type": ugc_type,
                    "status": "generated",
                    **result,
                }
                existing_scripts.append(script_entry)
                existing_ids.add(script_id)
                generated_count += 1

                # Show the hook for quick review
                hook = result.get("hook", "")
                duration = result.get("total_duration_seconds", "?")
                scenes = result.get("scenes", [])
                print(f"OK ({len(scenes)} scenes, ~{duration}s)")
                print(f"    Hook: \"{hook[:80]}{'...' if len(hook) > 80 else ''}\"")
            else:
                error_count += 1
                print("FAILED")

            # Rate limiting
            time.sleep(0.5)

    # Save all scripts
    save_json(UGC_SCRIPTS_FILE, existing_scripts)

    print(f"\n--- Summary ---")
    print(f"Generated {generated_count} UGC scripts ({len(products)} products x {len(ugc_types)} angles)")
    print(f"Skipped {skipped_count} (already exist)")
    print(f"Failed {error_count}")
    print(f"Total UGC scripts: {len(existing_scripts)}")
    print(f"Saved to: {UGC_SCRIPTS_FILE}")


if __name__ == "__main__":
    main()
