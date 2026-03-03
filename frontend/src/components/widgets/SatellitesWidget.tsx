import React from 'react';
import { Satellite } from 'lucide-react';
import WidgetShell from './WidgetShell';
import { useDataStore } from '../../stores/dataStore';

const SatellitesWidget: React.FC = () => {
  const satellites = useDataStore((s) => s.satellites);

  return (
    <WidgetShell title="Satellites" icon={<Satellite size={14} />}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-mono text-zinc-500">
          TRACKING{' '}
          <span className="bg-purple-900/50 text-purple-400 px-1.5 py-0.5 rounded text-[10px]">
            {satellites.length}
          </span>
        </span>
      </div>

      {satellites.length === 0 ? (
        <p className="text-zinc-500 text-xs text-center py-4 font-mono">No satellite data</p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-[10px] font-mono">
            <thead className="sticky top-0 bg-zinc-900 z-10">
              <tr className="text-zinc-500 border-b border-zinc-700">
                <th className="text-left py-1 px-1">NAME</th>
                <th className="text-right py-1 px-1">NORAD</th>
                <th className="text-right py-1 px-1">ALT (km)</th>
                <th className="text-right py-1 px-1">VEL (km/s)</th>
              </tr>
            </thead>
            <tbody>
              {satellites.slice(0, 30).map((s, i) => (
                <tr
                  key={s.noradId}
                  className={`${
                    i % 2 === 0 ? 'bg-zinc-800/50' : 'bg-zinc-900'
                  } hover:bg-zinc-700/50 transition-colors`}
                >
                  <td className="py-0.5 px-1 text-zinc-200 truncate max-w-[100px]">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                    {s.name}
                  </td>
                  <td className="text-right py-0.5 px-1 text-zinc-400">{s.noradId}</td>
                  <td className="text-right py-0.5 px-1 text-purple-400">
                    {s.altitude.toFixed(0)}
                  </td>
                  <td className="text-right py-0.5 px-1 text-zinc-300">
                    {s.velocity.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </WidgetShell>
  );
};

export default React.memo(SatellitesWidget);
