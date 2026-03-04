import React from 'react';
import { Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import WidgetShell from './WidgetShell';
import { useDataStore } from '../../stores/dataStore';

const SOURCE_COLORS: Record<string, string> = {
  Hydro: '#3b82f6',
  Wind: '#06b6d4',
  Solar: '#eab308',
  Thermal: '#f97316',
  Nuclear: '#a855f7',
};

function getColor(name: string): string {
  for (const [key, color] of Object.entries(SOURCE_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return '#6b7280';
}

const EnergyWidget: React.FC = () => {
  const energy = useDataStore((s) => s.energy);

  return (
    <WidgetShell title="Energy Grid" icon={<Zap size={14} />}>
      {!energy ? (
        <p className="text-zinc-500 text-xs text-center py-4 font-mono">Awaiting data...</p>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-mono font-bold text-zinc-100">
              {energy.total_mw != null ? energy.total_mw.toLocaleString() : '—'}
            </span>
            <span className="text-[9px] font-mono text-zinc-500 uppercase">MW Total</span>
          </div>

          {(energy.sources ?? []).length > 0 ? (
          <div className="flex gap-2 flex-1 min-h-0">
            <div className="w-1/2 min-h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={energy.sources}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="80%"
                    strokeWidth={0}
                  >
                    {energy.sources.map((s) => (
                      <Cell key={s.name} fill={getColor(s.name)} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', fontSize: 10, fontFamily: 'monospace' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 flex flex-col justify-center gap-1">
              {energy.sources.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getColor(s.name) }}
                  />
                  <span className="text-[10px] font-mono text-zinc-300 truncate">
                    {s.name}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 ml-auto">
                    {s.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          ) : (
            <p className="text-zinc-500 text-xs text-center py-4 font-mono">No source breakdown</p>
          )}
        </div>
      )}
    </WidgetShell>
  );
};

export default React.memo(EnergyWidget);
