import React, { useState, useEffect } from 'react';
import {
  Ticket,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  ShieldAlert,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { SupportTicket } from '../types';

export const TicketsView: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch (e) {
      console.warn('Fetch tickets error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicketStatus = (ticketId: string, newStatus: any) => {
    setTickets(prev =>
      prev.map(t => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-rose-400 font-semibold text-sm">
            <Ticket className="w-5 h-5" />
            <span>Human-Agent SLA Handoff</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Escalated Support Tickets & Supervisor Queue</h2>
          <p className="text-xs text-slate-400">
            Automatically generated when customer queries require human supervisor intervention or priority RMA replacement.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-3.5 py-2 rounded-xl text-xs transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* TICKETS LIST */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-sm">
            No active escalated tickets found in queue.
          </div>
        ) : (
          tickets.map(t => (
            <div
              key={t.id}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl space-y-3 transition-all shadow-lg"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-cyan-400 text-sm">{t.id}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      t.priority === 'urgent'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : t.priority === 'high'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                    }`}
                  >
                    {t.priority} priority
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{t.category}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Status:</span>
                  <select
                    value={t.status}
                    onChange={e => updateTicketStatus(t.id, e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
                  >
                    <option value="Open">Open</option>
                    <option value="Escalated">Escalated</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-base text-white">{t.subject}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{t.summary}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t.userName} ({t.userEmail})</span>
                </div>

                <div className="flex items-center space-x-2 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Created: {new Date(t.createdAt).toLocaleString()}</span>
                  {t.assignedAgent && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">Assigned: {t.assignedAgent}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
