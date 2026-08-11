import React, { useState, useEffect, useRef } from 'react';
import {
  ChatMessage,
  ChatSession,
  UserProfile,
  ProcessedResponse
} from '../types';
import { BENCHMARK_QUERIES, BenchmarkQuery } from '../data/sampleQueries';
import {
  Send,
  Bot,
  User,
  Plus,
  Trash2,
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  ChevronDown,
  ChevronUp,
  Brain,
  Layers,
  Database,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Star,
  FileText,
  LifeBuoy,
  RefreshCw,
  Cpu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  MessageSquare,
  Headset,
  PhoneCall,
  UserCheck,
  ShieldAlert,
  CreditCard,
  Wrench,
  Package,
  HelpCircle,
  GitFork,
  Zap,
  Globe,
  ExternalLink
} from 'lucide-react';
import { useDashboardLayout } from '../hooks';

interface ChatWindowProps {
  currentUser: UserProfile;
  onStatusUpdate?: (status: { lastLlmLatencyMs?: number; activeAgent?: string }) => void;
}

interface SpecializedAgentInfo {
  id: string;
  name: string;
  domainLabel: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  glowColor: string;
  icon: 'credit-card' | 'wrench' | 'package' | 'zap' | 'help' | 'git-fork';
  description: string;
}

const detectSpecializedAgent = (query: string): SpecializedAgentInfo => {
  const q = query.toLowerCase();
  if (
    q.includes('bill') ||
    q.includes('invoice') ||
    q.includes('pay') ||
    q.includes('charge') ||
    q.includes('refund') ||
    q.includes('subscri') ||
    q.includes('cost') ||
    q.includes('card')
  ) {
    return {
      id: 'billing',
      name: 'Billing & Account Specialist Agent',
      domainLabel: 'Billing Agent (Finance)',
      badgeBg: 'bg-amber-950/90',
      badgeBorder: 'border-amber-500/70',
      textColor: 'text-amber-300',
      glowColor: 'shadow-amber-500/20',
      icon: 'credit-card',
      description: 'Analyzing invoice records, payment gateways & subscription tiers...'
    };
  }
  if (
    q.includes('tech') ||
    q.includes('error') ||
    q.includes('bug') ||
    q.includes('api') ||
    q.includes('crash') ||
    q.includes('code') ||
    q.includes('fail') ||
    q.includes('issue') ||
    q.includes('latency') ||
    q.includes('500') ||
    q.includes('404')
  ) {
    return {
      id: 'tech_support',
      name: 'Technical Support & Engineering Agent',
      domainLabel: 'Tech Support Agent (Engine)',
      badgeBg: 'bg-indigo-950/90',
      badgeBorder: 'border-indigo-500/70',
      textColor: 'text-indigo-300',
      glowColor: 'shadow-indigo-500/20',
      icon: 'wrench',
      description: 'Debugging system logs, API endpoints & stack traces...'
    };
  }
  if (
    q.includes('product') ||
    q.includes('feature') ||
    q.includes('spec') ||
    q.includes('compare') ||
    q.includes('plan') ||
    q.includes('model') ||
    q.includes('limit') ||
    q.includes('rag')
  ) {
    return {
      id: 'product_specs',
      name: 'Product Specs & Architecture Agent',
      domainLabel: 'Product Specs Agent (Catalog)',
      badgeBg: 'bg-emerald-950/90',
      badgeBorder: 'border-emerald-500/70',
      textColor: 'text-emerald-300',
      glowColor: 'shadow-emerald-500/20',
      icon: 'package',
      description: 'Cross-referencing feature matrices & product documentation...'
    };
  }
  if (
    q.includes('complain') ||
    q.includes('frustrated') ||
    q.includes('terrible') ||
    q.includes('cancel') ||
    q.includes('supervisor') ||
    q.includes('human') ||
    q.includes('escalat')
  ) {
    return {
      id: 'escalations',
      name: 'Escalations & Priority Compliance Agent',
      domainLabel: 'Escalation Agent (Urgent)',
      badgeBg: 'bg-rose-950/90',
      badgeBorder: 'border-rose-500/70',
      textColor: 'text-rose-300',
      glowColor: 'shadow-rose-500/20',
      icon: 'zap',
      description: 'Evaluating customer sentiment & SLA priority rules...'
    };
  }
  return {
    id: 'faq',
    name: 'General FAQ & Guidance Agent',
    domainLabel: 'FAQ Helper Agent (General)',
    badgeBg: 'bg-purple-950/90',
    badgeBorder: 'border-purple-500/70',
    textColor: 'text-purple-300',
    glowColor: 'shadow-purple-500/20',
    icon: 'help',
    description: 'Retrieving standard knowledge base articles & quick answers...'
  };
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, onStatusUpdate }) => {
  const {
    isMobile,
    isTablet,
    isDesktop,
    isSidebarOpen,
    isSidebarCollapsed,
    toggleSidebar,
    toggleSidebarCollapse,
    closeSidebar
  } = useDashboardLayout();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('session-1');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Transfer to Human State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferReason, setTransferReason] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSuccessBanner, setTransferSuccessBanner] = useState<{ ticketId: string } | null>(null);

  // Multi-Agent Live Progress State
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number | null>(null);
  const [activeProcessingAgent, setActiveProcessingAgent] = useState<SpecializedAgentInfo | null>(null);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Speech Synthesis state
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Feedback Notification Toast state
  const [feedbackToast, setFeedbackToast] = useState<{ messageId: string; type: 'thumbs_up' | 'thumbs_down' } | null>(null);

  // Expanded Thinking traces per message ID
  const [expandedTraceMap, setExpandedTraceMap] = useState<Record<string, boolean>>({});

  const handleFeedback = async (messageId: string, type: 'thumbs_up' | 'thumbs_down') => {
    let updatedType: 'thumbs_up' | 'thumbs_down' | null = type;

    setMessages(prev =>
      prev.map(m => {
        if (m.id === messageId) {
          updatedType = m.feedbackType === type ? null : type;
          return { ...m, feedbackType: updatedType };
        }
        return m;
      })
    );

    if (updatedType) {
      setFeedbackToast({ messageId, type: updatedType });
      setTimeout(() => setFeedbackToast(null), 3000);
    } else {
      setFeedbackToast(null);
    }

    try {
      await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSessionId,
          messageId,
          feedbackType: updatedType
        })
      });
    } catch (e) {
      console.warn('Feedback API Error:', e);
    }
  };

  const handleTransferToHuman = async () => {
    if (isTransferring) return;
    setIsTransferring(true);
    try {
      const res = await fetch('/api/chat/transfer-to-human', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSessionId,
          userId: currentUser.id,
          reason: transferReason.trim() || 'Customer requested direct human agent intervention.'
        })
      });

      const data = await res.json();
      if (data.success) {
        if (data.systemMessage) {
          setMessages(prev => [...prev, data.systemMessage]);
        }
        setSessions(prev =>
          prev.map(s => (s.id === activeSessionId ? { ...s, status: 'escalated' } : s))
        );
        setTransferSuccessBanner({ ticketId: data.ticket.id });
        setIsTransferModalOpen(false);
        setTransferReason('');
        setTimeout(() => setTransferSuccessBanner(null), 10000);
      }
    } catch (e) {
      console.error('Transfer to human error:', e);
    } finally {
      setIsTransferring(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Sessions
  useEffect(() => {
    fetchSessions();
  }, [currentUser.id]);

  // Load Messages when active session changes
  useEffect(() => {
    if (activeSessionId) {
      fetchMessages(activeSessionId);
    }
  }, [activeSessionId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, activeWorkflowStep]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`/api/chat/sessions?userId=${currentUser.id}`);
      const data = await res.json();
      if (data.sessions && data.sessions.length > 0) {
        setSessions(data.sessions);
        setActiveSessionId(data.sessions[0].id);
      } else {
        createNewSession();
      }
    } catch (e) {
      console.warn('Failed to fetch sessions:', e);
    }
  };

  const fetchMessages = async (sessId: string) => {
    try {
      const res = await fetch(`/api/chat/messages/${sessId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.warn('Failed to fetch messages:', e);
    }
  };

  const createNewSession = async () => {
    try {
      const res = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title: 'New Support Conversation'
        })
      });
      const data = await res.json();
      if (data.session) {
        setSessions(prev => [data.session, ...prev]);
        setActiveSessionId(data.session.id);
        setMessages([]);
      }
    } catch (e) {
      console.warn('Failed to create session:', e);
    }
  };

  const deleteSession = async (sessId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/chat/sessions/${sessId}`, { method: 'DELETE' });
      const updated = sessions.filter(s => s.id !== sessId);
      setSessions(updated);
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
      } else {
        createNewSession();
      }
    } catch (e) {
      console.warn('Failed to delete session:', e);
    }
  };

  const renderAgentIcon = (iconType: string, className = 'w-4 h-4') => {
    switch (iconType) {
      case 'credit-card':
        return <CreditCard className={className} />;
      case 'wrench':
        return <Wrench className={className} />;
      case 'package':
        return <Package className={className} />;
      case 'zap':
        return <Zap className={className} />;
      case 'help':
        return <HelpCircle className={className} />;
      case 'git-fork':
        return <GitFork className={className} />;
      default:
        return <Bot className={className} />;
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || inputQuery).trim();
    if (!queryText || isLoading) return;

    setInputQuery('');
    setIsLoading(true);

    const detectedSpecialist = detectSpecializedAgent(queryText);

    // Add optimistic user message
    const tempUserMsg: ChatMessage = {
      id: `msg-user-temp-${Date.now()}`,
      sessionId: activeSessionId,
      sender: 'user',
      content: queryText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    // Simulate Step-by-Step Multi-Agent Thinking Stages with dynamic specialized agent updates
    setActiveWorkflowStep(1); // Intent Agent
    setActiveProcessingAgent({
      id: 'intent_router',
      name: 'Intent Classification Router',
      domainLabel: 'Intent Classifier',
      badgeBg: 'bg-cyan-950/90',
      badgeBorder: 'border-cyan-500/70',
      textColor: 'text-cyan-300',
      glowColor: 'shadow-cyan-500/20',
      icon: 'git-fork',
      description: 'Parsing request intent & mapping domain entities...'
    });
    onStatusUpdate?.({ activeAgent: 'Intent Classification Router' });

    setTimeout(() => {
      setActiveWorkflowStep(2);
      setActiveProcessingAgent(detectedSpecialist);
      onStatusUpdate?.({ activeAgent: detectedSpecialist.name });
    }, 250); // Agent Router to Specialized Agent

    setTimeout(() => {
      setActiveWorkflowStep(3);
      setActiveProcessingAgent({
        ...detectedSpecialist,
        description: `Performing RAG vector similarity search for ${detectedSpecialist.domainLabel}...`
      });
      onStatusUpdate?.({ activeAgent: `RAG Vector Index (${detectedSpecialist.id})` });
    }, 550); // RAG Vector Retriever

    setTimeout(() => {
      setActiveWorkflowStep(4);
      setActiveProcessingAgent({
        ...detectedSpecialist,
        description: `Gemini synthesis grounded in ${detectedSpecialist.domainLabel} context...`
      });
      onStatusUpdate?.({ activeAgent: `Gemini Synthesizing (${detectedSpecialist.id})` });
    }, 850); // Aggregator & LLM

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSessionId,
          userId: currentUser.id,
          content: queryText,
          history: messages.map(m => ({ role: m.sender, content: m.content }))
        })
      });

      const data = await res.json();

      if (data.assistantMessage) {
        setMessages(prev => {
          // Replace temp or append
          const filtered = prev.filter(m => m.id !== tempUserMsg.id);
          return [...filtered, data.userMessage, data.assistantMessage];
        });

        const meta = data.assistantMessage.responseMetadata;
        if (meta) {
          const invokedStr = meta.invokedAgents ? meta.invokedAgents.map((a: string) => a.toUpperCase() + ' AGENT').join(', ') : 'Router';
          onStatusUpdate?.({
            lastLlmLatencyMs: meta.latencyMs || 350,
            activeAgent: invokedStr
          });
        }

        // Expand trace for newly arrived message by default
        setExpandedTraceMap(prev => ({
          ...prev,
          [data.assistantMessage.id]: true
        }));
      }
    } catch (err) {
      console.error('Send message error:', err);
      // Fallback response message
      const errBotMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sessionId: activeSessionId,
        sender: 'assistant',
        content: 'I apologize, but our server encountered a temporary connection glitch. Please try again or refresh the page.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errBotMsg]);
    } finally {
      setIsLoading(false);
      setActiveWorkflowStep(null);
      setActiveProcessingAgent(null);
    }
  };

  // Voice Speech-To-Text
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in this browser version.');
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputQuery(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    }
  };

  // Text-To-Speech Playback
  const speakMessage = (msgId: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (speakingMsgId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      setSpeakingMsgId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleTraceExpansion = (msgId: string) => {
    setExpandedTraceMap(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* DESKTOP / TABLET RESPONSIVE SIDEBAR */}
      <aside
        className={`${
          isSidebarCollapsed ? 'w-16' : 'w-72 md:w-80'
        } bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-200 hidden md:flex`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <h2 className="font-semibold text-sm text-slate-200 flex items-center space-x-2 truncate">
              <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Chat Sessions</span>
            </h2>
          )}
          <div className="flex items-center space-x-1">
            {!isSidebarCollapsed && (
              <button
                onClick={createNewSession}
                className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shadow-md shadow-indigo-600/30"
                title="Create New Chat Session"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">New Chat</span>
              </button>
            )}
            <button
              onClick={toggleSidebarCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4 text-indigo-400" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
          {sessions.map(s => {
            const isActive = s.id === activeSessionId;
            if (isSidebarCollapsed) {
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={`w-full flex items-center justify-center p-2.5 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                  title={s.title}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              );
            }
            return (
              <div
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`group relative flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  isActive
                    ? 'bg-slate-800/90 border-indigo-500/60 text-white shadow-lg shadow-indigo-950/40'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <div className="overflow-hidden pr-6">
                  <div className="text-xs font-medium truncate mb-1 flex items-center space-x-1.5">
                    <span className="truncate">{s.title}</span>
                    {s.status === 'escalated' && (
                      <span className="shrink-0 px-1.5 py-0.2 text-[9px] font-bold bg-rose-950 text-rose-400 border border-rose-800 rounded">
                        HUMAN
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                    <span>{new Date(s.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {s.primaryCategory && (
                      <>
                        <span>•</span>
                        <span className="text-indigo-400 font-medium">{s.primaryCategory}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={e => deleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                  title="Delete Session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* System Info Footprint */}
        {!isSidebarCollapsed && (
          <div className="p-3 border-t border-slate-800/80 bg-slate-950 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>RAG Vector Chunks:</span>
              <span className="text-emerald-400 font-mono">36 Indexed</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Multi-Agent Router:</span>
              <span className="text-cyan-400 font-mono">5 Specialized</span>
            </div>
          </div>
        )}
      </aside>

      {/* MOBILE SESSIONS DRAWER OVERLAY */}
      {isSidebarOpen && isMobile && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={closeSidebar} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 border-r border-slate-800 p-4 space-y-4 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-bold text-sm text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Chat Sessions History</span>
              </h2>
              <button onClick={closeSidebar} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => {
                createNewSession();
                closeSidebar();
              }}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Session</span>
            </button>

            <div className="flex-1 overflow-y-auto space-y-2">
              {sessions.map(s => (
                <div
                  key={s.id}
                  onClick={() => {
                    setActiveSessionId(s.id);
                    closeSidebar();
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    s.id === activeSessionId
                      ? 'bg-slate-800 border-indigo-500 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="text-xs font-medium truncate mb-1">{s.title}</div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(s.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
        {/* ACTIVE SESSION CONTROL HEADER */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 z-10 shadow-md">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              sessions.find(s => s.id === activeSessionId)?.status === 'escalated'
                ? 'bg-rose-500 animate-ping'
                : 'bg-emerald-400'
            }`} />
            <h2 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
              {sessions.find(s => s.id === activeSessionId)?.title || 'Live AI Support Session'}
            </h2>
            {sessions.find(s => s.id === activeSessionId)?.status === 'escalated' && (
              <span className="bg-rose-950/80 text-rose-300 border border-rose-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 shrink-0">
                <Headset className="w-3 h-3 text-rose-400" />
                <span>Human SLA Active</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {sessions.find(s => s.id === activeSessionId)?.status === 'escalated' ? (
              <div className="flex items-center space-x-1.5 bg-rose-950/80 border border-rose-800/80 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm">
                <UserCheck className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Dispatched to Support Queue</span>
                <span className="sm:hidden">Human Escalated</span>
              </div>
            ) : (
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-rose-950/50 transition-all border border-rose-400/30 hover:scale-105 active:scale-95"
                title="Flag conversation and transfer to a human support specialist"
              >
                <Headset className="w-4 h-4" />
                <span>Transfer to Human</span>
              </button>
            )}
          </div>
        </div>

        {/* ESCALATION SUCCESS BANNER */}
        {transferSuccessBanner && (
          <div className="bg-rose-950/90 border-b border-rose-800/80 px-4 py-2 flex items-center justify-between text-xs text-rose-200 animate-in slide-in-from-top duration-300">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                Conversation flagged! Support Ticket <strong className="font-mono text-white">#{transferSuccessBanner.ticketId}</strong> created and dispatched to Tier-2 Support.
              </span>
            </div>
            <button
              onClick={() => setTransferSuccessBanner(null)}
              className="p-1 hover:bg-rose-900 rounded text-rose-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* DYNAMIC REAL-TIME AGENT PROCESSING FEEDBACK BANNER */}
        {isLoading && activeProcessingAgent && (
          <div className={`px-4 py-2.5 border-b flex items-center justify-between text-xs animate-in slide-in-from-top duration-300 ${activeProcessingAgent.badgeBg} ${activeProcessingAgent.badgeBorder} ${activeProcessingAgent.textColor} shadow-lg ${activeProcessingAgent.glowColor} z-10`}>
            <div className="flex items-center space-x-3 min-w-0">
              <div className="relative flex items-center justify-center p-1.5 rounded-lg bg-black/40 border border-white/10 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-lg bg-current opacity-30" />
                {renderAgentIcon(activeProcessingAgent.icon, 'w-4 h-4 shrink-0 relative text-current')}
              </div>
              <div className="flex items-center space-x-2 min-w-0">
                <span className="font-bold tracking-wide uppercase font-mono text-[11px] bg-black/50 px-2.5 py-0.5 rounded border border-white/15 shrink-0 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-current animate-spin" />
                  <span>{activeProcessingAgent.name}</span>
                </span>
                <span className="text-slate-200 truncate hidden sm:inline text-[11px] font-medium">
                  • {activeProcessingAgent.description}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0 text-[10px] font-mono bg-black/40 px-2.5 py-1 rounded-md text-slate-200 border border-white/10">
              <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
              <span>REAL-TIME AGENT PROCESSING</span>
            </div>
          </div>
        )}

        {/* BENCHMARK QUERY PRESET BAR */}
        <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2.5 flex items-center space-x-3 overflow-x-auto no-scrollbar shrink-0">
          {/* Mobile Sessions Drawer Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="md:hidden flex items-center space-x-1.5 bg-slate-950 hover:bg-slate-800 text-indigo-400 border border-slate-800 px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0"
            title="Toggle Sessions History"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sessions</span>
          </button>

          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 shrink-0">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Benchmark Queries:</span>
          </div>

          <div className="flex items-center space-x-2">
            {BENCHMARK_QUERIES.map(bq => (
              <button
                key={bq.id}
                onClick={() => handleSendMessage(bq.query)}
                className="group flex items-center space-x-1.5 px-3 py-1 bg-slate-950 hover:bg-indigo-950/70 border border-slate-800 hover:border-indigo-500/60 rounded-lg text-xs text-slate-300 hover:text-white transition-all whitespace-nowrap shrink-0"
                title={bq.description}
              >
                <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60">
                  {bq.category}
                </span>
                <span className="truncate max-w-[200px]">{bq.query}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CHAT MESSAGES SCROLL CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-xl shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Bot className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">TechMart Multi-Agent AI Support</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  How can we assist you today? Ask questions about billing refunds, technical error codes (E-305, E-102), hardware specs, product warranties, or order delivery.
                </p>
              </div>

              {/* Sample Quick Action Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                <button
                  onClick={() => handleSendMessage('I paid $14.99 for TechMart Premium yesterday, but my SoundBuds app still says locked (Error E-305). Can I get a refund or fix this?')}
                  className="p-3.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/80 rounded-xl text-xs space-y-1 transition-all group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-cyan-400 flex items-center justify-between">
                    <span>Subscription Error & Refund</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-slate-400">Triggers Billing & Technical Agents together via RAG.</p>
                </button>

                <button
                  onClick={() => handleSendMessage('My SoundBuds Ultra earbuds have no sound in left ear and flash red (Error E-102). How do I hard reset them?')}
                  className="p-3.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/80 rounded-xl text-xs space-y-1 transition-all group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-cyan-400 flex items-center justify-between">
                    <span>Earbud Diagnostic (Error E-102)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-slate-400">Retrieves exact diagnostic steps from UserManual.pdf.</p>
                </button>
              </div>
            </div>
          ) : (
            messages.map(m => {
              if (m.sender === 'system') {
                return (
                  <div key={m.id} className="w-full flex justify-center my-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-w-2xl w-full bg-gradient-to-br from-rose-950/80 via-slate-900 to-amber-950/80 border border-rose-500/50 p-4 rounded-2xl shadow-xl shadow-rose-950/30 space-y-2">
                      <div className="flex items-center justify-between border-b border-rose-900/50 pb-2">
                        <div className="flex items-center space-x-2 text-xs font-bold text-rose-300 uppercase tracking-wider">
                          <Headset className="w-4 h-4 text-rose-400 animate-pulse" />
                          <span>Human Support SLA Escalation Triggered</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {m.content}
                      </div>
                      <div className="pt-2 border-t border-rose-900/40 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center space-x-1 text-amber-400 font-medium">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Status: Dispatched to Tier-2 Support Queue</span>
                        </span>
                        <span className="text-slate-400">Target Response: &lt; 15 mins</span>
                      </div>
                    </div>
                  </div>
                );
              }

              const isUser = m.sender === 'user';
              const metadata = m.responseMetadata;
              const isTraceExpanded = expandedTraceMap[m.id];

              return (
                <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-3xl w-full space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* MESSAGE BUBBLE */}
                    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-md ${
                          isUser
                            ? 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                            : 'bg-slate-900 border border-slate-800 text-cyan-400'
                        }`}
                      >
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-cyan-400" />}
                      </div>

                      <div className="flex-1 space-y-3">
                        <div
                          className={`p-4 rounded-2xl text-sm leading-relaxed ${
                            isUser
                              ? 'bg-indigo-600 text-white rounded-tr-none ml-auto max-w-xl'
                              : 'bg-slate-900 border border-slate-800/90 text-slate-200 rounded-tl-none shadow-xl'
                          }`}
                        >
                          {/* Formatting assistant reply */}
                          <div className="whitespace-pre-wrap">{m.content}</div>

                          {/* Suggested Action Pills if available */}
                          {!isUser && metadata?.suggestedActions && metadata.suggestedActions.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
                              {metadata.suggestedActions.map((action, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSendMessage(`Follow up action: ${action}`)}
                                  className="px-2.5 py-1 bg-slate-950 hover:bg-indigo-950 text-indigo-300 hover:text-white border border-slate-800 hover:border-indigo-500/60 rounded-lg text-xs transition-colors"
                                >
                                  {action}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* ASSISTANT MESSAGE METADATA & MULTI-AGENT TRACE TOGGLE */}
                        {!isUser && metadata && (
                          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center space-x-2">
                                <span className="flex items-center space-x-1 text-slate-300 font-medium">
                                  <Brain className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>Intent: {metadata.intent.primaryIntent.toUpperCase()}</span>
                                </span>
                                <span className="text-slate-600">•</span>
                                <span className="text-slate-400">
                                  Latency: <strong className="text-slate-200">{metadata.latencyMs}ms</strong>
                                </span>
                                {metadata.escalatedToHuman && (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800 font-semibold text-[10px]">
                                    Escalated #{metadata.ticketId}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-2">
                                {/* Thumbs Up / Thumbs Down Model Feedback Buttons */}
                                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 space-x-0.5">
                                  <button
                                    onClick={() => handleFeedback(m.id, 'thumbs_up')}
                                    className={`p-1.5 rounded-md transition-all ${
                                      m.feedbackType === 'thumbs_up'
                                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/80 font-bold shadow-sm shadow-emerald-900/50'
                                        : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80'
                                    }`}
                                    title="Rate response as helpful (Thumbs Up)"
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleFeedback(m.id, 'thumbs_down')}
                                    className={`p-1.5 rounded-md transition-all ${
                                      m.feedbackType === 'thumbs_down'
                                        ? 'bg-rose-950 text-rose-400 border border-rose-600/80 font-bold shadow-sm shadow-rose-900/50'
                                        : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/80'
                                    }`}
                                    title="Rate response as unhelpful (Thumbs Down)"
                                  >
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Speech Player */}
                                <button
                                  onClick={() => speakMessage(m.id, m.content)}
                                  className={`p-1.5 rounded-lg border transition-colors ${
                                    speakingMsgId === m.id
                                      ? 'bg-cyan-950 border-cyan-500 text-cyan-400 animate-pulse'
                                      : 'bg-slate-950 border-slate-800 hover:text-white'
                                  }`}
                                  title="Text-To-Speech Playback"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Toggle Trace Details */}
                                <button
                                  onClick={() => toggleTraceExpansion(m.id)}
                                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                                >
                                  <span>Multi-Agent Trace</span>
                                  {isTraceExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            {/* FEEDBACK ACKNOWLEDGMENT STATUS TAG */}
                            {m.feedbackType && (
                              <div className="pt-2 border-t border-slate-800/60 flex items-center space-x-1.5 text-[11px]">
                                {m.feedbackType === 'thumbs_up' ? (
                                  <span className="text-emerald-400 flex items-center space-x-1 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>Model Feedback Logged: Helpful Response (+5 CSAT)</span>
                                  </span>
                                ) : (
                                  <span className="text-rose-400 flex items-center space-x-1 font-medium bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
                                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                                    <span>Model Feedback Logged: Low Relevance Flagged</span>
                                  </span>
                                )}
                              </div>
                            )}

                            {/* EXPANDED AGENT EXECUTION TRACE & RAG CITATIONS */}
                            {isTraceExpanded && (
                              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3">
                                {/* Invoked Agents Pills */}
                                <div>
                                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                                    Invoked Agents ({metadata.invokedAgents.length}):
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {metadata.invokedAgents.map(ag => (
                                      <span
                                        key={ag}
                                        className="px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-mono text-[11px]"
                                      >
                                        {ag.toUpperCase()} AGENT
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Retrieved RAG Chunks */}
                                <div>
                                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center space-x-1">
                                    <Database className="w-3 h-3 text-emerald-400" />
                                    <span>Retrieved RAG Context ({metadata.retrievedChunks.length} Chunks):</span>
                                  </div>
                                  <div className="space-y-1.5">
                                    {metadata.retrievedChunks.map((rc, idx) => (
                                      <div
                                        key={idx}
                                        className="p-2 bg-slate-950 border border-slate-800/80 rounded-lg text-[11px] space-y-1"
                                      >
                                        <div className="flex items-center justify-between text-slate-300 font-medium">
                                          <span>{rc.chunk.docTitle}</span>
                                          <span className="text-emerald-400 font-mono">
                                            {Math.round(rc.similarityScore * 100)}% Match
                                          </span>
                                        </div>
                                        <p className="text-slate-400 text-[10px] line-clamp-2">{rc.chunk.content}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Google Search Grounding Verification Sources */}
                                {metadata.groundingSources && metadata.groundingSources.length > 0 && (
                                  <div>
                                    <div className="text-[11px] font-semibold text-cyan-400 mb-1.5 uppercase tracking-wider flex items-center space-x-1">
                                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                                      <span>Google Search Grounding Verification ({metadata.groundingSources.length} Web Sources):</span>
                                    </div>
                                    <div className="space-y-1.5">
                                      {metadata.groundingSources.map((gs, idx) => (
                                        <a
                                          key={idx}
                                          href={gs.uri}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/50 rounded-lg text-[11px] flex items-center justify-between text-cyan-300 hover:text-cyan-200 transition-colors group"
                                        >
                                          <span className="truncate max-w-md font-medium">{gs.title}</span>
                                          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2" />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* MULTI-AGENT REAL-TIME THINKING ANIMATION */}
          {isLoading && (
            <div className="flex items-start space-x-3 my-2 animate-in fade-in duration-200">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg">
                <Bot className="w-5 h-5 animate-spin" />
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl max-w-xl w-full space-y-3 shadow-2xl">
                {/* ACTIVE SPECIALIZED AGENT REAL-TIME HIGHLIGHT BADGE */}
                {activeProcessingAgent && (
                  <div className={`p-3 rounded-xl border flex items-start space-x-3 transition-all duration-300 ${activeProcessingAgent.badgeBg} ${activeProcessingAgent.badgeBorder} ${activeProcessingAgent.textColor} ${activeProcessingAgent.glowColor} shadow-lg`}>
                    <div className="p-2 rounded-lg bg-black/40 border border-white/10 shrink-0 text-current">
                      {renderAgentIcon(activeProcessingAgent.icon, 'w-5 h-5 animate-pulse')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between space-x-2">
                        <span className="text-xs font-bold uppercase tracking-wider font-mono">
                          ⚡ ACTIVE AGENT: {activeProcessingAgent.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-slate-200 border border-white/10 flex items-center space-x-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>Processing Turn</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1 font-sans leading-relaxed">
                        {activeProcessingAgent.description}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 pt-1 border-t border-slate-800/80">
                  <Sparkles className="w-4 h-4 animate-bounce" />
                  <span>Orchestrating Real-Time Agent Pipeline...</span>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  <div className={`flex items-center space-x-2 transition-opacity ${activeWorkflowStep && activeWorkflowStep >= 1 ? 'opacity-100 text-slate-200 font-medium' : 'opacity-40 text-slate-500'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${activeWorkflowStep && activeWorkflowStep >= 1 ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span>Step 1: Intent Router (Parsing query target)</span>
                  </div>

                  <div className={`flex items-center space-x-2 transition-opacity ${activeWorkflowStep && activeWorkflowStep >= 2 ? 'opacity-100 text-slate-200 font-medium' : 'opacity-40 text-slate-500'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${activeWorkflowStep && activeWorkflowStep >= 2 ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span>
                      Step 2: Specialized Agent Assigned: <strong className="text-amber-300 font-mono underline underline-offset-2">{activeProcessingAgent ? activeProcessingAgent.domainLabel : 'Specialized Agent'}</strong>
                    </span>
                  </div>

                  <div className={`flex items-center space-x-2 transition-opacity ${activeWorkflowStep && activeWorkflowStep >= 3 ? 'opacity-100 text-slate-200 font-medium' : 'opacity-40 text-slate-500'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${activeWorkflowStep && activeWorkflowStep >= 3 ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span>Step 3: Cosine RAG Vector Retrieval (Domain Knowledge)</span>
                  </div>

                  <div className={`flex items-center space-x-2 transition-opacity ${activeWorkflowStep && activeWorkflowStep >= 4 ? 'opacity-100 text-slate-200 font-medium' : 'opacity-40 text-slate-500'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${activeWorkflowStep && activeWorkflowStep >= 4 ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span>Step 4: Gemini LLM Response Synthesis & Citation Assembly</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT FORM CONTAINER */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2 max-w-4xl mx-auto"
          >
            {/* Speech Microphone button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl border transition-colors ${
                isListening
                  ? 'bg-rose-950 border-rose-500 text-rose-400 animate-pulse'
                  : 'bg-slate-950 border-slate-800 hover:text-white text-slate-400'
              }`}
              title="Voice Speech-To-Text Input"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Ask TechMart Support... (e.g., 'How do I return my laptop or fix Error E-305?')"
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                disabled={isLoading}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none pr-12 shadow-inner placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-3 rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/30 shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>

      {/* TRANSFER TO HUMAN CONFIRMATION MODAL */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200 text-slate-100">
            <button
              onClick={() => setIsTransferModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800 flex items-center justify-center shrink-0">
                <Headset className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Transfer to Human Specialist</h3>
                <p className="text-xs text-slate-400">Flag conversation & notify Tier-2 support team</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              Are you sure you want to request human intervention? This conversation will be flagged for priority review and an automated support ticket will be created in the support queue.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Reason or additional notes (optional):</label>
              <textarea
                value={transferReason}
                onChange={e => setTransferReason(e.target.value)}
                placeholder="e.g. Need urgent supervisor approval for hardware replacement or complex account billing error..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/80 rounded-xl p-3 text-xs text-white focus:outline-none placeholder:text-slate-500 resize-none"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-semibold transition-colors border border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTransferToHuman}
                disabled={isTransferring}
                className="flex-1 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-950/40 border border-rose-500/40 flex items-center justify-center space-x-2"
              >
                {isTransferring ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching Ticket...</span>
                  </>
                ) : (
                  <>
                    <Headset className="w-3.5 h-3.5" />
                    <span>Confirm Transfer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
