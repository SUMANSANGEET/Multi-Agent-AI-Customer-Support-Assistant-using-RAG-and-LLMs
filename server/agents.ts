import { GoogleGenAI, Type } from "@google/genai";
import {
  AgentType,
  IntentAnalysis,
  AgentExecutionTrace,
  RetrievalResult,
  ProcessedResponse,
  GroundingSource
} from "../src/types";
import { getGeminiClient } from "./gemini";
import { ragEngine } from "./ragEngine";

export class MultiAgentOrchestrator {
  /**
   * Main Orchestration Flow:
   * 1. Intent Detection Agent -> Analyzes intent, sentiment, urgency
   * 2. Agent Router -> Routes to specialized agent(s)
   * 3. RAG Retrieval -> Semantic vector search for relevant context
   * 4. Specialized Agents -> Process with domain knowledge + Google Search Grounding
   * 5. Response Aggregator -> Merges findings, citations, follow-up actions & web verification sources
   */
  public async processUserQuery(
    userQuery: string,
    history: { role: string; content: string }[] = []
  ): Promise<ProcessedResponse> {
    const startTime = Date.now();
    const traces: AgentExecutionTrace[] = [];
    const allGroundingSources: GroundingSource[] = [];
    const allSearchQueries: string[] = [];

    // Step 1: Intent Detection Agent
    const intentTraceStart = Date.now();
    const intentAnalysis = await this.runIntentDetectionAgent(userQuery, history);
    traces.push({
      agent: 'intent',
      agentName: 'Intent Detection Agent',
      inputPromptSnippet: userQuery.slice(0, 100),
      outputSummary: `Primary: ${intentAnalysis.primaryIntent.toUpperCase()} (${Math.round(intentAnalysis.confidence * 100)}%), Sentiment: ${intentAnalysis.sentiment}, Urgency: ${intentAnalysis.urgency}`,
      latencyMs: Date.now() - intentTraceStart,
      chunksUsed: [],
      status: 'completed'
    });

    // Step 2: Agent Router
    const targetAgents = this.determineTargetAgents(intentAnalysis);

    // Step 3: RAG Retrieval System
    const retrievedChunks = await ragEngine.searchVectorStore(
      userQuery,
      5,
      intentAnalysis.primaryIntent !== 'faq' ? intentAnalysis.primaryIntent : undefined
    );

    // Step 4: Execute Specialized Agents with Google Search Grounding
    const agentOutputs: { agent: AgentType; output: string }[] = [];

    for (const agentType of targetAgents) {
      const agentStart = Date.now();
      const chunksUsed = retrievedChunks.map(r => r.chunk.id);

      const agentResult = await this.runSpecializedAgent(
        agentType,
        userQuery,
        intentAnalysis,
        retrievedChunks
      );

      agentOutputs.push({ agent: agentType, output: agentResult.output });

      if (agentResult.groundingSources.length > 0) {
        allGroundingSources.push(...agentResult.groundingSources);
      }
      if (agentResult.searchQueries.length > 0) {
        allSearchQueries.push(...agentResult.searchQueries);
      }

      traces.push({
        agent: agentType,
        agentName: `${this.getAgentDisplayName(agentType)} Agent`,
        inputPromptSnippet: `Query + ${retrievedChunks.length} RAG chunks + Google Search Grounding`,
        outputSummary: agentResult.output.slice(0, 150) + '...',
        latencyMs: Date.now() - agentStart,
        chunksUsed,
        status: 'completed'
      });
    }

    // Step 5: Response Aggregator & Final Grounded Synthesis
    const aggregatorResult = await this.runResponseAggregator(
      userQuery,
      intentAnalysis,
      agentOutputs,
      retrievedChunks
    );

    if (aggregatorResult.groundingSources.length > 0) {
      allGroundingSources.push(...aggregatorResult.groundingSources);
    }
    if (aggregatorResult.searchQueries.length > 0) {
      allSearchQueries.push(...aggregatorResult.searchQueries);
    }

    // Deduplicate grounding sources by URI
    const uniqueGroundingSources: GroundingSource[] = [];
    const seenUris = new Set<string>();
    for (const src of allGroundingSources) {
      if (src.uri && !seenUris.has(src.uri)) {
        seenUris.add(src.uri);
        uniqueGroundingSources.push(src);
      }
    }

    // Deduplicate search queries
    const uniqueSearchQueries = Array.from(new Set(allSearchQueries));

    let finalReply = aggregatorResult.output;

    // Append Web Search Grounding section if web sources were retrieved and not already formatted
    if (uniqueGroundingSources.length > 0 && !finalReply.includes("🌐 Real-Time Web Verification")) {
      const webSourcesText = uniqueGroundingSources
        .map(src => `• [${src.title}](${src.uri})`)
        .join('\n');
      finalReply += `\n\n🌐 **Real-Time Web Verification (Google Search Grounding):**\n${webSourcesText}`;
    }

    const shouldEscalate =
      intentAnalysis.sentiment === 'angry' ||
      intentAnalysis.urgency === 'critical' ||
      userQuery.toLowerCase().includes('human') ||
      userQuery.toLowerCase().includes('supervisor') ||
      userQuery.toLowerCase().includes('representative');

    const ticketId = shouldEscalate ? `TICK-${Math.floor(100000 + Math.random() * 900000)}` : undefined;

    const suggestedActions = this.generateSuggestedActions(intentAnalysis, shouldEscalate);

    const totalLatency = Date.now() - startTime;

    return {
      id: `resp-${Date.now()}`,
      replyText: finalReply,
      intent: intentAnalysis,
      invokedAgents: targetAgents,
      executionTraces: traces,
      retrievedChunks,
      groundingSources: uniqueGroundingSources,
      searchQueries: uniqueSearchQueries,
      escalatedToHuman: shouldEscalate,
      ticketId,
      suggestedActions,
      latencyMs: totalLatency,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Module 3: Intent Detection Agent
   */
  private async runIntentDetectionAgent(
    query: string,
    history: { role: string; content: string }[]
  ): Promise<IntentAnalysis> {
    const ai = getGeminiClient();

    const systemPrompt = `You are the central Intent Detection Agent for TechMart Electronics AI Customer Support.
Analyze the user query and classify their intent into one of these domain agents:
- 'billing': Payments, subscriptions, invoices, unexpected charges, refund requests.
- 'technical': Hardware/software troubleshooting, app crashes, pairing issues, resets, error codes (e.g. E-305, E-102, E-401).
- 'product': Product specifications, pricing, model comparisons, stock availability.
- 'complaint': Expressed dissatisfaction, bad service, delayed shipments, request for escalation.
- 'faq': Business hours, contact info, standard policies, store addresses.

Detect sentiment ('positive', 'neutral', 'frustrated', 'angry') and urgency ('low', 'medium', 'high', 'critical').
Identify any secondary intents if the query combines domains (e.g., both billing and technical).
Extract any entities like order IDs, error codes, amounts, or product names.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `User Query: "${query}"`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              primaryIntent: { type: Type.STRING },
              secondaryIntents: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              confidence: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
              sentiment: { type: Type.STRING },
              urgency: { type: Type.STRING },
              entities: {
                type: Type.OBJECT,
                properties: {
                  productName: { type: Type.STRING },
                  orderId: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  errorCode: { type: Type.STRING }
                }
              }
            },
            required: ['primaryIntent', 'confidence', 'sentiment', 'urgency']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      const validAgents: AgentType[] = ['billing', 'technical', 'product', 'complaint', 'faq'];

      const primary = validAgents.includes(parsed.primaryIntent?.toLowerCase())
        ? (parsed.primaryIntent.toLowerCase() as AgentType)
        : 'faq';

      const secondaries = (parsed.secondaryIntents || [])
        .map((s: string) => s.toLowerCase() as AgentType)
        .filter((s: AgentType) => validAgents.includes(s) && s !== primary);

      return {
        primaryIntent: primary,
        secondaryIntents: secondaries,
        confidence: parsed.confidence || 0.9,
        reasoning: parsed.reasoning || 'Query analyzed for domain keywords.',
        sentiment: parsed.sentiment || 'neutral',
        urgency: parsed.urgency || 'medium',
        entities: parsed.entities || {}
      };
    } catch (e) {
      // Fallback intent detection if API call fails
      return this.heuristicIntentDetection(query);
    }
  }

  /**
   * Module 4: Agent Router Logic
   */
  private determineTargetAgents(intent: IntentAnalysis): AgentType[] {
    const agents: AgentType[] = [intent.primaryIntent];
    if (intent.secondaryIntents && intent.secondaryIntents.length > 0) {
      agents.push(...intent.secondaryIntents);
    }
    // Deduplicate
    return Array.from(new Set(agents));
  }

  /**
   * Module 5: Specialized Domain Agents with Google Search Grounding
   */
  private async runSpecializedAgent(
    agentType: AgentType,
    query: string,
    intent: IntentAnalysis,
    retrievedChunks: RetrievalResult[]
  ): Promise<{ output: string; groundingSources: GroundingSource[]; searchQueries: string[] }> {
    const ai = getGeminiClient();

    const contextText = retrievedChunks
      .map(
        (r, i) =>
          `[Source ${i + 1}: ${r.chunk.docTitle} (${r.chunk.category}) - Similarity: ${Math.round(r.similarityScore * 100)}%]\n${r.chunk.content}`
      )
      .join('\n\n');

    let agentRolePrompt = '';
    switch (agentType) {
      case 'billing':
        agentRolePrompt = `You are the Billing & Payment Specialist Agent for TechMart. Focus on payment terms, subscription pricing ($14.99/mo), 30-day money-back refund guarantee, invoice processing SLA (2-3 days), and account subscription sync. Provide precise monetary details and refund conditions.`;
        break;
      case 'technical':
        agentRolePrompt = `You are the Technical Support Specialist Agent for TechMart. Provide step-by-step diagnostic and troubleshooting instructions. Reference specific error codes (E-305 for app sync, E-102 for earbud reset, E-401 for power reset) and driver setup procedures.`;
        break;
      case 'product':
        agentRolePrompt = `You are the Product Specialist Agent for TechMart. Provide hardware specs (ApexBook Pro 15, SoundBuds Ultra, SmartWatch Elite, SmartHub Max), comparative advantages, TechCare+ protection options ($49/2yr), and pricing. Use Google Search grounding when current product news, market comparisons, or latest tech specs are required.`;
        break;
      case 'complaint':
        agentRolePrompt = `You are the Senior Complaint Resolution & Escalation Agent for TechMart. Exhibit empathy, acknowledge frustration, explain priority SLA response (2-hour supervisor turnaround), and present goodwill compensation options (RMA free return label or TechMart store credit).`;
        break;
      case 'faq':
      default:
        agentRolePrompt = `You are the General FAQ Agent for TechMart. Provide clear answers regarding operating hours (24/7 AI, 800-555-TECH phone support Mon-Fri 6am-9pm EST), store location, shipping SLAs, consumer electronics compliance, company policies, and general company background. Use Google Search grounding to verify current events, industry compliance standards, or live external context when needed.`;
        break;
    }

    const fullPrompt = `${agentRolePrompt}

Retrieved Knowledge Base Context (RAG):
${contextText || 'No direct document chunks retrieved.'}

Customer Query: "${query}"
Extracted Entities: ${JSON.stringify(intent.entities)}

Provide your expert domain assessment and recommended solution. Base your answer on the TechMart Knowledge Base context and real-time Google Search grounding web verification where applicable.`;

    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: fullPrompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const candidate = res.candidates?.[0] as any;
      const groundingMetadata = candidate?.groundingMetadata;
      const groundingChunks = groundingMetadata?.groundingChunks || [];
      const searchQueries = groundingMetadata?.webSearchQueries || [];

      const groundingSources: GroundingSource[] = [];
      for (const gc of groundingChunks) {
        if (gc.web?.uri) {
          groundingSources.push({
            title: gc.web.title || gc.web.uri,
            uri: gc.web.uri
          });
        }
      }

      return {
        output: res.text || 'Unable to generate specialized response.',
        groundingSources,
        searchQueries
      };
    } catch (e) {
      return {
        output: `[${agentType.toUpperCase()} AGENT]: Evaluated query regarding ${query}. Recommended reference to standard policy.`,
        groundingSources: [],
        searchQueries: []
      };
    }
  }

  /**
   * Response Aggregator & Final Synthesizer with Grounding
   */
  private async runResponseAggregator(
    query: string,
    intent: IntentAnalysis,
    agentOutputs: { agent: AgentType; output: string }[],
    retrievedChunks: RetrievalResult[]
  ): Promise<{ output: string; groundingSources: GroundingSource[]; searchQueries: string[] }> {
    const ai = getGeminiClient();

    const outputsCombined = agentOutputs
      .map(a => `--- ${this.getAgentDisplayName(a.agent).toUpperCase()} AGENT FINDINGS ---\n${a.output}`)
      .join('\n\n');

    const sourcesList = retrievedChunks
      .map(r => `• **${r.chunk.docTitle}** (${Math.round(r.similarityScore * 100)}% match)`)
      .join('\n');

    const systemPrompt = `You are the Final Response Aggregator for TechMart Electronics Multi-Agent Customer Support.
Synthesize the findings from the invoked specialized agents into a single, polished, friendly, and structured customer response.
Formatting Rules:
- Use clear bullet points and bold section headers for readability.
- Maintain an empathetic, highly professional tone.
- Include clear step-by-step instructions if troubleshooting is required.
- Ensure company policies or external facts are backed by real-time web verification when applicable.
- Do NOT mention "internal agents" or "prompts" to the customer; present as a unified TechMart Support response.
- Append a subtle "📚 Verified Sources" section at the bottom citing the Knowledge Base documents used.`;

    const prompt = `Customer Query: "${query}"

Agent Findings:
${outputsCombined}

Retrieved Citations:
${sourcesList}

Synthesize the final response for the customer.`;

    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          tools: [{ googleSearch: {} }]
        }
      });

      const candidate = res.candidates?.[0] as any;
      const groundingMetadata = candidate?.groundingMetadata;
      const groundingChunks = groundingMetadata?.groundingChunks || [];
      const searchQueries = groundingMetadata?.webSearchQueries || [];

      const groundingSources: GroundingSource[] = [];
      for (const gc of groundingChunks) {
        if (gc.web?.uri) {
          groundingSources.push({
            title: gc.web.title || gc.web.uri,
            uri: gc.web.uri
          });
        }
      }

      return {
        output: res.text || agentOutputs.map(a => a.output).join('\n\n'),
        groundingSources,
        searchQueries
      };
    } catch (e) {
      // Fallback concatenation
      return {
        output: agentOutputs.map(a => a.output).join('\n\n') + `\n\n📚 **Verified Sources:**\n` + sourcesList,
        groundingSources: [],
        searchQueries: []
      };
    }
  }

  private heuristicIntentDetection(query: string): IntentAnalysis {
    const q = query.toLowerCase();
    let primary: AgentType = 'faq';
    const secondaries: AgentType[] = [];

    if (q.includes('pay') || q.includes('bill') || q.includes('charge') || q.includes('refund') || q.includes('invoice') || q.includes('$')) {
      primary = 'billing';
    } else if (q.includes('error') || q.includes('fix') || q.includes('reset') || q.includes('locked') || q.includes('connect') || q.includes('broken') || q.includes('e-')) {
      primary = 'technical';
    } else if (q.includes('spec') || q.includes('buy') || q.includes('price') || q.includes('laptop') || q.includes('earbud') || q.includes('watch')) {
      primary = 'product';
    } else if (q.includes('furious') || q.includes('angry') || q.includes('terrible') || q.includes('supervisor') || q.includes('complaint')) {
      primary = 'complaint';
    }

    if (q.includes('refund') && primary !== 'billing') secondaries.push('billing');
    if (q.includes('error') && primary !== 'technical') secondaries.push('technical');

    const sentiment = (q.includes('furious') || q.includes('angry') || q.includes('terrible') || q.includes('hate')) ? 'angry' :
                      (q.includes('frustrated') || q.includes('stuck') || q.includes('issue')) ? 'frustrated' : 'neutral';

    return {
      primaryIntent: primary,
      secondaryIntents: secondaries,
      confidence: 0.85,
      reasoning: 'Heuristic keyword pattern matching fallback.',
      sentiment,
      urgency: sentiment === 'angry' ? 'high' : 'medium',
      entities: {}
    };
  }

  private generateSuggestedActions(intent: IntentAnalysis, escalated: boolean): string[] {
    const actions: string[] = [];

    if (intent.primaryIntent === 'billing') {
      actions.push('💳 View Subscription & Billing Portal');
      actions.push('📄 Request Refund Return Label');
    }
    if (intent.primaryIntent === 'technical') {
      actions.push('🔧 Run Hardware Diagnostics in App');
      actions.push('📲 Download Driver Package');
    }
    if (intent.primaryIntent === 'product') {
      actions.push('🛒 Compare TechMart Hardware Lineup');
      actions.push('🛡️ Explore TechCare+ Coverage Plans');
    }
    if (escalated) {
      actions.push('📞 Request Priority Supervisor Callback');
      actions.push('🎫 Check Escalated Ticket Status');
    } else {
      actions.push('💬 Ask Follow-up Question');
    }

    return actions;
  }

  private getAgentDisplayName(agent: AgentType): string {
    switch (agent) {
      case 'intent': return 'Intent Classifier';
      case 'billing': return 'Billing & Payments';
      case 'technical': return 'Technical Support';
      case 'product': return 'Product Catalog';
      case 'complaint': return 'Complaint Escalation';
      case 'faq': return 'General FAQ';
    }
  }
}

export const orchestrator = new MultiAgentOrchestrator();
