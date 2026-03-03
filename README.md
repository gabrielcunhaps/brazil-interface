# Brazil Intelligence Dashboard

Real-time situational awareness dashboard for Brazil. Integrates 15 public data sources into a CesiumJS 3D globe with drag-and-drop widgets, cinematic post-processing effects, and SSE-streamed live data.

## Architecture

```
                         Browser
                           |
              +------------+------------+
              |    React + CesiumJS     |
              |    Zustand stores       |
              |    react-grid-layout    |
              +------------+------------+
                           |
                      SSE stream
                      /api/stream
                           |
              +------------+------------+
              |     FastAPI backend     |
              |     stream.py (SSE)     |
              +------------+------------+
                           |
           +-------+-------+-------+-------+
           |       |       |       |       |
       OpenSky   USGS   FIRMS   BCB   ... (15 collectors)
       (flights) (quakes)(fires) (econ)
```

**Data flow**: Python collectors fetch public APIs on configurable intervals -> FastAPI aggregates into a single SSE stream -> Frontend Zustand stores consume events -> React components render in real time.

## Data Sources

| # | Source | Collector | SSE Event | Auth | Refresh |
|---|--------|-----------|-----------|------|---------|
| 1 | OpenSky Network (flights) | `opensky.py` | `flights` | Optional | 10s |
| 2 | USGS Earthquakes | `usgs.py` | `earthquakes` | None | 30s |
| 3 | CelesTrak Satellites | `celestrak.py` | `satellites` | None | 6h |
| 4 | NASA FIRMS (fires) | `firms.py` | `fires` | API key | 5min |
| 5 | INPE Queimadas (fires) | `queimadas.py` | `fires_inpe` | None | 5min |
| 6 | INMET Weather | `inmet.py` | `weather` | Optional | 15min |
| 7 | Banco Central (BCB) | `bcb.py` | `economy` | None | 1h |
| 8 | B3 Bovespa (market) | `bovespa.py` | `market` | None | 15s |
| 9 | INPE DETER (deforestation) | `deter.py` | `deforestation` | None | 1h |
| 10 | IBGE (demographics) | `ibge.py` | `demographics` | None | 1h |
| 11 | ONS (energy grid) | `ons.py` | `energy` | None | 5min |
| 12 | DataSUS (health) | `datasus.py` | `health` | None | 24h |
| 13 | TSE (elections) | `tse.py` | `elections` | None | 1h |
| 14 | Portal da Transparencia | `transparencia.py` | `transparency` | API key | 24h |
| 15 | BrasilAPI (aggregate) | `brasilapi.py` | `brasilapi` | None | 1h |

## Prerequisites

- **Node.js** >= 18
- **Python** >= 3.11
- **npm** (comes with Node.js)
- **pip** (comes with Python)

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd brazil-interface
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
```

### 3. Frontend

```bash
cd frontend
npm install
```

### 4. Environment variables

```bash
cp .env.example .env
# Edit .env with your API keys (most sources work without keys)
```

## Running

### Start the backend (port 8000)

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### Start the frontend (port 5173)

```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## Frontend Structure

```
frontend/src/
  App.tsx                          Main app component
  main.tsx                         Entry point
  components/
    globe/
      GlobeWidget.tsx              CesiumJS 3D globe wrapper
      FlightLayer.tsx              Aircraft positions from OpenSky
      EarthquakeLayer.tsx          Seismic events from USGS
      FireLayer.tsx                Fire hotspots from FIRMS/Queimadas
      SatelliteLayer.tsx           Orbital tracks from CelesTrak
      DeforestationLayer.tsx       DETER deforestation alerts
      WeatherLayer.tsx             INMET weather stations
      shaders/
        postprocess.ts             CRT / NVG / FLIR GLSL shaders
    widgets/
      WidgetShell.tsx              Draggable widget container
      FlightsWidget.tsx            Flight tracking table/stats
      WeatherWidget.tsx            Weather station data
    effects/
      Crosshair.tsx                HUD crosshair overlay
      FilmGrain.tsx                Analog film grain effect
    layout/
      DashboardGrid.tsx            react-grid-layout grid
      Sidebar.tsx                  Layer toggles and settings
      TopBar.tsx                   Title bar and deck switcher
      StatusBar.tsx                Connection status and clock
      SplashScreen.tsx             Boot-up splash animation
  config/
    decks.ts                       Layout preset definitions
    layers.ts                      Globe layer configuration
  hooks/
    useSSE.ts                      SSE connection and event dispatch
    useDeck.ts                     Deck switching logic
    useGlobeRef.ts                 CesiumJS viewer ref management
  stores/
    dataStore.ts                   All live data (Zustand)
    uiStore.ts                     UI state — sidebar, effects, modals
    layoutStore.ts                 Grid layout positions and sizes
  types/
    index.ts                       Shared TypeScript interfaces
  styles/                          Global CSS and Tailwind config
```

## Backend Structure

```
backend/
  main.py                          FastAPI app, lifespan, routes
  stream.py                        SSE endpoint and collector loops
  config.py                        Env vars, refresh intervals, feature flags
  models.py                        Pydantic models for all data sources
  collectors/
    base.py                        BaseCollector abstract class
    opensky.py                     ADS-B flight positions
    usgs.py                        USGS earthquake feed
    celestrak.py                   TLE satellite data + SGP4 propagation
    firms.py                       NASA FIRMS fire hotspots
    queimadas.py                   INPE Queimadas fire data
    inmet.py                       INMET weather stations
    bcb.py                         Central Bank indicators (SELIC, USD/BRL, IPCA)
    bovespa.py                     B3 stock market via yfinance
    deter.py                       INPE DETER deforestation alerts
    ibge.py                        IBGE demographic/geographic data
    ons.py                         ONS energy grid data
    datasus.py                     DataSUS public health data
    tse.py                         TSE election data
    transparencia.py               Portal da Transparencia spending data
    brasilapi.py                   BrasilAPI aggregate endpoints
```

## Widgets

| Widget | Data Source | Description |
|--------|------------|-------------|
| 3D Globe | All geo sources | CesiumJS globe with toggleable layers for flights, fires, quakes, satellites, weather, deforestation |
| Flights | OpenSky | Live aircraft table with callsign, altitude, speed, origin |
| Weather | INMET | Weather station readings — temperature, humidity, wind, pressure |
| Market | Bovespa/BCB | IBOVESPA chart, SELIC rate, USD/BRL exchange rate |
| Fires | FIRMS + Queimadas | Active fire hotspot count by biome, satellite source breakdown |
| Earthquakes | USGS | Recent seismic events list with magnitude and depth |
| Deforestation | DETER | Amazon deforestation alerts — area, municipality, date |
| Energy | ONS | Power generation mix — hydro, wind, solar, thermal percentages |
| Demographics | IBGE | Population stats by state, urban/rural split |
| Health | DataSUS | Disease notifications, vaccination coverage |
| Elections | TSE | Latest election results and voter statistics |
| Transparency | Portal da Transparencia | Federal spending by agency |
| Satellites | CelesTrak | Tracked objects count, notable passes |

## Effects System

The dashboard includes cinematic post-processing effects applied to the CesiumJS globe:

- **CRT** — Scanlines, phosphor glow, barrel distortion, vignette. Retro monitor aesthetic.
- **NVG** (Night Vision) — Green phosphor tint, noise, bloom. Military night-vision look.
- **FLIR** (Thermal) — False-color thermal palette, heat shimmer. Infrared camera simulation.
- **Film Grain** — Analog grain overlay on the entire viewport.
- **Crosshair** — HUD-style targeting reticle centered on the globe.

Effects are toggled from the sidebar and rendered via GLSL fragment shaders in `frontend/src/components/globe/shaders/postprocess.ts`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/stream` | SSE stream — all live data from enabled collectors |
| `GET` | `/api/data/{source}` | Latest cached data for a specific source |
| `GET` | `/api/data/{source}/history` | Historical data for a source |
| `GET` | `/api/sources` | List all sources with status and cache info |
| `GET` | `/api/health` | Health check — active collector count and names |

## Decks (Layout Presets)

The dashboard supports switchable layout presets ("decks") defined in `frontend/src/config/decks.ts`. Each deck arranges widgets and globe layers for a specific use case:

- **Overview** — Globe + key indicators from all sources
- **Amazon Watch** — Deforestation + fires + weather focused
- **Brazil Pulse** — Economic indicators: market, BCB rates, transparency
- **Flight Ops** — Globe with flight layer + flights widget maximized

## Future Plans

- **Part 2: MCP Server** — Expose all data sources as Model Context Protocol tools for LLM-powered natural language queries ("What fires are burning in the Amazon right now?")
- Additional widgets for AIS vessel tracking and live city cameras
- Historical playback mode with time slider
- Alert system for threshold-based notifications (magnitude > 5 quake, new DETER polygon, etc.)
