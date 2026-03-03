import { useEffect, useRef, memo } from "react";
import { useCesium } from "resium";
import * as Cesium from "cesium";
import { useDataStore } from "@/stores/dataStore";
import { useUIStore } from "@/stores/uiStore";

function tempColor(temp: number): Cesium.Color {
  // -10C = deep blue, 15C = cyan, 25C = yellow, 40C+ = red
  if (temp < 0) return Cesium.Color.ROYALBLUE;
  if (temp < 15) {
    const t = temp / 15;
    return Cesium.Color.lerp(Cesium.Color.ROYALBLUE, Cesium.Color.CYAN, t, new Cesium.Color());
  }
  if (temp < 25) {
    const t = (temp - 15) / 10;
    return Cesium.Color.lerp(Cesium.Color.CYAN, Cesium.Color.YELLOW, t, new Cesium.Color());
  }
  if (temp < 40) {
    const t = (temp - 25) / 15;
    return Cesium.Color.lerp(Cesium.Color.YELLOW, Cesium.Color.RED, t, new Cesium.Color());
  }
  return Cesium.Color.RED;
}

function WeatherLayer() {
  const { viewer } = useCesium();
  const pointsRef = useRef<Cesium.PointPrimitiveCollection | null>(null);
  const labelsRef = useRef<Cesium.LabelCollection | null>(null);
  const weather = useDataStore((s) => s.weather);
  const active = useUIStore((s) => s.activeLayers.has("weather"));

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const points = viewer.scene.primitives.add(
      new Cesium.PointPrimitiveCollection()
    );
    const labels = viewer.scene.primitives.add(
      new Cesium.LabelCollection({ scene: viewer.scene })
    );
    pointsRef.current = points;
    labelsRef.current = labels;

    return () => {
      if (!viewer.isDestroyed()) {
        viewer.scene.primitives.remove(points);
        viewer.scene.primitives.remove(labels);
      }
      pointsRef.current = null;
      labelsRef.current = null;
    };
  }, [viewer]);

  useEffect(() => {
    const points = pointsRef.current;
    const labels = labelsRef.current;
    if (!points || !labels || !viewer || viewer.isDestroyed()) return;

    points.removeAll();
    labels.removeAll();

    if (!active || weather.length === 0) {
      viewer.scene.requestRender();
      return;
    }

    for (const station of weather) {
      const position = Cesium.Cartesian3.fromDegrees(
        station.lon,
        station.lat,
        0
      );
      const color = tempColor(station.temp);

      points.add({
        position,
        pixelSize: 7,
        color,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 1,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });

      // Temperature label
      labels.add({
        position,
        text: `${Math.round(station.temp)}\u00B0C`,
        font: "10px monospace",
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -14),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scale: 0.8,
      });

      // Wind direction indicator
      if (station.wind_speed > 0) {
        labels.add({
          position,
          text: windArrow(station.wind_dir),
          font: "12px monospace",
          fillColor: Cesium.Color.LIGHTGRAY,
          pixelOffset: new Cesium.Cartesian2(0, 12),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scale: 0.9,
        });
      }
    }

    viewer.scene.requestRender();
  }, [weather, active, viewer]);

  return null;
}

function windArrow(deg: number): string {
  // 8-direction wind arrows based on meteorological convention (direction wind comes FROM)
  const arrows = ["\u2193", "\u2199", "\u2190", "\u2196", "\u2191", "\u2197", "\u2192", "\u2198"];
  const idx = Math.round(deg / 45) % 8;
  return arrows[idx];
}

export default memo(WeatherLayer);
