import React, { useMemo } from 'react';
import { Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import WidgetShell from './WidgetShell';
import { useDataStore } from '../../stores/dataStore';

const ElectionsWidget: React.FC = () => {
  const elections = useDataStore((s) => s.elections);

  const { year, position, chartData } = useMemo(() => {
    if (elections.length === 0) return { year: null, position: null, chartData: [] };
    const first = elections[0];
    const data = elections
      .slice(0, 8)
      .filter((e) => e.candidate && e.votes != null)
      .map((e) => ({
        name: `${e.candidate || 'Unknown'}${e.party ? ` (${e.party})` : ''}`,
        votes: e.votes ?? 0,
        percentage: e.percentage ?? 0,
      }))
      .sort((a, b) => b.votes - a.votes);
    return { year: first.year, position: first.position, chartData: data };
  }, [elections]);

  return (
    <WidgetShell title="Elections" icon={<Users size={14} />}>
      {elections.length === 0 ? (
        <p className="text-zinc-500 text-xs text-center py-4 font-mono">Awaiting data...</p>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono bg-emerald-900/50 text-emerald-400 px-1.5 py-0.5 rounded">
              {year}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">{position}</span>
          </div>

          <div className="flex-1 min-h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 9, fill: '#a1a1aa', fontFamily: 'monospace' }}
                />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', fontSize: 10, fontFamily: 'monospace' }}
                  formatter={(value: number) => [value.toLocaleString(), 'Votes']}
                />
                <Bar dataKey="votes" fill="#22c55e" radius={[0, 2, 2, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </WidgetShell>
  );
};

export default React.memo(ElectionsWidget);
