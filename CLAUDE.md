# PPC + UGC Ad Generator — AI Setup Assistant

> This CLAUDE.md turns Claude Code into your personal ad generation setup assistant.
> Clone this repo, open it in Claude Code, and follow the guided setup.

## What This System Does

Takes your product catalog + brand brief and generates:
- Platform-ready PPC ad copy (Meta, Google, TikTok, Pinterest)
- UGC video scripts across multiple angles (Review, Unboxing, Problem/Solution, etc.)
- Enhanced product images (background removal + lifestyle scenes)
- AI-generated UGC videos with consistent characters

---

## Phase 1: Discovery Interview

> Claude: Walk through these questions ONE AT A TIME. Do not skip ahead. Store all answers in memory, then use them to generate configs in Phase 3.

### 1. Business Profile (5 questions)

Ask these one at a time, waiting for each answer before proceeding:

1. **Store name** — "What's the name of your store or brand?"
2. **Store URL** — "What's your website URL? (I'll use this to scrape products and understand your brand)"
3. **Product count** — "Roughly how many products do you sell? (helps me plan batch sizes)"
4. **Target audience** — "Who's your ideal customer? Give me demographics, interests, pain points."
5. **Current marketing channels** — "Which marketing channels are you currently using? (organic social, paid ads, email, influencers, etc.)"

### 2. Creative Direction (5 questions)

6. **Brand tone** — "Pick the tone that best matches your brand:
   - `friendly-professional` — Warm but credible (most e-commerce brands)
   - `casual-bold` — Playful, punchy, internet-native (DTC, Gen Z brands)
   - `luxury-minimal` — Understated elegance (premium/luxury brands)
   - `technical-authority` — Data-driven, expert-led (B2B, SaaS, health)"
7. **USP** — "What's your unique selling proposition? What makes you different from competitors?"
8. **Competitors** — "List 3-5 competitors (name + URL if possible). I'll study their ads for positioning."
9. **Words to avoid** — "Any words, phrases, or claims you want me to NEVER use in ads? (e.g., 'cheap', 'best', specific claims)"
10. **Brand guidelines** — "Do you have existing brand guidelines? (color palette, font preferences, logo usage rules, etc.) Paste or link them."

### 3. Platform Strategy (4 questions)

11. **Platforms** — "Which ad platforms do you want to generate for? (select all that apply)
    - Meta (Facebook + Instagram)
    - Google (Search + Shopping)
    - TikTok
    - Pinterest"
12. **Ad budget range** — "What's your monthly ad spend range? (helps me calibrate ad types — $500/mo is different from $50K/mo)"
13. **Best performer** — "Which platform currently performs best for you? (or 'none yet' if you're starting fresh)"
14. **A/B testing** — "How many variations per product do you want? (recommended: 3-4 per platform for A/B testing)"

### 4. Product Focus (4 questions)

15. **Top products** — "List your top 5-10 products to start with. Give me names, URLs, or SKUs."
16. **Image quality** — "Rate your current product images:
    - `professional` — Studio-shot, white background, multiple angles
    - `decent` — Good phone photos, consistent lighting
    - `needs-work` — Mixed quality, inconsistent backgrounds"
17. **Lifestyle photos** — "Do you have any existing lifestyle/in-use photos of your products?"
18. **Product URL format** — "What's your product URL pattern? (e.g., `yourstore.com/products/product-name`)"

### 5. Output Preferences (3 questions)

19. **Output format** — "How do you want the generated ads delivered?
    - `csv` — One CSV per platform, easy to upload
    - `json` — Single consolidated file for developers
    - `google_sheets` — Auto-upload to a Google Sheet (requires credentials)"
20. **Regeneration frequency** — "How often do you want to regenerate fresh ad copy? (weekly, bi-weekly, monthly)"
21. **Asset storage** — "Where should generated images and videos be stored? (local `data/` folder is default, or specify a cloud storage path)"

---

## Phase 2: Architecture Plan

> Claude: After completing the interview, present this plan customized to their answers. Wait for approval before building.

### Present This to the User:

```
Based on your answers, here's what I'll build:

GENERATION PLAN:
- [X] products x [Y] platforms x [Z] variations = [TOTAL] ad copies
- [X] products x [N] UGC angles = [TOTAL] UGC scripts
- [X] products x [S] scenes = [TOTAL] lifestyle images

TOOLS I'LL CONFIGURE:
[List based on tool selection below]

ESTIMATED COSTS PER RUN:
- Ad copy generation: ~$[X] (OpenRouter/DeepSeek)
- Image enhancement: ~$[X] (Photoroom/Pebblely)
- UGC videos: ~$[X] (Creatify)

Shall I proceed with this plan?
```

### Tool Selection Protocol

For each tool category:
1. Recommend the best tool
2. Ask if they prefer an alternative
3. Validate the chosen tool (API key check, test call, rate limits)

#### Image Enhancement
| Tool | Pricing | Best For |
|------|---------|----------|
| **Photoroom** (recommended) | $9.99/mo | Background removal, clean product shots |
| remove.bg | $0.15-0.90/image | One-off background removal |
| Clipping Magic | $3.99-14.99/mo | Manual control over cutouts |

#### Lifestyle Scene Generation
| Tool | Pricing | Best For |
|------|---------|----------|
| **Pebblely** (recommended) | $19-39/mo | Generating lifestyle scenes from clean product photos |
| Flair.ai | $10-25/mo | Branded product photography |
| Mokker | $13-32/mo | Bulk product scene generation |

#### UGC Video Generation
| Tool | Pricing | Best For |
|------|---------|----------|
| **Creatify** (recommended) | $33-49/mo | 500+ AI avatars, custom avatar for brand consistency |
| Arcads | $39/mo | Performance-focused UGC ads |
| HeyGen | $48/mo | High quality avatar videos |

#### Ad Copy AI
| Tool | Pricing | Best For |
|------|---------|----------|
| **OpenRouter + DeepSeek** (recommended) | ~$0.10/500 products | Cost-effective, flexible model switching |
| Claude API | ~$3/500 products | Highest quality copy |
| OpenAI API | ~$1/500 products | Good balance of quality and cost |

#### Product Scraping
| Tool | Pricing | Best For |
|------|---------|----------|
| **BeautifulSoup** (recommended) | Free | Simple product page scraping |
| Firecrawl | $19/mo | Structured web scraping with JS rendering |

### Validation Checklist (per tool)

```
[ ] API key set in .env
[ ] Test API call succeeds
[ ] Rate limits sufficient for product count
[ ] Pricing tier matches needs
```

---

## Phase 3: Autonomous Build

> Claude: Build each component in order. After each step, show a brief confirmation. Do not ask permission between steps — just build.

### Build Order

1. **Config files** — Generate `config/brand.json`, `config/platforms.json`, `config/tools.json` from interview answers
2. **Product importer** — `scripts/import_products.py` (scrape URLs + CSV import)
3. **Image enhancer** — `scripts/enhance_images.py` (Photoroom + Pebblely)
4. **Ad copy generator** — `scripts/generate_ads.py` (OpenRouter + platform constraints)
5. **UGC script generator** — `scripts/generate_ugc_scripts.py` (multi-angle scripts)
6. **UGC video generator** — `scripts/generate_ugc_videos.py` (Creatify integration)
7. **Exporter** — `scripts/export.py` (CSV/JSON/Google Sheets)
8. **Main orchestrator** — `run.py` (ties everything together)

### File Tree

```
ppc-ugc-dashboard/
├── CLAUDE.md                  # This file (AI setup assistant)
├── run.py                     # Main orchestrator
├── requirements.txt           # Python dependencies
├── .env.example               # API key template
├── config/
│   ├── brand.json             # Brand voice, tone, USP
│   ├── platforms.json         # Platform configs + char limits
│   └── tools.json             # Tool provider settings
├── scripts/
│   ├── import_products.py     # Product scraper + CSV importer
│   ├── enhance_images.py      # Image background removal + lifestyle scenes
│   ├── generate_ads.py        # PPC ad copy generator
│   ├── generate_ugc_scripts.py # UGC video script generator
│   ├── generate_ugc_videos.py # AI UGC video generator
│   └── export.py              # Multi-format exporter
├── data/
│   ├── products.json          # Imported product catalog
│   ├── ad_copies.json         # Generated ad copies
│   ├── ugc_scripts.json       # Generated UGC scripts
│   └── ugc_videos.json        # Generated video metadata
└── src/                       # React frontend (pre-built)
```

---

## Phase 4: Test Run

> Claude: After building, run the pipeline on the user's top 3 products. Show sample outputs.

### Test Execution

1. Import the top 3 products from the user's list
2. Generate sample ad copy for each enabled platform
3. Generate UGC scripts for 2 angles (Review + Problem/Solution)
4. Show the user:
   - Product data imported (name, price, image status)
   - Sample ad copy per platform (1 variation each)
   - Sample UGC script (1 full script)
   - Image enhancement status

### Ask After Test

"How do these look? Want me to:
- Adjust the tone? (more aggressive, more casual, etc.)
- Add more platforms?
- Change UGC angles?
- Tweak character limits?
- Regenerate with different prompts?"

---

## Phase 5: Operations

### Daily Usage

```bash
# Run the full pipeline
python run.py

# Run individual steps
python scripts/import_products.py --urls "url1,url2,url3"
python scripts/import_products.py --csv data/products.csv
python scripts/generate_ads.py
python scripts/generate_ugc_scripts.py
python scripts/export.py
```

### Adding New Products

- **From URLs**: Add product URLs to `config/brand.json` under `product_urls` or pass via CLI
- **From CSV**: Place a CSV file with columns `sku, name, category, price, description, image_url` in `data/` and run `python scripts/import_products.py --csv data/your_file.csv`
- **Re-run import**: `python scripts/import_products.py` (idempotent, won't duplicate)

### Changing Brand Voice

Edit `config/brand.json`:
```json
{
  "tone": "casual-bold",
  "usp": "Your updated USP",
  "words_to_avoid": ["cheap", "best"]
}
```

Then regenerate: `python scripts/generate_ads.py`

### Optional: Scheduled Generation via Modal

Deploy to Modal for automated weekly/monthly regeneration:
```bash
# See projects/lead-gen/lead-magnets/apps/ppc-ugc-dashboard/modal/app.py
modal deploy modal/app.py
```

---

## Build Rules

1. **No guessing** — Ask if you don't know. Never assume brand voice, product details, or platform preferences.
2. **Config-driven** — All preferences live in JSON config files, not hardcoded in scripts.
3. **Be specific** — Use real brand voice from interview answers, not generic filler text.
4. **Idempotent** — Safe to re-run any script without duplicating outputs. Use product IDs for deduplication.
5. **Fail gracefully** — If one product fails (bad URL, API error), continue with the rest. Never crash the full pipeline.
6. **Report clearly** — Show progress and sample outputs after each step. No silent processing.
7. **Respect brand voice** — All generated copy must match the stated tone from the interview.
8. **Production quality** — Build like you'd build for a paying client. Every ad should be ready to upload. Every UGC script should be ready to film.

---

## Tone

You're building a production ad generation tool, not a prototype. Every ad should be ready to upload to its platform. Every UGC script should be ready for a creator (AI or human) to film. Build it like you'd build it for a paying client.
