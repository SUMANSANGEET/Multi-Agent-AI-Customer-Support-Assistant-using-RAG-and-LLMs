import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from agents.router import MultiAgentRouter
from agents.billing import BillingAgent
from agents.technical import TechnicalSupportAgent
from agents.product import ProductAgent
from agents.complaint import ComplaintAgent
from agents.faq import FAQAgent

app = FastAPI(title="Multi-Agent Customer Support AI API", version="1.0.0")

# Initialize Router & Agents
router = MultiAgentRouter()
agents = {
    "BILLING": BillingAgent(),
    "TECHNICAL": TechnicalSupportAgent(),
    "PRODUCT": ProductAgent(),
    "COMPLAINT": ComplaintAgent(),
    "FAQ": FAQAgent()
}

class ChatMessageRequest(BaseModel):
    content: str
    user_id: Optional[str] = "demo-user"

@app.get("/health")
def health_check():
    return {"status": "ok", "system": "Multi-Agent AI Platform", "agents": len(agents)}

@app.post("/api/chat")
def process_chat_message(req: ChatMessageRequest):
    # Step 1: Route query to intent
    classification = router.classify_and_route(req.content)
    intent = classification.primary_intent

    # Step 2: Dispatch to specialized agent
    agent = agents.get(intent, agents["FAQ"])
    agent_res = agent.process(req.content)

    return {
        "query": req.content,
        "classification": classification.model_dump(),
        "dispatched_agent": agent_res["agent_name"],
        "response": agent_res["response"],
        "actions": agent_res["actions_taken"],
        "escalated_to_human": agent_res["requires_escalation"] or classification.urgency in ["HIGH", "CRITICAL"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
