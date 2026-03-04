from __future__ import annotations

"""ONS (Operador Nacional do Sistema Eletrico) energy generation collector.

Returns a SINGLE aggregated dict matching the frontend EnergyData shape:
  {total_mw, sources: [{name, value, percentage}], history: [{time, total}]}
"""

import logging
from datetime import datetime, timezone
from typing import Any

from backend.collectors.base import BaseCollector
from backend.config import REFRESH_INTERVALS

logger = logging.getLogger(__name__)

API_URL = "https://dados.ons.org.br/dataset/geracao_usina"
# ONS public data portal -- fallback to the CKAN API
CKAN_API = "https://dados.ons.org.br/api/3/action/datastore_search"
RESOURCE_ID = "a1f2b3c4"  # placeholder -- actual resource IDs vary

# Representative Brazilian energy mix (2024/2025 averages in MW)
STATIC_SOURCES = [
    {"type": "Hidraulica", "generation_mw": 65000},
    {"type": "Eolica", "generation_mw": 22000},
    {"type": "Solar", "generation_mw": 12000},
    {"type": "Termica", "generation_mw": 18000},
    {"type": "Nuclear", "generation_mw": 2000},
    {"type": "Biomassa", "generation_mw": 8000},
]


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
                    data = await resp.json()
                    # Verify the response has actual records
                    result = data.get("result", data)
                    records = result.get("records", [])
                    if records:
                        return {"api": True, "records": records}
        except Exception:
            pass

        # Fallback: try the dataset page as JSON
        try:
            async with session.get(f"{API_URL}?format=json") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    if isinstance(data, list) and data:
                        return {"api": True, "records": data}
        except Exception:
            pass

        logger.warning("[ons] All endpoints failed, returning static data")
        return {"static": True}

    async def normalize(self, raw: Any) -> list[dict]:
        """Return a single-element list containing the aggregated EnergyData dict.

        The frontend expects: {total_mw, sources: [{name, value, percentage}], history: [{time, total}]}
        """
        sources_list: list[dict] = []

        if isinstance(raw, dict) and raw.get("static"):
            # Use static fallback
            for s in STATIC_SOURCES:
                sources_list.append({
                    "name": s["type"],
                    "value": s["generation_mw"],
                })
        elif isinstance(raw, dict) and raw.get("api"):
            records = raw.get("records", [])
            # Aggregate by generation type
            type_totals: dict[str, float] = {}
            for rec in records:
                gen_type = rec.get("nom_tipousina", rec.get("tipo", "Unknown"))
                gen_mw = _float(rec.get("val_geracao", rec.get("geracao"))) or 0.0
                if gen_type in type_totals:
                    type_totals[gen_type] += gen_mw
                else:
                    type_totals[gen_type] = gen_mw
            for name, value in type_totals.items():
                sources_list.append({"name": name, "value": value})
        else:
            # Unexpected format: use static
            for s in STATIC_SOURCES:
                sources_list.append({
                    "name": s["type"],
                    "value": s["generation_mw"],
                })

        # Calculate total and percentages
        total_mw = sum(s["value"] for s in sources_list) if sources_list else 0.0
        for s in sources_list:
            s["percentage"] = round((s["value"] / total_mw * 100) if total_mw > 0 else 0.0, 1)

        # Build simple history (hourly snapshots placeholder)
        now = datetime.now(timezone.utc)
        history = [
            {"time": now.isoformat(), "total": round(total_mw, 0)}
        ]

        energy_data = {
            "total_mw": round(total_mw, 0),
            "sources": sources_list,
            "history": history,
        }

        return [energy_data]


def _float(val: Any) -> float | None:
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


if __name__ == "__main__":
    import asyncio
    import json

    async def _test() -> None:
        c = ONSCollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} energy data objects")
            if data:
                print(json.dumps(data[0], indent=2, default=str))
        finally:
            await c.close()

    asyncio.run(_test())
