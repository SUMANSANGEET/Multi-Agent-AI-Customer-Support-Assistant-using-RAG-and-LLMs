import mongoose from "mongoose";

let isConnected = false;
let connectionError: string | null = null;

export async function connectMongoDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === "" || uri.includes("MY_MONGODB_URI")) {
    connectionError = "MONGODB_URI environment variable is not configured.";
    isConnected = false;
    return false;
  }

  if (isConnected) {
    return true;
  }

  try {
    // Connect with a 5 second timeout to avoid hanging server startup
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    connectionError = null;
    console.log("✅ Successfully connected to MongoDB Atlas");
    return true;
  } catch (error: any) {
    console.warn("⚠️ MongoDB Atlas connection warning:", error.message);
    connectionError = error.message;
    isConnected = false;
    return false;
  }
}

export function getMongoStatus() {
  const uri = process.env.MONGODB_URI;
  const isConfigured = Boolean(uri && uri.trim().length > 10 && !uri.includes("MY_MONGODB_URI"));
  
  return {
    isConfigured,
    isConnected,
    error: connectionError,
    readyState: mongoose.connection.readyState, // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  };
}

// Mongoose Schemas for TechMart Platform

// 1. Support Chat Sessions
const ChatLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userRole: { type: String, default: 'customer' },
  userMessage: { type: String, required: true },
  agentResponse: { type: String, required: true },
  routedAgent: { type: String, required: true },
  confidence: { type: Number, default: 1.0 },
  reasoning: { type: String, default: '' },
  latencyMs: { type: Number, default: 0 },
  sourcesUsed: [{
    title: String,
    snippet: String,
    score: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

// 2. Support Tickets
const TicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  subject: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'In Progress', 'Escalated', 'Resolved'], default: 'Open' },
  assignedAgent: { type: String, default: 'Unassigned' },
  lastMessage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const ChatLogModel = mongoose.models.ChatLog || mongoose.model('ChatLog', ChatLogSchema);
export const TicketModel = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
