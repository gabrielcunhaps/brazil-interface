import { useEffect, useRef, useState } from "react";
import { useDataStore } from "@/stores/dataStore";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

const MAX_RETRY_DELAY = 30_000;

export function useSSE() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const retryCount = useRef(0);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let disposed = false;

    function connect() {
      if (disposed) return;

      setStatus("connecting");
      const es = new EventSource("/api/stream");
      esRef.current = es;

      es.onopen = () => {
        if (disposed) return;
        retryCount.current = 0;
        setStatus("connected");
      };

      // Map SSE event names to store update functions.
      // Backend payload shape: { source, event, count, timestamp, data: [...] }
      // Array data sources pass p.data directly; single-object sources unwrap from array.
      const handlers: Record<string, (payload: any) => void> = {
        flights: (p) => useDataStore.getState().updateFlights(p.data ?? []),
        earthquakes: (p) => useDataStore.getState().updateEarthquakes(p.data ?? []),
        satellites: (p) => useDataStore.getState().updateSatellites(p.data ?? []),
        fires: (p) => useDataStore.getState().updateFires(p.data ?? []),
        fires_inpe: (p) => {
          const existing = useDataStore.getState().fires;
          useDataStore.getState().updateFires([...existing, ...(p.data ?? [])]);
        },
        weather: (p) => useDataStore.getState().updateWeather(p.data ?? []),
        economy: (p) => {
          const data = Array.isArray(p.data) ? p.data[0] : p.data;
          if (data) useDataStore.getState().updateEconomy(data);
        },
        market: (p) => {
          const data = Array.isArray(p.data) ? p.data[0] : p.data;
          if (data) useDataStore.getState().updateMarket(data);
        },
        deforestation: (p) => useDataStore.getState().updateDeforestation(p.data ?? []),
        energy: (p) => {
          const data = Array.isArray(p.data) ? p.data[0] : p.data;
          if (data) useDataStore.getState().updateEnergy(data);
        },
        health: (p) => useDataStore.getState().updateHealth(p.data ?? []),
        elections: (p) => useDataStore.getState().updateElections(p.data ?? []),
        transparency: (p) => useDataStore.getState().updateTransparency(p.data ?? []),
      };

      for (const [event, handler] of Object.entries(handlers)) {
        es.addEventListener(event, (e: MessageEvent) => {
          try {
            const payload = JSON.parse(e.data);
            handler(payload);
          } catch {
            // skip malformed data
          }
        });
      }

      es.onerror = () => {
        if (disposed) return;
        es.close();
        esRef.current = null;
        setStatus("disconnected");
        const delay = Math.min(1000 * 2 ** retryCount.current, MAX_RETRY_DELAY);
        retryCount.current += 1;
        setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      disposed = true;
      esRef.current?.close();
      esRef.current = null;
    };
  }, []);

  return status;
}
