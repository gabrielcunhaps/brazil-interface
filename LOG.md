# Brazil Intelligence Dashboard — LOG

### 2026-03-03 (fix all collectors)
- **Change**: Fixed all 13+ data collectors to return correct data shapes matching frontend TypeScript types. Major issues resolved:
  - **BCB**: Returns aggregated EconomyData object `{selic, ipca, usd_brl, *_history}` instead of flat EconomyIndicator list. Added static fallback for when BCB API fails.
  - **Bovespa**: Returns aggregated MarketData object `{symbol, price, change, changePercent, volume, history}` with IBOV history chart data instead of raw MarketTick list.
  - **ONS**: Returns aggregated EnergyData object `{total_mw, sources: [{name, value, percentage}], history}` instead of raw EnergySource list.
  - **CelesTrak**: Returns dicts with frontend field names (`noradId, lat, lon, altitude, velocity, tle1, tle2`) instead of Pydantic models with different names (`norad_id, latitude, longitude, altitude_km`).
  - **DETER**: Added 60s timeout for slow TerraBrasilis WFS, static fallback, returns frontend-compatible `{id, area_km2, lat, lon, detected_date, biome}`.
  - **INMET**: Added static fallback with 16 Brazilian capital weather stations (INMET API returns 403). Returns `{id, name, lat, lon, temp, humidity, pressure, wind_speed, wind_dir}`.
  - **TSE**: Fixed null values — CKAN API only returns dataset metadata (zip URLs), not actual data. Now always uses curated static 2022 election results with real candidates/votes.
  - **Queimadas**: Fixed INPE fire data — old JSON API is 404. Now uses INPE CSV dataserver endpoint. Fixed date logic to skip header-only files and try up to 5 days back.
  - **All collectors**: Changed from returning Pydantic models to plain dicts matching frontend TypeScript types exactly.
  - **stream.py**: Added singleton source handling — BCB, Bovespa, ONS data is unwrapped from single-element lists before sending over SSE.
  - **main.py**: REST endpoints also unwrap singleton sources.
  - **EnergyWidget**: Added Portuguese energy source name color mapping (Hidraulica, Eolica, Termica, Biomassa).
- **Outcome**: All collectors produce data matching frontend types. TypeScript compiles cleanly. USGS, CelesTrak, DETER, Queimadas, DataSUS, TSE, Transparencia, IBGE, BrasilAPI all return real or representative static data. BCB/Bovespa/ONS return properly aggregated singleton objects.

### 2026-03-03
- **Change**: Fix SSE data flow, widget resilience, and Globe crash
- **Outcome**: useSSE.ts now correctly unwraps single-object payloads (economy, market, energy) from arrays before passing to Zustand stores. All widgets guard against null/undefined/NaN data and show "Awaiting data..." instead of crashing. GlobeWidget uses lazy-loading with error boundary — shows a styled fallback when Cesium is unavailable. TypeScript compiles cleanly.

### 2026-03-03
- **Change**: Initial project creation — full dashboard implementation
- **Outcome**: Complete frontend (React + CesiumJS + Tailwind + 13 widgets) and backend (FastAPI + 15 data collectors + SSE streaming) created. Ready for npm install and testing.
