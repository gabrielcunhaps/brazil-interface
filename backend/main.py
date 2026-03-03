"""FastAPI application — Brazil Intelligence Dashboard backend."""

from __future__ import annotations

import json
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.collectors import ALL_COLLECTORS
from backend.collectors.base import BaseCollector
from backend.config import CORS_ORIGINS, ENABLED_COLLECTORS
from backend.stream import sse_endpoint

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Active collector instances
collectors: dict[str, BaseCollector] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize collectors on startup, close them on shutdown."""

    logger.info("Starting Brazil Intelligence Dashboard backend")
    for name, cls in ALL_COLLECTORS.items():
        if ENABLED_COLLECTORS.get(name, True):
            collectors[name] = cls()
            logger.info("  Initialized collector: %s", name)
        else:
            logger.info("  Skipped collector: %s (disabled)", name)
    logger.info("Ready — %d collectors active", len(collectors))

    yield

    logger.info("Shutting down — closing %d collectors", len(collectors))
    for name, collector in collectors.items():
        await collector.close()
    collectors.clear()


app = FastAPI(
    title="Brazil Intelligence Dashboard",
    description="Real-time data aggregation for the Brazil Intelligence Dashboard",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# SSE streaming endpoint
# ---------------------------------------------------------------------------

@app.get("/api/stream")
async def stream(request: Request):
    """SSE endpoint — streams real-time data from all enabled collectors."""
    return await sse_endpoint(request, collectors)


# ---------------------------------------------------------------------------
# REST endpoints
# ---------------------------------------------------------------------------

@app.get("/api/data/{source}")
async def get_source_data(source: str):
    """Return the latest cached data for a given source."""
    if source not in collectors:
        available = list(collectors.keys())
        return JSONResponse(
            status_code=404,
            content={"error": f"Unknown source: {source}", "available": available},
        )

    collector = collectors[source]
    data = await collector.get_latest()
    return {
        "source": source,
        "count": len(data),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": [
            item.model_dump(mode="json") if hasattr(item, "model_dump") else item
            for item in data
        ],
    }


@app.get("/api/data/{source}/history")
async def get_source_history(source: str):
    """Return historical data for a source (if available, same as latest for now)."""
    if source not in collectors:
        return JSONResponse(
            status_code=404,
            content={"error": f"Unknown source: {source}"},
        )

    collector = collectors[source]
    data = await collector.get_latest()
    return {
        "source": source,
        "count": len(data),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": [
            item.model_dump(mode="json") if hasattr(item, "model_dump") else item
            for item in data
        ],
    }


@app.get("/api/sources")
async def list_sources():
    """List all available data sources and their status."""
    sources = {}
    for name, collector in collectors.items():
        sources[name] = {
            "enabled": True,
            "refresh_interval": collector.refresh_interval,
            "cached_count": len(collector._cache),
            "last_fetch": collector._last_fetch,
        }
    # Also list disabled sources
    for name in ALL_COLLECTORS:
        if name not in collectors:
            sources[name] = {"enabled": False}
    return {"sources": sources}


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "collectors_active": len(collectors),
        "collectors_available": len(ALL_COLLECTORS),
        "sources": list(collectors.keys()),
    }


# ---------------------------------------------------------------------------
# Static files (production: serve frontend build)
# ---------------------------------------------------------------------------

frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    from backend.config import PORT

    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=PORT,
        reload=True,
    )
