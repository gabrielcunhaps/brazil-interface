import { memo, useEffect, useState } from "react";
import { useSSE } from "@/hooks/useSSE";
import { useDataStore } from "@/stores/dataStore";

function StatusBar() {
  const connectionStatus = useSSE();
  const [utc, setUtc] = useState(getUTC());

  const flightCount = useDataStore((s) => s.flights.length);
  const earthquakeCount = useDataStore((s) => s.earthquakes.length);
  const fireCount = useDataStore((s) => s.fires.length);

  useEffect(() => {
    const interval = setInterval(() => setUtc(getUTC()), 1000);
    return () => clearInterval(interval);
  }, []);

  const statusColor =
    connectionStatus === "connected"
      ? "bg-emerald-400"
      : connectionStatus === "connecting"
        ? "bg-amber-400"
        : "bg-red-400";

  const statusGlow =
    connectionStatus === "connected"
      ? "shadow-[0_0_6px_rgba(16,185,129,0.6)]"
      : connectionStatus === "connecting"
        ? "shadow-[0_0_6px_rgba(245,158,11,0.6)]"
        : "shadow-[0_0_6px_rgba(239,68,68,0.6)]";

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-8 bg-black border-t border-emerald-500/20 z-50 flex items-center justify-between px-4 font-mono text-xs text-zinc-500">
      {/* Left: Connection status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColor} ${statusGlow}`} />
        <span className="uppercase">{connectionStatus}</span>
      </div>

      {/* Center: UTC time */}
      <div className="flex items-center gap-4">
        <span className="text-zinc-400">{utc} UTC</span>
      </div>

      {/* Right: Entity counts */}
      <div className="flex items-center gap-4">
        <CountBadge label="FLT" count={flightCount} />
        <CountBadge label="EQK" count={earthquakeCount} />
        <CountBadge label="FIRE" count={fireCount} />
      </div>
    </footer>
  );
}

function CountBadge({ label, count }: { label: string; count: number }) {
  return (
    <span className="text-zinc-500">
      {label}:{" "}
      <span className="text-zinc-300">{count.toLocaleString()}</span>
    </span>
  );
}

function getUTC(): string {
  const now = new Date();
  return now.toISOString().slice(11, 19);
}

export default memo(StatusBar);
