import { useEffect, useRef, memo } from "react";
import { useCesium } from "resium";
import * as Cesium from "cesium";
import { useDataStore } from "@/stores/dataStore";
import { useUIStore } from "@/stores/uiStore";

function fireColor(brightness: number, confidence: string): Cesium.Color {
  const isHigh = confidence === "high" || confidence === "nominal";
  if (brightness > 400) return Cesium.Color.RED.withAlpha(isHigh ? 1.0 : 0.8);
  if (brightness > 330)
    return Cesium.Color.ORANGERED.withAlpha(isHigh ? 0.95 : 0.75);
  return Cesium.Color.ORANGE.withAlpha(isHigh ? 0.9 : 0.7);
}

function fireSize(confidence: string): number {
  if (confidence === "high" || confidence === "nominal") return 5;
  if (confidence === "medium" || confidence === "normal") return 4;
  return 3;
}

function FireLayer() {
  const { viewer } = useCesium();
  const pointsRef = useRef<Cesium.PointPrimitiveCollection | null>(null);
  const fires = useDataStore((s) => s.fires);
  const active = useUIStore((s) => s.activeLayers.has("fires"));

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const points = viewer.scene.primitives.add(
      new Cesium.PointPrimitiveCollection()
    );
    pointsRef.current = points;

    return () => {
      if (!viewer.isDestroyed()) {
        viewer.scene.primitives.remove(points);
      }
      pointsRef.current = null;
    };
  }, [viewer]);

  useEffect(() => {
    const points = pointsRef.current;
    if (!points || !viewer || viewer.isDestroyed()) return;

    points.removeAll();

    if (!active || fires.length === 0) {
      viewer.scene.requestRender();
      return;
    }

    for (const fire of fires) {
      const position = Cesium.Cartesian3.fromDegrees(fire.lon, fire.lat, 0);
      const color = fireColor(fire.brightness, fire.confidence);
      const size = fireSize(fire.confidence);

      points.add({
        position,
        pixelSize: size,
        color,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 0.5,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });
    }

    viewer.scene.requestRender();
  }, [fires, active, viewer]);

  return null;
}

export default memo(FireLayer);
