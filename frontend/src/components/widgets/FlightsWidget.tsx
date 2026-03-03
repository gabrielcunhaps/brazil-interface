import React, { useMemo, useState } from 'react';
import { Plane } from 'lucide-react';
import WidgetShell from './WidgetShell';
import { useDataStore } from '../../stores/dataStore';

type SortKey = 'altitude' | 'velocity';

const FlightsWidget: React.FC = () => {
  const flights = useDataStore((s) => s.flights);
  const [sortBy, setSortBy] = useState<SortKey>('altitude');

  const sorted = useMemo(
    () => [...flights].sort((a, b) => b[sortBy] - a[sortBy]),
    [flights, sortBy],
  );

  return (
    <WidgetShell title="Air Traffic" icon={<Plane size={14} />}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-zinc-500">
          TOTAL{' '}
          <span className="bg-emerald-900/50 text-emerald-400 px-1.5 py-0.5 rounded text-[10px]">
            {flights.length}
          </span>
        </span>
        <div className="flex gap-1">
          {(['altitude', 'velocity'] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                sortBy === key
                  ? 'bg-emerald-900/50 text-emerald-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-zinc-500 text-xs text-center py-4 font-mono">No flight data</p>
      ) : (
        <div className="overflow-auto flex-1">
          <table className="w-full text-[10px] font-mono">
            <thead className="sticky top-0 bg-zinc-900 z-10">
              <tr className="text-zinc-500 border-b border-zinc-700">
                <th className="text-left py-1 px-1">CALLSIGN</th>
                <th className="text-right py-1 px-1">ALT (m)</th>
                <th className="text-right py-1 px-1">VEL (m/s)</th>
                <th className="text-right py-1 px-1">HDG</th>
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 50).map((f, i) => (
                <tr
                  key={f.icao24}
                  className={`${
                    i % 2 === 0 ? 'bg-zinc-800/50' : 'bg-zinc-900'
                  } hover:bg-zinc-700/50 transition-colors`}
                >
                  <td className="py-0.5 px-1 text-zinc-200">
                    {f.callsign?.trim() || f.icao24}
                  </td>
                  <td className="text-right py-0.5 px-1 text-emerald-400">
                    {f.altitude?.toLocaleString() ?? '—'}
                  </td>
                  <td className="text-right py-0.5 px-1 text-zinc-300">
                    {f.velocity?.toFixed(0) ?? '—'}
                  </td>
                  <td className="text-right py-0.5 px-1 text-zinc-400">
                    {f.heading?.toFixed(0) ?? '—'}°
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

export default React.memo(FlightsWidget);
