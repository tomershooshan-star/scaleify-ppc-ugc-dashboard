import type { LucideIcon } from 'lucide-react';

type CardColor = 'default' | 'green' | 'amber' | 'red' | 'blue';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  color?: CardColor;
}

const colorMap: Record<CardColor, { icon: string; value: string }> = {
  default: { icon: 'text-text-secondary', value: 'text-text-primary' },
  green: { icon: 'text-green-400', value: 'text-green-400' },
  amber: { icon: 'text-amber-400', value: 'text-amber-400' },
  red: { icon: 'text-red-400', value: 'text-red-400' },
  blue: { icon: 'text-blue-400', value: 'text-blue-400' },
};

export default function StatCard({ title, value, icon: Icon, subtitle, color = 'default' }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className="bg-bg-card rounded-lg p-5 border border-border-subtle card-glow transition-all">
      <div className="flex items-start justify-between mb-3">
        <p className="text-text-muted text-xs font-medium uppercase tracking-wider">{title}</p>
        <Icon className={`w-4 h-4 ${colors.icon}`} />
      </div>
      <p className={`text-2xl font-bold ${colors.value}`}>{value}</p>
      {subtitle && <p className="text-text-muted text-xs mt-1">{subtitle}</p>}
    </div>
  );
}
