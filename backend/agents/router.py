import os
from google import genai
from pydantic import BaseModel, Field

class IntentClassification(BaseModel):
    primary_intent: str = Field(description="One of: BILLING, TECHNICAL, PRODUCT, COMPLAINT, FAQ")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0")
    sentiment: str = Field(description="One of: POSITIVE, NEUTRAL, FRUSTRATED, ANGRY")
    urgency: str = Field(description="One of: LOW, MEDIUM, HIGH, CRITICAL")
    reasoning: str = Field(description="Explanation of classification choice")

class MultiAgentRouter:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None

    def classify_and_route(self, user_query: str) -> IntentClassification:
        """Classifies customer query intent and determines routing agent."""
        if not self.client:
            # Rule-based fallback classification
            q_lower = user_query.lower()
            if any(k in q_lower for k in ["pay", "charge", "refund", "invoice", "card", "billing", "$"]):
                return IntentClassification(
                    primary_intent="BILLING", confidence=0.92, sentiment="NEUTRAL", urgency="MEDIUM", reasoning="Billing keyword match"
                )
            elif any(k in q_lower for k in ["error", "reset", "pair", "sync", "broken", "fail", "bluetooth"]):
                return IntentClassification(
                    primary_intent="TECHNICAL", confidence=0.89, sentiment="FRUSTRATED", urgency="HIGH", reasoning="Technical error code match"
                )
            elif any(k in q_lower for k in ["spec", "battery", "ram", "display", "inch", "weight", "feature"]):
                return IntentClassification(
                    primary_intent="PRODUCT", confidence=0.95, sentiment="NEUTRAL", urgency="LOW", reasoning="Product hardware spec match"
                )
            elif any(k in q_lower for k in ["unacceptable", "supervisor", "terrible", "lawyer", "manager", "worst"]):
                return IntentClassification(
                    primary_intent="COMPLAINT", confidence=0.98, sentiment="ANGRY", urgency="CRITICAL", reasoning="Escalation de-escalation trigger"
                )
            else:
                return IntentClassification(
                    primary_intent="FAQ", confidence=0.85, sentiment="NEUTRAL", urgency="LOW", reasoning="General informational query"
                )

        prompt = f"""Analyze the following customer query and classify its primary intent:
Customer Query: "{user_query}"

Allowed Intents:
- BILLING: Charges, invoices, payment failures, refunds, subscription plans ($14.99/mo).
- TECHNICAL: Firmware errors (E-305, E-102), device sync, pairing, hard reset.
- PRODUCT: Laptop / Earbud / Smartwatch hardware specifications, dimensions, features.
- COMPLAINT: Angry customers, service complaints, requesting human supervisor.
- FAQ: Operating hours, store locations, standard return windows.

Return structured response containing primary_intent, confidence, sentiment, urgency, reasoning."""

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_schema": IntentClassification,
                }
            )
            return response.parsed
        except Exception as e:
            print(f"Gemini Router error: {e}")
            return IntentClassification(
                primary_intent="FAQ", confidence=0.80, sentiment="NEUTRAL", urgency="LOW", reasoning=f"Fallback due to router error: {str(e)}"
            )
