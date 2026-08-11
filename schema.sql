-- TechMart Multi-Agent Support: telemetry schema
-- Works as-is on SQLite; for Postgres swap AUTOINCREMENT -> SERIAL / IDENTITY.

CREATE TABLE IF NOT EXISTS agent_events (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp     TEXT NOT NULL,        -- ISO 8601, UTC, e.g. 2026-08-11T14:32:05Z
    session_id    TEXT,                 -- groups multi-turn conversations
    agent         TEXT NOT NULL,        -- 'Intent Router' | 'Tech Support' | 'Billing & RMA' |
                                         -- 'Product Specs' | 'Escalations' | 'FAQ Helper'
    query_text    TEXT,                 -- optional, for later analysis/debugging
    latency_ms    REAL NOT NULL,        -- time this agent took to respond
    resolved      INTEGER,              -- 1 = resolved without escalation, 0 = not
    csat_score    REAL,                 -- 0-100, nullable (not every interaction gets rated)
    retrieved_docs INTEGER,             -- number of RAG chunks retrieved, optional
    confidence    REAL                  -- model/router confidence 0-1, optional
);

CREATE INDEX IF NOT EXISTS idx_agent_events_ts ON agent_events (timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_events_agent ON agent_events (agent);

-- Example insert (called by your app right after an agent finishes handling a request):
-- INSERT INTO agent_events (timestamp, session_id, agent, latency_ms, resolved, csat_score, confidence)
-- VALUES ('2026-08-11T14:32:05Z', 'sess_123', 'Tech Support', 412.5, 1, 92.0, 0.87);
