import React from 'react';
import {
  Bot,
  BrainCircuit,
  Database,
  BarChart3,
  Ticket,
  UserCheck,
  Folder,
  Menu,
  X,
  Smartphone,
  Tablet,
  Monitor,
  ChevronRight,
  Info
} from 'lucide-react';
import { UserProfile } from '../types';
import { ThemeSwitcher, ThemeMode } from './ThemeSwitcher';
import { useDashboardLayout } from '../hooks';

export type NavTabId = 'chat' | 'inspector' | 'rag' | 'analytics' | 'tickets' | 'drive' | 'streamlit';

export interface NavItemConfig {
  id: NavTabId;
  label: string;
  mobileLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  tooltip: string;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'chat',
    label: 'Live Support Chat',
    mobileLabel: 'Chat',
    icon: Bot,
    tooltip: 'Interactive multi-agent customer support chat with automatic intent routing and context-aware responses.',
  },
  {
    id: 'inspector',
    label: 'Agent Inspector',
    mobileLabel: 'Inspector',
    icon: BrainCircuit,
    iconColor: 'text-cyan-400',
    tooltip: 'Visualize agent sub-graphs, routing heatmaps, system prompt logic, and step-by-step decision execution traces.',
  },
  {
    id: 'rag',
    label: 'RAG Knowledge Base',
    mobileLabel: 'Knowledge Base',
    icon: Database,
    iconColor: 'text-emerald-400',
    tooltip: 'Explore vector embeddings, chunked PDF policies, semantic similarity scores, and document indexing.',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    mobileLabel: 'Analytics',
    icon: BarChart3,
    iconColor: 'text-amber-400',
    tooltip: 'Track customer sentiment, intent breakdown, latency benchmarks, and individual agent workload distribution.',
  },
  {
    id: 'tickets',
    label: 'Tickets',
    mobileLabel: 'Tickets',
    icon: Ticket,
    iconColor: 'text-rose-400',
    tooltip: 'Review support ticket queues, human agent escalation states, and automated resolution tracking.',
  },
  {
    id: 'drive',
    label: 'Google Drive',
    mobileLabel: 'Drive',
    icon: Folder,
    iconColor: 'text-emerald-400',
    tooltip: 'Sync and manage external policy manuals, PDFs, and knowledge base assets stored in Google Drive.',
  },
  {
    id: 'streamlit',
    label: 'Streamlit',
    mobileLabel: 'Streamlit',
    icon: BarChart3,
    iconColor: 'text-orange-400',
    tooltip: 'Launch Python-powered analytical dashboards and detailed multi-agent query performance reports.',
  },
];

interface NavbarProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  currentUser: UserProfile;
  onOpenAuth: () => void;
  hasGeminiKey: boolean;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  hasGeminiKey,
  currentTheme,
  onThemeChange
}) => {
  const {
    device,
    isMobile,
    isTablet,
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    handleTabChange
  } = useDashboardLayout();

  const onSelectTab = (tab: NavTabId) => {
    handleTabChange(() => setActiveTab(tab));
  };

  const DeviceIcon = isMobile ? Smartphone : isTablet ? Tablet : Monitor;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Capstone Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg md:hidden transition-colors"
              title="Toggle Navigation Menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  TechMart AI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded-full uppercase tracking-wider">
                  Multi-Agent RAG
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Enterprise Customer Support Engine • Capstone Architecture
              </p>
            </div>
          </div>

          {/* Navigation Tabs with Hover Tooltips */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <div key={item.id} className="relative group/nav flex items-center">
                  <button
                    onClick={() => onSelectTab(item.id)}
                    title={`${item.label}: ${item.tooltip}`}
                    aria-label={`${item.label} - ${item.tooltip}`}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${item.iconColor || ''}`} />
                    <span>{item.label}</span>
                  </button>

                  {/* Enhanced Floating Tooltip Card */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-60 p-3 bg-slate-900/95 backdrop-blur-md text-slate-200 text-xs rounded-xl border border-slate-700/80 shadow-2xl opacity-0 scale-95 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:scale-100 transition-all duration-200 z-50">
                    <div className="font-semibold text-white mb-1 flex items-center space-x-1.5 border-b border-slate-800 pb-1.5">
                      <Icon className={`w-3.5 h-3.5 ${item.iconColor || 'text-indigo-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">{item.tooltip}</p>
                    {/* Tooltip Triangle Arrow */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-t border-l border-slate-700/80 rotate-45" />
                  </div>
                </div>
              );
            })}
          </nav>

          {/* User Auth, Theme Switcher & System Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono" title={`Layout engine optimized for ${device}`}>
              <DeviceIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="capitalize text-slate-300 font-semibold">{device}</span>
            </div>

            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${hasGeminiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-slate-300 font-medium">
                {hasGeminiKey ? 'Gemini 3.6 Active' : 'Fallback Engine'}
              </span>
            </div>

            <ThemeSwitcher currentTheme={currentTheme} onThemeChange={onThemeChange} />

            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
              title={`Logged in as ${currentUser.name} (${currentUser.role}). Click to switch user profile.`}
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="max-w-[100px] truncate">{currentUser.name}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs with Tooltip titles */}
        <div className="md:hidden flex items-center justify-between border-t border-slate-800/80 py-2 overflow-x-auto space-x-2 no-scrollbar text-xs">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={`${item.label}: ${item.tooltip}`}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {item.mobileLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE / TABLET RESPONSIVE SIDEBAR DRAWER OVERLAY */}
      {isSidebarOpen && (isMobile || isTablet) && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={closeSidebar}
          />

          {/* Drawer Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 border-r border-slate-800 p-5 space-y-6 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Navigation Menu</h3>
                  <div className="flex items-center space-x-1.5 text-[10px] text-indigo-400 font-mono">
                    <DeviceIcon className="w-3 h-3" />
                    <span className="capitalize">{device} Viewport</span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeSidebar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Drawer Links with inline descriptions */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    title={`${item.label}: ${item.tooltip}`}
                    className={`w-full flex flex-col text-left p-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.iconColor || 'text-indigo-400'}`} />
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-60" />
                    </div>
                    <p className={`mt-1 text-[11px] leading-tight pl-7 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {item.tooltip}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Mobile Footer Status & Auth */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Active User:</span>
                <span className="font-semibold text-slate-200">{currentUser.name}</span>
              </div>
              <button
                onClick={() => {
                  closeSidebar();
                  onOpenAuth();
                }}
                className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl text-xs font-semibold border border-slate-700"
              >
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>Switch User Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

