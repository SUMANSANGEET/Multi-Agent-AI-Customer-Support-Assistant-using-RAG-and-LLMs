import React, { useState } from 'react';
import {
  Flame,
  Clock,
  Calendar,
  Filter,
  Zap,
  Bot,
  BrainCircuit,
  CreditCard,
  Wrench,
  ShoppingBag,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Info
} from 'lucide-react';
import { AgentRoutingHeatmapData, AgentType } from '../types';

interface AgentRoutingHeatmapProps {
  heatmapData?: AgentRoutingHeatmapData;
}

const AGENT_CONFIGS: Record<AgentType, { name: string; icon: React.FC<{ className?: string }>; color: string; bg: string; border: string }> = {
  intent: { name: 'Intent Router', icon: BrainCircuit, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  billing: { name: 'Billing Agent', icon: CreditCard, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  technical: { name: 'Tech Support', icon: Wrench, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  product: { name: 'Product Specs', icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  complaint: { name: 'Escalations', icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  faq: { name: 'FAQ Helper', icon: HelpCircle, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
};

export const AgentRoutingHeatmap: React.FC<AgentRoutingHeatmapProps> = ({ heatmapData }) => {
  const [selectedAgent, setSelectedAgent] = useState<AgentType | 'all'>('all');
  const [timeRangeDays, setTimeRangeDays] = useState<30 | 14 | 7>(30);
  const [viewMode, setViewMode] = useState<'30days' | 'timeSlots'>('30days');
  const [selectedCell, setSelectedCell] = useState<{
    dateLabel: string;
    agentName: string;
    volume: number;
    isPeak: boolean;
    dayOfWeek: string;
  } | null>(null);

  if (!heatmapData) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-2xl">
        Heatmap telemetry data unavailable.
      </div>
    );
  }

  const { days, timeSlots, agents, dailyAgentVolume, timeSlotAgentVolume, peakTimesSummary } = heatmapData;

  // Filter days based on timeRangeDays
  const filteredDays = days.slice(-timeRangeDays);

  // Compute max volume for intensity scaling
  let maxVol = 1;
  if (viewMode === '30days') {
    filteredDays.forEach(d => {
      agents.forEach(a => {
        if (selectedAgent === 'all' || selectedAgent === a) {
          const vol = dailyAgentVolume[d.date]?.[a] || 0;
          if (vol > maxVol) maxVol = vol;
        }
      });
    });
  } else {
    timeSlots.forEach(ts => {
      agents.forEach(a => {
        if (selectedAgent === 'all' || selectedAgent === a) {
          const vol = timeSlotAgentVolume[ts.id]?.[a] || 0;
          if (vol > maxVol) maxVol = vol;
        }
      });
    });
  }

  // Get color intensity styling
  const getCellIntensityStyle = (vol: number, max: number) => {
    if (vol === 0) return 'bg-slate-950/60 border-slate-800/60 text-slate-600';
    const ratio = vol / max;
    if (ratio >= 0.82) {
      return 'bg-gradient-to-tr from-amber-500/30 to-rose-500/40 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20 font-bold ring-1 ring-amber-400/50';
    }
    if (ratio >= 0.6) {
      return 'bg-indigo-600/40 border-indigo-500/60 text-indigo-200 font-semibold';
    }
    if (ratio >= 0.35) {
      return 'bg-cyan-900/40 border-cyan-700/50 text-cyan-300 font-medium';
    }
    return 'bg-slate-800/50 border-slate-800 text-slate-400';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
      {/* HEADER & SUMMARY METRICS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            <h3 className="text-lg font-bold text-white tracking-tight">Agent Routing Heatmap & Peak Traffic Analysis</h3>
          </div>
          <p className="text-xs text-slate-400">
            30-day temporal visualization of agent executions across peak traffic hours and weekday demand spikes.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1 text-xs">
            <button
              onClick={() => setViewMode('30days')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === '30days'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
              Daily View
            </button>
            <button
              onClick={() => setViewMode('timeSlots')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'timeSlots'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 inline mr-1.5" />
              24h Peak Profile
            </button>
          </div>

          {/* Time Range Filter */}
          {viewMode === '30days' && (
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1 text-xs">
              <button
                onClick={() => setTimeRangeDays(30)}
                className={`px-2.5 py-1.5 rounded-lg font-medium ${timeRangeDays === 30 ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                30D
              </button>
              <button
                onClick={() => setTimeRangeDays(14)}
                className={`px-2.5 py-1.5 rounded-lg font-medium ${timeRangeDays === 14 ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                14D
              </button>
              <button
                onClick={() => setTimeRangeDays(7)}
                className={`px-2.5 py-1.5 rounded-lg font-medium ${timeRangeDays === 7 ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                7D
              </button>
            </div>
          )}
        </div>
      </div>

      {/* HIGHLIGHTED PEAK TRAFFIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-950/80 border border-slate-800/90 rounded-xl space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Peak Hour Window</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-amber-300 truncate">{peakTimesSummary.peakHourRange}</div>
          <div className="text-[10px] text-slate-500">Highest concurrent agent routing</div>
        </div>

        <div className="p-3.5 bg-slate-950/80 border border-slate-800/90 rounded-xl space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Busiest Days</span>
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-sm font-bold text-rose-300 truncate">{peakTimesSummary.peakDayOfWeek}</div>
          <div className="text-[10px] text-slate-500">+42% routing spike vs weekends</div>
        </div>

        <div className="p-3.5 bg-slate-950/80 border border-slate-800/90 rounded-xl space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Top Routed Agent</span>
            <Wrench className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-sm font-bold text-indigo-300 capitalize">
            {AGENT_CONFIGS[peakTimesSummary.peakAgent]?.name || peakTimesSummary.peakAgent}
          </div>
          <div className="text-[10px] text-slate-500">Peak single-day: {peakTimesSummary.peakVolume} execs</div>
        </div>

        <div className="p-3.5 bg-slate-950/80 border border-slate-800/90 rounded-xl space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>30-Day Total Volume</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-emerald-400 font-mono">
            {peakTimesSummary.total30DayVolume.toLocaleString()} Query Execs
          </div>
          <div className="text-[10px] text-slate-500">Avg {peakTimesSummary.avgDailyVolume} daily routings</div>
        </div>
      </div>

      {/* AGENT FILTER BAR */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-slate-400 font-medium shrink-0 flex items-center space-x-1">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <span>Agent Filter:</span>
        </span>

        <button
          onClick={() => setSelectedAgent('all')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all border ${
            selectedAgent === 'all'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          All Specialized Agents
        </button>

        {agents.map(ag => {
          const cfg = AGENT_CONFIGS[ag];
          const Icon = cfg.icon;
          const isSelected = selectedAgent === ag;
          return (
            <button
              key={ag}
              onClick={() => setSelectedAgent(ag)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? `${cfg.bg} ${cfg.color} ${cfg.border} font-semibold ring-1 ring-slate-700`
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cfg.name}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN HEATMAP GRID */}
      <div className="space-y-3 overflow-x-auto">
        {viewMode === '30days' ? (
          /* MODE 1: DAILY 30-DAY GRID */
          <div className="min-w-[700px] space-y-2">
            {/* Header Dates */}
            <div className="grid grid-cols-[140px_1fr] gap-2 items-center">
              <div className="text-xs font-semibold text-slate-400">Agent Domain</div>
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${filteredDays.length}, minmax(0, 1fr))` }}>
                {filteredDays.map(d => (
                  <div
                    key={d.date}
                    className={`text-[10px] text-center font-mono py-1 rounded truncate ${
                      d.isWeekend ? 'text-slate-500 font-normal' : 'text-slate-300 font-semibold'
                    }`}
                    title={`${d.label} (${d.dayOfWeek})`}
                  >
                    <div>{d.dayOfWeek[0]}</div>
                    <div className="text-[9px] text-slate-500">{d.label.split(' ')[1]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Rows */}
            {agents
              .filter(ag => selectedAgent === 'all' || selectedAgent === ag)
              .map(ag => {
                const cfg = AGENT_CONFIGS[ag];
                const Icon = cfg.icon;

                return (
                  <div key={ag} className="grid grid-cols-[140px_1fr] gap-2 items-center">
                    {/* Row Label */}
                    <div className="flex items-center space-x-2 px-2 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs truncate">
                      <Icon className={`w-3.5 h-3.5 ${cfg.color} shrink-0`} />
                      <span className="font-medium text-slate-200 truncate">{cfg.name}</span>
                    </div>

                    {/* Cells Grid */}
                    <div
                      className="grid gap-1"
                      style={{ gridTemplateColumns: `repeat(${filteredDays.length}, minmax(0, 1fr))` }}
                    >
                      {filteredDays.map(d => {
                        const vol = dailyAgentVolume[d.date]?.[ag] || 0;
                        const isPeak = vol / maxVol >= 0.82;
                        const styleClass = getCellIntensityStyle(vol, maxVol);

                        return (
                          <div
                            key={`${ag}-${d.date}`}
                            onClick={() =>
                              setSelectedCell({
                                dateLabel: d.label,
                                agentName: cfg.name,
                                volume: vol,
                                isPeak,
                                dayOfWeek: d.dayOfWeek
                              })
                            }
                            className={`h-9 rounded-md border text-[10px] flex items-center justify-center cursor-pointer transition-all hover:scale-110 hover:z-20 relative group ${styleClass}`}
                            title={`${cfg.name} on ${d.label} (${d.dayOfWeek}): ${vol} executions ${isPeak ? '🔥 Peak Traffic' : ''}`}
                          >
                            <span>{vol}</span>
                            {isPeak && (
                              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          /* MODE 2: 24-HOUR TIME SLOTS PROFILE */
          <div className="space-y-2 min-w-[600px]">
            <div className="grid grid-cols-[140px_1fr] gap-2 items-center">
              <div className="text-xs font-semibold text-slate-400">Agent Domain</div>
              <div className="grid grid-cols-6 gap-2">
                {timeSlots.map(ts => (
                  <div
                    key={ts.id}
                    className={`text-[11px] text-center p-2 rounded-lg border font-mono ${
                      ts.isPeakHours
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>{ts.label.split(' ')[0]}</div>
                    <div className="text-[9px] text-slate-500">{ts.label.split(' ')[2] || ''}</div>
                  </div>
                ))}
              </div>
            </div>

            {agents
              .filter(ag => selectedAgent === 'all' || selectedAgent === ag)
              .map(ag => {
                const cfg = AGENT_CONFIGS[ag];
                const Icon = cfg.icon;

                return (
                  <div key={ag} className="grid grid-cols-[140px_1fr] gap-2 items-center">
                    <div className="flex items-center space-x-2 px-2 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs truncate">
                      <Icon className={`w-3.5 h-3.5 ${cfg.color} shrink-0`} />
                      <span className="font-medium text-slate-200 truncate">{cfg.name}</span>
                    </div>

                    <div className="grid grid-cols-6 gap-2">
                      {timeSlots.map(ts => {
                        const vol = timeSlotAgentVolume[ts.id]?.[ag] || 0;
                        const isPeak = ts.isPeakHours || vol / maxVol >= 0.8;
                        const styleClass = getCellIntensityStyle(vol, maxVol);

                        return (
                          <div
                            key={`${ag}-${ts.id}`}
                            onClick={() =>
                              setSelectedCell({
                                dateLabel: ts.label,
                                agentName: cfg.name,
                                volume: vol,
                                isPeak,
                                dayOfWeek: 'Peak Hour Block'
                              })
                            }
                            className={`h-12 rounded-xl border text-xs font-mono flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${styleClass}`}
                          >
                            <span className="font-bold">{vol}</span>
                            <span className="text-[9px] opacity-75">execs</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* FOOTER LEGEND & INTERACTIVE CELL DRILLDOWN */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-800/80 pt-4 gap-3 text-xs text-slate-400">
        {/* Heatmap Legend */}
        <div className="flex items-center space-x-3">
          <span className="font-medium text-slate-400">Traffic Intensity:</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-800" />
            <span className="text-[11px]">Low</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-cyan-900/40 border border-cyan-700/50" />
            <span className="text-[11px]">Moderate</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-indigo-600/40 border border-indigo-500/60" />
            <span className="text-[11px]">High</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-500/40 border border-amber-400 ring-1 ring-amber-400/50" />
            <span className="text-[11px] text-amber-300 font-semibold">Peak Traffic</span>
          </div>
        </div>

        {/* Selected Cell Drilldown Badge */}
        {selectedCell ? (
          <div className="flex items-center space-x-2 bg-slate-950 border border-indigo-500/40 px-3 py-1.5 rounded-xl text-xs text-slate-200">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>
              <strong className="text-white">{selectedCell.agentName}</strong> on {selectedCell.dateLabel}:{' '}
              <strong className="text-cyan-400 font-mono">{selectedCell.volume} query routings</strong>
            </span>
            {selectedCell.isPeak && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                🔥 Peak Slot
              </span>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-slate-500 italic">
            Click any cell to inspect detailed query routing telemetry.
          </div>
        )}
      </div>
    </div>
  );
};
