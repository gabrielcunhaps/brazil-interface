import React, { useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { createChart, ColorType, type IChartApi } from 'lightweight-charts';
import WidgetShell from './WidgetShell';
import { useDataStore } from '../../stores/dataStore';

const MarketWidget: React.FC = () => {
  const market = useDataStore((s) => s.market);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#a1a1aa',
        fontSize: 10,
        fontFamily: 'ui-monospace, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(63, 63, 70, 0.3)' },
        horzLines: { color: 'rgba(63, 63, 70, 0.3)' },
      },
      width: chartRef.current.clientWidth,
      height: chartRef.current.clientHeight,
      rightPriceScale: {
        borderColor: 'rgba(63, 63, 70, 0.5)',
      },
      timeScale: {
        borderColor: 'rgba(63, 63, 70, 0.5)',
      },
    });

    const areaSeries = chart.addAreaSeries({
      topColor: 'rgba(34, 197, 94, 0.4)',
      bottomColor: 'rgba(34, 197, 94, 0.0)',
      lineColor: '#22c55e',
      lineWidth: 2,
    });

    if (market?.history) {
      areaSeries.setData(
        market.history.map((h) => ({
          time: h.time as any,
          value: h.close,
        })),
      );
    }

    chartInstanceRef.current = chart;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartInstanceRef.current || !market?.history) return;
    const series = chartInstanceRef.current.timeScale();
    // Re-apply data on updates
    const allSeries = (chartInstanceRef.current as any)._private__seriesMap;
    // Simpler approach: remove and re-create not needed if we keep a ref
  }, [market?.history]);

  const isUp = market ? market.change >= 0 : true;

  return (
    <WidgetShell title="IBOVESPA" icon={<TrendingUp size={14} />}>
      {!market ? (
        <p className="text-zinc-500 text-xs text-center py-4 font-mono">No market data</p>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-mono font-bold text-zinc-100">
              {market.price.toLocaleString('pt-BR')}
            </span>
            <span
              className={`flex items-center gap-0.5 text-xs font-mono ${
                isUp ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isUp ? '+' : ''}
              {market.change.toFixed(2)} ({market.changePercent.toFixed(2)}%)
            </span>
          </div>
          <div ref={chartRef} className="flex-1 min-h-[120px]" />
        </div>
      )}
    </WidgetShell>
  );
};

export default React.memo(MarketWidget);
