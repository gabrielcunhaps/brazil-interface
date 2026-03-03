import { useRef, useEffect, memo } from "react";
import {
  Viewer,
  Globe as ResiumGlobe,
  Scene,
  CameraFlyTo,
} from "resium";
import * as Cesium from "cesium";
import { useGlobeRef } from "@/hooks/useGlobeRef";
import FlightLayer from "./FlightLayer";
import EarthquakeLayer from "./EarthquakeLayer";
import SatelliteLayer from "./SatelliteLayer";
import FireLayer from "./FireLayer";
import DeforestationLayer from "./DeforestationLayer";
import WeatherLayer from "./WeatherLayer";

Cesium.Ion.defaultAccessToken = "";

const BRAZIL_CENTER = Cesium.Cartesian3.fromDegrees(-51.9, -14.2, 5_000_000);

function GlobeWidget() {
  const { viewerRef, setViewer } = useGlobeRef();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, [viewerRef]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <Viewer
        full={false}
        style={{ width: "100%", height: "100%" }}
        ref={(e) => {
          if (e?.cesiumElement) {
            setViewer(e.cesiumElement);
          }
        }}
        animation={false}
        baseLayerPicker={false}
        fullscreenButton={false}
        geocoder={false}
        homeButton={false}
        infoBox={false}
        navigationHelpButton={false}
        sceneModePicker={false}
        selectionIndicator={false}
        timeline={false}
        vrButton={false}
        requestRenderMode
        maximumRenderTimeChange={Infinity}
      >
        <Scene backgroundColor={Cesium.Color.BLACK} />
        <ResiumGlobe
          baseColor={Cesium.Color.fromCssColorString("#0a0a0f")}
          showGroundAtmosphere={false}
          enableLighting
        />
        <CameraFlyTo destination={BRAZIL_CENTER} duration={0} once />

        <FlightLayer />
        <EarthquakeLayer />
        <SatelliteLayer />
        <FireLayer />
        <DeforestationLayer />
        <WeatherLayer />
      </Viewer>
    </div>
  );
}

export default memo(GlobeWidget);
