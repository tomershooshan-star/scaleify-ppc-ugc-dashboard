import { useState } from 'react';
import { Calendar } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import CampaignOverview from '../components/CampaignOverview';
import PpcGallery from '../components/PpcGallery';
import UgcScripts from '../components/UgcScripts';
import { business, generationStats } from '../data/sampleData';

type SectionId = 'overview' | 'ppc' | 'ugc';

const sectionTitles: Record<SectionId, string> = {
  overview: 'Campaign Overview',
  ppc: 'PPC Ads',
  ugc: 'UGC Videos',
};

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');

  return (
    <div className="flex">
      <Sidebar activeSection={activeSection} onSectionChange={(s) => setActiveSection(s as SectionId)} />

      {/* Main content — offset by sidebar width */}
      <div className="flex-1 ml-56 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-bg-primary/90 backdrop-blur-sm border-b border-border-subtle">
          <div className="px-6 lg:px-8 h-14 flex items-center justify-between">
            <div>
              <h1 className="text-sm font-semibold text-text-primary">{sectionTitles[activeSection]}</h1>
              <p className="text-text-muted text-[11px]">
                {business.name} &bull; {business.products} products &bull; Last generated: {generationStats.lastGenerated}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-text-muted text-xs bg-bg-card border border-border-subtle rounded-lg px-3 py-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Feb 2026</span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 px-6 lg:px-8 py-6">
          {activeSection === 'overview' && <CampaignOverview />}
          {activeSection === 'ppc' && <PpcGallery />}
          {activeSection === 'ugc' && <UgcScripts />}
        </main>

        {/* CTA Footer */}
        <div className="border-t border-border-subtle bg-bg-card mt-8">
          <div className="px-6 lg:px-8 py-8">
            <div className="bg-gradient-to-r from-[#252525] to-[#303030] rounded-lg p-8 text-center border border-border-hover">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-3">
                  Want this generating ads for YOUR products?
                </h2>
                <p className="text-text-secondary mb-5">
                  Connect your store, upload your product catalog, and get platform-ready ad copy in minutes.
                </p>
                <a
                  href="https://cal.com/scale-ify/clarity-call"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-text-primary text-bg-primary px-6 py-3 rounded-lg font-semibold hover:bg-text-secondary transition-colors shadow-xl"
                >
                  <Calendar className="w-4 h-4" />
                  Book Your Free Clarity Call
                </a>
                <p className="text-text-muted text-xs mt-3">
                  No commitment &bull; See your own ads generated live &bull; Get personalized recommendations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border-subtle bg-[#161616]">
          <div className="px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <p className="text-text-muted text-xs">
                &copy; 2026 Scaleify. Demo dashboard with sample data.
              </p>
              <p className="text-text-muted text-[10px] opacity-60">
                React + TypeScript + Recharts
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
