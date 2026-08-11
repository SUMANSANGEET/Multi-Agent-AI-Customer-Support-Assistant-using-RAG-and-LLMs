export type AgentType = 'intent' | 'billing' | 'technical' | 'product' | 'complaint' | 'faq';

export type UserRole = 'customer' | 'support_agent' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  accountStatus: 'Active' | 'Pending' | 'Suspended';
}

export interface KBDocument {
  id: string;
  title: string;
  category: 'Billing' | 'Technical' | 'Product' | 'Complaint' | 'FAQ' | 'Policy';
  filename: string;
  content: string;
  chunkCount: number;
  lastUpdated: string;
}

export interface VectorChunk {
  id: string;
  docId: string;
  docTitle: string;
  category: string;
  content: string;
  vector?: number[];
  metadata?: Record<string, any>;
}

export interface RetrievalResult {
  chunk: VectorChunk;
  similarityScore: number;
}

export interface IntentAnalysis {
  primaryIntent: AgentType;
  secondaryIntents: AgentType[];
  confidence: number;
  reasoning: string;
  sentiment: 'positive' | 'neutral' | 'frustrated' | 'angry';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  entities: {
    productName?: string;
    orderId?: string;
    amount?: string;
    date?: string;
    errorCode?: string;
  };
}

export interface AgentExecutionTrace {
  agent: AgentType;
  agentName: string;
  inputPromptSnippet: string;
  outputSummary: string;
  latencyMs: number;
  chunksUsed: string[]; // chunk IDs
  status: 'invoked' | 'skipped' | 'completed' | 'error';
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ProcessedResponse {
  id: string;
  replyText: string;
  intent: IntentAnalysis;
  invokedAgents: AgentType[];
  executionTraces: AgentExecutionTrace[];
  retrievedChunks: RetrievalResult[];
  groundingSources?: GroundingSource[];
  searchQueries?: string[];
  escalatedToHuman: boolean;
  ticketId?: string;
  suggestedActions: string[];
  latencyMs: number;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  responseMetadata?: ProcessedResponse;
  rating?: number; // 1-5 CSAT
  feedback?: string;
  feedbackType?: 'thumbs_up' | 'thumbs_down' | null;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  primaryCategory?: string;
  status: 'active' | 'resolved' | 'escalated';
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'Open' | 'In Progress' | 'Escalated' | 'Resolved';
  summary: string;
  conversationSnippet: string;
  assignedAgent?: string;
  createdAt: string;
}

export interface HeatmapCell {
  date: string;
  dayLabel: string;
  hourSlot: string;
  agent: AgentType;
  volume: number;
  isPeak: boolean;
}

export interface AgentRoutingHeatmapData {
  days: { date: string; label: string; dayOfWeek: string; isWeekend: boolean }[];
  timeSlots: { id: string; label: string; isPeakHours: boolean }[];
  agents: AgentType[];
  dailyAgentVolume: Record<string, Record<AgentType, number>>;
  timeSlotAgentVolume: Record<string, Record<AgentType, number>>;
  peakTimesSummary: {
    peakHourRange: string;
    peakDayOfWeek: string;
    peakAgent: AgentType;
    peakDate: string;
    peakVolume: number;
    total30DayVolume: number;
    avgDailyVolume: number;
  };
}

export interface SystemAnalytics {
  totalConversations: number;
  activeSessionsToday: number;
  avgResponseTimeMs: number;
  csatScore: number;
  resolutionRatePercent: number;
  agentUsageCount: Record<AgentType, number>;
  agentLatencies?: Record<AgentType, number[]>;
  heatmapData?: AgentRoutingHeatmapData;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    frustrated: number;
    angry: number;
  };
  ragStats: {
    totalDocs: number;
    totalChunks: number;
    avgSimilarity: number;
    topRetrievedDocs: { docTitle: string; count: number }[];
  };
  recentLogs: {
    id: string;
    query: string;
    primaryIntent: string;
    latencyMs: number;
    timestamp: string;
    escalated: boolean;
  }[];
}
