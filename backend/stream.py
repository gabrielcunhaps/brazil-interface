from __future__ import annotations

"""SSE streaming endpoint — pushes real-time data from all collectors to connected clients."""

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Any

from sse_starlette.sse import EventSourceResponse
from starlette.requests import Request

from backend.collectors.base import BaseCollector
from backend.config import ENABLED_COLLECTORS

logger = logging.getLogger(__name__)

HEARTBEAT_INTERVAL = 15  # seconds

# Source name mapping for SSE event names
SOURCE_EVENT_NAMES = {
    "opensky": "flights",
    "usgs": "earthquakes",
    "celestrak": "satellites",
    "firms": "fires",
    "queimadas": "fires_inpe",
    "inmet": "weather",
    "bcb": "economy",
    "bovespa": "market",
    "deter": "deforestation",
    "ibge": "demographics",
    "ons": "energy",
    "datasus": "health",
    "tse": "elections",
    "transparencia": "transparency",
    "brasilapi": "brasilapi",
}

# These sources send a SINGLE aggregated object (not a list).
# The frontend store expects a single object for these, so we unwrap the
# single-element list returned by the collector's normalize().
SINGLETON_SOURCES = {"bcb", "bovespa", "ons"}


def _serialize_item(item: Any) -> Any:
    """Serialize a single item — handles both Pydantic models and plain dicts."""
    if hasattr(item, "model_dump"):
        return item.model_dump(mode="json")
    return item


def _build_payload(source_name: str, event_name: str, data: list) -> str:
    """Build the SSE JSON payload, handling singleton vs list sources."""
    serialized = [_serialize_item(item) for item in data]

    if source_name in SINGLETON_SOURCES and len(serialized) == 1:
        # Unwrap: send the single object directly as `data`
        payload = {
            "source": source_name,
            "event": event_name,
            "count": 1,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": serialized[0],
        }
    else:
        payload = {
            "source": source_name,
            "event": event_name,
            "count": len(serialized),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": serialized,
        }

    return json.dumps(payload, default=str)


async def _collector_loop(
    collector: BaseCollector,
    queue: asyncio.Queue,
    stop_event: asyncio.Event,
) -> None:
    """Continuously fetch from a collector and push updates to the queue."""
    event_name = SOURCE_EVENT_NAMES.get(collector.source_name, collector.source_name)

    while not stop_event.is_set():
        try:
            data = await collector.get_latest()
            if data:  # Only send if we have data
                payload_str = _build_payload(collector.source_name, event_name, data)
                await queue.put((event_name, payload_str))
            else:
                logger.debug("[stream] %s returned empty data", collector.source_name)
        except Exception:
            logger.exception("[stream] Error in %s loop", collector.source_name)

        # Wait for the collector's refresh interval before next fetch
        try:
            await asyncio.wait_for(
                stop_event.wait(),
                timeout=collector.refresh_interval,
            )
            break  # stop_event was set
        except asyncio.TimeoutError:
            pass  # time to fetch again


async def _heartbeat_loop(queue: asyncio.Queue, stop_event: asyncio.Event) -> None:
    """Send periodic heartbeat to keep the SSE connection alive."""
    while not stop_event.is_set():
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=HEARTBEAT_INTERVAL)
            break
        except asyncio.TimeoutError:
            ts = datetime.now(timezone.utc).isoformat()
            await queue.put(("heartbeat", json.dumps({"type": "heartbeat", "timestamp": ts})))


async def stream_generator(
    request: Request,
    collectors: dict[str, BaseCollector],
) -> Any:
    """Async generator that yields SSE events from all active collectors."""
    queue: asyncio.Queue = asyncio.Queue()
    stop_event = asyncio.Event()
    tasks: list[asyncio.Task] = []

    # Start a loop for each enabled collector
    for name, collector in collectors.items():
        if not ENABLED_COLLECTORS.get(name, True):
            continue
        task = asyncio.create_task(
            _collector_loop(collector, queue, stop_event),
            name=f"collector-{name}",
        )
        tasks.append(task)

    # Start heartbeat
    tasks.append(
        asyncio.create_task(_heartbeat_loop(queue, stop_event), name="heartbeat")
    )

    try:
        # Send initial connection event
        yield {
            "event": "connected",
            "data": json.dumps({
                "sources": list(collectors.keys()),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }),
        }

        while True:
            # Check if client disconnected
            if await request.is_disconnected():
                break

            try:
                event_name, data = await asyncio.wait_for(queue.get(), timeout=1.0)
                yield {"event": event_name, "data": data}
            except asyncio.TimeoutError:
                continue

    finally:
        stop_event.set()
        for task in tasks:
            task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)
        logger.info("[stream] Client disconnected, cleaned up %d tasks", len(tasks))


async def sse_endpoint(request: Request, collectors: dict[str, BaseCollector]) -> EventSourceResponse:
    """Create an SSE response that streams data from all collectors."""
    return EventSourceResponse(stream_generator(request, collectors))
