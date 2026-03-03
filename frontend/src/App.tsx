import { memo } from "react";
import { useSSE } from "@/hooks/useSSE";
import { useUIStore } from "@/stores/uiStore";
import TopBar from "@/components/layout/TopBar";
import StatusBar from "@/components/layout/StatusBar";
import Sidebar from "@/components/layout/Sidebar";
import DashboardGrid from "@/components/layout/DashboardGrid";
import SplashScreen from "@/components/layout/SplashScreen";
import FilmGrain from "@/components/effects/FilmGrain";
import Crosshair from "@/components/effects/Crosshair";

function App() {
  // Initialize SSE connection
  useSSE();

  const splashComplete = useUIStore((s) => s.splashComplete);

  return (
    <div className="h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {!splashComplete && <SplashScreen />}
      <TopBar />
      <div className="flex h-[calc(100vh-5rem)] mt-12 mb-8">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <DashboardGrid />
        </main>
      </div>
      <StatusBar />
      <FilmGrain />
      <Crosshair />
    </div>
  );
}

export default memo(App);
