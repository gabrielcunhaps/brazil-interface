import React, { useMemo } from 'react';
import { TreePine } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import WidgetShell from './WidgetShell';
import { useDataStore } from '../../stores/dataStore';

const DeforestationWidget: React.FC = () => {
  const deforestation = useDataStore((s) => s.deforestation);

  const { totalArea, alertCount, biomeData, recentAlerts } = useMemo(() => {
    const total = deforestation.reduce((sum, a) => sum + a.area_km2, 0);
    const biomes: Record<string, number> = {};
    for (const a of deforestation) {
      const b = a.biome || 'Unknown';
      biomes[b] = (biomes[b] || 0) + a.area_km2;
    }
    const biomeArr = Object.entries(biomes)
      .map(([name, area]) => ({ name, area: parseFloat(area.toFixed(2)) }))
      .sort((a, b) => b.area - a.area);

    const recent = [...deforestation]
      .sort((a, b) => b.detected_date.localeCompare(a.detected_date))
      .slice(0, 5);

    return { totalArea: total, alertCount: deforestation.length, biomeData: biomeArr, recentAlerts: recent };
  }, [deforestation]);

  return (
    <WidgetShell title="Deforestation" icon={<TreePine size={14} />}>
      <div className="flex items-center gap-4 mb-2">
        <div>
          <div className="text-2xl font-mono font-bold text-red-400">
            {totalArea.toFixed(1)}
          </div>
          <div className="text-[9px] font-mono text-zinc-500 uppercase">km² deforested</div>
        </div>
        <div>
          <div className="text-lg font-mono font-bold text-zinc-200">{alertCount}</div>
          <div className="text-[9px] font-mono text-zinc-500 uppercase">Alerts</div>
        </div>
      </div>

      {biomeData.length > 0 && (
        <div className="mb-2">
          <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
            By Biome
          </div>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={biomeData} layout="vertical">
                <XAxis type="number" hide />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', fontSize: 10, fontFamily: 'monospace' }}
                />
                <Bar dataKey="area" fill="#ef4444" radius={[0, 2, 2, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {recentAlerts.length > 0 && (
        <div>
          <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
            Recent Alerts
          </div>
          <div className="space-y-0.5">
            {recentAlerts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between text-[10px] font-mono px-1.5 py-0.5 bg-zinc-800/50 rounded"
              >
                <span className="text-zinc-300 truncate">
                  {a.biome} — {a.area_km2.toFixed(2)} km²
                </span>
                <span className="text-zinc-500 whitespace-nowrap ml-2">{a.detected_date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {deforestation.length === 0 && (
        <p className="text-zinc-500 text-xs text-center py-4 font-mono">No deforestation data</p>
      )}
    </WidgetShell>
  );
};

export default React.memo(DeforestationWidget);
