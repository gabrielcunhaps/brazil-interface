"""DETER / TerraBrasilis deforestation alert collector."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from backend.collectors.base import BaseCollector
from backend.config import REFRESH_INTERVALS
from backend.models import DeforestationAlert

logger = logging.getLogger(__name__)

API_URL = (
    "https://terrabrasilis.dpi.inpe.br/geoserver/deter-amz/wfs"
    "?service=WFS&version=2.0.0&request=GetFeature"
    "&typeName=deter-amz:deter_amz"
    "&outputFormat=application/json&count=100&sortBy=view_date+D"
)


class DETERCollector(BaseCollector):
    source_name = "deter"
    refresh_interval = REFRESH_INTERVALS["deter"]

    async def fetch(self) -> Any:
        session = await self._get_session()
        async with session.get(API_URL) as resp:
            resp.raise_for_status()
            return await resp.json()

    async def normalize(self, raw: Any) -> list[DeforestationAlert]:
        now = datetime.now(timezone.utc)
        features = raw.get("features") or []
        results: list[DeforestationAlert] = []
        for f in features:
            props = f.get("properties", {})
            geom = f.get("geometry", {})
            centroid = _centroid(geom)

            results.append(DeforestationAlert(
                source=self.source_name,
                fetched_at=now,
                api_url=API_URL,
                alert_id=str(f.get("id", "")),
                date=props.get("view_date", ""),
                area_km2=_float(props.get("areamunkm")),
                municipality=props.get("municipali", ""),
                state=props.get("uf", ""),
                biome="Amazonia",
                longitude=centroid[0],
                latitude=centroid[1],
                class_name=props.get("classname", ""),
            ))
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

    async def _test() -> None:
        c = DETERCollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} deforestation alerts")
            for a in data[:3]:
                print(f"  {a.class_name} in {a.municipality}/{a.state}: {a.area_km2} km2")
        finally:
            await c.close()

    asyncio.run(_test())
