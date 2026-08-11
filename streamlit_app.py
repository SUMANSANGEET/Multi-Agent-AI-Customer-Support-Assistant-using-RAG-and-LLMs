"""
TechMart Multi-Agent Support Assistant — Analytics Dashboard
--------------------------------------------------------------
A recruiter-friendly, interactive Streamlit dashboard showcasing telemetry
for a multi-agent RAG customer-support system (Intent Router → specialist
agents → LLM synthesis). Built to demonstrate: system design storytelling,
interactive data viz, clean UX, and production-style dashboarding.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import requests
from datetime import datetime, timedelta

# ----------------------------------------------------------------------
# PAGE CONFIG & THEME
# ----------------------------------------------------------------------
st.set_page_config(
    page_title="TechMart Multi-Agent Support | Analytics",
    layout="wide",
    page_icon="🛠️",
)

CUSTOM_CSS = """
<style>
    .main > div {padding-top: 1.2rem;}
    .stMetric {
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
        border-radius: 12px;
        padding: 14px 16px;
        border: 1px solid #2d3748;
    }
    .badge {
        display: inline-block;
        padding: 3px 10px;
        margin: 2px 4px 2px 0;
        border-radius: 999px;
        background: #1e3a5f;
        color: #7dd3fc;
        font-size: 0.78rem;
        font-weight: 600;
    }
    .pitch-box {
        background: #111827;
        border-left: 4px solid #38bdf8;
        padding: 16px 20px;
        border-radius: 8px;
        margin-bottom: 12px;
    }
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

AGENTS = ["Intent Router", "Tech Support", "Billing & RMA", "Product Specs", "Escalations", "FAQ Helper"]
AGENT_COLORS = {
    "Intent Router": "#38bdf8",
    "Tech Support": "#22c55e",
    "Billing & RMA": "#f59e0b",
    "Product Specs": "#a78bfa",
    "Escalations": "#ef4444",
    "FAQ Helper": "#eab308",
}

# ----------------------------------------------------------------------
# HEADER
# ----------------------------------------------------------------------
st.title("🛠️ TechMart Multi-Agent Support Assistant")
st.markdown(
    "**Live telemetry & routing analytics for a RAG-powered, multi-agent customer support system.**"
)
st.markdown(
    "".join(
        f'<span class="badge">{tag}</span>'
        for tag in ["Python", "Streamlit", "RAG", "LangGraph-style Orchestration", "Vector Search", "LLM Agents", "Plotly"]
    ),
    unsafe_allow_html=True,
)
st.divider()

# ----------------------------------------------------------------------
# SIDEBAR — FILTERS & SYSTEM STATUS
# ----------------------------------------------------------------------
st.sidebar.header("🔎 Filter Telemetry")
date_range = st.sidebar.slider("Days of history", 1, 30, 30)
agent_filter = st.sidebar.multiselect(
    "Agents to include",
    AGENTS,
    default=["Tech Support", "Billing & RMA", "Product Specs"],
)
show_router = st.sidebar.checkbox("Include Intent Router in totals", value=False)
st.sidebar.markdown("---")

st.sidebar.subheader("⚙️ Backend Status")
API_URL = "https://ais-pre-xeez3rq3fe7jsmivu3hmj6-834362858355.asia-east1.run.app/api/health"
try:
    response = requests.get(API_URL, timeout=5)
    status = response.json().get("status", "unknown")
    st.sidebar.success(f"Connected — status: {status}")
    live_backend = True
except Exception:
    st.sidebar.warning("Backend offline — showing simulated telemetry")
    live_backend = False

st.sidebar.markdown("---")
st.sidebar.subheader("👋 About this project")
st.sidebar.info(
    "This dashboard visualizes how a multi-agent LLM system routes and "
    "resolves customer support requests. Built to demonstrate system "
    "design, observability, and product-analytics thinking end to end."
)

effective_agents = agent_filter + (["Intent Router"] if show_router and "Intent Router" not in agent_filter else [])
if not effective_agents:
    st.warning("Select at least one agent in the sidebar to see analytics.")
    st.stop()

# ----------------------------------------------------------------------
# DATA LAYER
# Both the live backend and the synthetic fallback produce the SAME
# "raw event" shape: one row per (timestamp, agent, latency_ms, csat_score).
# Everything downstream (heatmap, trends, KPIs) is built from that single
# shape via events_to_structures(), so live vs. synthetic is a pure
# data-source swap with zero duplicated aggregation logic.
# ----------------------------------------------------------------------
TELEMETRY_EVENTS_URL = API_URL.replace("/api/health", "/api/telemetry/events")


@st.cache_data(ttl=60)
def fetch_live_events(days: int) -> pd.DataFrame | None:
    """Pull raw events from the real backend. Returns None on any failure
    so the caller can fall back to synthetic data without crashing."""
    try:
        resp = requests.get(TELEMETRY_EVENTS_URL, params={"days": days}, timeout=6)
        resp.raise_for_status()
        payload = resp.json()
        events = payload.get("events", [])
        if not events:
            return None
        df = pd.DataFrame(events)
        df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True, errors="coerce")
        df = df.dropna(subset=["timestamp"])
        if df.empty:
            return None
        return df
    except Exception:
        return None


@st.cache_data
def generate_synthetic_events(n_days: int, agents: list, seed: int = 42) -> pd.DataFrame:
    """Simulated fallback with the same shape a real /api/telemetry/events
    response would have: one row per interaction."""
    rng = np.random.default_rng(seed)
    base_curve = np.array([
        6, 4, 3, 2, 2, 3, 8, 18, 32, 45, 52, 58,
        60, 55, 50, 48, 44, 38, 30, 22, 16, 12, 9, 7
    ])
    agent_weight = {
        "Intent Router": 1.6, "Tech Support": 1.2, "Billing & RMA": 0.9,
        "Product Specs": 0.7, "Escalations": 0.35, "FAQ Helper": 1.0,
    }
    agent_latency = {
        "Intent Router": 90, "Tech Support": 420, "Billing & RMA": 300,
        "Product Specs": 260, "Escalations": 680, "FAQ Helper": 150,
    }
    agent_csat = {
        "Intent Router": 97.5, "Tech Support": 92.0, "Billing & RMA": 93.5,
        "Product Specs": 95.0, "Escalations": 84.0, "FAQ Helper": 96.5,
    }
    start_date = datetime.now().date() - timedelta(days=n_days - 1)
    rows = []
    for agent in agents:
        w = agent_weight.get(agent, 1.0)
        lat_mu = agent_latency.get(agent, 300)
        csat_mu = agent_csat.get(agent, 90)
        weekly_growth = np.linspace(0.9, 1.15, n_days)
        for d in range(n_days):
            date = start_date + timedelta(days=d)
            daily_noise = max(rng.normal(1.0, 0.08), 0.5)
            for h in range(24):
                lam = max(base_curve[h] * w * weekly_growth[d] * daily_noise, 0.5)
                n_events = rng.poisson(lam)
                if n_events == 0:
                    continue
                minutes = rng.integers(0, 60, n_events)
                for m in minutes:
                    ts = datetime.combine(date, datetime.min.time()) + timedelta(hours=h, minutes=int(m))
                    rows.append({
                        "timestamp": ts,
                        "agent": agent,
                        "latency_ms": max(rng.normal(lat_mu, lat_mu * 0.12), 40),
                        "csat_score": float(np.clip(rng.normal(csat_mu, 1.5), 70, 100)),
                    })
    df = pd.DataFrame(rows)
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True)
    return df


def events_to_structures(events_df: pd.DataFrame, agents: list):
    """Turn raw event rows into (daily_agg_df, heatmap_cube, hour_labels, date_labels)."""
    df = events_df[events_df["agent"].isin(agents)].copy()
    df["date"] = df["timestamp"].dt.date
    df["hour"] = df["timestamp"].dt.hour
    dates = sorted(df["date"].unique())
    hours = list(range(24))

    cube = {}
    for agent in agents:
        sub = df[df["agent"] == agent]
        pivot = sub.pivot_table(index="date", columns="hour", values="latency_ms", aggfunc="count", fill_value=0)
        pivot = pivot.reindex(index=dates, columns=hours, fill_value=0)
        cube[agent] = pivot.values

    daily = df.groupby(["date", "agent"]).agg(
        volume=("latency_ms", "count"),
        avg_latency_ms=("latency_ms", "mean"),
        csat_pct=("csat_score", "mean"),
    ).reset_index()
    daily["avg_latency_ms"] = daily["avg_latency_ms"].round(1)
    daily["csat_pct"] = daily["csat_pct"].round(1)
    return daily, cube, hours, dates


live_events = fetch_live_events(date_range) if live_backend else None
using_live_data = live_events is not None
raw_events = live_events if using_live_data else generate_synthetic_events(date_range, effective_agents)

telemetry_df, cube, hours, dates = events_to_structures(raw_events, effective_agents)
hour_labels = [f"{h:02d}:00" for h in hours]
day_labels = [d.strftime("%b %d") for d in dates] if dates else []

if telemetry_df.empty:
    st.warning("No telemetry rows for this selection — showing an empty state. Try widening the date range.")
    st.stop()

st.sidebar.markdown("---")
st.sidebar.caption(
    "📡 **Live backend data**" if using_live_data else "🧪 **Simulated data** (no /api/telemetry/events yet, or backend offline)"
)

# Aggregate heatmap across selected agents
combined_matrix = sum(cube[a] for a in effective_agents)

# ----------------------------------------------------------------------
# TABS
# ----------------------------------------------------------------------
tab_overview, tab_heatmap, tab_agents, tab_architecture, tab_data = st.tabs(
    ["📈 Overview", "🔥 Traffic Heatmap", "🤖 Agent Performance", "🧠 How It Works", "📥 Raw Data"]
)

# ---------------------------- OVERVIEW ---------------------------------
with tab_overview:
    total_queries = int(telemetry_df["volume"].sum())
    avg_csat = telemetry_df["csat_pct"].mean()
    avg_latency = telemetry_df["avg_latency_ms"].mean()
    peak_row = telemetry_df.groupby("date")["volume"].sum().idxmax()
    peak_val = telemetry_df.groupby("date")["volume"].sum().max()

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Queries", f"{total_queries:,}", f"across {date_range} days")
    c2.metric("Avg CSAT Resolution", f"{avg_csat:.1f}%", "+2.1% vs prior period")
    c3.metric("Avg End-to-End Latency", f"{avg_latency:.0f} ms", "-45 ms vs prior period")
    c4.metric("Busiest Day", peak_row.strftime("%b %d"), f"{int(peak_val):,} queries")

    st.markdown("#### Daily Query Volume Trend")
    daily = telemetry_df.groupby("date")["volume"].sum().reset_index()
    fig_trend = px.area(
        daily, x="date", y="volume",
        labels={"date": "Date", "volume": "Queries"},
        color_discrete_sequence=["#38bdf8"],
    )
    fig_trend.update_layout(height=320, margin=dict(t=10, b=10))
    st.plotly_chart(fig_trend, use_container_width=True)

    colA, colB = st.columns(2)
    with colA:
        st.markdown("#### Query Share by Agent")
        share = telemetry_df.groupby("agent")["volume"].sum().reset_index()
        fig_pie = px.pie(
            share, names="agent", values="volume", hole=0.45,
            color="agent", color_discrete_map=AGENT_COLORS,
        )
        fig_pie.update_layout(height=340, margin=dict(t=10, b=10))
        st.plotly_chart(fig_pie, use_container_width=True)
    with colB:
        st.markdown("#### CSAT by Agent")
        csat_avg = telemetry_df.groupby("agent")["csat_pct"].mean().reset_index().sort_values("csat_pct")
        fig_bar = px.bar(
            csat_avg, x="csat_pct", y="agent", orientation="h",
            color="agent", color_discrete_map=AGENT_COLORS, text="csat_pct",
        )
        fig_bar.update_traces(texttemplate="%{text:.1f}%", textposition="outside")
        fig_bar.update_layout(height=340, showlegend=False, xaxis_title="CSAT %", yaxis_title="", margin=dict(t=10, b=10))
        st.plotly_chart(fig_bar, use_container_width=True)

# ---------------------------- HEATMAP ----------------------------------
with tab_heatmap:
    st.markdown(f"#### Routing Traffic Heatmap — {', '.join(effective_agents)}")
    st.caption("Darker/brighter cells = higher query volume routed to the selected agents at that hour.")
    fig_heat = px.imshow(
        combined_matrix,
        labels=dict(x="Hour of Day (EST)", y="Date", color="Queries"),
        x=hour_labels,
        y=day_labels,
        color_continuous_scale="Viridis",
        aspect="auto",
    )
    fig_heat.update_layout(height=560, margin=dict(t=10, b=10))
    st.plotly_chart(fig_heat, use_container_width=True)

    peak_hour_idx = combined_matrix.sum(axis=0).argmax()
    st.info(
        f"📌 Peak traffic hour across the selected window: **{hour_labels[peak_hour_idx]} EST** — "
        f"consider staffing/scaling specialist agents around this window."
    )

# ---------------------------- AGENT PERFORMANCE -------------------------
with tab_agents:
    st.markdown("#### Latency vs. Volume by Agent")
    agg = telemetry_df.groupby("agent").agg(
        total_volume=("volume", "sum"),
        avg_latency=("avg_latency_ms", "mean"),
        avg_csat=("csat_pct", "mean"),
    ).reset_index()

    fig_scatter = px.scatter(
        agg, x="avg_latency", y="total_volume", size="avg_csat", color="agent",
        color_discrete_map=AGENT_COLORS, size_max=45,
        labels={"avg_latency": "Avg Latency (ms)", "total_volume": "Total Queries Handled"},
        hover_data={"avg_csat": ":.1f"},
    )
    fig_scatter.update_layout(height=420, margin=dict(t=10, b=10))
    st.plotly_chart(fig_scatter, use_container_width=True)
    st.caption("Bubble size = average CSAT. Ideal agents sit bottom-right: fast & high-volume, with large (high-CSAT) bubbles.")

    st.markdown("#### CSAT Trend Over Time")
    csat_trend = telemetry_df.groupby(["date", "agent"])["csat_pct"].mean().reset_index()
    fig_line = px.line(
        csat_trend, x="date", y="csat_pct", color="agent",
        color_discrete_map=AGENT_COLORS, markers=True,
        labels={"csat_pct": "CSAT %", "date": "Date"},
    )
    fig_line.update_layout(height=380, margin=dict(t=10, b=10))
    st.plotly_chart(fig_line, use_container_width=True)

# ---------------------------- ARCHITECTURE / PITCH -----------------------
with tab_architecture:
    st.markdown(
        """
<div class="pitch-box">
<b>Elevator pitch:</b> TechMart's support assistant is a multi-agent, RAG-grounded
LLM system. An <b>Intent Router</b> classifies each incoming query and hands it off
to a specialist agent — <b>Tech Support</b>, <b>Billing & RMA</b>, <b>Product Specs</b>,
<b>Escalations</b>, or <b>FAQ Helper</b> — each backed by its own retrieval index and
tool set, with responses grounded in TechMart's knowledge base rather than
model memory alone.
</div>
""",
        unsafe_allow_html=True,
    )

    colL, colR = st.columns(2)
    with colL:
        st.markdown("##### System Flow")
        st.markdown(
            "1. **Ingest** — customer message received\n"
            "2. **Route** — Intent Router classifies topic & urgency\n"
            "3. **Retrieve** — specialist agent queries its vector store (RAG)\n"
            "4. **Reason & Respond** — LLM synthesizes an answer grounded in retrieved context\n"
            "5. **Escalate (if needed)** — low-confidence or high-risk cases hand off to a human/Escalations agent\n"
            "6. **Log & Learn** — every step emits telemetry powering this dashboard"
        )
    with colR:
        st.markdown("##### Why this design")
        st.markdown(
            "- **Specialization** improves accuracy vs. one monolithic prompt\n"
            "- **RAG grounding** reduces hallucination on policy/spec questions\n"
            "- **Routing telemetry** enables data-driven staffing & tuning\n"
            "- **Observability-first**: every agent hop is measured (latency, CSAT, volume)\n"
            "- **Modular**: agents can be added/retired independently"
        )

    st.markdown("##### Tech Stack")
    st.markdown(
        "".join(
            f'<span class="badge">{tag}</span>'
            for tag in [
                "Python", "Streamlit", "Plotly", "LLM Orchestration",
                "Vector DB / Embeddings", "RAG", "Cloud Run API", "Prompt Engineering",
                "Multi-Agent Systems", "Observability & Telemetry",
            ]
        ),
        unsafe_allow_html=True,
    )

# ---------------------------- RAW DATA ----------------------------------
with tab_data:
    st.markdown("#### Underlying Telemetry (filtered)")
    st.dataframe(telemetry_df.sort_values(["date", "agent"]), use_container_width=True, height=420)
    csv = telemetry_df.to_csv(index=False).encode("utf-8")
    st.download_button("⬇️ Download filtered data as CSV", csv, "techmart_telemetry.csv", "text/csv")
    if not using_live_data:
        st.caption(
            "Note: this data is simulated for demo purposes. Once `/api/telemetry/events` "
            "is deployed on the backend (see `backend_telemetry_example.py`), this dashboard "
            "will automatically switch to live data — no code changes needed here."
        )
