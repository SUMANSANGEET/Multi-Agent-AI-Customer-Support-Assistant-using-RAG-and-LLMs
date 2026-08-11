import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ChatWindow } from './components/ChatWindow';
import { AgentInspector } from './components/AgentInspector';
import { RAGInspector } from './components/RAGInspector';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { TicketsView } from './components/TicketsView';
import { GoogleDriveView } from './components/GoogleDriveView';
import { StreamlitAnalyticsView } from './components/StreamlitAnalyticsView';
import { AuthModal } from './components/AuthModal';
import { StatusBar, SystemStatusState } from './components/StatusBar';
import { ThemeMode } from './components/ThemeSwitcher';
import { UserProfile } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'inspector' | 'rag' | 'analytics' | 'tickets' | 'drive' | 'streamlit'>('chat');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(true);

  // Theme Profile State ('midnight' | 'light' | 'high-contrast' | 'cobalt')
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('techmart_theme') as ThemeMode) || 'midnight';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('techmart_theme', currentTheme);
  }, [currentTheme]);

  // System Status Bar State
  const [systemStatus, setSystemStatus] = useState<SystemStatusState>({
    apiConnected: true,
    pingMs: null,
    lastLlmLatencyMs: 380,
    activeAgent: 'Multi-Agent Router (Idle)',
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'user-demo-1',
    name: 'Alex Morgan',
    email: 'alex.morgan@techmart.example',
    role: 'customer',
    plan: 'Pro',
    accountStatus: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  });

  const checkHealth = async () => {
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        const data = await res.json();
        if (typeof data.hasGeminiKey === 'boolean') {
          setHasGeminiKey(data.hasGeminiKey);
        }
        setSystemStatus(prev => ({
          ...prev,
          apiConnected: true,
          pingMs: latency,
          mongoStatus: data.mongoStatus
        }));
      } else {
        setSystemStatus(prev => ({ ...prev, apiConnected: false }));
      }
    } catch {
      setSystemStatus(prev => ({ ...prev, apiConnected: false }));
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = (update: { lastLlmLatencyMs?: number; activeAgent?: string }) => {
    setSystemStatus(prev => ({
      ...prev,
      ...(update.lastLlmLatencyMs !== undefined && { lastLlmLatencyMs: update.lastLlmLatencyMs }),
      ...(update.activeAgent !== undefined && { activeAgent: update.activeAgent })
    }));
  };

  return (
    <div data-theme={currentTheme} className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        hasGeminiKey={hasGeminiKey}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
      />

      {/* Primary Tab Content */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'chat' && (
          <ChatWindow currentUser={currentUser} onStatusUpdate={handleStatusUpdate} />
        )}
        {activeTab === 'inspector' && (
          <AgentInspector onStatusUpdate={handleStatusUpdate} />
        )}
        {activeTab === 'rag' && <RAGInspector />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'tickets' && <TicketsView />}
        {activeTab === 'drive' && <GoogleDriveView />}
        {activeTab === 'streamlit' && <StreamlitAnalyticsView />}
      </div>

      {/* Bottom Subtle Status Bar */}
      <StatusBar status={systemStatus} onRefreshHealth={checkHealth} />

      {/* Auth & User Switcher Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />
    </div>
  );
}
