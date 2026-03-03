import { memo, useMemo } from "react";
import { Entity, PointGraphics, LabelGraphics } from "resium";
import * as Cesium from "cesium";
import { useDataStore } from "@/stores/dataStore";
import { useUIStore } from "@/stores/uiStore";

function magnitudeColor(mag: number): Cesium.Color {
  if (mag < 3) return Cesium.Color.YELLOW.withAlpha(0.85);
  if (mag < 5) return Cesium.Color.ORANGE.withAlpha(0.9);
  if (mag < 7) return Cesium.Color.RED.withAlpha(0.95);
  return Cesium.Color.DARKRED.withAlpha(1.0);
}

function magnitudeSize(mag: number): number {
  return Math.max(4, Math.min(mag * 3, 24));
}

function EarthquakeLayer() {
  const earthquakes = useDataStore((s) => s.earthquakes);
  const active = useUIStore((s) => s.activeLayers.has("earthquakes"));

  const entities = useMemo(() => {
    if (!active || earthquakes.length === 0) return null;

    const now = Date.now();
    const ONE_HOUR = 3600_000;

    return earthquakes.map((eq) => {
      const isRecent = now - eq.time < ONE_HOUR;
      const color = magnitudeColor(eq.magnitude);
      const size = magnitudeSize(eq.magnitude);
      const position = Cesium.Cartesian3.fromDegrees(eq.lon, eq.lat);

      return (
        <Entity key={eq.id} position={position}>
          <PointGraphics
            pixelSize={size}
            color={color}
            outlineColor={isRecent ? Cesium.Color.WHITE : Cesium.Color.BLACK}
            outlineWidth={isRecent ? 2 : 1}
            disableDepthTestDistance={Number.POSITIVE_INFINITY}
          />
          <LabelGraphics
            text={`M${eq.magnitude.toFixed(1)} ${eq.place}`}
            font="11px monospace"
            fillColor={Cesium.Color.WHITE}
            outlineColor={Cesium.Color.BLACK}
            outlineWidth={2}
            style={Cesium.LabelStyle.FILL_AND_OUTLINE}
            pixelOffset={new Cesium.Cartesian2(0, -size - 6)}
            disableDepthTestDistance={Number.POSITIVE_INFINITY}
            scale={0.8}
            show={eq.magnitude >= 3}
          />
        </Entity>
      );
    });
  }, [earthquakes, active]);

  if (!active) return null;
  return <>{entities}</>;
}

export default memo(EarthquakeLayer);
