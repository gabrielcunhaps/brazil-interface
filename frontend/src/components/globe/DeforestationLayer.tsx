import { memo, useMemo } from "react";
import { Entity, PolygonGraphics, PointGraphics, LabelGraphics } from "resium";
import * as Cesium from "cesium";
import { useDataStore } from "@/stores/dataStore";
import { useUIStore } from "@/stores/uiStore";
import type { DeforestationAlert } from "@/types";

const FILL_COLOR = Cesium.Color.RED.withAlpha(0.25);
const OUTLINE_COLOR = Cesium.Color.RED.withAlpha(0.9);
const POINT_COLOR = Cesium.Color.CRIMSON;

function extractPositions(
  geometry: Record<string, unknown>
): Cesium.Cartesian3[] | null {
  const coords = geometry.coordinates as number[][][] | number[][][][] | undefined;
  if (!coords) return null;

  if (geometry.type === "Polygon" && coords.length > 0) {
    return Cesium.Cartesian3.fromDegreesArray(
      (coords as number[][][])[0].flat()
    );
  }
  if (geometry.type === "MultiPolygon" && coords.length > 0) {
    const outer = (coords as number[][][][])[0];
    if (outer && outer.length > 0) {
      return Cesium.Cartesian3.fromDegreesArray(outer[0].flat());
    }
  }
  return null;
}

function AlertEntity({ alert }: { alert: DeforestationAlert }) {
  const position = Cesium.Cartesian3.fromDegrees(alert.lon, alert.lat);

  if (alert.geometry) {
    const positions = extractPositions(
      alert.geometry as unknown as Record<string, unknown>
    );
    if (positions) {
      return (
        <Entity key={alert.id} position={position}>
          <PolygonGraphics
            hierarchy={positions}
            material={FILL_COLOR}
            outline
            outlineColor={OUTLINE_COLOR}
            outlineWidth={2}
          />
          <LabelGraphics
            text={`${alert.area_km2.toFixed(1)} km\u00B2\n${alert.detected_date}`}
            font="10px monospace"
            fillColor={Cesium.Color.WHITE}
            outlineColor={Cesium.Color.BLACK}
            outlineWidth={2}
            style={Cesium.LabelStyle.FILL_AND_OUTLINE}
            pixelOffset={new Cesium.Cartesian2(0, -16)}
            disableDepthTestDistance={Number.POSITIVE_INFINITY}
            scale={0.8}
          />
        </Entity>
      );
    }
  }

  // Fallback: point marker if no geometry
  return (
    <Entity key={alert.id} position={position}>
      <PointGraphics
        pixelSize={8}
        color={POINT_COLOR}
        outlineColor={OUTLINE_COLOR}
        outlineWidth={2}
        disableDepthTestDistance={Number.POSITIVE_INFINITY}
      />
      <LabelGraphics
        text={`${alert.area_km2.toFixed(1)} km\u00B2`}
        font="10px monospace"
        fillColor={Cesium.Color.WHITE}
        outlineColor={Cesium.Color.BLACK}
        outlineWidth={2}
        style={Cesium.LabelStyle.FILL_AND_OUTLINE}
        pixelOffset={new Cesium.Cartesian2(0, -14)}
        disableDepthTestDistance={Number.POSITIVE_INFINITY}
        scale={0.8}
      />
    </Entity>
  );
}

const MemoAlert = memo(AlertEntity);

function DeforestationLayer() {
  const deforestation = useDataStore((s) => s.deforestation);
  const active = useUIStore((s) => s.activeLayers.has("deforestation"));

  const entities = useMemo(() => {
    if (!active || deforestation.length === 0) return null;
    return deforestation.map((alert) => (
      <MemoAlert key={alert.id} alert={alert} />
    ));
  }, [deforestation, active]);

  if (!active) return null;
  return <>{entities}</>;
}

export default memo(DeforestationLayer);
