class FAQAgent:
    def __init__(self):
        self.name = "General FAQ Agent"

    def process(self, query: str, context: str = "") -> dict:
        """Answers standard operational queries regarding opening hours, store locations, and standard return policies."""
        return {
            "agent": "faq",
            "agent_name": self.name,
            "response": "Our customer support team operates 24/7 at 1-800-555-TECH. We offer a 30-day hassle-free return window for all unopened products with free return shipping.",
            "actions_taken": ["Retrieved General FAQ Policy Doc"],
            "requires_escalation": False
        }
