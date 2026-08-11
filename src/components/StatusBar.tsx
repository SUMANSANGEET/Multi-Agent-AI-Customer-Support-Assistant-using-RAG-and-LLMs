import React, { useEffect, useState } from 'react';
import {
  Activity,
  Bot,
  Clock,
  Database,
  Cpu,
  Wifi,
  WifiOff,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export interface SystemStatusState {
  apiConnected: boolean;
  pingMs: number | null;
  lastLlmLatencyMs: number | null;
  activeAgent: string;
}

interface StatusBarProps {
  status: SystemStatusState;
  onRefreshHealth?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ status, onRefreshHealth }) => {
  return (
    <footer className="bg-slate-900/95 border-t border-slate-800/80 px-4 py-2 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3 shrink-0 selection:bg-none z-20">
      {/* LEFT: API Connection & Ping */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            {status.apiConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            )}
          </span>

          <span className="font-semibold text-slate-300 flex items-center space-x-1">
            {status.apiConnected ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span className={status.apiConnected ? 'text-slate-200' : 'text-rose-400 font-bold'}>
              {status.apiConnected ? 'API Connected' : 'API Offline'}
            </span>
          </span>

          {status.pingMs !== null && status.apiConnected && (
            <span className="font-mono text-[11px] text-emerald-400/90 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
              {status.pingMs}ms ping
            </span>
          )}
        </div>

        <div className="hidden sm:block text-slate-700">|</div>

        {/* LLM Model Info */}
        <div className="hidden sm:flex items-center space-x-1.5 text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Model:</span>
          <span className="font-mono text-cyan-300 font-medium text-[11px]">Gemini 3.6 Flash</span>
        </div>
      </div>

      {/* CENTER: Active Agent */}
      <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1 rounded-lg border border-slate-800/80">
        <Bot className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-slate-400">Active Agent:</span>
        <span className="font-semibold font-mono text-indigo-300 capitalize text-[11px]">
          {status.activeAgent || 'Multi-Agent Router (Idle)'}
        </span>
      </div>

      {/* RIGHT: Latency & RAG Status */}
      <div className="flex items-center space-x-4">
        {/* Latency metric */}
        <div className="flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">LLM Latency:</span>
          <span className="font-mono font-bold text-amber-300 text-[11px]">
            {status.lastLlmLatencyMs !== null ? `${status.lastLlmLatencyMs} ms` : '--'}
          </span>
        </div>

        <div className="hidden md:block text-slate-700">|</div>

        {/* Vector Store Index status */}
        <div className="hidden md:flex items-center space-x-1.5">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>RAG Index:</span>
          <span className="font-mono text-emerald-400 font-medium text-[11px]">36 Chunks</span>
        </div>
      </div>
    </footer>
  );
};
