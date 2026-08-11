# Customer Support Multi-Agent AI System

An enterprise-grade, multi-agent AI customer support platform built with **Gemini 3.6 Flash**, **Vector RAG (Retrieval-Augmented Generation)**, **Intent Classifier & Router**, and interactive system telemetry dashboards.

---

## 🌟 Key Features

- **Central Intent Classifier & Multi-Agent Router**: Evaluates customer messages in real-time, determines primary intent, sentiment, and urgency, and dispatches to specialized domain agents.
- **5 Specialized Domain Agents**:
  1. **Billing & Subscriptions Agent**: Handles payment failures, pro-rated refunds, invoice SLA tracking, and pricing plan upgrades.
  2. **Technical Support Agent**: Diagnoses firmware issues, app sync (Error E-305), earbud pairing (Error E-102), and hard resets.
  3. **Product & Specs Agent**: Detailed hardware specifications for ApexBook Pro 15, SoundBuds Ultra, SmartWatch Elite, and SmartHub Max.
  4. **Escalations & Complaints Agent**: Empathetic de-escalation with 2-hour supervisor SLA callbacks and goodwill store credits.
  5. **General FAQ Agent**: Operating hours, store locations, and standard 30-day warranty policies.
- **Vector Search RAG Engine**: Dense vector embeddings with cosine similarity matching over knowledge base documents.
- **Human-in-the-Loop SLA Queue**: Automatic support ticket creation and status tracking when human supervisor escalation is needed.
- **Analytics & Telemetry Dashboard**: Real-time monitoring of CSAT scores, agent usage distribution, latencies, and sentiment metrics.

---

## 🚀 Live Demo Link

- **Production App Link**: [https://ais-pre-xeez3rq3fe7jsmivu3hmj6-834362858355.asia-east1.run.app](https://ais-pre-xeez3rq3fe7jsmivu3hmj6-834362858355.asia-east1.run.app)

---

## 📦 Exporting & Pushing to GitHub

To push this repository to your GitHub account:

1. Click on the **Settings** menu at the top right of the Google AI Studio Build UI.
2. Select **Export to GitHub**.
3. Authenticate with your GitHub account and choose or create the target repository name.
4. All project files, full-stack Express backend, React UI, and RAG vector engine will automatically commit and push to your GitHub repo.

---

## 🛠️ Local Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone <your-github-repo-url>
   cd customer-support-multiagent
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📄 License

MIT License. Built with Google AI Studio & Gemini.
