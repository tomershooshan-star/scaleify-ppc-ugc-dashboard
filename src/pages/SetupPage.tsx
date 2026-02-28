import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Link2,
  Upload,
  Database,
  Plus,
  X,
  Check,
  Loader2,
  Copy,
  ChevronDown,
  Sparkles,
  Image,
  Package,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { productAdCounts } from '../data/sampleData';

/* ─── Types ─── */

interface AddedProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: string;
  source: 'url' | 'csv' | 'database';
}

const toneOptions = [
  { id: 'friendly-professional', label: 'Friendly & Professional' },
  { id: 'casual-bold', label: 'Casual & Bold' },
  { id: 'luxury-minimal', label: 'Luxury & Minimal' },
  { id: 'technical-authority', label: 'Technical Authority' },
];

const ugcTypeOptions = [
  { id: 'review', label: 'Review' },
  { id: 'unboxing', label: 'Unboxing' },
  { id: 'problem-solution', label: 'Problem / Solution' },
  { id: 'day-in-my-life', label: 'Day in My Life' },
  { id: 'before-after', label: 'Before / After' },
  { id: 'testimonial', label: 'Testimonial' },
];

const platformOptions = [
  { id: 'meta', label: 'Meta Ads', color: 'bg-blue-500' },
  { id: 'google', label: 'Google Ads', color: 'bg-red-500' },
  { id: 'tiktok', label: 'TikTok', color: 'bg-pink-500' },
  { id: 'pinterest', label: 'Pinterest', color: 'bg-rose-600' },
];

const aiPrompts = [
  {
    title: 'Brand Voice',
    prompt: `Act as a brand strategist. I run a [business type] that sells [products]. Help me define my brand voice by answering:\n\n1. What tone should our ads use? (e.g., friendly, bold, luxurious, technical)\n2. What is our unique selling proposition in one sentence?\n3. Who is our ideal customer? (age, lifestyle, pain points)\n4. What words or phrases should we avoid in our ads?\n\nFormat your answer so I can copy each section directly.`,
  },
  {
    title: 'Competitor Analysis',
    prompt: `List 5 competitors for a [business type] that sells [products] to [audience]. For each competitor:\n\n1. Name and website\n2. Their ad tone in one sentence\n3. Their main positioning angle\n4. One thing they do well in their ads\n5. One gap in their messaging we could exploit\n\nKeep it concise — I need this to inform my ad strategy.`,
  },
  {
    title: 'USP Generator',
    prompt: `I sell [products] to [audience]. My products are different because [key differentiator].\n\nWrite 5 versions of a unique selling proposition:\n- Each under 20 words\n- Each highlighting a different angle (quality, speed, price, experience, social proof)\n- Written in a tone that would work in paid ads\n\nAlso suggest 5 words/phrases I should AVOID in my ads and explain why.`,
  },
];

/* Simulated product names for URL scraping demo */
const scrapedProducts = [
  { name: 'Artisan Coffee Mug Set', category: 'Kitchen', price: '$38.00' },
  { name: 'Organic Cotton Bath Towels', category: 'Bathroom', price: '$52.00' },
  { name: 'Walnut Serving Board', category: 'Kitchen', price: '$64.00' },
  { name: 'Recycled Glass Vase', category: 'Living Room', price: '$29.00' },
  { name: 'Merino Wool Throw', category: 'Bedroom', price: '$89.00' },
];

/* ─── Step Number Badge ─── */

function StepBadge({ n }: { n: number }) {
  return (
    <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-sm font-bold text-text-secondary border border-border-default">
      {n}
    </div>
  );
}

/* ─── Tag Input ─── */

function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder,
}: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        onAdd(input.trim());
      }
      setInput('');
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 min-h-[42px] focus-within:border-border-hover transition-colors">
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 bg-bg-card border border-border-default rounded-md px-2 py-0.5 text-xs text-text-secondary"
        >
          {tag}
          <button onClick={() => onRemove(tag)} className="text-text-muted hover:text-text-primary">
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[100px] bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none"
      />
    </div>
  );
}

/* ─── AI Prompt Card ─── */

function PromptCard({ title, prompt }: { title: string; prompt: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-bg-elevated rounded-lg p-4 border border-border-subtle">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-text-primary">{title}</p>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] font-medium text-text-muted hover:text-text-secondary bg-bg-card border border-border-subtle hover:border-border-hover px-2 py-1 rounded transition-colors"
        >
          {copied ? <Check className="w-2.5 h-2.5 text-green-400" /> : <Copy className="w-2.5 h-2.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="text-[11px] text-text-muted leading-relaxed whitespace-pre-wrap font-mono">{prompt}</pre>
    </div>
  );
}

/* ─── Main Setup Page ─── */

export default function SetupPage() {
  const navigate = useNavigate();

  // Step 1: Products
  const [productTab, setProductTab] = useState<'url' | 'csv' | 'database'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [addedProducts, setAddedProducts] = useState<AddedProduct[]>([]);
  const [selectedDbProducts, setSelectedDbProducts] = useState<string[]>([]);
  const [scraping, setScraping] = useState(false);
  const [csvUploaded, setCsvUploaded] = useState(false);
  const csvFileRef = useRef<HTMLInputElement>(null);

  // Step 2: Brand Brief
  const [brandName, setBrandName] = useState('');
  const [tone, setTone] = useState('friendly-professional');
  const [usp, setUsp] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [avoidWords, setAvoidWords] = useState<string[]>([]);
  const [showAiPrompts, setShowAiPrompts] = useState(false);

  // Step 3: Platform Config
  const [platforms, setPlatforms] = useState<Record<string, boolean>>({
    meta: true,
    google: true,
    tiktok: false,
    pinterest: false,
  });
  const [variations, setVariations] = useState(4);
  const [selectedUgcTypes, setSelectedUgcTypes] = useState<string[]>(['review', 'problem-solution']);
  const [outputFormat, setOutputFormat] = useState('csv');

  // Step 4: Generate
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStep, setGenStep] = useState('');

  /* ─── Product Handlers ─── */

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    setScraping(true);
    setTimeout(() => {
      const fake = scrapedProducts[addedProducts.length % scrapedProducts.length];
      setAddedProducts((prev) => [
        ...prev,
        {
          id: `url-${Date.now()}`,
          name: fake.name,
          sku: `SKU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          category: fake.category,
          price: fake.price,
          source: 'url',
        },
      ]);
      setUrlInput('');
      setScraping(false);
    }, 1800);
  };

  const handleCsvUpload = () => {
    setCsvUploaded(true);
    const csvProducts: AddedProduct[] = [
      { id: 'csv-1', name: 'Ceramic Candle Holder', sku: 'LIV-CH-600', category: 'Living Room', price: '$24.00', source: 'csv' },
      { id: 'csv-2', name: 'Wooden Picture Frame', sku: 'BED-PF-700', category: 'Bedroom', price: '$18.00', source: 'csv' },
      { id: 'csv-3', name: 'Woven Storage Basket', sku: 'LIV-SB-800', category: 'Living Room', price: '$32.00', source: 'csv' },
    ];
    setAddedProducts((prev) => [...prev, ...csvProducts]);
  };

  const toggleDbProduct = (sku: string) => {
    setSelectedDbProducts((prev) => {
      const next = prev.includes(sku) ? prev.filter((s) => s !== sku) : [...prev, sku];
      // Sync with addedProducts
      const dbProduct = productAdCounts.find((p) => p.sku === sku);
      if (dbProduct) {
        if (next.includes(sku)) {
          setAddedProducts((ap) => [
            ...ap,
            { id: `db-${sku}`, name: dbProduct.product, sku: dbProduct.sku, category: '', price: '', source: 'database' },
          ]);
        } else {
          setAddedProducts((ap) => ap.filter((p) => p.id !== `db-${sku}`));
        }
      }
      return next;
    });
  };

  const selectAllDb = () => {
    const allSkus = productAdCounts.map((p) => p.sku);
    setSelectedDbProducts(allSkus);
    const dbProducts: AddedProduct[] = productAdCounts.map((p) => ({
      id: `db-${p.sku}`,
      name: p.product,
      sku: p.sku,
      category: '',
      price: '',
      source: 'database' as const,
    }));
    setAddedProducts((prev) => [
      ...prev.filter((p) => p.source !== 'database'),
      ...dbProducts,
    ]);
  };

  const deselectAllDb = () => {
    setSelectedDbProducts([]);
    setAddedProducts((prev) => prev.filter((p) => p.source !== 'database'));
  };

  const removeProduct = (id: string) => {
    setAddedProducts((prev) => prev.filter((p) => p.id !== id));
    if (id.startsWith('db-')) {
      const sku = id.replace('db-', '');
      setSelectedDbProducts((prev) => prev.filter((s) => s !== sku));
    }
  };

  /* ─── Platform Handlers ─── */

  const togglePlatform = (id: string) => {
    setPlatforms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleUgcType = (id: string) => {
    setSelectedUgcTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  /* ─── Generate Handler ─── */

  const handleGenerate = () => {
    setGenerating(true);
    setGenProgress(0);

    const steps = [
      { text: 'Connecting to product catalog...', pct: 15 },
      { text: 'Analyzing product data...', pct: 30 },
      { text: 'Generating ad copy for all platforms...', pct: 55 },
      { text: 'Generating UGC video scripts...', pct: 75 },
      { text: 'Exporting files...', pct: 90 },
      { text: 'Done! Redirecting to dashboard...', pct: 100 },
    ];

    steps.forEach((step, i) => {
      setTimeout(() => {
        setGenStep(step.text);
        setGenProgress(step.pct);
        if (i === steps.length - 1) {
          setTimeout(() => navigate('/'), 1200);
        }
      }, (i + 1) * 1200);
    });
  };

  /* ─── Computed values ─── */

  const totalProducts = addedProducts.length;
  const enabledPlatforms = Object.entries(platforms).filter(([, v]) => v).map(([k]) => k);
  const estAds = totalProducts * enabledPlatforms.length * variations;
  const estUgc = totalProducts * selectedUgcTypes.length;

  const productTabs = [
    { id: 'url' as const, label: 'Paste URL', icon: Link2 },
    { id: 'csv' as const, label: 'Upload CSV', icon: Upload },
    { id: 'database' as const, label: 'Product Database', icon: Database },
  ];

  return (
    <div className="flex">
      <Sidebar activeSection="setup" onSectionChange={() => {}} />

      <div className="flex-1 ml-56 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-bg-primary/90 backdrop-blur-sm border-b border-border-subtle">
          <div className="px-6 lg:px-8 h-14 flex items-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-secondary transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </header>

        <main className="max-w-4xl px-6 lg:px-8 py-8">
          <div className="space-y-10">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">Setup Your Ad Generator</h1>
              <p className="text-text-secondary">
                Add your products, define your brand, pick your platforms, and generate ads.
              </p>
            </div>

            {/* ═══════ STEP 1: PRODUCTS ═══════ */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <StepBadge n={1} />
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Add Products</h2>
                  <p className="text-xs text-text-muted">Import products by URL, CSV, or from your database</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-4 bg-bg-card rounded-lg p-1 border border-border-subtle w-fit">
                {productTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setProductTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        productTab === tab.id
                          ? 'bg-bg-elevated text-text-primary'
                          : 'text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="bg-bg-card rounded-lg p-5 border border-border-subtle">
                {/* URL Tab */}
                {productTab === 'url' && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                        <input
                          type="url"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                          placeholder="https://yourstore.com/products/product-name"
                          className="w-full bg-bg-elevated border border-border-subtle rounded-lg pl-9 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-border-hover transition-colors"
                        />
                      </div>
                      <button
                        onClick={handleAddUrl}
                        disabled={!urlInput.trim() || scraping}
                        className="flex items-center gap-1.5 bg-text-primary text-bg-primary px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-text-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      >
                        {scraping ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        {scraping ? 'Scraping...' : 'Add Product'}
                      </button>
                    </div>
                    <p className="text-[11px] text-text-muted">
                      Paste any product URL — we'll automatically extract the name, description, price, and images.
                    </p>
                  </div>
                )}

                {/* CSV Tab */}
                {productTab === 'csv' && (
                  <div className="space-y-4">
                    {!csvUploaded ? (
                      <>
                        <label
                          onClick={() => csvFileRef.current?.click()}
                          className="flex flex-col items-center justify-center h-36 bg-bg-elevated border-2 border-dashed border-border-default rounded-lg cursor-pointer hover:border-border-hover hover:bg-bg-elevated/80 transition-colors"
                        >
                          <Upload className="w-6 h-6 text-text-muted mb-2" />
                          <span className="text-xs text-text-secondary font-medium">Drop CSV or XLSX file here</span>
                          <span className="text-[10px] text-text-muted mt-1">or click to browse</span>
                          <input
                            ref={csvFileRef}
                            type="file"
                            accept=".csv,.xlsx"
                            className="hidden"
                            onChange={handleCsvUpload}
                          />
                        </label>
                        <div className="bg-bg-elevated rounded-lg p-3">
                          <p className="text-[10px] text-text-muted font-medium mb-2">Expected columns:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {['sku', 'product_name', 'category', 'price', 'description', 'image_url'].map((col) => (
                              <span key={col} className="text-[10px] font-mono text-text-secondary bg-bg-card border border-border-subtle rounded px-1.5 py-0.5">
                                {col}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-400" />
                          </div>
                          <p className="text-xs text-text-primary font-medium">3 products imported from CSV</p>
                        </div>
                        <div className="bg-bg-elevated rounded-lg overflow-hidden">
                          <table className="w-full text-left text-[11px]">
                            <thead>
                              <tr className="border-b border-border-default">
                                <th className="px-3 py-2 text-text-muted font-medium">Product</th>
                                <th className="px-3 py-2 text-text-muted font-medium">SKU</th>
                                <th className="px-3 py-2 text-text-muted font-medium">Category</th>
                                <th className="px-3 py-2 text-text-muted font-medium">Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {addedProducts.filter((p) => p.source === 'csv').map((p) => (
                                <tr key={p.id} className="border-b border-border-subtle last:border-0">
                                  <td className="px-3 py-2 text-text-secondary">{p.name}</td>
                                  <td className="px-3 py-2 text-text-muted font-mono">{p.sku}</td>
                                  <td className="px-3 py-2 text-text-muted">{p.category}</td>
                                  <td className="px-3 py-2 text-text-muted">{p.price}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Database Tab */}
                {productTab === 'database' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-text-muted">
                        {selectedDbProducts.length} of {productAdCounts.length} selected
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={selectAllDb}
                          className="text-[10px] font-medium text-text-muted hover:text-text-secondary transition-colors"
                        >
                          Select All
                        </button>
                        <span className="text-border-subtle">|</span>
                        <button
                          onClick={deselectAllDb}
                          className="text-[10px] font-medium text-text-muted hover:text-text-secondary transition-colors"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {productAdCounts.map((p) => {
                        const selected = selectedDbProducts.includes(p.sku);
                        return (
                          <button
                            key={p.sku}
                            onClick={() => toggleDbProduct(p.sku)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                              selected
                                ? 'bg-bg-elevated border border-border-hover'
                                : 'bg-bg-elevated/50 border border-transparent hover:border-border-subtle'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                selected
                                  ? 'bg-text-primary border-text-primary'
                                  : 'border-border-default bg-transparent'
                              }`}
                            >
                              {selected && <Check className="w-2.5 h-2.5 text-bg-primary" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-text-primary truncate">{p.product}</p>
                              <p className="text-[10px] text-text-muted">{p.sku}</p>
                            </div>
                            <span className="text-[10px] text-text-muted shrink-0">{p.total} ads</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Products Added Summary */}
              {totalProducts > 0 && (
                <div className="mt-4 bg-bg-card rounded-lg p-4 border border-border-subtle">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-text-secondary" />
                      <p className="text-xs font-semibold text-text-primary">{totalProducts} product{totalProducts !== 1 ? 's' : ''} added</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {addedProducts.map((p) => (
                      <span
                        key={p.id}
                        className="flex items-center gap-1.5 bg-bg-elevated border border-border-subtle rounded-lg px-2.5 py-1.5 text-[11px] text-text-secondary"
                      >
                        <div className="w-5 h-5 rounded bg-bg-card border border-border-subtle flex items-center justify-center shrink-0">
                          <Image className="w-2.5 h-2.5 text-text-muted" />
                        </div>
                        {p.name}
                        <button
                          onClick={() => removeProduct(p.id)}
                          className="text-text-muted hover:text-text-primary ml-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ═══════ STEP 2: BRAND BRIEF ═══════ */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <StepBadge n={2} />
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Brand Brief</h2>
                  <p className="text-xs text-text-muted">Define your brand voice so the AI matches your tone</p>
                </div>
              </div>

              <div className="bg-bg-card rounded-lg p-5 border border-border-subtle space-y-5">
                {/* Row 1: Business Name + Tone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Business Name</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g. Evergreen Home Goods"
                      className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-border-hover transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Tone of Voice</label>
                    <div className="relative">
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-border-hover transition-colors appearance-none"
                      >
                        {toneOptions.map((o) => (
                          <option key={o.id} value={o.id}>{o.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* USP */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Unique Selling Proposition</label>
                  <textarea
                    value={usp}
                    onChange={(e) => setUsp(e.target.value)}
                    placeholder="What makes your products different? e.g. Hand-crafted quality, sustainable materials, lifetime warranty..."
                    rows={2}
                    className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-border-hover transition-colors resize-none"
                  />
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Target Audience</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. 25-45 homeowners who value quality over quantity"
                    className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-border-hover transition-colors"
                  />
                </div>

                {/* Tags: Competitors + Avoid Words */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Competitors</label>
                    <TagInput
                      tags={competitors}
                      onAdd={(t) => setCompetitors((prev) => [...prev, t])}
                      onRemove={(t) => setCompetitors((prev) => prev.filter((c) => c !== t))}
                      placeholder="Type a competitor name and press Enter"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Words to Avoid</label>
                    <TagInput
                      tags={avoidWords}
                      onAdd={(t) => setAvoidWords((prev) => [...prev, t])}
                      onRemove={(t) => setAvoidWords((prev) => prev.filter((w) => w !== t))}
                      placeholder="e.g. cheap, discount, bargain"
                    />
                  </div>
                </div>

                {/* AI Prompts Expandable */}
                <div className="border-t border-border-subtle pt-4">
                  <button
                    onClick={() => setShowAiPrompts(!showAiPrompts)}
                    className="flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Need help? Generate your brand brief with AI
                    <ChevronDown className={`w-3 h-3 transition-transform ${showAiPrompts ? 'rotate-180' : ''}`} />
                  </button>

                  {showAiPrompts && (
                    <div className="mt-4 space-y-3">
                      <p className="text-[11px] text-text-muted">
                        Copy any prompt below into Claude, ChatGPT, or any AI — then paste the results back into the fields above.
                      </p>
                      {aiPrompts.map((p) => (
                        <PromptCard key={p.title} title={p.title} prompt={p.prompt} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ═══════ STEP 3: PLATFORM CONFIG ═══════ */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <StepBadge n={3} />
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Platform & Output</h2>
                  <p className="text-xs text-text-muted">Choose where your ads will run and how they're generated</p>
                </div>
              </div>

              <div className="bg-bg-card rounded-lg p-5 border border-border-subtle space-y-6">
                {/* Platform Toggles */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-3">Platforms</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {platformOptions.map((p) => {
                      const enabled = platforms[p.id];
                      return (
                        <button
                          key={p.id}
                          onClick={() => togglePlatform(p.id)}
                          className={`flex items-center gap-2.5 px-3 py-3 rounded-lg border text-left transition-all ${
                            enabled
                              ? 'border-border-hover bg-bg-elevated'
                              : 'border-border-subtle bg-transparent hover:border-border-default'
                          }`}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full ${p.color} ${enabled ? '' : 'opacity-30'}`} />
                          <span className={`text-xs font-medium ${enabled ? 'text-text-primary' : 'text-text-muted'}`}>
                            {p.label}
                          </span>
                          {enabled && (
                            <Check className="w-3 h-3 text-green-400 ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Variations per product */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-3">Variations per Product</label>
                  <div className="flex gap-2">
                    {[2, 4, 6, 8].map((n) => (
                      <button
                        key={n}
                        onClick={() => setVariations(n)}
                        className={`flex-1 text-xs font-medium py-2.5 rounded-lg border transition-colors ${
                          variations === n
                            ? 'border-border-hover bg-bg-elevated text-text-primary'
                            : 'border-border-subtle text-text-muted hover:border-border-hover'
                        }`}
                      >
                        {n} per product
                      </button>
                    ))}
                  </div>
                </div>

                {/* UGC Types */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-3">UGC Video Types</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ugcTypeOptions.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => toggleUgcType(t.id)}
                        className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
                          selectedUgcTypes.includes(t.id)
                            ? 'border-border-hover bg-bg-elevated text-text-primary'
                            : 'border-border-subtle text-text-muted hover:border-border-hover'
                        }`}
                      >
                        {selectedUgcTypes.includes(t.id) && <Check className="w-2.5 h-2.5 inline mr-1" />}
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Output Format */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-3">Output Format</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'csv', label: 'CSV' },
                      { id: 'json', label: 'JSON' },
                      { id: 'sheets', label: 'Google Sheets' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setOutputFormat(f.id)}
                        className={`flex-1 text-xs font-medium py-2.5 rounded-lg border transition-colors ${
                          outputFormat === f.id
                            ? 'border-border-hover bg-bg-elevated text-text-primary'
                            : 'border-border-subtle text-text-muted hover:border-border-hover'
                        }`}
                      >
                        {f.id === outputFormat && <Check className="w-2.5 h-2.5 inline mr-1" />}
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ═══════ STEP 4: REVIEW & GENERATE ═══════ */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <StepBadge n={4} />
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Review & Generate</h2>
                  <p className="text-xs text-text-muted">Confirm your setup and start generating</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#252525] to-[#303030] rounded-lg p-6 border border-border-hover">
                {!generating ? (
                  <>
                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-bg-card/40 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-text-primary">{totalProducts}</p>
                        <p className="text-[10px] text-text-muted">Products</p>
                      </div>
                      <div className="bg-bg-card/40 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-text-primary">{enabledPlatforms.length}</p>
                        <p className="text-[10px] text-text-muted">Platforms</p>
                      </div>
                      <div className="bg-bg-card/40 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-text-primary">~{estAds}</p>
                        <p className="text-[10px] text-text-muted">Ad Copies</p>
                      </div>
                      <div className="bg-bg-card/40 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-text-primary">~{estUgc}</p>
                        <p className="text-[10px] text-text-muted">UGC Scripts</p>
                      </div>
                    </div>

                    {/* Config summary */}
                    <div className="flex flex-wrap items-center gap-3 mb-6 text-[11px] text-text-muted">
                      {brandName && (
                        <span className="bg-bg-card/40 rounded px-2 py-1">Brand: {brandName}</span>
                      )}
                      <span className="bg-bg-card/40 rounded px-2 py-1">
                        Tone: {toneOptions.find((o) => o.id === tone)?.label}
                      </span>
                      <span className="bg-bg-card/40 rounded px-2 py-1">
                        {variations} variations per product
                      </span>
                      <span className="bg-bg-card/40 rounded px-2 py-1">
                        Output: {outputFormat.toUpperCase()}
                      </span>
                    </div>

                    {/* Generate button */}
                    <div className="text-center">
                      <button
                        onClick={handleGenerate}
                        disabled={totalProducts === 0 || enabledPlatforms.length === 0}
                        className="inline-flex items-center gap-2 bg-text-primary text-bg-primary px-8 py-3 rounded-lg font-semibold hover:bg-text-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xl"
                      >
                        <Sparkles className="w-4 h-4" />
                        Generate Ads
                      </button>
                      {totalProducts === 0 && (
                        <p className="text-[10px] text-amber-400/80 mt-2">Add at least one product to get started</p>
                      )}
                      <p className="text-text-muted text-xs mt-4">
                        Prefer we handle the setup?{' '}
                        <a
                          href="https://cal.com/scale-ify/clarity-call"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors"
                        >
                          Book a Clarity Call
                        </a>
                      </p>
                    </div>
                  </>
                ) : (
                  /* Generation Progress */
                  <div className="py-4">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 rounded-full bg-bg-card/60 flex items-center justify-center mx-auto mb-3">
                        <Loader2 className="w-5 h-5 text-text-secondary animate-spin" />
                      </div>
                      <p className="text-sm font-medium text-text-primary">{genStep}</p>
                    </div>
                    <div className="max-w-md mx-auto">
                      <div className="h-2 bg-bg-card/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-text-primary rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${genProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-text-muted text-center mt-2">{genProgress}%</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
