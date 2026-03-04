from __future__ import annotations

"""Bovespa / B3 market collector using yfinance.

Returns a SINGLE aggregated dict matching the frontend MarketData shape:
  {symbol, price, change, changePercent, volume, history: [{time, open, high, low, close}]}
"""

import logging
from datetime import datetime, timezone
from typing import Any

from backend.collectors.base import BaseCollector
from backend.config import REFRESH_INTERVALS

logger = logging.getLogger(__name__)

# Primary ticker for the widget header
PRIMARY_TICKER = "^BVSP"
TICKERS = ["^BVSP", "PETR4.SA", "VALE3.SA", "ITUB4.SA", "BBDC4.SA"]
API_URL = "https://query1.finance.yahoo.com/v8/finance/chart/"

# Static fallback for when yfinance fails
STATIC_FALLBACK = {
    "symbol": "^BVSP",
    "price": 130000.0,
    "change": -250.0,
    "changePercent": -0.19,
    "volume": 8500000,
    "history": [],
}


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
        try:
            import yfinance as yf
        except ImportError:
            logger.warning("[bovespa] yfinance not installed, using fallback")
            return {"fallback": True}

        results: dict[str, Any] = {}
        history_data: list[dict] = []

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

        # Fetch IBOV history for the chart (last 30 days)
        try:
            ibov = yf.Ticker(PRIMARY_TICKER)
            hist = ibov.history(period="1mo")
            for idx, row in hist.iterrows():
                ts = int(idx.timestamp()) if hasattr(idx, "timestamp") else 0
                history_data.append({
                    "time": ts,
                    "open": round(float(row.get("Open", 0)), 2),
                    "high": round(float(row.get("High", 0)), 2),
                    "low": round(float(row.get("Low", 0)), 2),
                    "close": round(float(row.get("Close", 0)), 2),
                })
        except Exception:
            logger.warning("[bovespa] Failed to fetch IBOV history")

        return {"tickers": results, "history": history_data}

    async def normalize(self, raw: Any) -> list[dict]:
        """Return a single-element list containing the aggregated MarketData dict.

        The frontend expects: {symbol, price, change, changePercent, volume, history: [...]}
        """
        if raw.get("fallback"):
            return [STATIC_FALLBACK]

        tickers = raw.get("tickers", {})
        history = raw.get("history", [])

        # Use the primary ticker (IBOV) for the main display
        primary = tickers.get(PRIMARY_TICKER, {})
        price = primary.get("price")

        if price is None:
            return [STATIC_FALLBACK]

        prev = primary.get("prev_close")
        change = (price - prev) if prev else 0.0
        change_pct = (change / prev * 100) if (prev and prev != 0) else 0.0

        market_data = {
            "symbol": PRIMARY_TICKER,
            "price": round(price, 2),
            "change": round(change, 2),
            "changePercent": round(change_pct, 2),
            "volume": primary.get("volume") or 0,
            "history": history,
        }

        return [market_data]


if __name__ == "__main__":
    import asyncio
    import json

    async def _test() -> None:
        c = BovespaCollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} market data objects")
            if data:
                d = data[0]
                # Don't print full history
                preview = {**d, "history": f"[{len(d.get('history', []))} items]"}
                print(json.dumps(preview, indent=2, default=str))
        finally:
            await c.close()

    asyncio.run(_test())
