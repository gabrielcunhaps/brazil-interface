import { useEffect, useRef, memo } from "react";
import { useCesium } from "resium";
import * as Cesium from "cesium";
import * as satellite from "satellite.js";
import { useDataStore } from "@/stores/dataStore";
import { useUIStore } from "@/stores/uiStore";

function SatelliteLayer() {
  const { viewer } = useCesium();
  const pointsRef = useRef<Cesium.PointPrimitiveCollection | null>(null);
  const labelsRef = useRef<Cesium.LabelCollection | null>(null);
  const polylinesRef = useRef<Cesium.PolylineCollection | null>(null);
  const satellites = useDataStore((s) => s.satellites);
  const active = useUIStore((s) => s.activeLayers.has("satellites"));

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const points = viewer.scene.primitives.add(
      new Cesium.PointPrimitiveCollection()
    );
    const labels = viewer.scene.primitives.add(
      new Cesium.LabelCollection({ scene: viewer.scene })
    );
    const polylines = viewer.scene.primitives.add(
      new Cesium.PolylineCollection()
    );
    pointsRef.current = points;
    labelsRef.current = labels;
    polylinesRef.current = polylines;

    return () => {
      if (!viewer.isDestroyed()) {
        viewer.scene.primitives.remove(points);
        viewer.scene.primitives.remove(labels);
        viewer.scene.primitives.remove(polylines);
      }
      pointsRef.current = null;
      labelsRef.current = null;
      polylinesRef.current = null;
    };
  }, [viewer]);

  useEffect(() => {
    const points = pointsRef.current;
    const labels = labelsRef.current;
    const polylines = polylinesRef.current;
    if (!points || !labels || !polylines || !viewer || viewer.isDestroyed())
      return;

    points.removeAll();
    labels.removeAll();
    polylines.removeAll();

    if (!active || satellites.length === 0) {
      viewer.scene.requestRender();
      return;
    }

    for (const sat of satellites) {
      const altKm = sat.altitude;
      // Color by altitude: LEO cyan, MEO green, GEO gold
      let color: Cesium.Color;
      if (altKm < 2000) {
        color = Cesium.Color.CYAN.withAlpha(0.9);
      } else if (altKm < 20000) {
        color = Cesium.Color.LIME.withAlpha(0.9);
      } else {
        color = Cesium.Color.GOLD.withAlpha(0.9);
      }

      const position = Cesium.Cartesian3.fromDegrees(
        sat.lon,
        sat.lat,
        altKm * 1000
      );

      points.add({
        position,
        pixelSize: 5,
        color,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 1,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });

      labels.add({
        position,
        text: sat.name,
        font: "9px monospace",
        fillColor: color,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(8, 0),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scale: 0.7,
      });

      // Draw a simple orbit ring if TLE data is available
      if (sat.tle1 && sat.tle2) {
        try {
          const orbitPositions = propagateOrbit(sat.tle1, sat.tle2);
          if (orbitPositions.length > 1) {
            polylines.add({
              positions: orbitPositions,
              width: 1.0,
              material: Cesium.Material.fromType("Color", {
                color: color.withAlpha(0.3),
              }),
            });
          }
        } catch {
          // TLE propagation can fail for stale data
        }
      }
    }

    viewer.scene.requestRender();
  }, [satellites, active, viewer]);

  return null;
}

function propagateOrbit(tle1: string, tle2: string): Cesium.Cartesian3[] {
  try {
    const satrec = satellite.twoline2satrec(tle1, tle2);
    const positions: Cesium.Cartesian3[] = [];
    const now = new Date();
    const periodMinutes = (2 * Math.PI) / satrec.no; // orbital period
    const step = periodMinutes / 60; // ~60 points per orbit

    for (let i = 0; i <= 60; i++) {
      const t = new Date(now.getTime() + i * step * 60_000);
      const posVel = satellite.propagate(satrec, t);
      if (
        typeof posVel.position === "boolean" ||
        posVel.position === undefined
      )
        continue;

      const gmst = satellite.gstime(t);
      const geo = satellite.eciToGeodetic(posVel.position, gmst);
      const lon = satellite.degreesLong(geo.longitude);
      const lat = satellite.degreesLat(geo.latitude);
      const alt = geo.height * 1000;
      positions.push(Cesium.Cartesian3.fromDegrees(lon, lat, alt));
    }
    return positions;
  } catch {
    return [];
  }
}

export default memo(SatelliteLayer);
