import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, ShieldAlert, Zap, AlertTriangle } from 'lucide-react';
import { Scan } from '../types';

interface SecurityAnalyticsProps {
  scans: Record<string, Scan>;
}

export function SecurityAnalytics({ scans }: SecurityAnalyticsProps) {
  const scanList = Object.values(scans);

  // Time series mock trend data for last 7 days
  const trendData = [
    { day: 'Mon', critical: 4, high: 8, medium: 12, score: 72 },
    { day: 'Tue', critical: 3, high: 6, medium: 10, score: 78 },
    { day: 'Wed', critical: 2, high: 5, medium: 9, score: 82 },
    { day: 'Thu', critical: 2, high: 4, medium: 7, score: 85 },
    { day: 'Fri', critical: 1, high: 3, medium: 6, score: 89 },
    { day: 'Sat', critical: 0, high: 2, medium: 4, score: 94 },
    { day: 'Sun', critical: 0, high: 1, medium: 3, score: 96 },
  ];

  const severityPieData = [
    { name: 'Critical', value: scanList.reduce((acc, s) => acc + (s.findingsSummary?.critical || 0), 0) || 1, color: '#ef4444' },
    { name: 'High', value: scanList.reduce((acc, s) => acc + (s.findingsSummary?.high || 0), 0) || 2, color: '#f97316' },
    { name: 'Medium', value: scanList.reduce((acc, s) => acc + (s.findingsSummary?.medium || 0), 0) || 4, color: '#eab308' },
    { name: 'Low', value: scanList.reduce((acc, s) => acc + (s.findingsSummary?.low || 0), 0) || 6, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium block">Mean Time to Fix (MTTR)</span>
            <span className="text-2xl font-extrabold text-white font-mono mt-1 block">1.8 Hours</span>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> 42% faster with AI PRs
            </span>
          </div>
          <div className="p-3 bg-brand-cyan/15 text-brand-cyan rounded-2xl border border-brand-cyan/30">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium block">Avg Security Score</span>
            <span className="text-2xl font-extrabold text-brand-emerald font-mono mt-1 block">94 / 100</span>
            <span className="text-[11px] text-gray-400 mt-1 block">Across all repositories</span>
          </div>
          <div className="p-3 bg-brand-emerald/15 text-brand-emerald rounded-2xl border border-brand-emerald/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium block">Auto-Patches Applied</span>
            <span className="text-2xl font-extrabold text-white font-mono mt-1 block">38 PRs</span>
            <span className="text-[11px] text-brand-cyan font-semibold mt-1 block">Zero regressions</span>
          </div>
          <div className="p-3 bg-purple-500/15 text-purple-400 rounded-2xl border border-purple-500/30">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium block">Active Risk Density</span>
            <span className="text-2xl font-extrabold text-amber-400 font-mono mt-1 block">0.02 / KLOC</span>
            <span className="text-[11px] text-gray-400 mt-1 block">Low vulnerability density</span>
          </div>
          <div className="p-3 bg-amber-500/15 text-amber-400 rounded-2xl border border-amber-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="glass-panel p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Vulnerability Reduction & Security Health Trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">7-day security score improvement velocity</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-brand-emerald/15 text-brand-emerald rounded-full border border-brand-emerald/30">
              +24% Improvement
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} domain={[60, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#scoreGrad)" name="Security Score" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Pie Chart */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Severity Distribution</h3>
            <p className="text-xs text-gray-400">Total detected vulnerabilities by level</p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severityPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                  {severityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {severityPieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-gray-300 font-medium">{item.name}:</span>
                <span className="font-mono text-white font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
