// ── Types ──

export type Platform = 'meta' | 'google' | 'tiktok' | 'pinterest';

export type AdStatus = 'draft' | 'ready' | 'review' | 'exported';

export type UgcScriptType = 'review' | 'unboxing' | 'problem-solution' | 'day-in-my-life' | 'before-after' | 'testimonial';

export interface AdVariation {
  id: string;
  product: string;
  sku: string;
  platform: Platform;
  headline: string;
  primaryText: string;
  description: string;
  cta: string;
  charCount: { headline: number; maxHeadline: number; primary: number; maxPrimary: number };
  status: AdStatus;
  angle: string;
  createdAt: string;
}

export interface UgcScript {
  id: string;
  product: string;
  type: UgcScriptType;
  duration: '15s' | '30s' | '60s';
  hook: string;
  scenes: { timestamp: string; direction: string; voiceover: string }[];
  cta: string;
  status: AdStatus;
}

export interface CampaignSummary {
  platform: Platform;
  campaigns: number;
  adSets: number;
  ads: number;
  estimatedReach: string;
  suggestedBudget: string;
  status: 'ready' | 'partial' | 'pending';
}

export interface ProductAdCount {
  product: string;
  sku: string;
  meta: number;
  google: number;
  tiktok: number;
  pinterest: number;
  ugcScripts: number;
  total: number;
}

export interface WeeklyOutput {
  week: string;
  meta: number;
  google: number;
  tiktok: number;
  ugc: number;
}

export interface QualityCheck {
  label: string;
  passed: number;
  total: number;
  status: 'pass' | 'warn' | 'fail';
}

// ── Sample Data ──

export const business = {
  name: 'Evergreen Home Goods',
  store: 'Shopify',
  products: 48,
  categories: ['Kitchen', 'Living Room', 'Bedroom', 'Outdoor'],
};

export const generationStats = {
  totalAds: 312,
  totalUgcScripts: 72,
  productsProcessed: 48,
  platformsCovered: 4,
  campaignsReady: 12,
  exportedFiles: 8,
  lastGenerated: 'Feb 28, 2026',
  generationTime: '4m 32s',
};

export const platformBreakdown: CampaignSummary[] = [
  { platform: 'meta', campaigns: 4, adSets: 12, ads: 144, estimatedReach: '2.4M', suggestedBudget: '$3,200/mo', status: 'ready' },
  { platform: 'google', campaigns: 3, adSets: 9, ads: 96, estimatedReach: '1.8M', suggestedBudget: '$2,800/mo', status: 'ready' },
  { platform: 'tiktok', campaigns: 3, adSets: 6, ads: 48, estimatedReach: '3.1M', suggestedBudget: '$1,500/mo', status: 'ready' },
  { platform: 'pinterest', campaigns: 2, adSets: 4, ads: 24, estimatedReach: '890K', suggestedBudget: '$600/mo', status: 'partial' },
];

export const productAdCounts: ProductAdCount[] = [
  { product: 'Ceramic Pour-Over Set', sku: 'KIT-PO-100', meta: 8, google: 6, tiktok: 4, pinterest: 2, ugcScripts: 3, total: 23 },
  { product: 'Bamboo Cutting Board XL', sku: 'KIT-CB-200', meta: 8, google: 6, tiktok: 4, pinterest: 2, ugcScripts: 3, total: 23 },
  { product: 'Linen Duvet Cover', sku: 'BED-DC-300', meta: 6, google: 4, tiktok: 2, pinterest: 2, ugcScripts: 2, total: 16 },
  { product: 'Cast Iron Dutch Oven', sku: 'KIT-DO-110', meta: 8, google: 6, tiktok: 4, pinterest: 2, ugcScripts: 3, total: 23 },
  { product: 'Modular Shelf System', sku: 'LIV-MS-400', meta: 6, google: 4, tiktok: 2, pinterest: 0, ugcScripts: 2, total: 14 },
  { product: 'Outdoor Teak Bench', sku: 'OUT-TB-500', meta: 6, google: 4, tiktok: 2, pinterest: 2, ugcScripts: 2, total: 16 },
  { product: 'Handwoven Throw Blanket', sku: 'LIV-TB-410', meta: 6, google: 4, tiktok: 4, pinterest: 2, ugcScripts: 3, total: 19 },
  { product: 'Stoneware Dinner Set', sku: 'KIT-DS-120', meta: 8, google: 6, tiktok: 4, pinterest: 2, ugcScripts: 3, total: 23 },
];

export const adVariations: AdVariation[] = [
  // Meta
  {
    id: 'ad-001', product: 'Ceramic Pour-Over Set', sku: 'KIT-PO-100', platform: 'meta',
    headline: 'Morning Coffee, Perfected',
    primaryText: 'Stop settling for mediocre coffee. Our hand-crafted ceramic pour-over set brews barista-quality coffee in under 4 minutes. Over 2,400 five-star reviews.',
    description: 'Free shipping on orders over $75', cta: 'Shop Now',
    charCount: { headline: 25, maxHeadline: 40, primary: 148, maxPrimary: 125, },
    status: 'review', angle: 'Quality / Craft', createdAt: 'Feb 28',
  },
  {
    id: 'ad-002', product: 'Ceramic Pour-Over Set', sku: 'KIT-PO-100', platform: 'meta',
    headline: 'Ditch the Keurig. Taste Real Coffee.',
    primaryText: 'Your morning deserves better than a plastic pod. Our ceramic pour-over set brings out flavors you didn\'t know your beans had. 30-day money-back guarantee.',
    description: 'Join 12,000+ home baristas', cta: 'Shop Now',
    charCount: { headline: 36, maxHeadline: 40, primary: 156, maxPrimary: 125 },
    status: 'ready', angle: 'Comparison / Upgrade', createdAt: 'Feb 28',
  },
  {
    id: 'ad-003', product: 'Bamboo Cutting Board XL', sku: 'KIT-CB-200', platform: 'meta',
    headline: 'The Last Cutting Board You\'ll Buy',
    primaryText: 'Sustainable bamboo. Knife-friendly surface. Built to last decades, not months. Extra-large for serious home cooks who need real workspace.',
    description: 'Sustainably sourced bamboo', cta: 'Learn More',
    charCount: { headline: 35, maxHeadline: 40, primary: 143, maxPrimary: 125 },
    status: 'ready', angle: 'Durability / Sustainability', createdAt: 'Feb 28',
  },
  {
    id: 'ad-004', product: 'Cast Iron Dutch Oven', sku: 'KIT-DO-110', platform: 'meta',
    headline: 'One Pot. Endless Meals.',
    primaryText: 'From sourdough bread to slow-braised short ribs, our 6-quart dutch oven does it all. Pre-seasoned and ready to use out of the box.',
    description: 'Lifetime warranty included', cta: 'Shop Now',
    charCount: { headline: 22, maxHeadline: 40, primary: 138, maxPrimary: 125 },
    status: 'ready', angle: 'Versatility', createdAt: 'Feb 28',
  },
  // Google
  {
    id: 'ad-005', product: 'Ceramic Pour-Over Set', sku: 'KIT-PO-100', platform: 'google',
    headline: 'Pour-Over Coffee Set',
    primaryText: 'Hand-crafted ceramic pour-over set. Brews barista-quality coffee in 4 minutes. Free shipping over $75.',
    description: 'Premium ceramic. 2,400+ reviews. 30-day guarantee.', cta: 'Shop Now',
    charCount: { headline: 20, maxHeadline: 30, primary: 92, maxPrimary: 90 },
    status: 'ready', angle: 'Direct / Search Intent', createdAt: 'Feb 28',
  },
  {
    id: 'ad-006', product: 'Linen Duvet Cover', sku: 'BED-DC-300', platform: 'google',
    headline: 'Linen Duvet Cover',
    primaryText: 'European flax linen. Gets softer with every wash. Temperature-regulating for year-round comfort.',
    description: 'Stone-washed finish. 6 colors available.', cta: 'Shop Now',
    charCount: { headline: 18, maxHeadline: 30, primary: 89, maxPrimary: 90 },
    status: 'ready', angle: 'Product Features', createdAt: 'Feb 28',
  },
  {
    id: 'ad-007', product: 'Outdoor Teak Bench', sku: 'OUT-TB-500', platform: 'google',
    headline: 'Teak Garden Bench',
    primaryText: 'Grade-A teak. Weather-resistant without treatment. Seats 3 comfortably. Assembly in 15 minutes.',
    description: 'Free delivery. 5-year outdoor warranty.', cta: 'Shop Now',
    charCount: { headline: 17, maxHeadline: 30, primary: 88, maxPrimary: 90 },
    status: 'exported', angle: 'Practical / Specs', createdAt: 'Feb 27',
  },
  // TikTok
  {
    id: 'ad-008', product: 'Handwoven Throw Blanket', sku: 'LIV-TB-410', platform: 'tiktok',
    headline: 'This blanket hits different',
    primaryText: 'POV: You finally replaced your Target throw with something that actually feels like a hug. Handwoven. Ridiculously soft. You\'ll fight over it.',
    description: '', cta: 'Get Yours',
    charCount: { headline: 27, maxHeadline: 40, primary: 155, maxPrimary: 150 },
    status: 'ready', angle: 'Relatable / POV', createdAt: 'Feb 28',
  },
  {
    id: 'ad-009', product: 'Stoneware Dinner Set', sku: 'KIT-DS-120', platform: 'tiktok',
    headline: 'Upgrade your plate game',
    primaryText: 'POV: Your friends come over and think you got your dishes from a boutique in Paris. Nope. $89 for a full 4-person set.',
    description: '', cta: 'Shop Now',
    charCount: { headline: 23, maxHeadline: 40, primary: 126, maxPrimary: 150 },
    status: 'ready', angle: 'Social Proof / Flex', createdAt: 'Feb 28',
  },
  {
    id: 'ad-010', product: 'Ceramic Pour-Over Set', sku: 'KIT-PO-100', platform: 'tiktok',
    headline: 'Coffee snobs, this is for you',
    primaryText: 'I switched from a $300 machine to this $45 pour-over set and the coffee is better. I\'m not even joking. The ceramic retains heat perfectly.',
    description: '', cta: 'Try It',
    charCount: { headline: 29, maxHeadline: 40, primary: 142, maxPrimary: 150 },
    status: 'ready', angle: 'Testimonial / Value', createdAt: 'Feb 28',
  },
  // Pinterest
  {
    id: 'ad-011', product: 'Modular Shelf System', sku: 'LIV-MS-400', platform: 'pinterest',
    headline: 'Minimalist shelving that actually works',
    primaryText: 'Design your perfect wall storage. Mix and match modules for any room. Solid oak with invisible mounting.',
    description: 'Save this for your next room makeover', cta: 'Save Pin',
    charCount: { headline: 38, maxHeadline: 40, primary: 101, maxPrimary: 125 },
    status: 'ready', angle: 'Aspirational / Design', createdAt: 'Feb 28',
  },
  {
    id: 'ad-012', product: 'Linen Duvet Cover', sku: 'BED-DC-300', platform: 'pinterest',
    headline: 'The bedroom refresh you need',
    primaryText: 'European flax linen in 6 muted tones. Effortlessly elevated bedding that gets softer with every wash.',
    description: 'Pin for your bedroom makeover board', cta: 'Save Pin',
    charCount: { headline: 28, maxHeadline: 40, primary: 97, maxPrimary: 125 },
    status: 'ready', angle: 'Aspirational / Lifestyle', createdAt: 'Feb 28',
  },
];

export const ugcScripts: UgcScript[] = [
  {
    id: 'ugc-001', product: 'Ceramic Pour-Over Set', type: 'review', duration: '30s',
    hook: 'I was skeptical about spending $45 on a coffee maker...',
    scenes: [
      { timestamp: '0:00-0:03', direction: 'Close-up of face, skeptical expression', voiceover: 'So I bought this pour-over set everyone\'s been talking about...' },
      { timestamp: '0:03-0:10', direction: 'Unboxing on kitchen counter, show ceramic texture', voiceover: 'First thing I noticed — the ceramic quality. This isn\'t some cheap Amazon knockoff.' },
      { timestamp: '0:10-0:20', direction: 'Brewing sequence, steam rising, slow pour', voiceover: 'Four minutes later and honestly? This is the best cup of coffee I\'ve made at home. Ever.' },
      { timestamp: '0:20-0:28', direction: 'Sitting at table, sipping, genuine reaction', voiceover: 'I returned my Nespresso. I\'m not even kidding. This is all I need now.' },
      { timestamp: '0:28-0:30', direction: 'Product on counter, natural light', voiceover: 'Link in bio if you want to try it yourself.' },
    ],
    cta: 'Link in bio — use code POUR15 for 15% off', status: 'ready',
  },
  {
    id: 'ugc-002', product: 'Cast Iron Dutch Oven', type: 'problem-solution', duration: '30s',
    hook: 'If you\'re still using non-stick pans from college...',
    scenes: [
      { timestamp: '0:00-0:05', direction: 'Show scratched, warped cheap pan', voiceover: 'Look at this pan. It\'s peeling. It\'s warped. We\'ve all been here.' },
      { timestamp: '0:05-0:12', direction: 'Transition to dutch oven reveal, dramatic', voiceover: 'Then I got this cast iron dutch oven and everything changed.' },
      { timestamp: '0:12-0:22', direction: 'Cooking montage — bread, stew, roast chicken', voiceover: 'Bread? Perfect crust. Stew? Restaurant quality. Roast chicken? My family thinks I took a cooking class.' },
      { timestamp: '0:22-0:28', direction: 'Show pre-seasoned surface, lifetime warranty card', voiceover: 'Pre-seasoned, lifetime warranty. This is the last pot you\'ll ever buy.' },
      { timestamp: '0:28-0:30', direction: 'Point to camera', voiceover: 'Link below. Thank me later.' },
    ],
    cta: 'Shop the dutch oven — free shipping today', status: 'ready',
  },
  {
    id: 'ugc-003', product: 'Handwoven Throw Blanket', type: 'unboxing', duration: '15s',
    hook: 'This just arrived and I can\'t stop touching it',
    scenes: [
      { timestamp: '0:00-0:03', direction: 'Holding sealed package, excited expression', voiceover: 'My handwoven throw just arrived!' },
      { timestamp: '0:03-0:08', direction: 'Unwrap, show texture close-up, drape over hand', voiceover: 'Feel that texture. This is real craftsmanship. So unbelievably soft.' },
      { timestamp: '0:08-0:13', direction: 'Drape on couch, style it, step back to admire', voiceover: 'My living room just went from basic to boutique hotel.' },
      { timestamp: '0:13-0:15', direction: 'Cozy on couch wrapped in blanket, thumbs up', voiceover: 'Link in bio!' },
    ],
    cta: 'Shop handwoven throws', status: 'ready',
  },
  {
    id: 'ugc-004', product: 'Bamboo Cutting Board XL', type: 'day-in-my-life', duration: '60s',
    hook: 'Sunday meal prep just hits different with the right tools',
    scenes: [
      { timestamp: '0:00-0:05', direction: 'Morning kitchen, coffee in hand, calm energy', voiceover: 'Sunday morning. Coffee\'s ready. Time for meal prep.' },
      { timestamp: '0:05-0:15', direction: 'Pull out cutting board, show size comparison', voiceover: 'This bamboo board is massive. I can actually prep everything without shuffling stuff around.' },
      { timestamp: '0:15-0:30', direction: 'Chopping montage — vegetables, herbs, protein', voiceover: 'Onions, peppers, chicken, herbs — all in one session. The surface is so knife-friendly.' },
      { timestamp: '0:30-0:45', direction: 'Show juice groove catching liquids, easy cleanup', voiceover: 'See that juice groove? Zero mess on my counter. And cleanup takes 30 seconds.' },
      { timestamp: '0:45-0:55', direction: 'Finished meals in containers, organized fridge', voiceover: 'Four days of lunches, done in 45 minutes. That\'s what the right tools do.' },
      { timestamp: '0:55-1:00', direction: 'Pat cutting board, wink at camera', voiceover: 'This board pays for itself every single week. Link in bio.' },
    ],
    cta: 'Get the Bamboo XL — save 20% this week', status: 'ready',
  },
  {
    id: 'ugc-005', product: 'Stoneware Dinner Set', type: 'before-after', duration: '15s',
    hook: 'What your dinner table looks like vs. what it could look like',
    scenes: [
      { timestamp: '0:00-0:03', direction: 'Sad table with mismatched plates, harsh lighting', voiceover: 'This is what most of us are working with...' },
      { timestamp: '0:03-0:05', direction: 'Quick transition — hand swipe or blink cut', voiceover: '' },
      { timestamp: '0:05-0:12', direction: 'Same table, styled with stoneware set, warm lighting, candles', voiceover: 'And this is a $89 upgrade. Same table. Same food. Completely different energy.' },
      { timestamp: '0:12-0:15', direction: 'Close-up of plate texture, minimal and elegant', voiceover: 'Stoneware dinner set. Link in bio.' },
    ],
    cta: 'Upgrade your table for $89', status: 'ready',
  },
  {
    id: 'ugc-006', product: 'Linen Duvet Cover', type: 'testimonial', duration: '30s',
    hook: 'My wife said this was the best purchase I\'ve ever made',
    scenes: [
      { timestamp: '0:00-0:05', direction: 'Sitting on bed edge, casual and genuine', voiceover: 'Okay so my wife is really picky about bedding. Like, unreasonably picky.' },
      { timestamp: '0:05-0:15', direction: 'Show duvet cover texture, run hand across it', voiceover: 'I surprised her with this linen duvet cover and she literally said it was the best purchase I\'ve ever made.' },
      { timestamp: '0:15-0:25', direction: 'Made bed shot from different angles, morning light', voiceover: 'It\'s European flax linen. Gets softer every wash. And it actually keeps you cool in summer.' },
      { timestamp: '0:25-0:30', direction: 'Both on bed, comfortable and happy', voiceover: 'Best $120 I ever spent. Her words, not mine.' },
    ],
    cta: 'Shop linen bedding — 6 colors available', status: 'exported',
  },
  {
    id: 'ugc-007', product: 'Outdoor Teak Bench', type: 'review', duration: '30s',
    hook: 'I almost bought a $2,000 bench. Then I found this.',
    scenes: [
      { timestamp: '0:00-0:04', direction: 'Standing in backyard, gesturing to bench', voiceover: 'I was about to drop two grand on a teak bench from Restoration Hardware.' },
      { timestamp: '0:04-0:12', direction: 'Sit on bench, show quality up close', voiceover: 'Then I found this one. Same grade-A teak. Same weather resistance. A fraction of the price.' },
      { timestamp: '0:12-0:22', direction: 'Show rain, sun, various weather on bench', voiceover: 'Three months in, rain, sun, everything. It looks even better than the day I got it.' },
      { timestamp: '0:22-0:30', direction: 'Relaxing on bench with coffee, golden hour', voiceover: 'My favorite spot in the house now. Link in bio.' },
    ],
    cta: 'Shop the teak bench — free delivery', status: 'review',
  },
  {
    id: 'ugc-008', product: 'Modular Shelf System', type: 'problem-solution', duration: '30s',
    hook: 'My living room looked like a storage unit',
    scenes: [
      { timestamp: '0:00-0:05', direction: 'Show messy room, stuff everywhere', voiceover: 'Books stacked on the floor. Plants on random tables. It was chaos.' },
      { timestamp: '0:05-0:15', direction: 'Time-lapse of installing modular shelves', voiceover: 'Got this modular shelf system and installed it in like 20 minutes.' },
      { timestamp: '0:15-0:25', direction: 'Styled shelves, everything organized beautifully', voiceover: 'Same stuff. Same room. But now it actually looks like I have my life together.' },
      { timestamp: '0:25-0:30', direction: 'Step back to admire, satisfied nod', voiceover: 'Invisible mounting, solid oak. This thing is legit.' },
    ],
    cta: 'Design your own shelf configuration', status: 'review',
  },
  {
    id: 'ugc-009', product: 'Ceramic Pour-Over Set', type: 'unboxing', duration: '15s',
    hook: 'The packaging alone is worth the price',
    scenes: [
      { timestamp: '0:00-0:03', direction: 'Package on counter, hands reaching in', voiceover: 'Okay let\'s see what the hype is about...' },
      { timestamp: '0:03-0:08', direction: 'Unwrap ceramic, show weight and finish', voiceover: 'Oh wow. The weight of this thing. The glaze. This is serious.' },
      { timestamp: '0:08-0:13', direction: 'All pieces laid out, morning light', voiceover: 'Carafe, dripper, filters, measuring scoop. Everything you need.' },
      { timestamp: '0:13-0:15', direction: 'Hold up to camera, impressed face', voiceover: 'First brew tomorrow morning. Stay tuned.' },
    ],
    cta: 'Shop the pour-over set', status: 'draft',
  },
  {
    id: 'ugc-010', product: 'Cast Iron Dutch Oven', type: 'day-in-my-life', duration: '60s',
    hook: 'Cozy Sunday cooking: dutch oven edition',
    scenes: [
      { timestamp: '0:00-0:08', direction: 'Morning kitchen, prepping ingredients', voiceover: 'Sunday ritual: slow-cook something amazing in the dutch oven.' },
      { timestamp: '0:08-0:20', direction: 'Browning meat, deglazing, adding veg', voiceover: 'There\'s something about the sear you get with cast iron. Nothing else compares.' },
      { timestamp: '0:20-0:35', direction: 'Into the oven, time-lapse, kitchen activities', voiceover: 'Three hours in the oven. Meanwhile, I actually get to relax.' },
      { timestamp: '0:35-0:50', direction: 'Open lid reveal, steam, beautiful food', voiceover: 'And this is why everyone needs a dutch oven. Look at that.' },
      { timestamp: '0:50-0:58', direction: 'Family eating, enjoying the meal', voiceover: 'My kids think I went to culinary school. I just have good equipment.' },
      { timestamp: '0:58-1:00', direction: 'Hold up dutch oven, wink', voiceover: 'Link in bio. You need this.' },
    ],
    cta: 'Get the dutch oven — pre-seasoned and ready', status: 'draft',
  },
  {
    id: 'ugc-011', product: 'Stoneware Dinner Set', type: 'testimonial', duration: '30s',
    hook: 'My dinner parties went from "meh" to "magazine-worthy"',
    scenes: [
      { timestamp: '0:00-0:05', direction: 'Before shot of basic table setting', voiceover: 'This is what my dinner parties used to look like. Fine, but forgettable.' },
      { timestamp: '0:05-0:15', direction: 'After shot with stoneware, styled beautifully', voiceover: 'Then I got this stoneware set and suddenly people were taking photos of my TABLE.' },
      { timestamp: '0:15-0:25', direction: 'Close-ups of texture, friends admiring', voiceover: 'Every single person asks where I got these. The texture, the matte finish, the weight.' },
      { timestamp: '0:25-0:30', direction: 'Full table shot, dinner party vibes', voiceover: 'Eighty-nine dollars. Best home upgrade I\'ve made.' },
    ],
    cta: 'Shop the dinner set — 4-person set for $89', status: 'draft',
  },
  {
    id: 'ugc-012', product: 'Bamboo Cutting Board XL', type: 'before-after', duration: '15s',
    hook: 'Your cutting board vs. mine',
    scenes: [
      { timestamp: '0:00-0:03', direction: 'Show small, warped plastic cutting board', voiceover: 'This is what most people are working with...' },
      { timestamp: '0:03-0:05', direction: 'Dramatic transition', voiceover: '' },
      { timestamp: '0:05-0:12', direction: 'XL bamboo board with full meal prep spread', voiceover: 'And this is the upgrade that changed my entire cooking routine. Extra-large, self-healing bamboo.' },
      { timestamp: '0:12-0:15', direction: 'Wipe clean in one motion, spotless', voiceover: 'Cleanup? Five seconds. Link in bio.' },
    ],
    cta: 'Get the XL bamboo board', status: 'review',
  },
];

export const weeklyOutputHistory: WeeklyOutput[] = [
  { week: 'W1 Jan', meta: 24, google: 18, tiktok: 8, ugc: 6 },
  { week: 'W2 Jan', meta: 32, google: 20, tiktok: 10, ugc: 8 },
  { week: 'W3 Jan', meta: 28, google: 16, tiktok: 12, ugc: 10 },
  { week: 'W4 Jan', meta: 36, google: 24, tiktok: 10, ugc: 8 },
  { week: 'W1 Feb', meta: 32, google: 20, tiktok: 14, ugc: 12 },
  { week: 'W2 Feb', meta: 40, google: 22, tiktok: 12, ugc: 10 },
  { week: 'W3 Feb', meta: 36, google: 24, tiktok: 16, ugc: 12 },
  { week: 'W4 Feb', meta: 44, google: 28, tiktok: 16, ugc: 14 },
];

export const qualityChecks: QualityCheck[] = [
  { label: 'Character limits respected', passed: 308, total: 312, status: 'warn' },
  { label: 'CTA present on all ads', passed: 312, total: 312, status: 'pass' },
  { label: 'Variations genuinely different', passed: 312, total: 312, status: 'pass' },
  { label: 'Brand voice consistency', passed: 296, total: 312, status: 'warn' },
  { label: 'No truncated copy', passed: 310, total: 312, status: 'pass' },
  { label: 'Platform formatting correct', passed: 312, total: 312, status: 'pass' },
];

export const exportFiles = [
  { name: 'meta_campaigns.csv', platform: 'meta' as Platform, rows: 144, size: '84 KB', status: 'ready' as const },
  { name: 'google_search_ads.csv', platform: 'google' as Platform, rows: 96, size: '56 KB', status: 'ready' as const },
  { name: 'google_shopping_feed.csv', platform: 'google' as Platform, rows: 48, size: '32 KB', status: 'ready' as const },
  { name: 'tiktok_ad_copy.csv', platform: 'tiktok' as Platform, rows: 48, size: '28 KB', status: 'ready' as const },
  { name: 'pinterest_pins.csv', platform: 'pinterest' as Platform, rows: 24, size: '14 KB', status: 'ready' as const },
  { name: 'ugc_scripts_all.json', platform: 'meta' as Platform, rows: 72, size: '120 KB', status: 'ready' as const },
  { name: 'campaign_structure.json', platform: 'meta' as Platform, rows: 12, size: '18 KB', status: 'ready' as const },
  { name: 'generation_report.md', platform: 'meta' as Platform, rows: 1, size: '6 KB', status: 'ready' as const },
];

// ── Helper functions ──

export function platformLabel(p: Platform): string {
  const labels: Record<Platform, string> = {
    meta: 'Meta Ads',
    google: 'Google Ads',
    tiktok: 'TikTok',
    pinterest: 'Pinterest',
  };
  return labels[p];
}

export function platformColor(p: Platform): string {
  const colors: Record<Platform, string> = {
    meta: '#1877f2',
    google: '#ea4335',
    tiktok: '#ff004f',
    pinterest: '#e60023',
  };
  return colors[p];
}

export function ugcTypeLabel(t: UgcScriptType): string {
  const labels: Record<UgcScriptType, string> = {
    'review': 'Review',
    'unboxing': 'Unboxing',
    'problem-solution': 'Problem / Solution',
    'day-in-my-life': 'Day in My Life',
    'before-after': 'Before / After',
    'testimonial': 'Testimonial',
  };
  return labels[t];
}
