from __future__ import annotations

"""CelesTrak satellite collector — active satellites with SGP4 position propagation.

Returns dicts matching the frontend Satellite shape:
  {name, noradId, lat, lon, altitude, velocity, tle1, tle2}
"""

import logging
import math
from datetime import datetime, timezone
from typing import Any

from backend.collectors.base import BaseCollector
from backend.config import REFRESH_INTERVALS

logger = logging.getLogger(__name__)

TLE_URL = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle"
MAX_SATELLITES = 200


class CelesTrakCollector(BaseCollector):
    source_name = "celestrak"
    refresh_interval = REFRESH_INTERVALS["celestrak"]

    async def fetch(self) -> Any:
        session = await self._get_session()
        try:
            async with session.get(TLE_URL) as resp:
                resp.raise_for_status()
                return await resp.text()
        except Exception:
            logger.warning("[celestrak] TLE fetch failed, returning empty")
            return ""

    async def normalize(self, raw: Any) -> list[dict]:
        """Return list of dicts matching frontend Satellite type."""
        if not raw or not isinstance(raw, str):
            return []

        try:
            from sgp4.api import Satrec, WGS72
            from sgp4.earth_gravity import wgs72
        except ImportError:
            logger.warning("[celestrak] sgp4 not installed, returning empty")
            return []

        lines = raw.strip().splitlines()
        now = datetime.now(timezone.utc)
        jd, fr = _datetime_to_jd(now)

        results: list[dict] = []
        i = 0
        while i + 2 < len(lines) and len(results) < MAX_SATELLITES:
            name = lines[i].strip()
            line1 = lines[i + 1].strip()
            line2 = lines[i + 2].strip()
            i += 3

            if not line1.startswith("1") or not line2.startswith("2"):
                continue

            try:
                sat = Satrec.twoline2rv(line1, line2, WGS72)
                e, r, v = sat.sgp4(jd, fr)
                if e != 0:
                    continue

                lat, lon, alt = _eci_to_geodetic(r, now, wgs72)

                # Validate reasonable values
                if abs(lat) > 90 or abs(lon) > 180 or alt < 0 or alt > 100000:
                    continue

                norad_id = int(line2[2:7])
                speed = math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2)

                # Return dict matching frontend Satellite type exactly
                results.append({
                    "name": name,
                    "noradId": norad_id,
                    "lat": round(lat, 4),
                    "lon": round(lon, 4),
                    "altitude": round(alt, 1),
                    "velocity": round(speed, 3),
                    "tle1": line1,
                    "tle2": line2,
                })
            except Exception:
                continue

        logger.info("[celestrak] Propagated %d satellites", len(results))
        return results


def _datetime_to_jd(dt: datetime) -> tuple[float, float]:
    """Convert datetime to Julian Date (whole + fraction)."""
    a = (14 - dt.month) // 12
    y = dt.year + 4800 - a
    m = dt.month + 12 * a - 3
    jdn = dt.day + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045
    jd = float(jdn)
    fr = (dt.hour - 12) / 24.0 + dt.minute / 1440.0 + dt.second / 86400.0
    return jd, fr


def _eci_to_geodetic(r: tuple, dt: datetime, wgs72_const: Any) -> tuple[float, float, float]:
    """Convert ECI (km) to geodetic lat/lon/alt (degrees, degrees, km)."""
    x, y, z = r
    gmst = _gmst(dt)
    lon = math.degrees(math.atan2(y, x)) - gmst
    lon = ((lon + 180) % 360) - 180

    r_xy = math.sqrt(x ** 2 + y ** 2)
    lat = math.degrees(math.atan2(z, r_xy))
    alt = math.sqrt(x ** 2 + y ** 2 + z ** 2) - wgs72_const.radiusearthkm
    return lat, lon, alt


def _gmst(dt: datetime) -> float:
    """Greenwich Mean Sidereal Time in degrees."""
    jd = _datetime_to_jd(dt)
    jd_total = jd[0] + jd[1]
    t = (jd_total - 2451545.0) / 36525.0
    gmst_sec = 67310.54841 + (876600.0 * 3600 + 8640184.812866) * t + 0.093104 * t ** 2 - 6.2e-6 * t ** 3
    return (gmst_sec % 86400) / 240.0


if __name__ == "__main__":
    import asyncio
    import json

    async def _test() -> None:
        c = CelesTrakCollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} satellites")
            for s in data[:5]:
                print(f"  {s['name']} NORAD={s['noradId']} @ {s['lat']},{s['lon']} alt={s['altitude']}km")
        finally:
            await c.close()

    asyncio.run(_test())
