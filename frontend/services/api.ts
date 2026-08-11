import { SupportTicket, SystemAnalytics } from '../../src/types';

export const apiService = {
  async sendMessage(content: string, userId: string = 'demo-user') {
    const res = await fetch('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, userId }),
    });
    return await res.json();
  },

  async fetchAnalytics(): Promise<SystemAnalytics> {
    const res = await fetch('/api/analytics');
    const data = await res.json();
    return data.analytics;
  },

  async fetchTickets(): Promise<SupportTicket[]> {
    const res = await fetch('/api/tickets');
    const data = await res.json();
    return data.tickets;
  },

  async searchRAG(query: string, categoryFilter: string = 'ALL') {
    const res = await fetch('/api/rag/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, topK: 5, categoryFilter }),
    });
    return await res.json();
  },

  async sendFeedback(sessionId: string, messageId: string, feedbackType: 'thumbs_up' | 'thumbs_down' | null) {
    const res = await fetch('/api/chat/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, messageId, feedbackType }),
    });
    return await res.json();
  }
};
