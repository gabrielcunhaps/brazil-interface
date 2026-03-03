import React from 'react';
import { Cloud, Thermometer, Droplets, Wind } from 'lucide-react';
import WidgetShell from './WidgetShell';
import { useDataStore } from '../../stores/dataStore';

function tempColor(temp: number): string {
  if (temp <= 10) return 'text-blue-400';
  if (temp <= 20) return 'text-cyan-400';
  if (temp <= 30) return 'text-yellow-400';
  if (temp <= 35) return 'text-orange-400';
  return 'text-red-400';
}

function conditionIcon(temp: number, humidity: number) {
  if (humidity > 80) return <Cloud size={16} className="text-zinc-400" />;
  if (temp > 30) return <Thermometer size={16} className="text-orange-400" />;
  return <Cloud size={16} className="text-cyan-400" />;
}

const WeatherWidget: React.FC = () => {
  const weather = useDataStore((s) => s.weather);
  const stations = weather.slice(0, 4);

  return (
    <WidgetShell title="Weather Stations" icon={<Cloud size={14} />}>
      {stations.length === 0 ? (
        <p className="text-zinc-500 text-xs text-center py-4 font-mono">No weather data</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {stations.map((s) => (
            <div
              key={s.id}
              className="bg-zinc-800/60 rounded p-2 border border-zinc-700/50"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono text-zinc-500 truncate max-w-[80%]">
                  {s.name}
                </span>
                {conditionIcon(s.temp, s.humidity)}
              </div>
              <div className={`text-2xl font-mono font-bold ${tempColor(s.temp)}`}>
                {s.temp.toFixed(1)}°
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-0.5 text-[9px] font-mono text-zinc-400">
                  <Droplets size={10} className="text-blue-400" />
                  {s.humidity}%
                </span>
                <span className="flex items-center gap-0.5 text-[9px] font-mono text-zinc-400">
                  <Wind size={10} className="text-cyan-400" />
                  {s.wind_speed.toFixed(1)}m/s
                </span>
              </div>
              <div className="text-[9px] font-mono text-zinc-500 mt-0.5">
                {s.pressure.toFixed(0)} hPa
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
};

export default React.memo(WeatherWidget);
