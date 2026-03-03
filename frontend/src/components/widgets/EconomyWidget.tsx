import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import WidgetShell from './WidgetShell';
import { useDataStore } from '../../stores/dataStore';

interface MetricCardProps {
  label: string;
  value: string;
  suffix?: string;
  history: { date: string; value: number }[];
  color: string;
}

function MetricCard({ label, value, history, color }: MetricCardProps) {
  const prev = history.length >= 2 ? history[history.length - 2].value : null;
  const curr = history.length >= 1 ? history[history.length - 1].value : null;
  const rising = prev !== null && curr !== null ? curr > prev : null;

  return (
    <div className="bg-zinc-800/60 rounded p-2 border border-zinc-700/50">
      <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
        {label}
      </div>
      <div className="flex items-center gap-1 mt-0.5">
        <span className="text-lg font-mono font-bold text-zinc-100">{value}</span>
        {rising !== null && (
          rising ? (
            <TrendingUp size={12} className="text-emerald-400" />
          ) : (
            <TrendingDown size={12} className="text-red-400" />
          )
        )}
      </div>
      {history.length > 1 && (
        <div className="h-8 mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

const EconomyWidget: React.FC = () => {
  const economy = useDataStore((s) => s.economy);

  return (
    <WidgetShell title="Economy" icon={<DollarSign size={14} />}>
      {!economy ? (
        <p className="text-zinc-500 text-xs text-center py-4 font-mono">No economic data</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <MetricCard
            label="SELIC"
            value={`${economy.selic.toFixed(2)}%`}
            history={economy.selic_history}
            color="#34d399"
          />
          <MetricCard
            label="USD/BRL"
            value={economy.usd_brl.toFixed(2)}
            history={economy.usd_brl_history}
            color="#60a5fa"
          />
          <MetricCard
            label="IPCA"
            value={`${economy.ipca.toFixed(2)}%`}
            history={economy.ipca_history}
            color="#f59e0b"
          />
        </div>
      )}
    </WidgetShell>
  );
};

export default React.memo(EconomyWidget);
