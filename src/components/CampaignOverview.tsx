import { Megaphone, Video, Layers, Clock, Download, Zap } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import StatCard from './StatCard';
import {
  generationStats,
  platformBreakdown,
  productAdCounts,
  weeklyOutputHistory,
  platformLabel,
  platformColor,
} from '../data/sampleData';

const pieData = platformBreakdown.map((p) => ({
  name: platformLabel(p.platform),
  value: p.ads,
  color: platformColor(p.platform),
}));

export default function CampaignOverview() {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Ads" value={generationStats.totalAds} icon={Megaphone} />
        <StatCard title="UGC Scripts" value={generationStats.totalUgcScripts} icon={Video} />
        <StatCard title="Products" value={generationStats.productsProcessed} icon={Layers} />
        <StatCard title="Platforms" value={generationStats.platformsCovered} icon={Zap} />
        <StatCard title="Campaigns Ready" value={generationStats.campaignsReady} icon={Download} color="green" />
        <StatCard title="Gen Time" value={generationStats.generationTime} icon={Clock} />
      </div>

      {/* Platform Breakdown + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie chart */}
        <div className="bg-bg-card rounded-lg p-6 border border-border-subtle">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Ads by Platform</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                strokeWidth={2}
                stroke="#1a1a1a"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#202020', border: '1px solid #353535', borderRadius: '8px', color: '#d9d9d9' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-text-muted">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </div>
            ))}
          </div>
        </div>

        {/* Platform cards */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">Platform Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {platformBreakdown.map((p) => (
              <div
                key={p.platform}
                className="bg-bg-card rounded-lg p-4 border border-border-subtle flex items-start gap-3"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${platformColor(p.platform)}15` }}
                >
                  <Megaphone className="w-4 h-4" style={{ color: platformColor(p.platform) }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-text-primary">{platformLabel(p.platform)}</p>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        p.status === 'ready'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {p.status === 'ready' ? 'Ready' : 'Partial'}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-text-muted">Campaigns</p>
                      <p className="text-text-primary font-semibold">{p.campaigns}</p>
                    </div>
                    <div>
                      <p className="text-text-muted">Ads</p>
                      <p className="text-text-primary font-semibold">{p.ads}</p>
                    </div>
                    <div>
                      <p className="text-text-muted">Reach</p>
                      <p className="text-text-primary font-semibold">{p.estimatedReach}</p>
                    </div>
                  </div>
                  <p className="text-text-muted text-xs mt-2">Budget: {p.suggestedBudget}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Output Trend */}
      <div className="bg-bg-card rounded-lg p-6 border border-border-subtle">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Weekly Ad Generation Output</h3>
          <span className="text-xs text-text-muted bg-bg-elevated px-2 py-1 rounded">Last 8 weeks</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={weeklyOutputHistory} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#353535" />
            <XAxis dataKey="week" stroke="#808080" tick={{ fill: '#a0a0a0', fontSize: 11 }} />
            <YAxis stroke="#808080" tick={{ fill: '#a0a0a0', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#202020', border: '1px solid #353535', borderRadius: '8px', color: '#d9d9d9' }}
            />
            <Legend
              wrapperStyle={{ color: '#a0a0a0', fontSize: 11 }}
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  meta: 'Meta Ads',
                  google: 'Google Ads',
                  tiktok: 'TikTok',
                  ugc: 'UGC Scripts',
                };
                return labels[value] ?? value;
              }}
            />
            <Bar dataKey="meta" stackId="a" fill="#1877f2" radius={[0, 0, 0, 0]} />
            <Bar dataKey="google" stackId="a" fill="#ea4335" />
            <Bar dataKey="tiktok" stackId="a" fill="#ff004f" />
            <Bar dataKey="ugc" stackId="a" fill="#a0a0a0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Products Table */}
      <div className="bg-bg-card rounded-lg p-6 border border-border-subtle">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Ad Variations by Product</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-default">
                <th className="pb-3 text-text-muted font-medium">Product</th>
                <th className="pb-3 text-text-muted font-medium text-center">Meta</th>
                <th className="pb-3 text-text-muted font-medium text-center">Google</th>
                <th className="pb-3 text-text-muted font-medium text-center hidden md:table-cell">TikTok</th>
                <th className="pb-3 text-text-muted font-medium text-center hidden md:table-cell">Pinterest</th>
                <th className="pb-3 text-text-muted font-medium text-center hidden lg:table-cell">UGC</th>
                <th className="pb-3 text-text-muted font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {productAdCounts.map((p) => (
                <tr key={p.sku} className="border-b border-border-subtle/50 hover:bg-bg-elevated/30 transition-colors">
                  <td className="py-3">
                    <div className="font-medium text-text-primary">{p.product}</div>
                    <div className="text-xs text-text-muted font-mono">{p.sku}</div>
                  </td>
                  <td className="py-3 text-center text-sm" style={{ color: '#1877f2' }}>{p.meta}</td>
                  <td className="py-3 text-center text-sm" style={{ color: '#ea4335' }}>{p.google}</td>
                  <td className="py-3 text-center text-sm hidden md:table-cell" style={{ color: '#ff004f' }}>{p.tiktok}</td>
                  <td className="py-3 text-center text-sm hidden md:table-cell" style={{ color: '#e60023' }}>{p.pinterest}</td>
                  <td className="py-3 text-center text-sm text-text-secondary hidden lg:table-cell">{p.ugcScripts}</td>
                  <td className="py-3 text-right font-bold text-text-primary">{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
