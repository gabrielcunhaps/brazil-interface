import { memo } from "react";
import {
  Globe,
  TreePine,
  Activity,
  Eye,
  Scan,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useDeck } from "@/hooks/useDeck";
import { useUIStore } from "@/stores/uiStore";
import type { DeckPreset, ShaderMode } from "@/types";

const DECK_ICONS: Record<string, React.ReactNode> = {
  "command-center": <Globe className="w-3.5 h-3.5" />,
  "amazon-watch": <TreePine className="w-3.5 h-3.5" />,
  "brazil-pulse": <Activity className="w-3.5 h-3.5" />,
};

const SHADER_OPTIONS: { value: ShaderMode; label: string }[] = [
  { value: "none", label: "None" },
  { value: "crt", label: "CRT" },
  { value: "nvg", label: "NVG" },
  { value: "flir", label: "FLIR" },
];

function TopBar() {
  const { activePreset, presetList, switchPreset } = useDeck();
  const connectionStatus = "connected"; // SSE managed by App
  const shaderMode = useUIStore((s) => s.shaderMode);
  const setShaderMode = useUIStore((s) => s.setShaderMode);

  return (
    <header className="fixed top-0 left-0 right-0 h-12 bg-black border-b border-emerald-500/20 z-50 flex items-center justify-between px-4">
      {/* Left: Title */}
      <div className="flex items-center gap-2">
        <Scan className="w-5 h-5 text-emerald-400" />
        <span
          className="font-mono text-sm font-bold tracking-widest text-emerald-400"
          style={{ textShadow: "0 0 10px rgba(16, 185, 129, 0.5)" }}
        >
          BRAZIL INTELLIGENCE
        </span>
      </div>

      {/* Center: Deck selector tabs */}
      <nav className="flex items-center gap-1 bg-zinc-800/50 rounded-md p-0.5">
        {presetList
          .filter((d) => d.id !== "custom")
          .map((deck) => (
            <button
              key={deck.id}
              onClick={() => switchPreset(deck.id as DeckPreset)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all ${
                activePreset === deck.id
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 border border-transparent"
              }`}
            >
              {DECK_ICONS[deck.id]}
              <span className="hidden md:inline">{deck.name}</span>
            </button>
          ))}
      </nav>

      {/* Right: Effects + Connection */}
      <div className="flex items-center gap-3">
        {/* Shader mode selector */}
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-zinc-500" />
          <select
            value={shaderMode}
            onChange={(e) => setShaderMode(e.target.value as ShaderMode)}
            className="bg-zinc-800 border border-zinc-700 rounded text-xs font-mono text-zinc-300 px-2 py-1 outline-none focus:border-emerald-500/50"
          >
            {SHADER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-1.5">
          {connectionStatus === "connected" ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-red-400" />
          )}
          <span
            className={`text-xs font-mono ${
              connectionStatus === "connected"
                ? "text-emerald-400"
                : connectionStatus === "connecting"
                  ? "text-amber-400"
                  : "text-red-400"
            }`}
          >
            {connectionStatus === "connected"
              ? "LIVE"
              : connectionStatus === "connecting"
                ? "SYNC"
                : "OFFLINE"}
          </span>
        </div>
      </div>
    </header>
  );
}

export default memo(TopBar);
