# Brazil Intelligence Dashboard — CLAUDE.md

## Project Overview
Real-time situational awareness dashboard for Brazil, integrating 13+ public data sources with a CesiumJS 3D globe and drag-and-drop widget system.

## Tech Stack
- **Frontend**: Vite + React 18 + TypeScript + CesiumJS (Resium) + Tailwind CSS
- **Backend**: FastAPI (Python 3.11+) + SSE streaming
- **Charts**: Recharts + lightweight-charts
- **State**: Zustand
- **Layout**: react-grid-layout

## Project Structure
- `frontend/` — Vite React app
- `backend/` — FastAPI Python server

## Running the Project
### Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

### Frontend
cd frontend
npm install
npm run dev

## Key Conventions
- All data flows through SSE: Backend collectors → SSE stream → Frontend Zustand stores → React components
- Each data source has: a Python collector (backend/collectors/), Pydantic models (models.py), TypeScript types (types/index.ts), Zustand store slice, and React widget
- Globe layers are in src/components/globe/, widgets in src/components/widgets/
- Zustand stores: dataStore (all data), uiStore (UI state), layoutStore (grid layouts)
- GLSL shaders for CRT/NVG/FLIR effects in src/components/globe/shaders/
- Layout presets ("decks") defined in src/config/decks.ts

## Adding a New Data Source
1. Create collector in backend/collectors/new_source.py extending BaseCollector
2. Add Pydantic model in backend/models.py
3. Register in backend/stream.py and backend/main.py
4. Add TypeScript type in frontend/src/types/index.ts
5. Add Zustand store action in frontend/src/stores/dataStore.ts
6. Add SSE event handler in frontend/src/hooks/useSSE.ts
7. Create widget in frontend/src/components/widgets/
8. Add layer config in frontend/src/config/layers.ts if applicable

## Environment Variables
See .env.example for required/optional API keys.
