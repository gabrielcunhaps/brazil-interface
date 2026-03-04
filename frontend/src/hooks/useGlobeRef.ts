import { useRef, useCallback } from "react";
import * as Cesium from "cesium";
import type { Viewer } from "cesium";

export function useGlobeRef() {
  const viewerRef = useRef<Viewer | null>(null);

  const setViewer = useCallback((viewer: Viewer | null) => {
    viewerRef.current = viewer;
  }, []);

  const flyTo = useCallback(
    (lon: number, lat: number, altitude = 1_000_000) => {
      const viewer = viewerRef.current;
      if (!viewer) return;

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, altitude),
        duration: 1.5,
      });
    },
    []
  );

  const resetView = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-52, -14, 6_000_000),
      duration: 2,
    });
  }, []);

  return { viewerRef, setViewer, flyTo, resetView };
}
