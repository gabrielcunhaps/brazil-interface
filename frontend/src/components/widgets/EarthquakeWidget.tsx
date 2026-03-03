import React from 'react';
import { Activity } from 'lucide-react';
import WidgetShell from './WidgetShell';
import { useDataStore } from '../../stores/dataStore';

function magColor(mag: number): string {
  if (mag >= 6) return 'bg-red-900/60 text-red-400 border-red-700';
  if (mag >= 4) return 'bg-orange-900/60 text-orange-400 border-orange-700';
  if (mag >= 2) return 'bg-yellow-900/60 text-yellow-400 border-yellow-700';
  return 'bg-zinc-700/60 text-zinc-400 border-zinc-600';
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const EarthquakeWidget: React.FC = () => {
  const earthquakes = useDataStore((s) => s.earthquakes);
  const recent = [...earthquakes]
    .sort((a, b) => b.time - a.time)
    .slice(0, 10);

  return (
    <WidgetShell title="Seismic Activity" icon={<Activity size={14} />}>
      {recent.length === 0 ? (
        <p className="text-zinc-500 text-xs text-center py-4 font-mono">No seismic data</p>
      ) : (
        <div className="space-y-1 overflow-auto">
          {recent.map((eq) => (
            <div
              key={eq.id}
              className="flex items-center gap-2 bg-zinc-800/50 rounded px-2 py-1 border border-zinc-700/30"
            >
              <span
                className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded border min-w-[40px] text-center ${magColor(eq.magnitude)}`}
              >
                {eq.magnitude.toFixed(1)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono text-zinc-200 truncate">
                  {eq.place}
                </div>
                <div className="text-[9px] font-mono text-zinc-500">
                  Depth: {eq.depth.toFixed(1)} km
                </div>
              </div>
              <span className="text-[9px] font-mono text-zinc-500 whitespace-nowrap">
                {timeAgo(eq.time)}
              </span>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
};

export default React.memo(EarthquakeWidget);
