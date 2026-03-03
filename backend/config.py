from __future__ import annotations

"""Configuration for the Brazil Intelligence Dashboard backend."""

import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
FIRMS_MAP_KEY = os.getenv("FIRMS_MAP_KEY", "")
INMET_TOKEN = os.getenv("INMET_TOKEN", "")
TRANSPARENCIA_KEY = os.getenv("TRANSPARENCIA_KEY", "")

# Refresh intervals in seconds per source
REFRESH_INTERVALS = {
    "opensky": 10,
    "usgs": 30,
    "celestrak": 21600,  # 6 hours
    "firms": 300,        # 5 minutes
    "queimadas": 300,
    "inmet": 900,        # 15 minutes
    "bcb": 3600,         # 1 hour
    "bovespa": 15,       # 15s during market hours
    "bovespa_off": 300,  # 5min outside market hours
    "deter": 3600,
    "ibge": 3600,
    "ons": 300,
    "datasus": 86400,    # daily
    "tse": 3600,
    "transparencia": 86400,
    "brasilapi": 3600,
}

# Feature flags — set to False to disable a collector
ENABLED_COLLECTORS = {
    "opensky": True,
    "usgs": True,
    "celestrak": True,
    "firms": bool(FIRMS_MAP_KEY),
    "queimadas": True,
    "inmet": True,
    "bcb": True,
    "bovespa": True,
    "deter": True,
    "ibge": True,
    "ons": True,
    "datasus": True,
    "tse": True,
    "transparencia": bool(TRANSPARENCIA_KEY),
    "brasilapi": True,
}

# CORS — allow Railway/Vercel domains + local dev
_extra_origins = os.getenv("CORS_ORIGINS", "")
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
] + [o.strip() for o in _extra_origins.split(",") if o.strip()]

# Production: port from environment
PORT = int(os.getenv("PORT", "8000"))
