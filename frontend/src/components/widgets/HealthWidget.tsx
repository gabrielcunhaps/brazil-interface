import React from 'react';
import { Heart } from 'lucide-react';
import WidgetShell from './WidgetShell';
import { useDataStore } from '../../stores/dataStore';

function severityClass(cases: number): string {
  if (cases >= 10000) return 'text-red-400';
  if (cases >= 1000) return 'text-orange-400';
  if (cases >= 100) return 'text-yellow-400';
  return 'text-emerald-400';
}

const HealthWidget: React.FC = () => {
  const health = useDataStore((s) => s.health);

  return (
    <WidgetShell title="Health Monitor" icon={<Heart size={14} />}>
      {health.length === 0 ? (
        <p className="text-zinc-500 text-xs text-center py-4 font-mono">No health data</p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-[10px] font-mono">
            <thead className="sticky top-0 bg-zinc-900 z-10">
              <tr className="text-zinc-500 border-b border-zinc-700">
                <th className="text-left py-1 px-1">DISEASE</th>
                <th className="text-right py-1 px-1">CASES</th>
                <th className="text-right py-1 px-1">DEATHS</th>
                <th className="text-left py-1 px-1">REGION</th>
              </tr>
            </thead>
            <tbody>
              {health.map((h, i) => (
                <tr
                  key={`${h.disease}-${h.region}-${i}`}
                  className={`${
                    i % 2 === 0 ? 'bg-zinc-800/50' : 'bg-zinc-900'
                  } hover:bg-zinc-700/50 transition-colors`}
                >
                  <td className="py-0.5 px-1 text-zinc-200 truncate max-w-[100px]">
                    {h.disease}
                  </td>
                  <td className={`text-right py-0.5 px-1 ${severityClass(h.cases)}`}>
                    {h.cases.toLocaleString()}
                  </td>
                  <td className="text-right py-0.5 px-1 text-red-400">
                    {h.deaths.toLocaleString()}
                  </td>
                  <td className="py-0.5 px-1 text-zinc-400 truncate max-w-[80px]">
                    {h.region}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {health.length > 0 && health[0].period && (
            <div className="text-[9px] font-mono text-zinc-500 mt-1 px-1">
              Period: {health[0].period}
            </div>
          )}
        </div>
      )}
    </WidgetShell>
  );
};

export default React.memo(HealthWidget);
