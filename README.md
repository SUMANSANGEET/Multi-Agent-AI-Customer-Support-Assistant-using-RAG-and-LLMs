<div align="center">

# 🤖 TechMart Multi-Agent AI Customer Support & RAG Platform


<p align="center">
  <b>An enterprise-grade, multi-agent AI support ecosystem powered by Google Gemini, Vector RAG, Mongoose/MongoDB Atlas, and real-time execution telemetry.</b>
</p>

[![Frontend on Vercel](https://img.shields.io/badge/Vercel-Live_Frontend-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://multi-agent-ai-customer-support-ass-virid.vercel.app/)
[![Backend on Render](https://img.shields.io/badge/Render-Live_API-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://multi-agent-ai-customer-support-bcbe.onrender.com/)
[![Streamlit Analytics](https://img.shields.io/badge/Streamlit-Analytics_App-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)](https://multi-agent-ai-customer-support-assistant-using-rag-and-llms-v.streamlit.app/)
[![Google AI Studio](https://img.shields.io/badge/AI_Studio-Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://ais-pre-xeez3rq3fe7jsmivu3hmj6-834362858355.asia-east1.run.app)

---

[![Gemini 2.4 API](https://img.shields.io/badge/Gemini_API-v2.4-indigo?style=flat-square&logo=google)](https://ai.google.dev/)
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_Connected-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

---

## 📌 Project Summary

The **TechMart Multi-Agent AI Customer Support & RAG Platform** is an enterprise-grade customer intelligence and automation platform. Traditional monolithic support chatbots frequently fail when handling multi-domain requests, hallucinate policies, or fail to escalate urgent disputes gracefully.

This platform solves these limitations by implementing an **Autonomous Intent Classifier & Multi-Agent Orchestrator** backed by **Google Gemini AI** and a **Vector Retrieval-Augmented Generation (RAG)** engine. Incoming customer inquiries are analyzed in real-time across sentiment, urgency, and category dimensions, then dispatched to specialized sub-agents (Billing, Technical, Product Specs, Complaints, FAQ) enriched with authoritative company policy documents.

---

## 🎯 Problem Statement, Goals & Objectives

### 🔴 Problem Statement
Legacy AI chatbots suffer from three critical bottlenecks in enterprise e-commerce:
1. **Context Drift & Hallucinations**: Generic LLM prompts confuse refund windows, warranty clauses, and technical troubleshooting steps.
2. **Lack of Domain Specialization**: A single prompt cannot effectively act as a billing accountant, hardware engineer, and empathetic complaint officer simultaneously.
3. **Black-Box Opacity & Escalation Gaps**: Support managers lack visibility into agent reasoning, leading to missed SLA callbacks for frustrated customers.

### 🎯 Core Goals & Objectives
- **Zero-Hallucination Policy Grounding**: Use Vector RAG chunking to ground all answers in official PDF manuals (refunds, shipping, warranties).
- **Sub-30ms Intent Classification**: Route customer queries dynamically to designated sub-agents within milliseconds.
- **Automated Human Escalation**: Detect negative sentiment (`angry`/`frustrated`) or high urgency to automatically create prioritized human support tickets.
- **Enterprise Observability**: Provide live routing heatmaps, system prompt inspection, and MongoDB Atlas persistence for execution traces.

---

## 🚀 Live Deployments

| Component | Target Environment | Status | URL Link |
| :--- | :--- | :---: | :--- |
| **Frontend UI** | Vercel | 🟢 Active | [Launch App](https://multi-agent-ai-customer-support-ass-virid.vercel.app/) |
| **Backend API** | Render | 🟢 Active | [API Endpoint](https://multi-agent-ai-customer-support-bcbe.onrender.com/) |
| **API Health Check** | Render | 🟢 Active | [Check Status](https://multi-agent-ai-customer-support-bcbe.onrender.com/api/health) |
| **Streamlit Analytics** | Streamlit Community Cloud | 🟢 Active | [Open Dashboard](https://multi-agent-ai-customer-support-assistant-using-rag-and-llms-v.streamlit.app/) |
| **Google AI Studio** | Cloud Run Sandbox | 🟢 Active | [Launch Applet](https://ais-pre-xeez3rq3fe7jsmivu3hmj6-834362858355.asia-east1.run.app) |

---

## 🎨 Architecture Highlights & Visual Summary

The architecture adopts a decoupled, multi-tier orchestration pattern. User inputs pass through a central Intent Classifier before hitting specialized sub-agents and vector knowledge retrievers.

``text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CLIENT LAYER (React 19 + Vite)                         │
│  Live Support Chat   │   Agent Inspector   │   RAG Viewer   │   Analytics & Heatmaps   │
└───────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTP / REST API
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             BACKEND ORCHESTRATOR (Express + Node)                      │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │                         1. INTENT CLASSIFIER ROUTER                            │   │
│   │         Evaluates: Primary Category (1 of 5)  │  Sentiment  │  Urgency         │   │
│   └───────────────────────────────────────┬────────────────────────────────────────┘   │
│                                           │                                            │
│        ┌───────────────────┬──────────────┼───────────────┬───────────────────┐        │
│        ▼                   ▼              ▼               ▼                   ▼        │
│  ┌───────────┐      ┌─────────────┐ ┌───────────┐   ┌───────────┐      ┌────────────┐  │
│  │ Billing   │      │ Technical   │ │ Product   │   │ Complaint │      │  FAQ       │  │
│  │ Sub-Agent │      │ Sub-Agent   │ │ Sub-Agent │   │ Sub-Agent │      │ Sub-Agent  │  │
│  └─────┬─────┘      └──────┬──────┘ └─────┬─────┘   └─────┬─────┘      └─────┬──────┘  │
│        │                   │              │               │                  │         │
│        └───────────────────┴──────────────┼───────────────┴──────────────────┘         │
│                                           │                                            │
│                                           ▼                                            │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │                        2. VECTOR RAG KNOWLEDGE ENGINE                          │   │
│   │    Chunk Indexing ➔ Cosine Similarity Matching ➔ Context Snippet Injection     │   │
│   └───────────────────────────────────────┬────────────────────────────────────────┘   │
│                                           │                                            │
│                                           ▼                                            │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │                        3. GOOGLE GEMINI 2.4 GENERATION                         │   │
│   │               Synthesizes authoritative response with policy citations         │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Async Persistence
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE & TELEMETRY LAYER                                │
│         MongoDB Atlas Cluster (Chat Logs, Intent Traces, Escalated Tickets)            │
└────────────────────────────────────────────────────────────────────────────────────────┘
🛠️ Technology Stack
<details open>
<summary><b>👉 Click to toggle Technology Stack Details</b></summary>
<br>
Layer	Technology / Library	Version	Purpose
Frontend UI	React	v19.0.1	Single-Page Application & state management
Language	TypeScript	v5.8.2	Strict typing across API contracts & agents
Styling	Tailwind CSS	v4.1.14	Responsive dark/light theme styling engine
Icons & Motion	Lucide React / Motion	v0.546 / v12	Modern UI icons & layout animations
Backend Runtime	Express.js / Node.js	v4.21.2 / v20	REST API routes & middleware proxy
AI Model Engine	@google/genai (Gemini)	v2.4.0	Intent classification & RAG synthesis
Database ORM	Mongoose / MongoDB Atlas	v8.18.0	Cloud document persistence & log queries
Build Tools	Vite / esbuild / tsx	v6.2.3	Bundling CJS server & fast dev server
</details>
🤖 Specialized Agent Sub-Graphs
<details>
<summary><b>👉 Click to expand Agent Sub-Graph Matrix & Capabilities</b></summary>
<br>
Agent Name	Primary Responsibilities	System Prompt Focus	Example Query
💳 Billing Agent	Invoices, refunds, duplicate charges, subscription upgrades.	Financial accuracy, SLA terms, payment processors.	"My credit card was charged twice for invoice #9920."
🔧 Technical Agent	Hardware pairing, reset steps, Error E-305/E-102 diagnostics.	Step-by-step troubleshooting, firmware protocols.	"How do I reset my SoundBuds Ultra headphones?"
📦 Product Spec Agent	Technical specs, dimension comparison, feature matrix.	Exact technical accuracy across ApexBook, SmartWatch, SmartHub.	"What is the battery life of ApexBook Pro 15?"
🚨 Complaint Agent	Service disputes, goodwill credits, human escalations.	Empathy, de-escalation, human callback SLA generation.	"This is terrible service, I demand a refund immediately!"
ℹ️ FAQ Agent	Business hours, store locations, warranty coverage limits.	Rapid summary from index documents.	"What are your store hours in San Francisco?"
</details>
📚 Retrieval-Augmented Generation (RAG) Engine
The application features a built-in vector similarity search pipeline that ingests and chunks corporate policy PDFs (Refund Policy, Shipping, Warranties, User Manuals):
Document Ingestion: PDF policy manuals loaded into normalized text chunks.
Dense Vector Generation: High-dimensional embeddings computed using @google/genai.
Cosine Similarity Match: Contextual scoring against customer queries with confidence cutoffs.
Context Injection: Top-
 relevant snippets passed to the active Gemini agent prompt.
code
JSON
{
  "query": "What is the return policy for opened electronics?",
  "topResult": {
    "docTitle": "Refund and Return Policy.pdf",
    "similarityScore": 0.914,
    "snippet": "Opened electronic items may be returned within 14 days of receipt, provided all original accessories and packaging are intact subject to a 10% restocking fee."
  }
}
📊 Telemetry, Analytics & Agent Inspector
<details>
<summary><b>👉 Click to view Agent Inspector & Real-time Metrics</b></summary>
<br>
Agent Routing Heatmap: Real-time visualization of query distribution across sub-agents.
Trace Execution Logs: Step-by-step visibility into prompt assembly, vector context retrieval, and decision confidence scores.
Sentiment Spectrum: Tracks customer emotion states (Satisfied, Neutral, Frustrated, Urgent) to trigger human callback tickets automatically.
MongoDB Atlas History: Durable persistence of chat logs, routing metadata, latencies, and escalation tickets.
</details>
🎓 Learning Outcomes
Developing this multi-agent enterprise platform yielded several key engineering learnings:
Multi-Agent Orchestration: Breaking complex customer requests into dedicated agent nodes yields significantly higher accuracy than monolithic prompts.
Hybrid Storage Resilience: Implementing non-blocking MongoDB Atlas calls with in-memory fallbacks ensures 100% application uptime even during network partitions.
Decoupled Architecture (Vercel + Render): Decoupling Vite static frontend assets from Express API servers improves cold-start speeds and container scaling.
Observability & Prompt Inspection: Exposing live routing heatmaps and decision traces makes AI reasoning transparent for auditing.
⚡ End-to-End Test Benchmark Suite
The codebase includes an automated End-to-End System Test Engine (scripts/e2eTest.ts) that validates all subsystems prior to production deployments:
code
Bash
npx tsx scripts/e2eTest.ts
code
Text
=================================================
🧪 STARTING END-TO-END SYSTEM INTEGRATION TESTS
=================================================

--- TEST GROUP 1: RAG Knowledge Engine ---
✅ [PASS] RAG Chunk Search Returns Results
✅ [PASS] RAG Context Document Title present
✅ [PASS] RAG Similarity Score calculated

--- TEST GROUP 2: Multi-Agent Routing Engine ---
✅ [PASS] Query: "My credit card was charged twice for..." returns non-empty response
✅ [PASS] Intent identified: billing (Latency: 30ms)
✅ [PASS] Query: "How do I pair my TechMart Wireless..." returns non-empty response
✅ [PASS] Intent identified: technical (Latency: 1ms)
✅ [PASS] Query: "What is the return policy for opened..." returns non-empty response
✅ [PASS] Intent identified: complaint (Latency: 2ms)
✅ [PASS] Query: "What are the specs of the Pro Laptop..." returns non-empty response
✅ [PASS] Intent identified: product (Latency: 1ms)
✅ [PASS] Query: "Where can I view my account profile..." returns non-empty response
✅ [PASS] Intent identified: faq (Latency: 1ms)

--- TEST GROUP 3: Human Escalation & Ticket Generation ---
✅ [PASS] Urgent/Angry query triggers human escalation
✅ [PASS] Ticket ID generated upon escalation

--- TEST GROUP 4: Database Health & Fallback ---
✅ [PASS] MongoDB configuration flag checked
✅ [PASS] MongoDB Atlas connection state checked

--- TEST GROUP 5: Live Express API Endpoints ---
✅ [PASS] GET /api/health returns 200 OK
✅ [PASS] GET /api/agents/details returns 200 OK
✅ [PASS] GET /api/knowledge returns 200 OK
✅ [PASS] POST /api/chat returns 200 OK

=================================================
📊 E2E TEST SUMMARY: 21 PASSED, 0 FAILED
=================================================
📡 API Reference Matrix
Method	Endpoint	Description	Sample Request Payload
GET	/api/health	System health, Gemini key status, and MongoDB Atlas status.	N/A
POST	/api/chat	Main multi-agent conversation entrypoint.	{"message": "How do I return a broken speaker?", "userId": "user-123"}
GET	/api/agents/details	System prompts and active agent configurations.	N/A
POST	/api/rag/search	Direct vector search against policy chunks.	{"query": "warranty period"}
GET	/api/db/status	Live connection state of MongoDB Atlas instance.	N/A
GET	/api/db/logs	Fetches historical multi-agent chat logs from Atlas.	N/A
🔮 Future Enhancements (Roadmap)
Here is the interactive product development roadmap:

Multi-Agent Intent Router with sub-30ms classification.

Vector RAG Pipeline over PDF policy manuals (refunds, warranties, shipping).

MongoDB Atlas Integration for chat logs and human ticket queues.

Live Agent Inspector & Routing Heatmaps.

🎙️ Voice-Based Customer Support: Real-time WebRTC audio streaming with Gemini Live API.

🌐 Multilingual Support: Automated multi-language translation for global customer queries.

💬 WhatsApp & Omnichannel Gateway: Twilio/WhatsApp integration for direct mobile support messaging.

🧠 Knowledge Graph Integration: Graph-based relational search connecting customer orders to technical product manuals.
🏁 Conclusion
The TechMart Multi-Agent AI Support Platform demonstrates how multi-agent decomposition, vector retrieval, and robust cloud persistence can solve the core challenges of enterprise customer support. By combining specialized sub-agents with authoritative PDF policy grounding, the platform delivers fast, accurate, and transparent AI interactions while maintaining a human-in-the-loop fallback for sensitive disputes.
👨‍💻 Author
P. Suman Sangeet
PGDM (Big Data Analytics)
Specialization: AI • Data Science • Generative AI • RAG Systems • Multi-Agent Architecture
<div align="center">
<sub>Built with ❤️ using Google Gemini, Vector RAG, React, Express, MongoDB Atlas, and Google AI Studio.</sub>
</div>
```

## 📑 Table of Contents

- [🚀 Live Deployments](#-live-deployments)
- [💡 Architectural Overview](#-architectural-overview)
- [🤖 Specialized Agent Sub-Graphs](#-specialized-agent-sub-graphs)
- [📚 Retrieval-Augmented Generation (RAG) Engine](#-retrieval-augmented-generation-rag-engine)
- [📊 Telemetry, Analytics & Agent Inspector](#-telemetry-analytics--agent-inspector)
- [⚡ End-to-End Test Benchmark Suite](#-end-to-end-test-benchmark-suite)
- [📡 API Reference Matrix](#-api-reference-matrix)
- [🛠️ Quick Start & Environment Setup](#️-quick-start--environment-setup)
- [👨‍💻 Author & Acknowledgments](#-author--acknowledgments)

---

## 🚀 Live Deployments

| Component | Target Environment | Status | URL Link |
| :--- | :--- | :---: | :--- |
| **Frontend UI** | Vercel | 🟢 Active | [Launch App](https://multi-agent-ai-customer-support-ass-virid.vercel.app/) |
| **Backend API** | Render | 🟢 Active | [API Endpoint](https://multi-agent-ai-customer-support-bcbe.onrender.com/) |
| **API Health Check** | Render | 🟢 Active | [Check Status](https://multi-agent-ai-customer-support-bcbe.onrender.com/api/health) |
| **Streamlit Analytics** | Streamlit Community Cloud | 🟢 Active | [Open Dashboard](https://multi-agent-ai-customer-support-assistant-using-rag-and-llms-v.streamlit.app/) |
| **Google AI Studio** | Cloud Run Sandbox | 🟢 Active | [Launch Applet](https://ais-pre-xeez3rq3fe7jsmivu3hmj6-834362858355.asia-east1.run.app) |

---

## 💡 Architectural Overview

The platform eliminates single-prompt limitations by introducing an **Autonomous Router Node** that evaluates incoming user queries across 3 dimensions: **Intent Category**, **Sentiment Analysis**, and **Urgency Level**.

┌─────────────────────────┐
                               │   Customer Query Input  │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │  Intent Router & Prompt │
                               │  Classifier (Gemini)    │
                               └────────────┬────────────┘
                                            │
         ┌──────────────────┬───────────────┼───────────────┬──────────────────┐
         │                  │               │               │                  │
         ▼                  ▼               ▼               ▼                  ▼
┌─────────────────┐ ┌───────────────┐ ┌───────────┐ ┌───────────────┐ ┌─────────────────┐
│ Billing Sub-    │ │ Technical     │ │ Product   │ │ Complaint &   │ │ General FAQ     │
│ Graph Agent     │ │ Support Agent │ │ Spec Agent│ │ Escalations   │ │ Knowledge Agent │
└────────┬────────┘ └───────┬───────┘ └─────┬─────┘ └───────┬───────┘ └────────┬────────┘
         │                  │               │               │                  │
         └──────────────────┴───────────────┼───────────────┴──────────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │ RAG Context Retriever   │
                               │ (Vector Embeddings)     │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │ Gemini 2.4 LLM Response │
                               │ & MongoDB Persistence   │
                               └─────────────────────────┘
                               
🤖 Specialized Agent Sub-Graphs
<details>
<summary><b>👉 Click to expand Agent Sub-Graph Matrix & Capabilities</b></summary>
<br>
Agent Name	Primary Responsibilities	System Prompt Focus	Example Query
💳 Billing Agent	Invoices, refunds, duplicate charges, subscription upgrades.	Financial accuracy, SLA terms, payment processors.	"My credit card was charged twice for invoice #9920."
🔧 Technical Agent	Hardware pairing, reset steps, Error E-305/E-102 diagnostics.	Step-by-step troubleshooting, firmware protocols.	"How do I reset my SoundBuds Ultra headphones?"
📦 Product Spec Agent	Technical specs, dimension comparison, feature matrix.	Exact technical accuracy across ApexBook, SmartWatch, SmartHub.	"What is the battery life of ApexBook Pro 15?"
🚨 Complaint Agent	Service disputes, goodwill credits, human escalations.	Empathy, de-escalation, human callback SLA generation.	"This is terrible service, I demand a refund immediately!"
ℹ️ FAQ Agent	Business hours, store locations, warranty coverage limits.	Rapid summary from index documents.	"What are your store hours in San Francisco?"
</details>

📚 Retrieval-Augmented Generation (RAG) Engine
The application features a built-in vector similarity search pipeline that ingests and chunks corporate policy PDFs (Refund Policy, Shipping, Warranties, User Manuals):
Document Ingestion: PDF policy manuals loaded into normalized text chunks.
Dense Vector Generation: High-dimensional embeddings computed using @google/genai.
Cosine Similarity Match: Contextual scoring against customer queries with confidence cutoffs.
Context Injection: Top-
 relevant snippets passed to the active Gemini agent prompt.
code
JSON
{
  "query": "What is the return policy for opened electronics?",
  "topResult": {
    "docTitle": "Refund and Return Policy.pdf",
    "similarityScore": 0.914,
    "snippet": "Opened electronic items may be returned within 14 days of receipt, provided all original accessories and packaging are intact subject to a 10% restocking fee."
  }
}

📊 Telemetry, Analytics & Agent Inspector
<details>
<summary><b>👉 Click to view Agent Inspector & Real-time Metrics</b></summary>
<br>
Agent Routing Heatmap: Real-time visualization of query distribution across sub-agents.
Trace Execution Logs: Step-by-step visibility into prompt assembly, vector context retrieval, and decision confidence scores.
Sentiment Spectrum: Tracks customer emotion states (Satisfied, Neutral, Frustrated, Urgent) to trigger human callback tickets automatically.
MongoDB Atlas History: Durable persistence of chat logs, routing metadata, latencies, and escalation tickets.
</details>
⚡ End-to-End Test Benchmark Suite
The codebase includes an automated End-to-End System Test Engine (scripts/e2eTest.ts) that validates all subsystems prior to production deployments:
code
Bash
npx tsx scripts/e2eTest.ts
code
Text
=================================================
🧪 STARTING END-TO-END SYSTEM INTEGRATION TESTS
=================================================

--- TEST GROUP 1: RAG Knowledge Engine ---
✅ [PASS] RAG Chunk Search Returns Results
✅ [PASS] RAG Context Document Title present
✅ [PASS] RAG Similarity Score calculated

--- TEST GROUP 2: Multi-Agent Routing Engine ---
✅ [PASS] Query: "My credit card was charged twice for..." returns non-empty response
✅ [PASS] Intent identified: billing (Latency: 30ms)
✅ [PASS] Query: "How do I pair my TechMart Wireless..." returns non-empty response
✅ [PASS] Intent identified: technical (Latency: 1ms)
✅ [PASS] Query: "What is the return policy for opened..." returns non-empty response
✅ [PASS] Intent identified: complaint (Latency: 2ms)
✅ [PASS] Query: "What are the specs of the Pro Laptop..." returns non-empty response
✅ [PASS] Intent identified: product (Latency: 1ms)
✅ [PASS] Query: "Where can I view my account profile..." returns non-empty response
✅ [PASS] Intent identified: faq (Latency: 1ms)

--- TEST GROUP 3: Human Escalation & Ticket Generation ---
✅ [PASS] Urgent/Angry query triggers human escalation
✅ [PASS] Ticket ID generated upon escalation

--- TEST GROUP 4: Database Health & Fallback ---
✅ [PASS] MongoDB configuration flag checked
✅ [PASS] MongoDB Atlas connection state checked

--- TEST GROUP 5: Live Express API Endpoints ---
✅ [PASS] GET /api/health returns 200 OK
✅ [PASS] GET /api/agents/details returns 200 OK
✅ [PASS] GET /api/knowledge returns 200 OK
✅ [PASS] POST /api/chat returns 200 OK

=================================================
📊 E2E TEST SUMMARY: 21 PASSED, 0 FAILED
=================================================
📡 API Reference Matrix
Method	Endpoint	Description	Sample Request Payload
GET	/api/health	System health, Gemini key status, and MongoDB Atlas status.	N/A
POST	/api/chat	Main multi-agent conversation entrypoint.	{"message": "How do I return a broken speaker?", "userId": "user-123"}
GET	/api/agents/details	System prompts and active agent configurations.	N/A
POST	/api/rag/search	Direct vector search against policy chunks.	{"query": "warranty period"}
GET	/api/db/status	Live connection state of MongoDB Atlas instance.	N/A
GET	/api/db/logs	Fetches historical multi-agent chat logs from Atlas.	N/A
🛠️ Quick Start & Environment Setup
1. Clone & Install Dependencies
code
Bash
git clone https://github.com/YOUR_USERNAME/customer-support-multiagent.git
cd customer-support-multiagent
npm install
2. Configure Environment Variables
Create a .env file in the project root:
code
Env
GEMINI_API_KEY="your_gemini_api_key_here"
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/techmart_db?retryWrites=true&w=majority"
VITE_API_BASE_URL=""
3. Launch Development Server
code
Bash
npm run dev
Open http://localhost:3000 in your browser.
👨‍💻 Author & Acknowledgments
P. Suman Sangeet
PGDM (Big Data Analytics)
Specialization: AI • Data Science • Generative AI • RAG Systems • Multi-Agent Architecture
<div align="center">
<sub>Built with ❤️ using Google Gemini, Vector RAG, React, Express, MongoDB Atlas, and Google AI Studio.</sub>
</div>
