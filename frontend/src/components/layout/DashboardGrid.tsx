import React, { memo, useMemo, lazy, Suspense } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import { useDeck } from "@/hooks/useDeck";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Lazy-load all widgets to avoid import-time crashes
const GlobeWidget = lazy(() => import("@/components/globe/GlobeWidget"));
const FlightsWidget = lazy(() => import("@/components/widgets/FlightsWidget"));
const WeatherWidget = lazy(() => import("@/components/widgets/WeatherWidget"));
const EconomyWidget = lazy(() => import("@/components/widgets/EconomyWidget"));
const MarketWidget = lazy(() => import("@/components/widgets/MarketWidget"));
const FiresWidget = lazy(() => import("@/components/widgets/FiresWidget"));
const EarthquakeWidget = lazy(() => import("@/components/widgets/EarthquakeWidget"));
const DeforestationWidget = lazy(() => import("@/components/widgets/DeforestationWidget"));
const EnergyWidget = lazy(() => import("@/components/widgets/EnergyWidget"));
const HealthWidget = lazy(() => import("@/components/widgets/HealthWidget"));
const ElectionsWidget = lazy(() => import("@/components/widgets/ElectionsWidget"));
const SatellitesWidget = lazy(() => import("@/components/widgets/SatellitesWidget"));
const TransparencyWidget = lazy(() => import("@/components/widgets/TransparencyWidget"));
const IntelFeed = lazy(() => import("@/components/widgets/IntelFeed"));

const WIDGET_MAP: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  "intel-feed": IntelFeed,
  flights: FlightsWidget,
  satellites: SatellitesWidget,
  fires: FiresWidget,
  weather: WeatherWidget,
  earthquakes: EarthquakeWidget,
  economy: EconomyWidget,
  market: MarketWidget,
  deforestation: DeforestationWidget,
  energy: EnergyWidget,
  health: HealthWidget,
  elections: ElectionsWidget,
  transparency: TransparencyWidget,
};

class WidgetErrorBoundary extends React.Component<
  { name: string; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-zinc-900 text-red-400 font-mono text-xs p-2">
          {this.props.name} failed to load
        </div>
      );
    }
    return this.props.children;
  }
}

const WidgetFallback = () => (
  <div className="flex items-center justify-center h-full bg-zinc-900/50">
    <span className="text-zinc-600 font-mono text-xs animate-pulse">LOADING...</span>
  </div>
);

function DashboardGrid() {
  const { currentLayout, currentDeck, updateLayout } = useDeck();

  const layouts = useMemo(
    () => ({ lg: currentLayout }),
    [currentLayout]
  );

  const visibleWidgets = currentDeck.visibleWidgets;

  const handleLayoutChange = (_current: Layout[], allLayouts: { [key: string]: Layout[] }) => {
    const lgLayout = allLayouts.lg;
    if (lgLayout) {
      updateLayout(lgLayout);
    }
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768 }}
      cols={{ lg: 12, md: 8, sm: 4 }}
      rowHeight={40}
      onLayoutChange={handleLayoutChange}
      draggableHandle=".drag-handle"
      compactType="vertical"
      margin={[8, 8]}
      containerPadding={[8, 8]}
    >
      {visibleWidgets.map((widgetId) => {
        if (widgetId === "globe") {
          return (
            <div key="globe" className="overflow-hidden rounded-lg border border-zinc-800">
              <WidgetErrorBoundary name="Globe">
                <Suspense fallback={<WidgetFallback />}>
                  <GlobeWidget />
                </Suspense>
              </WidgetErrorBoundary>
            </div>
          );
        }

        const WidgetComponent = WIDGET_MAP[widgetId];
        if (!WidgetComponent) return null;

        return (
          <div key={widgetId}>
            <WidgetErrorBoundary name={widgetId}>
              <Suspense fallback={<WidgetFallback />}>
                <WidgetComponent />
              </Suspense>
            </WidgetErrorBoundary>
          </div>
        );
      })}
    </ResponsiveGridLayout>
  );
}

export default memo(DashboardGrid);
