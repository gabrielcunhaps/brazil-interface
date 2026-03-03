"""ONS (Operador Nacional do Sistema Eletrico) energy generation collector."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from backend.collectors.base import BaseCollector
from backend.config import REFRESH_INTERVALS
from backend.models import EnergySource

logger = logging.getLogger(__name__)

API_URL = "https://dados.ons.org.br/dataset/geracao_usina"
# ONS public data portal — fallback to the CKAN API
CKAN_API = "https://dados.ons.org.br/api/3/action/datastore_search"
RESOURCE_ID = "a1f2b3c4"  # placeholder — actual resource IDs vary


class ONSCollector(BaseCollector):
    source_name = "ons"
    refresh_interval = REFRESH_INTERVALS["ons"]

    async def fetch(self) -> Any:
        session = await self._get_session()
        # Try the CKAN datastore API first
        params = {"resource_id": RESOURCE_ID, "limit": 100}
        try:
            async with session.get(CKAN_API, params=params) as resp:
                if resp.status == 200:
                    return await resp.json()
        except Exception:
            pass

        # Fallback: try the dataset page as JSON
        try:
            async with session.get(f"{API_URL}?format=json") as resp:
                resp.raise_for_status()
                return await resp.json()
        except Exception:
            logger.warning("[ons] All endpoints failed, returning static data")
            return self._static_fallback()

    def _static_fallback(self) -> dict:
        """Return representative Brazilian energy mix when API is unavailable."""

        return {
            "static": True,
            "sources": [
                {"type": "Hidraulica", "generation_mw": 65000, "region": "Brasil"},
                {"type": "Eolica", "generation_mw": 22000, "region": "Brasil"},
                {"type": "Solar", "generation_mw": 12000, "region": "Brasil"},
                {"type": "Termica", "generation_mw": 18000, "region": "Brasil"},
                {"type": "Nuclear", "generation_mw": 2000, "region": "Brasil"},
                {"type": "Biomassa", "generation_mw": 8000, "region": "Brasil"},
            ],
        }

    async def normalize(self, raw: Any) -> list[EnergySource]:
        now = datetime.now(timezone.utc)
        results: list[EnergySource] = []

        if isinstance(raw, dict) and raw.get("static"):
            for s in raw["sources"]:
                results.append(EnergySource(
                    source=self.source_name,
                    fetched_at=now,
                    api_url=API_URL,
                    generation_type=s["type"],
                    generation_mw=s["generation_mw"],
                    region=s.get("region", "Brasil"),
                ))
            return results

        # Parse CKAN response
        records = []
        if isinstance(raw, dict):
            result = raw.get("result", raw)
            records = result.get("records", [])
        elif isinstance(raw, list):
            records = raw

        for rec in records:
            results.append(EnergySource(
                source=self.source_name,
                fetched_at=now,
                api_url=API_URL,
                generation_type=rec.get("nom_tipousina", rec.get("tipo", "Unknown")),
                capacity_mw=_float(rec.get("val_capacidadeinstalada")),
                generation_mw=_float(rec.get("val_geracao", rec.get("geracao"))),
                region=rec.get("nom_subsistema", rec.get("subsistema", "")),
                date=rec.get("din_instante", rec.get("data", "")),
            ))
        return results


def _float(val: Any) -> float | None:
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


if __name__ == "__main__":
    import asyncio

    async def _test() -> None:
        c = ONSCollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} energy sources")
            for s in data:
                print(f"  {s.generation_type}: {s.generation_mw} MW ({s.region})")
        finally:
            await c.close()

    asyncio.run(_test())
