"""
Example telemetry endpoints for the TechMart backend (Cloud Run API).
Adapt to whatever framework/DB you're actually running (this assumes
FastAPI + SQLite via sqlite3; swap for SQLAlchemy/Postgres as needed).

Add this router to your existing app alongside /api/health.
"""

import sqlite3
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter(prefix="/api/telemetry", tags=["telemetry"])
DB_PATH = "techmart.db"  # adjust to your actual DB path / connection


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ---------------------------------------------------------------------
# 1) Call this from inside your agent pipeline, right after each agent
#    finishes handling a request, to log a row.
# ---------------------------------------------------------------------
class AgentEvent(BaseModel):
    agent: str
    latency_ms: float
    session_id: Optional[str] = None
    resolved: Optional[bool] = None
    csat_score: Optional[float] = None
    confidence: Optional[float] = None
    retrieved_docs: Optional[int] = None
    query_text: Optional[str] = None


@router.post("/log")
def log_event(event: AgentEvent):
    conn = get_conn()
    conn.execute(
        """INSERT INTO agent_events
           (timestamp, session_id, agent, query_text, latency_ms, resolved, csat_score, retrieved_docs, confidence)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            datetime.now(timezone.utc).isoformat(),
            event.session_id,
            event.agent,
            event.query_text,
            event.latency_ms,
            int(event.resolved) if event.resolved is not None else None,
            event.csat_score,
            event.retrieved_docs,
            event.confidence,
        ),
    )
    conn.commit()
    conn.close()
    return {"status": "logged"}


# ---------------------------------------------------------------------
# 2) The Streamlit dashboard calls this to pull raw events for a window.
#    It aggregates client-side, so this endpoint just needs to return rows.
# ---------------------------------------------------------------------
@router.get("/events")
def get_events(days: int = Query(30, ge=1, le=90)):
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    conn = get_conn()
    rows = conn.execute(
        """SELECT timestamp, agent, latency_ms, resolved, csat_score
           FROM agent_events WHERE timestamp >= ? ORDER BY timestamp ASC""",
        (since,),
    ).fetchall()
    conn.close()
    return {
        "count": len(rows),
        "events": [
            {
                "timestamp": r["timestamp"],
                "agent": r["agent"],
                "latency_ms": r["latency_ms"],
                "resolved": r["resolved"],
                "csat_score": r["csat_score"],
            }
            for r in rows
        ],
    }


# In your main FastAPI app:
#   from backend_telemetry_example import router as telemetry_router
#   app.include_router(telemetry_router)
