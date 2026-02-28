import { useState } from 'react';
import {
  Plus,
  Filter,
  Download,
  Copy,
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Check,
  ChevronDown,
  ExternalLink,
  CloudDownload,
} from 'lucide-react';
import { adVariations, platformLabel, platformColor, type Platform, type AdVariation, type AdStatus } from '../data/sampleData';

/* ─── Gradient placeholders for ad creatives ─── */

const gradients = [
  'from-[#1a2744] to-[#0f1729]',
  'from-[#2a1a2e] to-[#1a0f20]',
  'from-[#1a2e2a] to-[#0f201a]',
  'from-[#2e2a1a] to-[#20190f]',
  'from-[#1a1a2e] to-[#0f0f20]',
  'from-[#2e1a1a] to-[#200f0f]',
  'from-[#1a2e1a] to-[#0f200f]',
  'from-[#2a2a1a] to-[#1e1e0f]',
  'from-[#1a2a2a] to-[#0f1e1e]',
  'from-[#2a1a2a] to-[#1e0f1e]',
  'from-[#1e2844] to-[#121a30]',
  'from-[#2e1e2e] to-[#1a1220]',
];

const productEmojis: Record<string, string> = {
  'Ceramic Pour-Over Set': '\u2615',
  'Bamboo Cutting Board XL': '\ud83e\udd6c',
  'Linen Duvet Cover': '\ud83d\udecf\ufe0f',
  'Cast Iron Dutch Oven': '\ud83c\udf72',
  'Modular Shelf System': '\ud83d\udcda',
  'Outdoor Teak Bench': '\ud83e\udeb5',
  'Handwoven Throw Blanket': '\ud83e\uddf6',
  'Stoneware Dinner Set': '\ud83c\udf7d\ufe0f',
};

const statusConfig: Record<AdStatus, { label: string; dot: string; bg: string; text: string }> = {
  draft: { label: 'Draft', dot: 'bg-[#808080]', bg: 'bg-[#808080]/10', text: 'text-[#808080]' },
  review: { label: 'Review', dot: 'bg-amber-400', bg: 'bg-amber-400/10', text: 'text-amber-400' },
  ready: { label: 'Ready', dot: 'bg-green-400', bg: 'bg-green-400/10', text: 'text-green-400' },
  exported: { label: 'Exported', dot: 'bg-blue-400', bg: 'bg-blue-400/10', text: 'text-blue-400' },
};

/* ─── Generate Form Modal ─── */

function GenerateModal({ onClose }: { onClose: () => void }) {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [angles, setAngles] = useState('4');
  const [platforms, setPlatforms] = useState<Platform[]>(['meta', 'google']);
  const [brandNotes, setBrandNotes] = useState('');
  const [generating, setGenerating] = useState(false);

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-bg-card rounded-xl border border-border-default max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle sticky top-0 bg-bg-card rounded-t-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-bg-elevated flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-text-secondary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Generate PPC Ads</p>
              <p className="text-[11px] text-text-muted">AI-powered ad creative generation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-5">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Ceramic Pour-Over Coffee Set"
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-border-hover transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Product Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key features, benefits, price point, target audience..."
              rows={3}
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-border-hover transition-colors resize-none"
            />
          </div>

          {/* Image Upload Areas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Product Images</label>
              <label className="flex flex-col items-center justify-center h-28 bg-bg-elevated border border-dashed border-border-default rounded-lg cursor-pointer hover:border-border-hover hover:bg-bg-elevated/80 transition-colors">
                <Upload className="w-5 h-5 text-text-muted mb-1.5" />
                <span className="text-[11px] text-text-muted">Drop images or click</span>
                <span className="text-[10px] text-text-muted/60 mt-0.5">PNG, JPG up to 10MB</span>
                <input type="file" multiple accept="image/*" className="hidden" />
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Reference Ads (optional)</label>
              <label className="flex flex-col items-center justify-center h-28 bg-bg-elevated border border-dashed border-border-default rounded-lg cursor-pointer hover:border-border-hover hover:bg-bg-elevated/80 transition-colors">
                <ImageIcon className="w-5 h-5 text-text-muted mb-1.5" />
                <span className="text-[11px] text-text-muted">Attach ad examples</span>
                <span className="text-[10px] text-text-muted/60 mt-0.5">Competitor ads, inspo, etc.</span>
                <input type="file" multiple accept="image/*" className="hidden" />
              </label>
            </div>
          </div>

          {/* Angles + Platforms row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Number of Angles</label>
              <div className="relative">
                <select
                  value={angles}
                  onChange={(e) => setAngles(e.target.value)}
                  className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-border-hover transition-colors appearance-none"
                >
                  <option value="2">2 angles</option>
                  <option value="3">3 angles</option>
                  <option value="4">4 angles</option>
                  <option value="5">5 angles</option>
                  <option value="6">6 angles</option>
                  <option value="8">8 angles</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Target Platforms</label>
              <div className="flex flex-wrap gap-1.5">
                {(['meta', 'google', 'tiktok', 'pinterest'] as Platform[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
                      platforms.includes(p)
                        ? 'border-border-hover bg-bg-elevated text-text-primary'
                        : 'border-border-subtle text-text-muted hover:border-border-hover'
                    }`}
                  >
                    {platforms.includes(p) && <Check className="w-2.5 h-2.5 inline mr-1" />}
                    {platformLabel(p).replace(' Ads', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Brand Voice */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Brand Voice Notes (optional)</label>
            <textarea
              value={brandNotes}
              onChange={(e) => setBrandNotes(e.target.value)}
              placeholder="Tone, words to avoid, competitor positioning..."
              rows={2}
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-border-hover transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-subtle flex items-center justify-between">
          <p className="text-[11px] text-text-muted">
            ~{parseInt(angles) * platforms.length} ads will be generated
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!productName.trim() || platforms.length === 0 || generating}
              className="flex items-center gap-2 bg-text-primary text-bg-primary px-5 py-2 rounded-lg text-xs font-semibold hover:bg-text-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <div className="w-3 h-3 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  Generate Ads
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Detail Modal ─── */

function DetailModal({ ad, onClose }: { ad: AdVariation; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const status = statusConfig[ad.status];

  const handleCopy = () => {
    const text = `Headline: ${ad.headline}\nPrimary Text: ${ad.primaryText}\nDescription: ${ad.description}\nCTA: ${ad.cta}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-bg-card rounded-xl border border-border-default max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle sticky top-0 bg-bg-card rounded-t-xl z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
              style={{ backgroundColor: `${platformColor(ad.platform)}15` }}
            >
              {productEmojis[ad.product] || '\ud83d\udce6'}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{ad.product}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${platformColor(ad.platform)}15`, color: platformColor(ad.platform) }}
                >
                  {platformLabel(ad.platform)}
                </span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${status.bg} ${status.text}`}>
                  {status.label}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Image preview */}
          <div className={`w-full aspect-[4/3] rounded-lg bg-gradient-to-br ${gradients[parseInt(ad.id.slice(-3)) % gradients.length]} flex items-center justify-center`}>
            <div className="text-center">
              <span className="text-4xl block mb-2">{productEmojis[ad.product] || '\ud83d\udce6'}</span>
              <p className="text-text-muted text-xs">Ad creative preview</p>
            </div>
          </div>

          {/* Angle */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Angle</p>
            <p className="text-sm font-medium text-text-primary">{ad.angle}</p>
          </div>

          {/* Headline */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] uppercase tracking-wider text-text-muted">Headline</p>
              <span className={`text-[10px] font-mono ${ad.charCount.headline > ad.charCount.maxHeadline ? 'text-red-400' : 'text-text-muted'}`}>
                {ad.charCount.headline}/{ad.charCount.maxHeadline}
              </span>
            </div>
            <p className="text-sm font-semibold text-text-primary">{ad.headline}</p>
          </div>

          {/* Primary Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] uppercase tracking-wider text-text-muted">Primary Text</p>
              <span className={`text-[10px] font-mono ${ad.charCount.primary > ad.charCount.maxPrimary ? 'text-red-400' : 'text-text-muted'}`}>
                {ad.charCount.primary}/{ad.charCount.maxPrimary}
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{ad.primaryText}</p>
          </div>

          {/* Description */}
          {ad.description && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Description</p>
              <p className="text-sm text-text-secondary">{ad.description}</p>
            </div>
          )}

          {/* CTA */}
          <div className="pt-2 border-t border-border-subtle">
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Call to Action</p>
            <p className="text-sm font-medium text-text-primary">{ad.cta}</p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-border-subtle flex items-center justify-between">
          <span className="text-[11px] text-text-muted font-mono">{ad.sku} &bull; {ad.createdAt}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-secondary bg-bg-elevated border border-border-subtle hover:border-border-hover px-3 py-2 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy Brief'}
            </button>
            <button className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-secondary bg-bg-elevated border border-border-subtle hover:border-border-hover px-3 py-2 rounded-lg transition-colors">
              <Download className="w-3 h-3" />
              Download
            </button>
            <button className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-secondary bg-bg-elevated border border-border-subtle hover:border-border-hover px-3 py-2 rounded-lg transition-colors">
              <CloudDownload className="w-3 h-3" />
              Google Drive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Ad Card ─── */

function AdCard({ ad, onClick }: { ad: AdVariation; onClick: () => void }) {
  const status = statusConfig[ad.status];
  const gradientIndex = parseInt(ad.id.slice(-3)) % gradients.length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left group rounded-xl overflow-hidden border border-border-subtle hover:border-border-hover transition-all bg-bg-card"
    >
      {/* Image area */}
      <div className={`relative aspect-square bg-gradient-to-br ${gradients[gradientIndex]} flex items-center justify-center`}>
        <div className="text-center">
          <span className="text-3xl block mb-1">{productEmojis[ad.product] || '\ud83d\udce6'}</span>
          <p className="text-[10px] text-text-muted/60">{ad.product}</p>
        </div>

        {/* Status dot */}
        <div className={`absolute top-2.5 left-2.5 w-2 h-2 rounded-full ${status.dot}`} />

        {/* Platform badge */}
        <span
          className="absolute top-2.5 right-2.5 text-[9px] font-semibold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: `${platformColor(ad.platform)}25`, color: platformColor(ad.platform) }}
        >
          {platformLabel(ad.platform).replace(' Ads', '')}
        </span>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs font-medium bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <ExternalLink className="w-3 h-3" />
            View Brief
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs font-semibold text-text-primary leading-snug truncate group-hover:text-white transition-colors">
          {ad.headline}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-text-muted truncate mr-2">{ad.angle}</span>
          {(ad.charCount.headline > ad.charCount.maxHeadline || ad.charCount.primary > ad.charCount.maxPrimary) && (
            <span className="text-[9px] font-medium text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded shrink-0">
              Over limit
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ─── Main Gallery ─── */

const statusFilters: (AdStatus | 'all')[] = ['all', 'ready', 'review', 'draft', 'exported'];

export default function PpcGallery() {
  const [selectedAd, setSelectedAd] = useState<AdVariation | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AdStatus | 'all'>('all');

  const filtered = statusFilter === 'all'
    ? adVariations
    : adVariations.filter((a) => a.status === statusFilter);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {/* Generate button */}
          <button
            onClick={() => setShowGenerate(true)}
            className="flex items-center gap-2 bg-text-primary text-bg-primary px-4 py-2 rounded-lg text-xs font-semibold hover:bg-text-secondary transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Generate PPC Ads
          </button>

          {/* Status filters */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-text-muted" />
            {statusFilters.map((s) => {
              const cfg = s === 'all' ? null : statusConfig[s];
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1.5 text-[11px] font-medium rounded-lg border transition-colors ${
                    statusFilter === s
                      ? 'bg-bg-elevated border-border-hover text-text-primary'
                      : 'border-border-subtle text-text-muted hover:text-text-secondary hover:border-border-hover'
                  }`}
                >
                  {cfg && <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5`} />}
                  {s === 'all' ? 'All' : cfg!.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-text-muted text-xs">{filtered.length} ads</span>
          <button className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-secondary bg-bg-card border border-border-subtle hover:border-border-hover px-3 py-1.5 rounded-lg transition-colors">
            <Download className="w-3 h-3" />
            Export All
          </button>
        </div>
      </div>

      {/* 4-column image grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((ad) => (
          <AdCard key={ad.id} ad={ad} onClick={() => setSelectedAd(ad)} />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ImageIcon className="w-10 h-10 text-text-muted/30 mb-3" />
          <p className="text-sm text-text-muted">No ads match this filter</p>
        </div>
      )}

      {/* Modals */}
      {showGenerate && <GenerateModal onClose={() => setShowGenerate(false)} />}
      {selectedAd && <DetailModal ad={selectedAd} onClose={() => setSelectedAd(null)} />}
    </div>
  );
}
