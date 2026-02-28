import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, FileSpreadsheet, Palette, Calendar, Settings } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function SetupPage() {
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
              <h1 className="text-2xl font-bold text-text-primary mb-2">Setup Guide</h1>
              <p className="text-text-secondary">
                Connect your store and configure the ad generator to start producing platform-ready ad copy.
              </p>
            </div>

            {/* Step 1: What You Need */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-sm font-bold text-text-secondary border border-border-default">
                  1
                </div>
                <h2 className="text-lg font-semibold text-text-primary">What You Need</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-bg-card rounded-lg p-5 border border-border-subtle">
                  <ShoppingBag className="w-5 h-5 text-text-secondary mb-3" />
                  <h3 className="text-sm font-semibold text-text-primary mb-1">Product Catalog</h3>
                  <p className="text-text-muted text-xs leading-relaxed">
                    Export from Shopify, WooCommerce, or your store. Include titles, descriptions, prices, and images.
                  </p>
                </div>
                <div className="bg-bg-card rounded-lg p-5 border border-border-subtle">
                  <FileSpreadsheet className="w-5 h-5 text-text-secondary mb-3" />
                  <h3 className="text-sm font-semibold text-text-primary mb-1">Customer Reviews</h3>
                  <p className="text-text-muted text-xs leading-relaxed">
                    Top reviews per product (5-10 each). Used for authentic UGC scripts and social proof in ad copy.
                  </p>
                </div>
                <div className="bg-bg-card rounded-lg p-5 border border-border-subtle">
                  <Palette className="w-5 h-5 text-text-secondary mb-3" />
                  <h3 className="text-sm font-semibold text-text-primary mb-1">Brand Voice</h3>
                  <p className="text-text-muted text-xs leading-relaxed">
                    Brand guidelines, tone preferences, existing ad examples. Helps the AI match your voice exactly.
                  </p>
                </div>
              </div>
            </section>

            {/* Step 2: CSV Format */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-sm font-bold text-text-secondary border border-border-default">
                  2
                </div>
                <h2 className="text-lg font-semibold text-text-primary">Product CSV Format</h2>
              </div>
              <div className="bg-bg-card rounded-lg p-5 border border-border-subtle">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border-default">
                        <th className="pb-2 text-text-muted font-medium font-mono">sku</th>
                        <th className="pb-2 text-text-muted font-medium font-mono">product_name</th>
                        <th className="pb-2 text-text-muted font-medium font-mono">category</th>
                        <th className="pb-2 text-text-muted font-medium font-mono hidden md:table-cell">price</th>
                        <th className="pb-2 text-text-muted font-medium font-mono hidden md:table-cell">description</th>
                        <th className="pb-2 text-text-muted font-medium font-mono hidden lg:table-cell">image_url</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-text-secondary">
                        <td className="py-2 font-mono">KIT-PO-100</td>
                        <td className="py-2">Ceramic Pour-Over Set</td>
                        <td className="py-2">Kitchen</td>
                        <td className="py-2 hidden md:table-cell">$45.00</td>
                        <td className="py-2 hidden md:table-cell truncate max-w-40">Hand-crafted ceramic...</td>
                        <td className="py-2 hidden lg:table-cell truncate max-w-32">https://cdn.example...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-text-muted text-xs mt-3">
                  CSV or XLSX format. Include all active products you want ads generated for. Max 500 SKUs per run.
                </p>
              </div>
            </section>

            {/* Step 3: Configuration */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-sm font-bold text-text-secondary border border-border-default">
                  3
                </div>
                <h2 className="text-lg font-semibold text-text-primary">Configuration</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-bg-card rounded-lg p-5 border border-border-subtle">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="w-4 h-4 text-text-secondary" />
                    <h3 className="text-sm font-semibold text-text-primary">brand.json</h3>
                  </div>
                  <pre className="text-xs text-text-secondary bg-bg-elevated rounded-lg p-4 overflow-x-auto font-mono leading-relaxed">
{`{
  "business_name": "Your Brand",
  "tone": "friendly-professional",
  "usp": "Handcrafted quality...",
  "target_audience": "25-45 homeowners",
  "competitors": ["Brand A", "Brand B"],
  "avoid_words": ["cheap", "discount"]
}`}
                  </pre>
                </div>
                <div className="bg-bg-card rounded-lg p-5 border border-border-subtle">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="w-4 h-4 text-text-secondary" />
                    <h3 className="text-sm font-semibold text-text-primary">platforms.json</h3>
                  </div>
                  <pre className="text-xs text-text-secondary bg-bg-elevated rounded-lg p-4 overflow-x-auto font-mono leading-relaxed">
{`{
  "platforms": ["meta", "google", "tiktok"],
  "variations_per_product": 4,
  "ugc_types": [
    "review",
    "problem-solution",
    "unboxing"
  ],
  "output_format": "csv"
}`}
                  </pre>
                </div>
              </div>
            </section>

            {/* Step 4: CTA */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-sm font-bold text-text-secondary border border-border-default">
                  4
                </div>
                <h2 className="text-lg font-semibold text-text-primary">Ready to Generate?</h2>
              </div>
              <div className="bg-gradient-to-r from-[#252525] to-[#303030] rounded-lg p-8 text-center border border-border-hover">
                <p className="text-text-secondary mb-6">
                  We'll connect your store, configure the generator for your brand voice, and run the first batch of ads for you.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href="https://cal.com/scale-ify/clarity-call"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-text-primary text-bg-primary px-6 py-3 rounded-lg font-semibold hover:bg-text-secondary transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Book a Setup Call
                  </a>
                  <Link
                    to="/"
                    className="text-text-muted hover:text-text-secondary transition-colors text-sm"
                  >
                    Back to Demo Dashboard
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
