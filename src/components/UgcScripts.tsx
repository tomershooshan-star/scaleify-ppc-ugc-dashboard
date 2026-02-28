import { useState, useRef } from 'react';
import {
  Video,
  Clock,
  X,
  Plus,
  Sparkles,
  Upload,
  Globe,
  ChevronDown,
  Check,
  Copy,
  Download,
  CloudDownload,
  GripVertical,
} from 'lucide-react';
import { ugcScripts as initialScripts, ugcTypeLabel, type UgcScript, type AdStatus, type UgcScriptType } from '../data/sampleData';

const columns: { id: AdStatus; label: string; color: string; dotColor: string }[] = [
  { id: 'draft', label: 'Draft', color: 'text-text-muted', dotColor: 'bg-text-muted' },
  { id: 'review', label: 'In Review', color: 'text-amber-400', dotColor: 'bg-amber-400' },
  { id: 'ready', label: 'Ready', color: 'text-green-400', dotColor: 'bg-green-400' },
  { id: 'exported', label: 'Exported', color: 'text-blue-400', dotColor: 'bg-blue-400' },
];

function statusLabel(s: AdStatus): string {
  const labels: Record<AdStatus, string> = { draft: 'Draft', review: 'In Review', ready: 'Ready', exported: 'Exported' };
  return labels[s];
}

function statusDotColor(s: AdStatus): string {
  const c: Record<AdStatus, string> = { draft: 'bg-text-muted', review: 'bg-amber-400', ready: 'bg-green-400', exported: 'bg-blue-400' };
  return c[s];
}

function statusTextColor(s: AdStatus): string {
  const c: Record<AdStatus, string> = { draft: 'text-text-muted', review: 'text-amber-400', ready: 'text-green-400', exported: 'text-blue-400' };
  return c[s];
}

function durationBadge(d: string): string {
  if (d === '15s') return 'bg-green-500/10 text-green-400';
  if (d === '30s') return 'bg-blue-500/10 text-blue-400';
  return 'bg-amber-500/10 text-amber-400';
}

function typeBadgeColor(t: string): string {
  const colors: Record<string, string> = {
    'review': 'bg-purple-500/10 text-purple-400',
    'unboxing': 'bg-pink-500/10 text-pink-400',
    'problem-solution': 'bg-orange-500/10 text-orange-400',
    'day-in-my-life': 'bg-teal-500/10 text-teal-400',
    'before-after': 'bg-cyan-500/10 text-cyan-400',
    'testimonial': 'bg-indigo-500/10 text-indigo-400',
  };
  return colors[t] ?? 'bg-bg-elevated text-text-muted';
}

const ugcTypes: { id: UgcScriptType; label: string }[] = [
  { id: 'review', label: 'Review' },
  { id: 'unboxing', label: 'Unboxing' },
  { id: 'problem-solution', label: 'Problem / Solution' },
  { id: 'day-in-my-life', label: 'Day in My Life' },
  { id: 'before-after', label: 'Before / After' },
  { id: 'testimonial', label: 'Testimonial' },
];

/* ─── Generate UGC Modal ─── */

function GenerateModal({ onClose }: { onClose: () => void }) {
  const [productName, setProductName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [angles, setAngles] = useState('3');
  const [duration, setDuration] = useState<'15s' | '30s' | '60s'>('30s');
  const [selectedTypes, setSelectedTypes] = useState<UgcScriptType[]>(['review', 'problem-solution']);
  const [brandNotes, setBrandNotes] = useState('');
  const [generating, setGenerating] = useState(false);

  const toggleType = (t: UgcScriptType) => {
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      onClose();
    }, 2500);
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
              <Video className="w-4 h-4 text-text-secondary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Generate UGC Videos</p>
              <p className="text-[11px] text-text-muted">Product photo to full UGC video script</p>
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
          {/* Product Name + Website */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Ceramic Pour-Over Set"
                className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-border-hover transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Website URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourstore.com/product"
                  className="w-full bg-bg-elevated border border-border-subtle rounded-lg pl-8 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-border-hover transition-colors"
                />
              </div>
              <p className="text-[10px] text-text-muted/60 mt-1">We'll scrape product info automatically</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Product Description (optional if URL provided)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key selling points, target audience, price, what makes it special..."
              rows={2}
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-border-hover transition-colors resize-none"
            />
          </div>

          {/* Image Upload Areas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Product Photo</label>
              <label className="flex flex-col items-center justify-center h-28 bg-bg-elevated border border-dashed border-border-default rounded-lg cursor-pointer hover:border-border-hover hover:bg-bg-elevated/80 transition-colors">
                <Upload className="w-5 h-5 text-text-muted mb-1.5" />
                <span className="text-[11px] text-text-muted">Drop product photo</span>
                <span className="text-[10px] text-text-muted/60 mt-0.5">Used as the base for video</span>
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Reference UGC (optional)</label>
              <label className="flex flex-col items-center justify-center h-28 bg-bg-elevated border border-dashed border-border-default rounded-lg cursor-pointer hover:border-border-hover hover:bg-bg-elevated/80 transition-colors">
                <Video className="w-5 h-5 text-text-muted mb-1.5" />
                <span className="text-[11px] text-text-muted">Attach UGC examples</span>
                <span className="text-[10px] text-text-muted/60 mt-0.5">Videos or screenshots</span>
                <input type="file" multiple accept="image/*,video/*" className="hidden" />
              </label>
            </div>
          </div>

          {/* Angles + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Number of Angles</label>
              <div className="relative">
                <select
                  value={angles}
                  onChange={(e) => setAngles(e.target.value)}
                  className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-border-hover transition-colors appearance-none"
                >
                  <option value="1">1 angle</option>
                  <option value="2">2 angles</option>
                  <option value="3">3 angles</option>
                  <option value="4">4 angles</option>
                  <option value="6">6 angles</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Video Duration</label>
              <div className="flex gap-2">
                {(['15s', '30s', '60s'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`flex-1 text-xs font-medium py-2.5 rounded-lg border transition-colors ${
                      duration === d
                        ? 'border-border-hover bg-bg-elevated text-text-primary'
                        : 'border-border-subtle text-text-muted hover:border-border-hover'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* UGC Types */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Video Types</label>
            <div className="flex flex-wrap gap-1.5">
              {ugcTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleType(t.id)}
                  className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
                    selectedTypes.includes(t.id)
                      ? 'border-border-hover bg-bg-elevated text-text-primary'
                      : 'border-border-subtle text-text-muted hover:border-border-hover'
                  }`}
                >
                  {selectedTypes.includes(t.id) && <Check className="w-2.5 h-2.5 inline mr-1" />}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Voice */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Creator Notes (optional)</label>
            <textarea
              value={brandNotes}
              onChange={(e) => setBrandNotes(e.target.value)}
              placeholder="Tone of voice, creator persona, talking points to include or avoid..."
              rows={2}
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-border-hover transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-subtle flex items-center justify-between">
          <p className="text-[11px] text-text-muted">
            ~{parseInt(angles) * selectedTypes.length} scripts ({duration} each)
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
              disabled={!productName.trim() || selectedTypes.length === 0 || generating}
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
                  Generate Scripts
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Product Detail Modal (Multi-Angle View) ─── */

function ProductModal({
  product,
  angles,
  onClose,
}: {
  product: string;
  angles: UgcScript[];
  onClose: () => void;
}) {
  const [activeAngle, setActiveAngle] = useState(0);
  const [copied, setCopied] = useState(false);

  const current = angles[activeAngle];

  const handleCopy = () => {
    const lines = [
      `Product: ${current.product}`,
      `Angle: ${ugcTypeLabel(current.type)} | Duration: ${current.duration}`,
      `Hook: "${current.hook}"`,
      '',
      'Scene Breakdown:',
      ...current.scenes.map((s) => `[${s.timestamp}] ${s.direction}${s.voiceover ? `\nVO: "${s.voiceover}"` : ''}`),
      '',
      `CTA: ${current.cta}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAll = () => {
    const allLines = angles.map((angle, i) => {
      const lines = [
        `--- Angle ${i + 1}: ${ugcTypeLabel(angle.type)} (${angle.duration}) ---`,
        `Hook: "${angle.hook}"`,
        '',
        'Scene Breakdown:',
        ...angle.scenes.map((s) => `[${s.timestamp}] ${s.direction}${s.voiceover ? `\nVO: "${s.voiceover}"` : ''}`),
        '',
        `CTA: ${angle.cta}`,
      ];
      return lines.join('\n');
    });
    navigator.clipboard.writeText(`Product: ${product}\n\n${allLines.join('\n\n')}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-bg-card rounded-xl border border-border-default max-w-3xl w-full max-h-[88vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-card rounded-t-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-bg-elevated flex items-center justify-center">
              <Video className="w-4 h-4 text-text-secondary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{product}</p>
              <p className="text-[11px] text-text-muted">
                {angles.length} angle{angles.length !== 1 ? 's' : ''} generated
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Angle tabs */}
        <div className="px-6 pt-3 pb-0 border-b border-border-subtle shrink-0">
          <div className="flex gap-1 overflow-x-auto">
            {angles.map((angle, i) => (
              <button
                key={angle.id}
                onClick={() => setActiveAngle(i)}
                className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                  i === activeAngle
                    ? 'border-text-primary text-text-primary bg-bg-elevated/50'
                    : 'border-transparent text-text-muted hover:text-text-secondary hover:bg-bg-elevated/30'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor(angle.status)}`} />
                <span>Angle {i + 1}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${typeBadgeColor(angle.type)}`}>
                  {ugcTypeLabel(angle.type)}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${durationBadge(angle.duration)}`}>
                  {angle.duration}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Active angle content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status + meta row */}
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-[11px] font-medium ${statusTextColor(current.status)}`}>
              <span className={`w-2 h-2 rounded-full ${statusDotColor(current.status)}`} />
              {statusLabel(current.status)}
            </span>
            <span className="text-border-subtle">|</span>
            <span className="text-[11px] text-text-muted">{current.scenes.length} scenes</span>
          </div>

          {/* Hook */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1.5">Opening Hook</p>
            <p className="text-sm text-text-primary font-medium italic leading-relaxed">"{current.hook}"</p>
          </div>

          {/* Scene breakdown */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-3">Scene Breakdown</p>
            <div className="space-y-3">
              {current.scenes.map((scene, i) => (
                <div key={i} className="flex gap-3 bg-bg-elevated rounded-lg p-3">
                  <span className="text-text-muted font-mono text-[10px] shrink-0 w-20 pt-0.5">
                    {scene.timestamp}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-muted text-[11px] italic mb-1">[{scene.direction}]</p>
                    {scene.voiceover && (
                      <p className="text-text-secondary text-sm leading-relaxed">"{scene.voiceover}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2 border-t border-border-subtle">
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1.5">Call to Action</p>
            <p className="text-sm font-medium text-text-primary">{current.cta}</p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-border-subtle flex items-center justify-between shrink-0">
          <p className="text-[11px] text-text-muted">
            Viewing angle {activeAngle + 1} of {angles.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-secondary bg-bg-elevated border border-border-subtle hover:border-border-hover px-3 py-2 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy This Angle'}
            </button>
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-secondary bg-bg-elevated border border-border-subtle hover:border-border-hover px-3 py-2 rounded-lg transition-colors"
            >
              <Copy className="w-3 h-3" />
              Copy All Angles
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

/* ─── Script Card (Draggable) ─── */

function ScriptCard({
  script,
  allScripts,
  onClick,
  onDragStart,
}: {
  script: UgcScript;
  allScripts: UgcScript[];
  onClick: () => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}) {
  const angleCount = allScripts.filter((s) => s.product === script.product).length;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, script.id)}
      onClick={onClick}
      className="w-full text-left bg-bg-elevated rounded-lg p-3.5 border border-border-subtle hover:border-border-hover transition-all group cursor-grab active:cursor-grabbing"
    >
      {/* Top row: grip + product name + type badge */}
      <div className="flex items-start gap-2 mb-2">
        <GripVertical className="w-3.5 h-3.5 text-text-muted/40 shrink-0 mt-0.5 group-hover:text-text-muted transition-colors" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-text-primary leading-snug group-hover:text-white transition-colors">
              {script.product}
            </p>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${typeBadgeColor(script.type)}`}>
              {ugcTypeLabel(script.type)}
            </span>
          </div>
        </div>
      </div>

      {/* Hook excerpt */}
      <p className="text-[11px] text-text-muted leading-relaxed mb-3 line-clamp-2 ml-5.5">
        "{script.hook}"
      </p>

      {/* Bottom row: status + duration + angles + scenes */}
      <div className="flex items-center justify-between ml-5.5">
        <div className="flex items-center gap-2">
          {/* Status badge */}
          <span className={`flex items-center gap-1 text-[10px] font-medium ${statusTextColor(script.status)}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor(script.status)}`} />
            {statusLabel(script.status)}
          </span>
          {/* Duration */}
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${durationBadge(script.duration)}`}>
            <Clock className="w-2.5 h-2.5 inline mr-0.5" />
            {script.duration}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {angleCount > 1 && (
            <span className="text-[10px] text-text-muted bg-bg-card px-1.5 py-0.5 rounded">
              {angleCount} angles
            </span>
          )}
          <span className="text-[10px] text-text-muted">{script.scenes.length} scenes</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export default function UgcScripts() {
  const [scripts, setScripts] = useState<UgcScript[]>([...initialScripts]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [dragOverCol, setDragOverCol] = useState<AdStatus | null>(null);
  const draggedId = useRef<string | null>(null);

  // Drag handlers
  const handleDragStart = (_e: React.DragEvent, id: string) => {
    draggedId.current = id;
  };

  const handleDragOver = (e: React.DragEvent, colId: AdStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) setDragOverCol(colId);
  };

  const handleDragLeave = (e: React.DragEvent, colId: AdStatus) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX, clientY } = e;
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      if (dragOverCol === colId) setDragOverCol(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: AdStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = draggedId.current;
    if (!id) return;
    setScripts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: targetStatus } : s))
    );
    draggedId.current = null;
  };

  const handleDragEnd = () => {
    setDragOverCol(null);
    draggedId.current = null;
  };

  // Group by column
  const grouped = columns.map((col) => ({
    ...col,
    scripts: scripts.filter((s) => s.status === col.id),
  }));

  // Get all angles for a product
  const getProductAngles = (product: string): UgcScript[] => {
    return scripts.filter((s) => s.product === product);
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGenerate(true)}
            className="flex items-center gap-2 bg-text-primary text-bg-primary px-4 py-2 rounded-lg text-xs font-semibold hover:bg-text-secondary transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Generate UGC Videos
          </button>

          {/* Summary counts */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-muted">{scripts.length} scripts</span>
            <div className="flex items-center gap-2">
              {columns.map((col) => {
                const count = scripts.filter((s) => s.status === col.id).length;
                if (count === 0) return null;
                return (
                  <span key={col.id} className="flex items-center gap-1 text-[11px] text-text-muted">
                    <span className={`w-1.5 h-1.5 rounded-full ${col.dotColor}`} />
                    {count}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <button className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-secondary bg-bg-card border border-border-subtle hover:border-border-hover px-3 py-1.5 rounded-lg transition-colors">
          <Download className="w-3 h-3" />
          Export All
        </button>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" onDragEnd={handleDragEnd}>
        {grouped.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={(e) => handleDragLeave(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`bg-bg-card rounded-xl border overflow-hidden transition-colors ${
              dragOverCol === col.id
                ? 'border-text-primary/50 bg-bg-card/80'
                : 'border-border-subtle'
            }`}
          >
            {/* Column header */}
            <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                <span className="text-xs font-semibold text-text-primary">{col.label}</span>
              </div>
              <span className="text-[10px] font-medium text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded">
                {col.scripts.length}
              </span>
            </div>

            {/* Column cards */}
            <div className={`p-3 space-y-2.5 min-h-[200px] transition-colors ${
              dragOverCol === col.id ? 'bg-text-primary/[0.03]' : ''
            }`}>
              {col.scripts.length === 0 ? (
                <div className={`flex items-center justify-center h-32 text-xs rounded-lg border-2 border-dashed transition-colors ${
                  dragOverCol === col.id
                    ? 'border-text-primary/30 text-text-secondary'
                    : 'border-transparent text-text-muted'
                }`}>
                  {dragOverCol === col.id ? 'Drop here' : 'No scripts'}
                </div>
              ) : (
                col.scripts.map((script) => (
                  <ScriptCard
                    key={script.id}
                    script={script}
                    allScripts={scripts}
                    onClick={() => setSelectedProduct(script.product)}
                    onDragStart={handleDragStart}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showGenerate && <GenerateModal onClose={() => setShowGenerate(false)} />}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          angles={getProductAngles(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
