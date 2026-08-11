import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { orchestrator } from "./server/agents";
import { ragEngine } from "./server/ragEngine";
import { ChatMessage, ChatSession, SupportTicket, UserProfile, SystemAnalytics, AgentType, AgentRoutingHeatmapData } from "./src/types";

// In-memory data persistence
const usersStore: Map<string, UserProfile> = new Map([
  [
    "user-demo-1",
    {
      id: "user-demo-1",
      name: "Alex Morgan",
      email: "alex.morgan@techmart.example",
      role: "customer",
      plan: "Pro",
      accountStatus: "Active",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
    }
  ]
]);

const sessionsStore: ChatSession[] = [
  {
    id: "session-1",
    userId: "user-demo-1",
    title: "Premium Lock & Subscription Refund Query",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    messageCount: 2,
    primaryCategory: "Billing & Technical",
    status: "active"
  }
];

const messagesStore: Map<string, ChatMessage[]> = new Map([
  [
    "session-1",
    [
      {
        id: "msg-1",
        sessionId: "session-1",
        sender: "user",
        content: "I paid $14.99 for TechMart Premium subscription yesterday, but my SoundBuds app still says locked (Error E-305). Can I get a refund or fix this?",
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  ]
]);

const ticketsStore: SupportTicket[] = [
  {
    id: "TICK-849201",
    userId: "user-demo-1",
    userName: "Alex Morgan",
    userEmail: "alex.morgan@techmart.example",
    subject: "Escalated Damaged Shipment & Urgent Supervisor Resolution",
    category: "Complaint & Delivery",
    priority: "high",
    status: "Escalated",
    summary: "Customer received ApexBook Pro box with water damage. Automated agent issued prepaid RMA and transferred to Tier-2 supervisor SLA.",
    conversationSnippet: "Damaged delivery, demands supervisor callback.",
    assignedAgent: "Sarah Jenkins (Tier-2 Supervisor)",
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

const agentUsageCount = {
  intent: 18,
  billing: 8,
  technical: 7,
  product: 4,
  complaint: 3,
  faq: 6
};

const agentLatenciesHistory: Record<AgentType, number[]> = {
  intent: [120, 115, 140, 110, 130, 125, 118, 122],
  billing: [310, 280, 325, 295, 340, 315, 300, 310],
  technical: [420, 450, 410, 480, 435, 460, 440, 425],
  product: [250, 270, 240, 280, 260, 255, 265, 248],
  complaint: [380, 395, 410, 375, 420, 385, 400, 390],
  faq: [180, 195, 175, 210, 185, 190, 200, 182]
};

const sentimentBreakdown = {
  positive: 8,
  neutral: 12,
  frustrated: 4,
  angry: 2
};

const recentLogsList: {
  id: string;
  query: string;
  primaryIntent: string;
  latencyMs: number;
  timestamp: string;
  escalated: boolean;
}[] = [];

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // Initialize RAG background embeddings if key present
  ragEngine.generateGeminiEmbeddings().catch(err => console.warn(err));

  // --- API ROUTES ---

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      environment: process.env.NODE_ENV || "development",
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString()
    });
  });

  // Auth: Login
  app.post("/api/auth/login", (req, res) => {
    const { email } = req.body;
    let user = Array.from(usersStore.values()).find(u => u.email === email);
    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        name: email.split("@")[0] || "Valued Customer",
        email: email || "customer@techmart.example",
        role: "customer",
        plan: "Pro",
        accountStatus: "Active"
      };
      usersStore.set(user.id, user);
    }
    res.json({ success: true, user });
  });

  // Auth: Register
  app.post("/api/auth/register", (req, res) => {
    const { name, email } = req.body;
    const user: UserProfile = {
      id: `user-${Date.now()}`,
      name: name || "New Customer",
      email: email || "user@techmart.example",
      role: "customer",
      plan: "Free",
      accountStatus: "Active"
    };
    usersStore.set(user.id, user);
    res.json({ success: true, user });
  });

  // Chat: Sessions
  app.get("/api/chat/sessions", (req, res) => {
    const userId = (req.query.userId as string) || "user-demo-1";
    const sessions = sessionsStore.filter(s => s.userId === userId || userId === "all");
    res.json({ sessions });
  });

  app.post("/api/chat/sessions", (req, res) => {
    const { userId, title } = req.body;
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      userId: userId || "user-demo-1",
      title: title || "New Conversation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      status: "active"
    };
    sessionsStore.unshift(newSession);
    messagesStore.set(newSession.id, []);
    res.json({ session: newSession });
  });

  app.delete("/api/chat/sessions/:id", (req, res) => {
    const { id } = req.params;
    const index = sessionsStore.findIndex(s => s.id === id);
    if (index !== -1) {
      sessionsStore.splice(index, 1);
      messagesStore.delete(id);
    }
    res.json({ success: true });
  });

  // Chat: Get Messages
  app.get("/api/chat/messages/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    const list = messagesStore.get(sessionId) || [];
    res.json({ messages: list });
  });

  // Chat: Feedback on Response (Thumbs Up / Thumbs Down)
  app.post("/api/chat/feedback", (req, res) => {
    const { sessionId, messageId, feedbackType } = req.body;
    if (sessionId && messageId) {
      const list = messagesStore.get(sessionId);
      if (list) {
        const msg = list.find(m => m.id === messageId);
        if (msg) {
          msg.feedbackType = feedbackType;
          msg.rating = feedbackType === 'thumbs_up' ? 5 : feedbackType === 'thumbs_down' ? 1 : undefined;
        }
      }
    }
    res.json({ success: true, messageId, feedbackType });
  });

  // Chat: Manual Transfer to Human Agent
  app.post("/api/chat/transfer-to-human", (req, res) => {
    const { sessionId, userId, reason, notes } = req.body;
    const currentSessionId = sessionId || "session-1";
    const session = sessionsStore.find(s => s.id === currentSessionId);

    if (session) {
      session.status = "escalated";
      session.updatedAt = new Date().toISOString();
    }

    const ticketId = `TICK-${Math.floor(100000 + Math.random() * 900000)}`;
    const msgs = messagesStore.get(currentSessionId) || [];
    const lastUserMsg = msgs.slice().reverse().find(m => m.sender === 'user')?.content || "Human transfer requested by customer.";

    const ticket: SupportTicket = {
      id: ticketId,
      userId: userId || "user-demo-1",
      userName: "Alex Morgan",
      userEmail: "alex.morgan@techmart.example",
      subject: `[Human Transfer] ${session ? session.title : "Live Chat Transfer"}`,
      category: "Human Escalation",
      priority: "high",
      status: "Escalated",
      summary: notes || reason ? `Human transfer requested: ${reason || notes}` : `Customer requested human assistance in Chat Session ${currentSessionId}. Query: ${lastUserMsg.slice(0, 100)}...`,
      conversationSnippet: lastUserMsg,
      assignedAgent: "Sarah Jenkins (Tier-2 Human Specialist)",
      createdAt: new Date().toISOString()
    };

    ticketsStore.unshift(ticket);

    const systemMsg: ChatMessage = {
      id: `msg-sys-${Date.now()}`,
      sessionId: currentSessionId,
      sender: "system",
      content: `🎧 **Transferred to Human Specialist**\n\nSupport Ticket **#${ticketId}** has been dispatched to Tier-2 Customer Support. A human agent will review your conversation history and join shortly.${reason ? `\n\n*Reason:* ${reason}` : ''}`,
      timestamp: new Date().toISOString()
    };

    msgs.push(systemMsg);
    messagesStore.set(currentSessionId, msgs);

    recentLogsList.unshift({
      id: systemMsg.id,
      query: `[HUMAN TRANSFER] ${reason || "Manual Customer Transfer"}`,
      primaryIntent: "complaint",
      latencyMs: 35,
      timestamp: new Date().toISOString(),
      escalated: true
    });

    res.json({
      success: true,
      ticket,
      systemMessage: systemMsg,
      session
    });
  });

  // Chat: Send Message & Process Multi-Agent RAG
  app.post("/api/chat/message", async (req, res) => {
    try {
      const { sessionId, userId, content, history } = req.body;
      if (!content || !content.trim()) {
        res.status(400).json({ error: "Message content is required." });
        return;
      }

      const currentSessionId = sessionId || "session-1";
      const userMsg: ChatMessage = {
        id: `msg-user-${Date.now()}`,
        sessionId: currentSessionId,
        sender: "user",
        content: content.trim(),
        timestamp: new Date().toISOString()
      };

      // Store user message
      const list = messagesStore.get(currentSessionId) || [];
      list.push(userMsg);
      messagesStore.set(currentSessionId, list);

      // Process query through Orchestrator
      const processed = await orchestrator.processUserQuery(content, history || []);

      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sessionId: currentSessionId,
        sender: "assistant",
        content: processed.replyText,
        timestamp: new Date().toISOString(),
        responseMetadata: processed
      };

      list.push(botMsg);
      messagesStore.set(currentSessionId, list);

      // Update Session
      const sess = sessionsStore.find(s => s.id === currentSessionId);
      if (sess) {
        sess.updatedAt = new Date().toISOString();
        sess.messageCount = list.length;
        sess.primaryCategory = processed.intent.primaryIntent.toUpperCase();
        if (processed.escalatedToHuman) {
          sess.status = "escalated";
        }
      }

      // Update Analytics Counters
      agentUsageCount.intent++;
      if (agentLatenciesHistory.intent) {
        agentLatenciesHistory.intent.push(Math.round(processed.latencyMs * 0.25));
        if (agentLatenciesHistory.intent.length > 12) agentLatenciesHistory.intent.shift();
      }
      for (const agent of processed.invokedAgents) {
        agentUsageCount[agent] = (agentUsageCount[agent] || 0) + 1;
      }
      for (const tr of processed.executionTraces) {
        if (agentLatenciesHistory[tr.agent]) {
          agentLatenciesHistory[tr.agent].push(tr.latencyMs);
          if (agentLatenciesHistory[tr.agent].length > 12) agentLatenciesHistory[tr.agent].shift();
        }
      }
      const sent = processed.intent.sentiment;
      if (sent in sentimentBreakdown) {
        sentimentBreakdown[sent as keyof typeof sentimentBreakdown]++;
      }

      recentLogsList.unshift({
        id: processed.id,
        query: content,
        primaryIntent: processed.intent.primaryIntent,
        latencyMs: processed.latencyMs,
        timestamp: processed.timestamp,
        escalated: processed.escalatedToHuman
      });
      if (recentLogsList.length > 20) recentLogsList.pop();

      // Create ticket if escalated
      if (processed.escalatedToHuman && processed.ticketId) {
        ticketsStore.unshift({
          id: processed.ticketId,
          userId: userId || "user-demo-1",
          userName: "Alex Morgan",
          userEmail: "alex.morgan@techmart.example",
          subject: `Auto Escalation: ${content.slice(0, 45)}...`,
          category: processed.intent.primaryIntent.toUpperCase(),
          priority: processed.intent.sentiment === "angry" ? "urgent" : "high",
          status: "Escalated",
          summary: `Auto-escalated query (Urgency: ${processed.intent.urgency}). Sentiment: ${processed.intent.sentiment}.`,
          conversationSnippet: content,
          createdAt: new Date().toISOString()
        });
      }

      res.json({
        userMessage: userMsg,
        assistantMessage: botMsg,
        responseMetadata: processed
      });
    } catch (error: any) {
      console.error("[API Chat Error]:", error);
      res.status(500).json({ error: error?.message || "Internal server error during query processing." });
    }
  });

  // RAG: Documents
  app.get("/api/rag/documents", (_req, res) => {
    res.json({ documents: ragEngine.getDocuments() });
  });

  app.post("/api/rag/documents", (req, res) => {
    const { title, category, content, filename } = req.body;
    const newDoc = {
      id: `kb-doc-${Date.now()}`,
      title: title || "Custom Document",
      category: category || "General",
      filename: filename || "CustomDoc.pdf",
      content: content || "",
      chunkCount: 1,
      lastUpdated: new Date().toISOString().split("T")[0]
    };
    ragEngine.addDocument(newDoc);
    res.json({ success: true, document: newDoc });
  });

  // RAG: Search Vector Store Directly (for testing/debug inspector)
  app.post("/api/rag/search", async (req, res) => {
    const { query, topK, categoryFilter } = req.body;
    const results = await ragEngine.searchVectorStore(query || "", topK || 4, categoryFilter);
    res.json({ results });
  });

  // RAG: Chunks
  app.get("/api/rag/chunks", (_req, res) => {
    res.json({ chunks: ragEngine.getAllChunks() });
  });

  // RAG: Add Chunk Manually
  app.post("/api/rag/add-chunk", (req, res) => {
    const { docTitle, category, content } = req.body;
    const chunk = ragEngine.addChunkManually({
      docId: `doc-${Date.now()}`,
      docTitle: docTitle || "Manual Knowledge Chunk",
      category: category || "General",
      content: content || ""
    });
    res.json({ success: true, chunk });
  });

  function generate30DayHeatmapData(): AgentRoutingHeatmapData {
  const agents: AgentType[] = ['intent', 'billing', 'technical', 'product', 'complaint', 'faq'];
  const days: { date: string; label: string; dayOfWeek: string; isWeekend: boolean }[] = [];
  const timeSlots = [
    { id: 'slot-1', label: '00:00 - 04:00 (Night)', isPeakHours: false },
    { id: 'slot-2', label: '04:00 - 08:00 (Early Morning)', isPeakHours: false },
    { id: 'slot-3', label: '08:00 - 12:00 (Morning Peak)', isPeakHours: true },
    { id: 'slot-4', label: '12:00 - 16:00 (Afternoon Peak)', isPeakHours: true },
    { id: 'slot-5', label: '16:00 - 20:00 (Evening)', isPeakHours: false },
    { id: 'slot-6', label: '20:00 - 24:00 (Late Evening)', isPeakHours: false },
  ];

  const now = new Date('2026-08-11T08:36:30-07:00');
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dailyAgentVolume: Record<string, Record<AgentType, number>> = {};
  const timeSlotAgentVolume: Record<string, Record<AgentType, number>> = {};

  timeSlots.forEach(ts => {
    timeSlotAgentVolume[ts.id] = { intent: 0, billing: 0, technical: 0, product: 0, complaint: 0, faq: 0 };
  });

  let total30DayVolume = 0;
  let maxVolumeCell = { date: '', dayOfWeek: '', agent: 'technical' as AgentType, volume: 0 };

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = dayNames[d.getDay()];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const month = monthNames[d.getMonth()];
    const dateNum = d.getDate();
    const label = `${month} ${dateNum}`;

    days.push({ date: dateStr, label, dayOfWeek, isWeekend });

    dailyAgentVolume[dateStr] = {
      intent: 0,
      billing: 0,
      technical: 0,
      product: 0,
      complaint: 0,
      faq: 0
    };

    const baseMult = isWeekend ? 0.35 : (dayOfWeek === 'Mon' || dayOfWeek === 'Tue' ? 1.4 : 1.0);
    
    agents.forEach(agent => {
      const baseVol = agent === 'intent' ? 38 : agent === 'technical' ? 30 : agent === 'billing' ? 24 : agent === 'product' ? 18 : agent === 'faq' ? 14 : 10;
      const seed = (dateStr.charCodeAt(8) * 17 + dateStr.charCodeAt(9) * 31 + agent.charCodeAt(0) * 7) % 12;
      const vol = Math.round(baseVol * baseMult + seed);

      dailyAgentVolume[dateStr][agent] = vol;
      total30DayVolume += vol;

      if (vol > maxVolumeCell.volume) {
        maxVolumeCell = { date: dateStr, dayOfWeek, agent, volume: vol };
      }

      const slotWeights = [0.04, 0.08, 0.38, 0.32, 0.13, 0.05];
      timeSlots.forEach((ts, idx) => {
        const slotVol = Math.round(vol * slotWeights[idx]);
        timeSlotAgentVolume[ts.id][agent] += slotVol;
      });
    });
  }

  return {
    days,
    timeSlots,
    agents,
    dailyAgentVolume,
    timeSlotAgentVolume,
    peakTimesSummary: {
      peakHourRange: "09:00 AM - 02:00 PM EST (Morning Peak)",
      peakDayOfWeek: "Monday & Tuesday",
      peakAgent: maxVolumeCell.agent,
      peakDate: maxVolumeCell.date,
      peakVolume: maxVolumeCell.volume,
      total30DayVolume,
      avgDailyVolume: Math.round(total30DayVolume / 30)
    }
  };
}

// Analytics
  app.get("/api/analytics", (_req, res) => {
    const totalConversations = Array.from(messagesStore.values()).reduce((acc, m) => acc + m.length, 0);
    const docs = ragEngine.getDocuments();
    const chunks = ragEngine.getAllChunks();

    const analytics: SystemAnalytics = {
      totalConversations,
      activeSessionsToday: sessionsStore.length,
      avgResponseTimeMs: 840,
      csatScore: 4.85,
      resolutionRatePercent: 94.2,
      agentUsageCount,
      agentLatencies: agentLatenciesHistory,
      heatmapData: generate30DayHeatmapData(),
      sentimentBreakdown,
      ragStats: {
        totalDocs: docs.length,
        totalChunks: chunks.length,
        avgSimilarity: 0.88,
        topRetrievedDocs: [
          { docTitle: "Refund & Return Policy", count: 24 },
          { docTitle: "Device Troubleshooting & User Manual", count: 19 },
          { docTitle: "FAQ & General Company Information", count: 15 },
          { docTitle: "Product Catalog & Pricing", count: 11 }
        ]
      },
      recentLogs: recentLogsList
    };

    res.json({ analytics });
  });

  // Tickets
  app.get("/api/tickets", (_req, res) => {
    res.json({ tickets: ticketsStore });
  });

  app.post("/api/tickets", (req, res) => {
    const { subject, category, priority, summary } = req.body;
    const ticket: SupportTicket = {
      id: `TICK-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: "user-demo-1",
      userName: "Alex Morgan",
      userEmail: "alex.morgan@techmart.example",
      subject: subject || "Customer Support Escalation",
      category: category || "General",
      priority: priority || "medium",
      status: "Open",
      summary: summary || "Manual escalation request.",
      conversationSnippet: summary || "",
      createdAt: new Date().toISOString()
    };
    ticketsStore.unshift(ticket);
    res.json({ success: true, ticket });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TechMart Multi-Agent Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
