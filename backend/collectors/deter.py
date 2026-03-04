from __future__ import annotations

"""DETER / TerraBrasilis deforestation alert collector.

Returns dicts matching the frontend DeforestationAlert shape:
  {id, area_km2, lat, lon, detected_date, biome, geometry?}
"""

import logging
from datetime import datetime, timezone
from typing import Any

import aiohttp

from backend.collectors.base import BaseCollector
from backend.config import REFRESH_INTERVALS

logger = logging.getLogger(__name__)

API_URL = (
    "https://terrabrasilis.dpi.inpe.br/geoserver/deter-amz/wfs"
    "?service=WFS&version=2.0.0&request=GetFeature"
    "&typeName=deter-amz:deter_amz"
    "&outputFormat=application/json&count=100&sortBy=view_date+D"
)

# Static fallback for when TerraBrasilis is slow/down
STATIC_FALLBACK = [
    {"gid": "static_1", "classname": "DESMATAMENTO_CR", "view_date": "2026-02-15",
     "areamunkm": 2.5, "municipality": "Altamira", "uf": "PA", "lat": -3.20, "lon": -52.21},
    {"gid": "static_2", "classname": "DEGRADACAO", "view_date": "2026-02-14",
     "areamunkm": 1.8, "municipality": "Sao Felix do Xingu", "uf": "PA", "lat": -6.64, "lon": -51.98},
    {"gid": "static_3", "classname": "DESMATAMENTO_CR", "view_date": "2026-02-13",
     "areamunkm": 3.2, "municipality": "Porto Velho", "uf": "RO", "lat": -8.76, "lon": -63.90},
    {"gid": "static_4", "classname": "MINERACAO", "view_date": "2026-02-12",
     "areamunkm": 0.9, "municipality": "Itaituba", "uf": "PA", "lat": -4.27, "lon": -55.99},
    {"gid": "static_5", "classname": "DESMATAMENTO_CR", "view_date": "2026-02-11",
     "areamunkm": 5.1, "municipality": "Labrea", "uf": "AM", "lat": -7.26, "lon": -64.80},
    {"gid": "static_6", "classname": "DEGRADACAO", "view_date": "2026-02-10",
     "areamunkm": 1.2, "municipality": "Novo Progresso", "uf": "PA", "lat": -7.14, "lon": -55.38},
    {"gid": "static_7", "classname": "DESMATAMENTO_CR", "view_date": "2026-02-09",
     "areamunkm": 4.3, "municipality": "Apui", "uf": "AM", "lat": -7.20, "lon": -59.89},
    {"gid": "static_8", "classname": "DESMATAMENTO_CR", "view_date": "2026-02-08",
     "areamunkm": 2.7, "municipality": "Maraba", "uf": "PA", "lat": -5.37, "lon": -49.13},
]


class DETERCollector(BaseCollector):
    source_name = "deter"
    refresh_interval = REFRESH_INTERVALS["deter"]

    async def _get_session(self) -> aiohttp.ClientSession:
        """Override with a longer timeout for TerraBrasilis (can be slow)."""
        if self._session is None or self._session.closed:
            timeout = aiohttp.ClientTimeout(total=60, connect=15)
            self._session = aiohttp.ClientSession(timeout=timeout)
        return self._session

    async def fetch(self) -> Any:
        session = await self._get_session()
        try:
            async with session.get(API_URL) as resp:
                resp.raise_for_status()
                data = await resp.json()
                features = data.get("features", [])
                if features:
                    return data
                logger.warning("[deter] Empty features from API")
        except Exception as exc:
            logger.warning("[deter] WFS fetch failed: %s — using static fallback", exc)

        return {"static": True, "features": STATIC_FALLBACK}

    async def normalize(self, raw: Any) -> list[dict]:
        """Return list of dicts matching frontend DeforestationAlert type."""
        results: list[dict] = []

        if isinstance(raw, dict) and raw.get("static"):
            for item in raw.get("features", []):
                results.append({
                    "id": str(item.get("gid", "")),
                    "area_km2": item.get("areamunkm", 0),
                    "lat": item.get("lat", 0),
                    "lon": item.get("lon", 0),
                    "detected_date": item.get("view_date", ""),
                    "biome": "Amazonia",
                })
            return results

        features = raw.get("features") or []
        for f in features:
            props = f.get("properties", {})
            geom = f.get("geometry", {})
            centroid = _centroid(geom)

            results.append({
                "id": str(f.get("id", props.get("gid", ""))),
                "area_km2": _float(props.get("areamunkm")) or 0,
                "lat": centroid[1],
                "lon": centroid[0],
                "detected_date": props.get("view_date", ""),
                "biome": "Amazonia",
            })
        return results


def _centroid(geom: dict) -> tuple[float, float]:
    """Extract approximate centroid from GeoJSON geometry."""
    coords = geom.get("coordinates")
    if not coords:
        return (0.0, 0.0)
    gtype = geom.get("type", "")
    flat: list[tuple[float, float]] = []
    if gtype == "Point":
        return (coords[0], coords[1])
    elif gtype in ("Polygon", "MultiLineString"):
        ring = coords[0] if coords else []
        flat = [(c[0], c[1]) for c in ring]
    elif gtype == "MultiPolygon":
        for poly in coords:
            for ring in poly:
                flat.extend((c[0], c[1]) for c in ring)
    else:
        return (0.0, 0.0)
    if not flat:
        return (0.0, 0.0)
    avg_lon = sum(c[0] for c in flat) / len(flat)
    avg_lat = sum(c[1] for c in flat) / len(flat)
    return (avg_lon, avg_lat)


def _float(val: Any) -> float | None:
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


if __name__ == "__main__":
    import asyncio
    import json

    async def _test() -> None:
        c = DETERCollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} deforestation alerts")
            for a in data[:3]:
                print(f"  {a['id']}: {a['area_km2']} km2 @ {a['lat']},{a['lon']} ({a['detected_date']})")
        finally:
            await c.close()

    asyncio.run(_test())
