import React, { useMemo } from 'react';
import { Flame } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import WidgetShell from './WidgetShell';
import { useDataStore } from '../../stores/dataStore';

const FiresWidget: React.FC = () => {
  const fires = useDataStore((s) => s.fires);

  const stats = useMemo(() => {
    const confidence: Record<string, number> = { high: 0, nominal: 0, low: 0 };
    const sources: Record<string, number> = {};
    const byDate: Record<string, number> = {};

    for (const f of fires) {
      const conf = f.confidence?.toLowerCase() ?? 'low';
      if (conf === 'high' || conf === 'h') confidence.high++;
      else if (conf === 'nominal' || conf === 'n') confidence.nominal++;
      else confidence.low++;

      const src = f.source ?? 'unknown';
      sources[src] = (sources[src] || 0) + 1;

      if (f.acq_date) {
        byDate[f.acq_date] = (byDate[f.acq_date] || 0) + 1;
      }
    }

    const total = fires.length || 1;
    const trendData = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, count]) => ({ date, count }));

    return { confidence, sources, trendData, total };
  }, [fires]);

  return (
    <WidgetShell title="Fire Hotspots" icon={<Flame size={14} />}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl font-mono font-bold text-orange-400">
          {fires.length.toLocaleString()}
        </span>
        <span className="text-[9px] font-mono text-zinc-500 uppercase">Active Hotspots</span>
      </div>

      {stats.trendData.length > 1 && (
        <div className="h-16 mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.trendData}>
              <defs>
                <linearGradient id="fireGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', fontSize: 10, fontFamily: 'monospace' }}
                labelStyle={{ color: '#a1a1aa' }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#f97316"
                fill="url(#fireGrad)"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-1">
        <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Confidence</div>
        <div className="flex gap-2">
          {(['high', 'nominal', 'low'] as const).map((level) => {
            const pct = fires.length ? ((stats.confidence[level] / fires.length) * 100).toFixed(0) : '0';
            const colors = { high: 'text-red-400', nominal: 'text-orange-400', low: 'text-yellow-400' };
            return (
              <span key={level} className={`text-[10px] font-mono ${colors[level]}`}>
                {level}: {pct}%
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-2 space-y-1">
        <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Sources</div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(stats.sources).map(([src, count]) => (
            <span
              key={src}
              className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded"
            >
              {src}: {count}
            </span>
          ))}
          {Object.keys(stats.sources).length === 0 && (
            <span className="text-[10px] font-mono text-zinc-500">No source data</span>
          )}
        </div>
      </div>
    </WidgetShell>
  );
};

export default React.memo(FiresWidget);
