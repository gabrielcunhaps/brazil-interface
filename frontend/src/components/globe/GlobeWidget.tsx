import { memo, Component, type ReactNode, useState, useEffect } from "react";
import { Globe } from "lucide-react";

// Error boundary to catch Cesium/Resium initialization failures
class GlobeErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function GlobeFallback() {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <div className="text-emerald-500/50 font-mono text-sm text-center">
        <Globe className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p>3D GLOBE</p>
        <p className="text-xs text-emerald-500/30">Requires Cesium Ion Token</p>
      </div>
    </div>
  );
}

function CesiumGlobe() {
  const [loaded, setLoaded] = useState(false);
  const [mod, setMod] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCesium() {
      try {
        const [cesiumMod, resiumMod, hookMod, ...layerMods] = await Promise.all([
          import("cesium"),
          import("resium"),
          import("@/hooks/useGlobeRef"),
          import("./FlightLayer"),
          import("./EarthquakeLayer"),
          import("./SatelliteLayer"),
          import("./FireLayer"),
          import("./DeforestationLayer"),
          import("./WeatherLayer"),
        ]);

        if (cancelled) return;

        cesiumMod.Ion.defaultAccessToken = "";

        setMod({
          Cesium: cesiumMod,
          Viewer: resiumMod.Viewer,
          ResiumGlobe: resiumMod.Globe,
          Scene: resiumMod.Scene,
          CameraFlyTo: resiumMod.CameraFlyTo,
          useGlobeRef: hookMod.useGlobeRef,
          FlightLayer: layerMods[0].default,
          EarthquakeLayer: layerMods[1].default,
          SatelliteLayer: layerMods[2].default,
          FireLayer: layerMods[3].default,
          DeforestationLayer: layerMods[4].default,
          WeatherLayer: layerMods[5].default,
        });
        setLoaded(true);
      } catch {
        // Cesium not available — stay unloaded, fallback will show
      }
    }

    loadCesium();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded || !mod) {
    return <GlobeFallback />;
  }

  return <CesiumViewer mod={mod} />;
}

function CesiumViewer({ mod }: { mod: any }) {
  const {
    Cesium,
    Viewer,
    ResiumGlobe,
    Scene,
    CameraFlyTo,
    useGlobeRef,
    FlightLayer,
    EarthquakeLayer,
    SatelliteLayer,
    FireLayer,
    DeforestationLayer,
    WeatherLayer,
  } = mod;

  const { viewerRef, setViewer } = useGlobeRef();
  const BRAZIL_CENTER = Cesium.Cartesian3.fromDegrees(-51.9, -14.2, 5_000_000);

  useEffect(() => {
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, [viewerRef]);

  return (
    <div className="w-full h-full relative">
      <Viewer
        full={false}
        style={{ width: "100%", height: "100%" }}
        ref={(e: any) => {
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

function GlobeWidget() {
  return (
    <GlobeErrorBoundary fallback={<GlobeFallback />}>
      <CesiumGlobe />
    </GlobeErrorBoundary>
  );
}

export default memo(GlobeWidget);
