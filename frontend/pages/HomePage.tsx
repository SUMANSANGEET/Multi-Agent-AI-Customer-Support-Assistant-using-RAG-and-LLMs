import React, { useState } from 'react';
import { ChatWindow } from '../../src/components/ChatWindow';
import { AgentInspector } from '../../src/components/AgentInspector';
import { RAGInspector } from '../../src/components/RAGInspector';
import { AnalyticsDashboard } from '../../src/components/AnalyticsDashboard';
import { TicketsView } from '../../src/components/TicketsView';
import { UserProfile } from '../../src/types';

interface HomePageProps {
  activeTab: 'chat' | 'inspector' | 'rag' | 'analytics' | 'tickets';
  currentUser: UserProfile;
}

export const HomePage: React.FC<HomePageProps> = ({ activeTab, currentUser }) => {
  return (
    <main className="flex-1 flex flex-col">
      {activeTab === 'chat' && <ChatWindow currentUser={currentUser} />}
      {activeTab === 'inspector' && <AgentInspector />}
      {activeTab === 'rag' && <RAGInspector />}
      {activeTab === 'analytics' && <AnalyticsDashboard />}
      {activeTab === 'tickets' && <TicketsView />}
    </main>
  );
};
