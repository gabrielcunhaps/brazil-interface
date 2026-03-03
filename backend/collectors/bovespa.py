"""Bovespa / B3 market collector using yfinance."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import yfinance as yf

from backend.collectors.base import BaseCollector
from backend.config import REFRESH_INTERVALS
from backend.models import MarketTick

logger = logging.getLogger(__name__)

TICKERS = ["^BVSP", "PETR4.SA", "VALE3.SA", "ITUB4.SA", "BBDC4.SA"]
API_URL = "https://query1.finance.yahoo.com/v8/finance/chart/"


def _is_market_hours() -> bool:
    """B3 trades 10:00-17:00 BRT = 13:00-20:00 UTC."""

    utc_hour = datetime.now(timezone.utc).hour
    return 13 <= utc_hour < 20


class BovespaCollector(BaseCollector):
    source_name = "bovespa"

    @property
    def refresh_interval(self) -> float:
        return REFRESH_INTERVALS["bovespa"] if _is_market_hours() else REFRESH_INTERVALS["bovespa_off"]

    def _should_refresh(self) -> bool:
        import time
        return (time.time() - self._last_fetch) >= self.refresh_interval

    async def fetch(self) -> Any:
        results: dict[str, Any] = {}
        for symbol in TICKERS:
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.fast_info
                results[symbol] = {
                    "price": getattr(info, "last_price", None),
                    "prev_close": getattr(info, "previous_close", None),
                    "market_cap": getattr(info, "market_cap", None),
                    "volume": getattr(info, "last_volume", None),
                }
            except Exception:
                logger.warning("[bovespa] Failed to fetch %s", symbol)
                results[symbol] = {}
        return results

    async def normalize(self, raw: Any) -> list[MarketTick]:
        now = datetime.now(timezone.utc)
        results: list[MarketTick] = []
        for symbol, data in raw.items():
            price = data.get("price")
            if price is None:
                continue
            prev = data.get("prev_close")
            change = (price - prev) if prev else None
            change_pct = (change / prev * 100) if (change is not None and prev) else None
            results.append(MarketTick(
                source=self.source_name,
                fetched_at=now,
                api_url=f"{API_URL}{symbol}",
                symbol=symbol,
                price=price,
                change=change,
                change_pct=change_pct,
                volume=data.get("volume"),
                market_cap=data.get("market_cap"),
                timestamp=now,
            ))
        return results


if __name__ == "__main__":
    import asyncio

    async def _test() -> None:
        c = BovespaCollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} market ticks")
            for t in data:
                pct = f"{t.change_pct:+.2f}%" if t.change_pct else "N/A"
                print(f"  {t.symbol}: R${t.price:.2f} ({pct})")
        finally:
            await c.close()

    asyncio.run(_test())
