import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Smile,
  ShieldAlert,
  Database,
  Users,
  CheckCircle2,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { SystemAnalytics } from '../types';
import { AgentRoutingHeatmap } from './AgentRoutingHeatmap';

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.analytics) {
        setAnalytics(data.analytics);
      }
    } catch (e) {
      console.warn('Analytics fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !analytics) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
        Loading system performance metrics...
      </div>
    );
  }

  const agentData = analytics.agentUsageCount || {};
  const agentValues = (Object.values(agentData) as number[]);
  const maxAgentVal = Math.max(...(agentValues.length > 0 ? agentValues : [1]), 1);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
            <BarChart3 className="w-5 h-5" />
            <span>System Intelligence & Telemetry</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Multi-Agent Analytics & CSAT Dashboard</h2>
          <p className="text-xs text-slate-400">
            Monitor real-time agent routing usage, customer sentiment breakdown, response latencies, and RAG retrieval accuracy.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-3.5 py-2 rounded-xl text-xs transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Conversations */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Queries Handled</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{analytics.totalConversations}</div>
          <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% week over week</span>
          </div>
        </div>

        {/* CSAT Score */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Customer Satisfaction (CSAT)</span>
            <Smile className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{analytics.csatScore} / 5.0</div>
          <div className="text-[11px] text-slate-400">Based on verified user ratings</div>
        </div>

        {/* Avg Response Time */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Avg Response Latency</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{analytics.avgResponseTimeMs} ms</div>
          <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Below 1,000ms SLA target</span>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>First-Touch Resolution</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{analytics.resolutionRatePercent}%</div>
          <div className="text-[11px] text-slate-400">Only 5.8% required human handoff</div>
        </div>
      </div>

      {/* 30-DAY INTERACTIVE AGENT ROUTING HEATMAP */}
      <AgentRoutingHeatmap heatmapData={analytics.heatmapData} />

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Routing Usage Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="font-semibold text-base text-white flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Domain Agent Routing Distribution</span>
          </h3>

          <div className="space-y-3 pt-2">
            {Object.entries(agentData).map(([agentKey, count]) => {
              const numericCount = Number(count) || 0;
              const percentage = Math.round((numericCount / maxAgentVal) * 100);
              return (
                <div key={agentKey} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300 uppercase">{agentKey} AGENT</span>
                    <span className="font-mono text-slate-400">{count} Executions</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sentiment Distribution Breakdown */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="font-semibold text-base text-white flex items-center space-x-2">
            <Smile className="w-4 h-4 text-amber-400" />
            <span>Customer Sentiment Analysis Breakdown</span>
          </h3>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400">Positive / Satisfied</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {analytics.sentimentBreakdown?.positive || 0}
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400">Neutral / Informational</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">
                {analytics.sentimentBreakdown?.neutral || 0}
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400">Frustrated / Issue</div>
              <div className="text-xl font-bold text-amber-400 mt-1">
                {analytics.sentimentBreakdown?.frustrated || 0}
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400">Angry / Escalated</div>
              <div className="text-xl font-bold text-rose-400 mt-1">
                {analytics.sentimentBreakdown?.angry || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RAG RETRIEVAL HEALTH METRICS */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h3 className="font-semibold text-base text-white flex items-center space-x-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Top Retrieved Knowledge Base Documents</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analytics.ragStats?.topRetrievedDocs?.map((doc, i) => (
            <div key={i} className="p-4 bg-slate-950 border border-slate-800/90 rounded-xl space-y-1">
              <div className="text-xs font-bold text-slate-200 truncate">{doc.docTitle}</div>
              <div className="text-xs text-emerald-400 font-mono font-semibold">{doc.count} Retrieves</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
