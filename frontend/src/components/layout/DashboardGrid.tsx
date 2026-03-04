import { memo, useMemo, type ReactNode } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import { useDeck } from "@/hooks/useDeck";
import GlobeWidget from "@/components/globe/GlobeWidget";
import FlightsWidget from "@/components/widgets/FlightsWidget";
import WeatherWidget from "@/components/widgets/WeatherWidget";
import EconomyWidget from "@/components/widgets/EconomyWidget";
import MarketWidget from "@/components/widgets/MarketWidget";
import FiresWidget from "@/components/widgets/FiresWidget";
import EarthquakeWidget from "@/components/widgets/EarthquakeWidget";
import DeforestationWidget from "@/components/widgets/DeforestationWidget";
import EnergyWidget from "@/components/widgets/EnergyWidget";
import HealthWidget from "@/components/widgets/HealthWidget";
import ElectionsWidget from "@/components/widgets/ElectionsWidget";
import SatellitesWidget from "@/components/widgets/SatellitesWidget";
import TransparencyWidget from "@/components/widgets/TransparencyWidget";
import IntelFeed from "@/components/widgets/IntelFeed";

const ResponsiveGridLayout = WidthProvider(Responsive);

const WIDGET_COMPONENTS: Record<string, ReactNode> = {
  "intel-feed": <IntelFeed />,
  flights: <FlightsWidget />,
  satellites: <SatellitesWidget />,
  fires: <FiresWidget />,
  weather: <WeatherWidget />,
  earthquakes: <EarthquakeWidget />,
  economy: <EconomyWidget />,
  market: <MarketWidget />,
  deforestation: <DeforestationWidget />,
  energy: <EnergyWidget />,
  health: <HealthWidget />,
  elections: <ElectionsWidget />,
  transparency: <TransparencyWidget />,
};

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
              <GlobeWidget />
            </div>
          );
        }

        const widget = WIDGET_COMPONENTS[widgetId];
        if (!widget) return null;

        return (
          <div key={widgetId}>
            {widget}
          </div>
        );
      })}
    </ResponsiveGridLayout>
  );
}

export default memo(DashboardGrid);
