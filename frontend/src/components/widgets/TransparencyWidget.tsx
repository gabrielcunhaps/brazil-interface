import React, { useMemo } from 'react';
import { Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import WidgetShell from './WidgetShell';
import { useDataStore } from '../../stores/dataStore';

function formatBRL(value: number): string {
  if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(1)}K`;
  return `R$ ${value.toFixed(2)}`;
}

const TransparencyWidget: React.FC = () => {
  const transparency = useDataStore((s) => s.transparency);

  const chartData = useMemo(
    () =>
      [...transparency]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6)
        .map((t) => ({
          name: t.program.length > 20 ? t.program.slice(0, 20) + '...' : t.program,
          amount: t.amount,
        })),
    [transparency],
  );

  return (
    <WidgetShell title="Transparency" icon={<Eye size={14} />}>
      {transparency.length === 0 ? (
        <p className="text-zinc-500 text-xs text-center py-4 font-mono">No transparency data</p>
      ) : (
        <div className="flex flex-col h-full">
          {chartData.length > 0 && (
            <div className="h-24 mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 8, fill: '#a1a1aa', fontFamily: 'monospace' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={30}
                  />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', fontSize: 10, fontFamily: 'monospace' }}
                    formatter={(value: number) => [formatBRL(value), 'Amount']}
                  />
                  <Bar dataKey="amount" fill="#8b5cf6" radius={[2, 2, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="overflow-auto flex-1">
            <div className="space-y-0.5">
              {transparency.slice(0, 8).map((t, i) => (
                <div
                  key={`${t.program}-${i}`}
                  className="flex items-center justify-between text-[10px] font-mono px-1.5 py-1 bg-zinc-800/50 rounded"
                >
                  <div className="truncate flex-1 mr-2">
                    <span className="text-zinc-200">{t.program}</span>
                    <span className="text-zinc-500 ml-1">
                      ({t.beneficiaries.toLocaleString()} ben.)
                    </span>
                  </div>
                  <span className="text-emerald-400 whitespace-nowrap font-bold">
                    {formatBRL(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </WidgetShell>
  );
};

export default React.memo(TransparencyWidget);
