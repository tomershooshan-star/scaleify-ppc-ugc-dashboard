import { BarChart3, Image, Video, Settings, Megaphone, Calendar } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'ppc', label: 'PPC Ads', icon: Image },
  { id: 'ugc', label: 'UGC Videos', icon: Video },
] as const;

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const location = useLocation();
  const isSetup = location.pathname === '/setup';

  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-bg-card border-r border-border-subtle flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 h-14 flex items-center gap-2.5 border-b border-border-subtle shrink-0">
        <div className="w-7 h-7 rounded-lg bg-bg-elevated flex items-center justify-center">
          <Megaphone className="w-3.5 h-3.5 text-text-secondary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary leading-tight">Ad Generator</p>
          <p className="text-[10px] text-text-muted leading-tight">by Scaleify</p>
        </div>
        <span className="text-[9px] font-medium bg-bg-elevated text-text-muted px-1.5 py-0.5 rounded border border-border-subtle ml-auto">
          DEMO
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider px-3 py-2">Dashboard</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = !isSetup && activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-bg-elevated text-text-primary font-medium'
                  : 'text-text-muted hover:text-text-secondary hover:bg-bg-elevated/50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-text-secondary' : ''}`} />
              {item.label}
            </button>
          );
        })}

        <div className="pt-4 pb-1">
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider px-3 py-2">Settings</p>
        </div>
        <Link
          to="/setup"
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            isSetup
              ? 'bg-bg-elevated text-text-primary font-medium'
              : 'text-text-muted hover:text-text-secondary hover:bg-bg-elevated/50'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Setup Guide
        </Link>
      </nav>

      {/* CTA at bottom */}
      <div className="px-3 pb-4 pt-2 border-t border-border-subtle">
        <a
          href="https://cal.com/scale-ify/clarity-call"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 w-full bg-bg-elevated hover:bg-border-default text-text-secondary text-xs font-medium px-3 py-2.5 rounded-lg border border-border-subtle hover:border-border-hover transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" />
          Book a Clarity Call
        </a>
      </div>
    </aside>
  );
}
