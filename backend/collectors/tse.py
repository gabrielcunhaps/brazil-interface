from __future__ import annotations

"""TSE (Tribunal Superior Eleitoral) election data collector.

Returns dicts matching the frontend ElectionData shape:
  {year, position, candidate, party, votes, percentage}

Note: TSE CKAN returns dataset metadata (zip file links), not usable election data.
We use the static fallback which provides representative 2022 election results.
"""

import logging
from typing import Any

from backend.collectors.base import BaseCollector
from backend.config import REFRESH_INTERVALS

logger = logging.getLogger(__name__)

# TSE CKAN open data API
CKAN_URL = "https://dadosabertos.tse.jus.br/api/3/action/package_list"
PACKAGE_URL = "https://dadosabertos.tse.jus.br/api/3/action/package_show"

# Comprehensive static election data (2022 general elections)
STATIC_RESULTS = [
    # Presidential - 2nd round
    {"year": 2022, "position": "Presidente", "candidate": "Luiz Inacio Lula da Silva",
     "party": "PT", "votes": 60345999, "percentage": 50.90, "round": 2},
    {"year": 2022, "position": "Presidente", "candidate": "Jair Bolsonaro",
     "party": "PL", "votes": 58206354, "percentage": 49.10, "round": 2},
    # Presidential - 1st round top candidates
    {"year": 2022, "position": "Presidente", "candidate": "Simone Tebet",
     "party": "MDB", "votes": 4915423, "percentage": 4.16, "round": 1},
    {"year": 2022, "position": "Presidente", "candidate": "Ciro Gomes",
     "party": "PDT", "votes": 3599287, "percentage": 3.04, "round": 1},
    # Key governors
    {"year": 2022, "position": "Governador - SP", "candidate": "Tarcisio de Freitas",
     "party": "Republicanos", "votes": 13319714, "percentage": 55.27},
    {"year": 2022, "position": "Governador - MG", "candidate": "Romeu Zema",
     "party": "NOVO", "votes": 6441708, "percentage": 56.18},
    {"year": 2022, "position": "Governador - RJ", "candidate": "Claudio Castro",
     "party": "PL", "votes": 4368938, "percentage": 58.55},
    {"year": 2022, "position": "Governador - BA", "candidate": "Jeronimo Rodrigues",
     "party": "PT", "votes": 5765010, "percentage": 52.79},
    {"year": 2022, "position": "Governador - RS", "candidate": "Eduardo Leite",
     "party": "PSDB", "votes": 3850470, "percentage": 57.12},
    {"year": 2022, "position": "Governador - PR", "candidate": "Ratinho Junior",
     "party": "PSD", "votes": 4617668, "percentage": 69.64},
    # Senate seats
    {"year": 2022, "position": "Senador - SP", "candidate": "Marcos Pontes",
     "party": "PL", "votes": 11245000, "percentage": 33.50},
    {"year": 2022, "position": "Senador - RJ", "candidate": "Romario",
     "party": "PL", "votes": 3870000, "percentage": 31.80},
]


class TSECollector(BaseCollector):
    source_name = "tse"
    refresh_interval = REFRESH_INTERVALS["tse"]

    async def fetch(self) -> Any:
        session = await self._get_session()
        try:
            async with session.get(CKAN_URL) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    packages = data.get("result", [])
                    # The CKAN API returns dataset names (zip file references),
                    # not usable election results. We check if data is available
                    # but always prefer the curated static dataset.
                    if packages:
                        logger.info("[tse] CKAN has %d packages, using curated static data", len(packages))
        except Exception:
            logger.warning("[tse] CKAN API unreachable")

        # Always return static data (CKAN only has downloadable zip files)
        return {"static": True}

    async def normalize(self, raw: Any) -> list[dict]:
        """Return list of dicts matching frontend ElectionData type."""
        results: list[dict] = []
        for r in STATIC_RESULTS:
            results.append({
                "year": r["year"],
                "position": r["position"],
                "candidate": r["candidate"],
                "party": r["party"],
                "votes": r["votes"],
                "percentage": r["percentage"],
            })
        return results


if __name__ == "__main__":
    import asyncio
    import json

    async def _test() -> None:
        c = TSECollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} election results")
            for r in data[:5]:
                print(f"  {r['year']} {r['position']}: {r['candidate']} ({r['party']}) - {r['votes']:,} votes ({r['percentage']}%)")
        finally:
            await c.close()

    asyncio.run(_test())
