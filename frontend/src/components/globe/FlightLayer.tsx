import { useEffect, useRef, memo } from "react";
import { useCesium } from "resium";
import * as Cesium from "cesium";
import { useDataStore } from "@/stores/dataStore";
import { useUIStore } from "@/stores/uiStore";

function altitudeColor(altitude: number): Cesium.Color {
  // 0m = green, 6000m = yellow, 12000m+ = red
  const t = Math.min(altitude / 12000, 1);
  if (t < 0.5) {
    const s = t * 2;
    return new Cesium.Color(s, 1.0, 0.0, 0.9);
  }
  const s = (t - 0.5) * 2;
  return new Cesium.Color(1.0, 1.0 - s, 0.0, 0.9);
}

function FlightLayer() {
  const { viewer } = useCesium();
  const billboardsRef = useRef<Cesium.BillboardCollection | null>(null);
  const labelsRef = useRef<Cesium.LabelCollection | null>(null);
  const flights = useDataStore((s) => s.flights);
  const active = useUIStore((s) => s.activeLayers.has("flights"));

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const billboards = viewer.scene.primitives.add(
      new Cesium.BillboardCollection({ scene: viewer.scene })
    );
    const labels = viewer.scene.primitives.add(
      new Cesium.LabelCollection({ scene: viewer.scene })
    );
    billboardsRef.current = billboards;
    labelsRef.current = labels;

    return () => {
      if (!viewer.isDestroyed()) {
        viewer.scene.primitives.remove(billboards);
        viewer.scene.primitives.remove(labels);
      }
      billboardsRef.current = null;
      labelsRef.current = null;
    };
  }, [viewer]);

  useEffect(() => {
    const billboards = billboardsRef.current;
    const labels = labelsRef.current;
    if (!billboards || !labels || !viewer || viewer.isDestroyed()) return;

    billboards.removeAll();
    labels.removeAll();

    if (!active || flights.length === 0) {
      viewer.scene.requestRender();
      return;
    }

    for (const f of flights) {
      if (f.on_ground) continue;

      const position = Cesium.Cartesian3.fromDegrees(
        f.lon,
        f.lat,
        f.altitude
      );
      const color = altitudeColor(f.altitude);

      billboards.add({
        position,
        image: createAirplaneCanvas(f.heading, color),
        scale: 0.5,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });

      if (f.callsign.trim()) {
        labels.add({
          position,
          text: f.callsign.trim(),
          font: "10px monospace",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -18),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scale: 0.8,
        });
      }
    }

    viewer.scene.requestRender();
  }, [flights, active, viewer]);

  return null;
}

const canvasCache = new Map<string, HTMLCanvasElement>();

function createAirplaneCanvas(
  heading: number,
  color: Cesium.Color
): HTMLCanvasElement {
  const key = `${Math.round(heading / 5) * 5}-${color.toCssColorString()}`;
  if (canvasCache.has(key)) return canvasCache.get(key)!;

  const size = 24;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.translate(size / 2, size / 2);
  ctx.rotate(((heading || 0) * Math.PI) / 180);

  ctx.fillStyle = color.toCssColorString();
  ctx.beginPath();
  // Simple airplane triangle pointing up
  ctx.moveTo(0, -10);
  ctx.lineTo(-6, 8);
  ctx.lineTo(0, 4);
  ctx.lineTo(6, 8);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 0.5;
  ctx.stroke();

  canvasCache.set(key, canvas);
  return canvas;
}

export default memo(FlightLayer);
