import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Bot,
  CreditCard,
  Wrench,
  Package,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Zap,
  Clock,
  Layers,
  Terminal,
  Play,
  TrendingUp,
  Activity
} from 'lucide-react';
import { AgentType } from '../types';

interface AgentInspectorProps {
  onStatusUpdate?: (status: { lastLlmLatencyMs?: number; activeAgent?: string }) => void;
}

interface SparklineProps {
  data: number[];
  strokeColor: string;
  gradientId: string;
  agentLabel: string;
}

const AgentSparkline: React.FC<SparklineProps> = ({
  data,
  strokeColor,
  gradientId,
  agentLabel
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 160;
  const height = 34;
  const padding = 4;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return { x, y, val };
  });

  const pathD = points.reduce((acc, pt, i) => (
    i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`
  ), '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  const avg = Math.round(data.reduce((a, b) => a + b, 0) / data.length);
  const latest = data[data.length - 1];

  return (
    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span className="flex items-center space-x-1 text-slate-300 font-medium">
          <Activity className="w-3 h-3 text-slate-400" />
          <span>Response Sparkline</span>
        </span>
        <span className="text-emerald-400 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800/60 font-bold">
          {avg}ms avg
        </span>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8 overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Gradient Fill under sparkline */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Main sparkline path */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Historical points */}
          {points.map((pt, i) => {
            const isLast = i === points.length - 1;
            return (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={isLast ? 3 : 1.5}
                fill={isLast ? '#ffffff' : strokeColor}
                stroke={strokeColor}
                strokeWidth={isLast ? 1.5 : 0}
              />
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
        <span>Min: {min}ms</span>
        <span className="text-slate-300 font-bold">Latest: {latest}ms</span>
        <span>Max: {max}ms</span>
      </div>
    </div>
  );
};

export const AgentInspector: React.FC<AgentInspectorProps> = ({ onStatusUpdate }) => {
  const [testQuery, setTestQuery] = useState('I paid yesterday for Premium, but my app is locked with Error E-305.');
  const [simulatedResult, setSimulatedResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Historical agent response times
  const [agentLatencies, setAgentLatencies] = useState<Record<AgentType, number[]>>({
    intent: [120, 115, 140, 110, 130, 125, 118, 122],
    billing: [310, 280, 325, 295, 340, 315, 300, 310],
    technical: [420, 450, 410, 480, 435, 460, 440, 425],
    product: [250, 270, 240, 280, 260, 255, 265, 248],
    complaint: [380, 395, 410, 375, 420, 385, 400, 390],
    faq: [180, 195, 175, 210, 185, 190, 200, 182]
  });

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => {
        if (data.analytics?.agentLatencies) {
          setAgentLatencies(data.analytics.agentLatencies);
        }
      })
      .catch(e => console.warn('Analytics latency fetch error:', e));
  }, []);

  const handleSimulateRouting = async () => {
    setIsSimulating(true);
    onStatusUpdate?.({ activeAgent: 'Router Simulator Active...' });
    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: testQuery
        })
      });
      const data = await res.json();
      setSimulatedResult(data.responseMetadata);

      if (data.responseMetadata) {
        const invoked = data.responseMetadata.invokedAgents
          ? data.responseMetadata.invokedAgents.map((a: string) => a.toUpperCase() + ' AGENT').join(', ')
          : 'Router';

        onStatusUpdate?.({
          lastLlmLatencyMs: data.responseMetadata.latencyMs,
          activeAgent: invoked
        });

        // Dynamically update sparkline latencies
        if (data.responseMetadata.executionTraces) {
          setAgentLatencies(prev => {
            const updated = { ...prev };
            data.responseMetadata.executionTraces.forEach((tr: any) => {
              if (updated[tr.agent as AgentType]) {
                updated[tr.agent as AgentType] = [
                  ...updated[tr.agent as AgentType],
                  tr.latencyMs
                ].slice(-12);
              }
            });
            return updated;
          });
        }
      }
    } catch (e) {
      console.warn('Simulation error:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
            <BrainCircuit className="w-5 h-5" />
            <span>Multi-Agent System Architecture</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Agent Router & Latency Sparklines</h2>
          <p className="text-xs text-slate-400">
            Inspect response times for the 5 specialized domain agents, central Intent Classifier, and execution traces.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
          <div>
            <div className="text-slate-400 font-medium">Orchestrator Model:</div>
            <div className="text-emerald-400 font-mono font-bold">Gemini 3.6 Flash</div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <div className="text-slate-400 font-medium">Domain Agents:</div>
            <div className="text-indigo-400 font-mono font-bold">5 Specialized</div>
          </div>
        </div>
      </div>

      {/* INTENT ROUTER SPARKLINE HIGHLIGHT */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-purple-400">
            <BrainCircuit className="w-5 h-5" />
            <span className="font-bold text-base text-white">Central Intent Classifier & Router</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Zero-shot Classification Pipeline</span>
        </div>
        <p className="text-xs text-slate-400">
          Evaluates customer query sentiment, urgency, and domain intent to route incoming requests to specialized agents.
        </p>

        <AgentSparkline
          data={agentLatencies.intent || [120, 115, 140, 110, 130, 125]}
          strokeColor="#a855f7"
          gradientId="sparkline-intent"
          agentLabel="Intent Router"
        />
      </div>

      {/* ARCHITECTURE DIAGRAM MAP WITH SPARKlines */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Specialized Agents & Response Latency Sparklines</span>
          </h3>
          <span className="text-xs text-slate-400">Historical LLM Execution Times</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Billing Agent */}
          <div className="p-4 bg-slate-950 border border-slate-800 hover:border-emerald-500/60 rounded-xl space-y-2 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-emerald-400">
                <CreditCard className="w-4 h-4" />
                <span className="font-bold text-sm">Billing Agent</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Handles payment failures, subscription pricing ($14.99/mo), pro-rated refunds, invoice SLA.
              </p>
              <div className="text-[10px] font-mono bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/60 inline-block mt-2">
                Module 5.1
              </div>
            </div>

            <AgentSparkline
              data={agentLatencies.billing || [310, 280, 325, 295, 340]}
              strokeColor="#10b981"
              gradientId="sparkline-billing"
              agentLabel="Billing"
            />
          </div>

          {/* Technical Support Agent */}
          <div className="p-4 bg-slate-950 border border-slate-800 hover:border-cyan-500/60 rounded-xl space-y-2 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-cyan-400">
                <Wrench className="w-4 h-4" />
                <span className="font-bold text-sm">Technical Support</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Diagnoses app sync (Error E-305), earbud pairing (Error E-102), power reset (Error E-401).
              </p>
              <div className="text-[10px] font-mono bg-cyan-950/60 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/60 inline-block mt-2">
                Module 5.2
              </div>
            </div>

            <AgentSparkline
              data={agentLatencies.technical || [420, 450, 410, 480, 435]}
              strokeColor="#06b6d4"
              gradientId="sparkline-technical"
              agentLabel="Technical"
            />
          </div>

          {/* Product Agent */}
          <div className="p-4 bg-slate-950 border border-slate-800 hover:border-indigo-500/60 rounded-xl space-y-2 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400">
                <Package className="w-4 h-4" />
                <span className="font-bold text-sm">Product Agent</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Specs for ApexBook Pro 15, SoundBuds Ultra, SmartWatch Elite, SmartHub Max, TechCare+.
              </p>
              <div className="text-[10px] font-mono bg-indigo-950/60 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800/60 inline-block mt-2">
                Module 5.3
              </div>
            </div>

            <AgentSparkline
              data={agentLatencies.product || [250, 270, 240, 280, 260]}
              strokeColor="#818cf8"
              gradientId="sparkline-product"
              agentLabel="Product"
            />
          </div>

          {/* Complaint Agent */}
          <div className="p-4 bg-slate-950 border border-slate-800 hover:border-rose-500/60 rounded-xl space-y-2 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-bold text-sm">Complaint Agent</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Empathetic de-escalation, supervisor 2-hr SLA callback, store credit goodwill options.
              </p>
              <div className="text-[10px] font-mono bg-rose-950/60 text-rose-300 px-2 py-0.5 rounded border border-rose-800/60 inline-block mt-2">
                Module 5.4
              </div>
            </div>

            <AgentSparkline
              data={agentLatencies.complaint || [380, 395, 410, 375, 420]}
              strokeColor="#f43f5e"
              gradientId="sparkline-complaint"
              agentLabel="Complaint"
            />
          </div>

          {/* FAQ Agent */}
          <div className="p-4 bg-slate-950 border border-slate-800 hover:border-amber-500/60 rounded-xl space-y-2 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-amber-400">
                <HelpCircle className="w-4 h-4" />
                <span className="font-bold text-sm">FAQ Agent</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Operating hours (1-800-555-TECH), store addresses, standard return windows.
              </p>
              <div className="text-[10px] font-mono bg-amber-950/60 text-amber-300 px-2 py-0.5 rounded border border-amber-800/60 inline-block mt-2">
                Module 5.5
              </div>
            </div>

            <AgentSparkline
              data={agentLatencies.faq || [180, 195, 175, 210, 185]}
              strokeColor="#f59e0b"
              gradientId="sparkline-faq"
              agentLabel="FAQ"
            />
          </div>
        </div>
      </div>

      {/* LIVE INTERACTIVE ROUTER SIMULATOR */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base text-white flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Interactive Multi-Agent Router Simulator</span>
          </h3>
          <span className="text-xs text-slate-400">Module 3 & 4 Real-time Test</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Test Customer Query Prompt</label>
            <input
              type="text"
              value={testQuery}
              onChange={e => setTestQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleSimulateRouting}
            disabled={isSimulating || !testQuery.trim()}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/30"
          >
            <Play className="w-4 h-4" />
            <span>{isSimulating ? 'Classifying & Dispatching...' : 'Run Agent Router Test'}</span>
          </button>

          {/* SIMULATION RESULT DISPLAY */}
          {simulatedResult && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Primary Intent</div>
                  <div className="text-sm font-bold text-cyan-400 uppercase mt-0.5">
                    {simulatedResult.intent?.primaryIntent}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Confidence: {Math.round((Number(simulatedResult.intent?.confidence) || 0) * 100)}%
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Sentiment & Urgency</div>
                  <div className="text-sm font-bold text-amber-400 capitalize mt-0.5">
                    {simulatedResult.intent?.sentiment} ({simulatedResult.intent?.urgency})
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Escalated: {simulatedResult.escalatedToHuman ? 'YES' : 'NO'}
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Dispatched Agents</div>
                  <div className="text-sm font-bold text-indigo-400 mt-0.5">
                    {simulatedResult.invokedAgents?.join(', ').toUpperCase()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Latency: {simulatedResult.latencyMs}ms
                  </div>
                </div>
              </div>

              {/* Execution Traces Table */}
              <div>
                <div className="text-slate-400 font-bold mb-2">Detailed Execution Step Traces:</div>
                <div className="space-y-2">
                  {simulatedResult.executionTraces?.map((tr: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
                      <div className="flex items-center justify-between text-indigo-300 font-bold">
                        <span>{tr.agentName} ({tr.agent.toUpperCase()})</span>
                        <span className="text-slate-500">{tr.latencyMs}ms</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">{tr.outputSummary}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
