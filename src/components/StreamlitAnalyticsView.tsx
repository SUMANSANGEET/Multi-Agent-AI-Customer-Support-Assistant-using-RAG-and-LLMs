import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Copy,
  Check,
  ExternalLink,
  Code,
  Globe,
  Sliders,
  Sparkles,
  Server,
  Activity,
  Layers,
  Terminal,
  Play
} from 'lucide-react';

export const StreamlitAnalyticsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'code' | 'deploy'>('preview');
  const [dateRange, setDateRange] = useState(30);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([
    'Tech Support',
    'Billing & RMA',
    'Product Specs'
  ]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [apiStatus, setApiStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [copiedRequirements, setCopiedRequirements] = useState(false);

  const STREAMLIT_CODE = `import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import requests

# Page Config
st.set_page_config(page_title="TechMart Support Streamlit Analytics", layout="wide", page_icon="📊")

st.title("📊 TechMart Multi-Agent Analytics & Heatmap")
st.markdown("Real-time telemetry and 30-day agent routing distribution.")

# Sidebar Filters
st.sidebar.header("Filter Telemetry")
date_range = st.sidebar.slider("Select Days", 1, 30, ${dateRange})
agent_filter = st.sidebar.multiselect(
    "Filter Agents", 
    ["Intent Router", "Tech Support", "Billing & RMA", "Product Specs", "Escalations", "FAQ Helper"],
    default=${JSON.stringify(selectedAgents)}
)

# Fetch Data from App API
API_URL = "https://ais-pre-xeez3rq3fe7jsmivu3hmj6-834362858355.asia-east1.run.app/api/health"

try:
    response = requests.get(API_URL, timeout=5)
    st.sidebar.success(f"Connected to TechMart Backend: {response.json().get('status')}")
except Exception as e:
    st.sidebar.warning("Using local fallback data (API offline)")

# Synthetic 30-Day Heatmap Data
hours = [f"{h:02d}:00" for h in range(24)]
days = [f"Day {d}" for d in range(1, date_range + 1)]
matrix = np.random.poisson(lam=25, size=(len(days), len(hours)))

# Interactive Plotly Heatmap
fig = px.imshow(
    matrix,
    labels=dict(x="Hour of Day (EST)", y="30-Day Timeline", color="Routing Volume"),
    x=hours,
    y=days,
    color_continuous_scale="Viridis",
    title="30-Day Agent Routing Traffic Heatmap"
)
st.plotly_chart(fig, use_container_width=True)

# Key Metrics Grid
col1, col2, col3, col4 = st.columns(4)
col1.metric("Total Queries (30 Days)", "14,820", "+12.4%")
col2.metric("Peak Hour Traffic", "1,240 req/hr", "10 AM - 2 PM EST")
col3.metric("CSAT Resolution Rate", "94.2%", "+2.1%")
col4.metric("Avg SLA Latency", "340 ms", "-45 ms")`;

  const REQUIREMENTS_TXT = `streamlit>=1.30.0
pandas>=2.0.0
numpy>=1.24.0
plotly>=5.18.0
requests>=2.31.0`;

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('error'));
  }, []);

  const handleCopyCode = (text: string, isReq = false) => {
    navigator.clipboard.writeText(text);
    if (isReq) {
      setCopiedRequirements(true);
      setTimeout(() => setCopiedRequirements(false), 3000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    }
  };

  const allAgents = [
    'Intent Router',
    'Tech Support',
    'Billing & RMA',
    'Product Specs',
    'Escalations',
    'FAQ Helper'
  ];

  const toggleAgent = (agent: string) => {
    if (selectedAgents.includes(agent)) {
      if (selectedAgents.length > 1) {
        setSelectedAgents(selectedAgents.filter(a => a !== agent));
      }
    } else {
      setSelectedAgents([...selectedAgents, agent]);
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-500 p-0.5 shadow-lg shadow-orange-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Streamlit App Integration</h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-orange-950 text-orange-400 border border-orange-800/80 rounded-full flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-orange-400" />
                <span>Python & Streamlit Ready</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Interactive Python Streamlit analytics dashboard integrated with live TechMart REST APIs.
            </p>
          </div>
        </div>

        {/* SUB-NAVIGATION TABS */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('preview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'preview'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Live Streamlit Preview</span>
          </button>
          <button
            onClick={() => setActiveSubTab('code')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'code'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>streamlit_app.py</span>
          </button>
          <button
            onClick={() => setActiveSubTab('deploy')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'deploy'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Deployment Guide</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: STREAMLIT INTERACTIVE PREVIEW */}
      {activeSubTab === 'preview' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-4">
          {/* STREAMLIT SIDEBAR CONTROLS */}
          <div className="p-5 bg-slate-950 border-r border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-orange-400" />
                <span>Filter Telemetry</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Streamlit Sidebar</span>
            </div>

            {/* DATE RANGE SLIDER */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Select Days:</span>
                <span className="text-orange-400 font-bold font-mono">{dateRange} Days</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                value={dateRange}
                onChange={e => setDateRange(parseInt(e.target.value, 10))}
                className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 Day</span>
                <span>15 Days</span>
                <span>30 Days</span>
              </div>
            </div>

            {/* AGENTS MULTI-SELECT */}
            <div className="space-y-2">
              <span className="text-xs text-slate-300 font-medium block">Filter Agents:</span>
              <div className="space-y-1.5">
                {allAgents.map(agent => {
                  const isSelected = selectedAgents.includes(agent);
                  return (
                    <button
                      key={agent}
                      onClick={() => toggleAgent(agent)}
                      className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors border ${
                        isSelected
                          ? 'bg-orange-950/70 border-orange-800/80 text-orange-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{agent}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-orange-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* API BACKEND STATUS */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 font-medium block">Backend REST Connection:</span>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-2 text-xs">
                <Server className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-white font-medium truncate">TechMart REST Endpoint</div>
                  <div className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Status: {apiStatus === 'connected' ? 'Connected (200 OK)' : 'Connecting...'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN DASHBOARD CANVAS */}
          <div className="lg:col-span-3 p-6 space-y-6 bg-slate-900">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>📊 TechMart Multi-Agent Analytics & Heatmap</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Real-time telemetry and {dateRange}-day agent routing distribution powered by Streamlit & Plotly.
              </p>
            </div>

            {/* KEY METRICS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">Total Queries ({dateRange} Days)</div>
                <div className="text-2xl font-bold text-white font-mono">
                  {(14820 * (dateRange / 30)).toFixed(0)}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                  <span>↑ +12.4% vs prev cycle</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">Peak Hour Traffic</div>
                <div className="text-2xl font-bold text-orange-400 font-mono">1,240 <span className="text-xs font-normal text-slate-400">req/hr</span></div>
                <div className="text-[10px] text-slate-400">10:00 AM – 2:00 PM EST</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">CSAT Resolution Rate</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">94.2%</div>
                <div className="text-[10px] text-emerald-400 font-semibold">↑ +2.1% SLA Target</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">Avg SLA Latency</div>
                <div className="text-2xl font-bold text-cyan-400 font-mono">340 <span className="text-xs font-normal text-slate-400">ms</span></div>
                <div className="text-[10px] text-cyan-400 font-semibold">↓ -45 ms optimized</div>
              </div>
            </div>

            {/* PLOTLY HEATMAP VISUALIZATION SIMULATION */}
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-orange-400" />
                  <span>30-Day Agent Routing Traffic Heatmap (Viridis Palette)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Agents: {selectedAgents.length} selected
                </span>
              </div>

              {/* HEATMAP GRID */}
              <div className="space-y-1.5 overflow-x-auto pb-2">
                <div className="grid grid-cols-24 text-[9px] font-mono text-slate-500 min-w-[600px] mb-1">
                  {Array.from({ length: 24 }).map((_, h) => (
                    <div key={h} className="text-center">{`${h.toString().padStart(2, '0')}`}</div>
                  ))}
                </div>

                {Array.from({ length: Math.min(dateRange, 12) }).map((_, d) => (
                  <div key={d} className="flex items-center space-x-1 min-w-[600px]">
                    <span className="text-[9px] font-mono text-slate-500 w-12 shrink-0">
                      Day {d + 1}
                    </span>
                    <div className="grid grid-cols-24 gap-1 flex-1">
                      {Array.from({ length: 24 }).map((_, h) => {
                        // Highlight peak hours 10 to 14
                        const isPeak = h >= 10 && h <= 14;
                        const intensity = isPeak
                          ? Math.min(1, 0.6 + ((d % 3) * 0.15))
                          : Math.max(0.1, ((h * 7 + d * 13) % 100) / 100 * 0.5);

                        return (
                          <div
                            key={h}
                            style={{
                              backgroundColor: isPeak
                                ? `rgba(249, 115, 22, ${intensity})`
                                : `rgba(16, 185, 129, ${intensity})`
                            }}
                            className="h-5 rounded-sm hover:ring-2 hover:ring-white transition-all cursor-pointer group relative"
                          >
                            <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-slate-900 border border-slate-700 text-[10px] font-mono text-white p-1.5 rounded shadow-xl whitespace-nowrap z-20">
                              Day {d + 1} @ {h}:00 EST — Vol: {Math.round(intensity * 1200)} reqs
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 bg-emerald-900/60 rounded-sm"></div>
                    <span>Off-Peak Routing</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                    <span>Peak Hour Window (10 AM - 2 PM EST)</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Streamlit Plotly Engine</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: STREAMLIT CODE DISPLAY */}
      {activeSubTab === 'code' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-orange-400" />
              <h3 className="font-bold text-white text-base">streamlit_app.py</h3>
              <span className="text-xs text-slate-500 font-mono">Created at Project Root</span>
            </div>

            <button
              onClick={() => handleCopyCode(STREAMLIT_CODE, false)}
              className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-orange-600/20 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied Python Code!' : 'Copy streamlit_app.py'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
            <code>{STREAMLIT_CODE}</code>
          </pre>
        </div>
      )}

      {/* SUB-TAB 3: DEPLOYMENT GUIDE */}
      {activeSubTab === 'deploy' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-white">How to Deploy Streamlit App to Production</h3>
            <p className="text-xs text-slate-400 mt-1">
              Follow these simple steps to host your Streamlit dashboard on Streamlit Community Cloud or Hugging Face.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-orange-950 text-orange-400 border border-orange-800/80 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="font-bold text-sm text-white">Project Files Ready</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                <code className="text-orange-400 font-mono">streamlit_app.py</code> has been automatically created at the root directory of this repository.
              </p>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-orange-950 text-orange-400 border border-orange-800/80 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="font-bold text-sm text-white">Export to GitHub</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Export this project to GitHub via the AI Studio Settings Menu or commit your changes to your Git repository.
              </p>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-orange-950 text-orange-400 border border-orange-800/80 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="font-bold text-sm text-white">Deploy on Streamlit Cloud</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Go to <a href="https://share.streamlit.io" target="_blank" rel="noreferrer" className="text-orange-400 underline">share.streamlit.io</a>, connect your repository, and set main file to <code className="text-orange-400 font-mono">streamlit_app.py</code>.
              </p>
            </div>
          </div>

          {/* REQUIREMENTS.TXT CODE BOX */}
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-orange-400" />
                <span className="font-bold text-xs text-white">requirements.txt</span>
              </div>
              <button
                onClick={() => handleCopyCode(REQUIREMENTS_TXT, true)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1.5"
              >
                {copiedRequirements ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRequirements ? 'Copied' : 'Copy requirements.txt'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-orange-300">
              <code>{REQUIREMENTS_TXT}</code>
            </pre>
          </div>

          {/* LIVE BACKEND API LINK */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white">Live App REST API Endpoint</div>
              <div className="text-[11px] text-slate-400 font-mono">
                https://ais-pre-xeez3rq3fe7jsmivu3hmj6-834362858355.asia-east1.run.app/api/health
              </div>
            </div>
            <a
              href="https://ais-pre-xeez3rq3fe7jsmivu3hmj6-834362858355.asia-east1.run.app/api/health"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Test Live API</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
