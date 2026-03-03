import React from 'react';
import { Radio } from 'lucide-react';
import WidgetShell from './WidgetShell';
import { useDataStore } from '../../stores/dataStore';

const severityColors: Record<string, string> = {
  low: 'bg-zinc-700 text-zinc-300',
  medium: 'bg-amber-900/50 text-amber-400',
  high: 'bg-orange-900/50 text-orange-400',
  critical: 'bg-red-900/50 text-red-400',
};

const sourceColors: Record<string, string> = {
  flights: 'bg-blue-900/50 text-blue-400',
  earthquakes: 'bg-red-900/50 text-red-400',
  satellites: 'bg-purple-900/50 text-purple-400',
  fires: 'bg-orange-900/50 text-orange-400',
  weather: 'bg-cyan-900/50 text-cyan-400',
  economy: 'bg-emerald-900/50 text-emerald-400',
  market: 'bg-green-900/50 text-green-400',
  deforestation: 'bg-yellow-900/50 text-yellow-400',
  energy: 'bg-indigo-900/50 text-indigo-400',
  health: 'bg-pink-900/50 text-pink-400',
};

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const IntelFeed: React.FC = () => {
  const events = useDataStore((s) => s.intelEvents);
  const feed = events.slice(0, 50);

  return (
    <WidgetShell title="Intel Feed" icon={<Radio size={14} />}>
      {feed.length === 0 ? (
        <p className="text-zinc-500 text-xs text-center py-4 font-mono">No intel events</p>
      ) : (
        <div className="space-y-1 overflow-auto">
          {feed.map((evt) => (
            <div
              key={evt.id}
              className="flex items-start gap-2 px-1.5 py-1 rounded bg-zinc-800/30 border border-zinc-700/20"
            >
              <span
                className={`text-[8px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap mt-0.5 ${
                  sourceColors[evt.source] || 'bg-zinc-700 text-zinc-400'
                }`}
              >
                {evt.source.toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-zinc-200 truncate">
                    {evt.title}
                  </span>
                  <span
                    className={`text-[8px] font-mono px-1 py-0 rounded ${
                      severityColors[evt.severity] || severityColors.low
                    }`}
                  >
                    {evt.severity.toUpperCase()}
                  </span>
                </div>
                <div className="text-[9px] font-mono text-zinc-500">
                  {formatTimestamp(evt.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
};

export default React.memo(IntelFeed);
