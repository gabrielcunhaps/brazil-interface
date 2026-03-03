import { memo } from "react";
import {
  Plane,
  Satellite,
  Flame,
  TreePine,
  CloudRain,
  Activity,
  TrendingUp,
  DollarSign,
  HeartPulse,
  Vote,
  FileSearch,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { LAYERS_BY_CATEGORY } from "@/config/layers";
import type { ShaderMode } from "@/types";

const ICON_MAP: Record<string, React.ReactNode> = {
  Plane: <Plane className="w-4 h-4" />,
  Satellite: <Satellite className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  TreePine: <TreePine className="w-4 h-4" />,
  CloudRain: <CloudRain className="w-4 h-4" />,
  Activity: <Activity className="w-4 h-4" />,
  TrendingUp: <TrendingUp className="w-4 h-4" />,
  DollarSign: <DollarSign className="w-4 h-4" />,
  HeartPulse: <HeartPulse className="w-4 h-4" />,
  Vote: <Vote className="w-4 h-4" />,
  FileSearch: <FileSearch className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
};

const SHADER_OPTIONS: { value: ShaderMode; label: string }[] = [
  { value: "none", label: "None" },
  { value: "crt", label: "CRT" },
  { value: "nvg", label: "NVG" },
  { value: "flir", label: "FLIR" },
];

function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const activeLayers = useUIStore((s) => s.activeLayers);
  const toggleLayer = useUIStore((s) => s.toggleLayer);
  const shaderMode = useUIStore((s) => s.shaderMode);
  const setShaderMode = useUIStore((s) => s.setShaderMode);

  return (
    <aside
      className={`relative flex-shrink-0 h-full bg-zinc-900/95 border-r border-zinc-800 transition-all duration-300 overflow-hidden ${
        sidebarOpen ? "w-64" : "w-0"
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-6 top-3 z-10 w-6 h-8 bg-zinc-800 border border-zinc-700 border-l-0 rounded-r flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>

      <div className="w-64 h-full overflow-y-auto p-3 space-y-4">
        <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 px-1">
          Data Layers
        </h2>

        {LAYERS_BY_CATEGORY.map((group) => (
          <div key={group.category}>
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-emerald-500/70 mb-2 px-1">
              {group.category}
            </h3>
            <div className="space-y-0.5">
              {group.layers.map((layer) => {
                const active = activeLayers.has(layer.id);
                return (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded text-xs transition-all ${
                      active
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                    }`}
                  >
                    <span
                      className={
                        active ? "text-emerald-400" : "text-zinc-600"
                      }
                    >
                      {ICON_MAP[layer.icon]}
                    </span>
                    <span className="font-mono flex-1 text-left">
                      {layer.name}
                    </span>
                    <div
                      className={`w-6 h-3.5 rounded-full transition-colors ${
                        active ? "bg-emerald-500" : "bg-zinc-700"
                      } relative`}
                    >
                      <div
                        className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform ${
                          active ? "translate-x-2.5" : "translate-x-0.5"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Shader mode */}
        <div className="pt-3 border-t border-zinc-800">
          <h3 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2 px-1">
            Shader Mode
          </h3>
          <div className="space-y-1">
            {SHADER_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs font-mono cursor-pointer transition-all ${
                  shaderMode === opt.value
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                }`}
              >
                <input
                  type="radio"
                  name="shader"
                  value={opt.value}
                  checked={shaderMode === opt.value}
                  onChange={() => setShaderMode(opt.value)}
                  className="sr-only"
                />
                <div
                  className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                    shaderMode === opt.value
                      ? "border-emerald-400"
                      : "border-zinc-600"
                  }`}
                >
                  {shaderMode === opt.value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default memo(Sidebar);
