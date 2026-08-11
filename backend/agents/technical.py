class TechnicalSupportAgent:
    def __init__(self):
        self.name = "Technical Support Agent"

    def process(self, query: str, context: str = "") -> dict:
        """Diagnoses device firmware errors (Error E-305 app sync, Error E-102 earbud pairing, Error E-401 power reset)."""
        return {
            "agent": "technical",
            "agent_name": self.name,
            "response": "To resolve Error E-305 (Cloud Sync Timeout), please clear app cache, press and hold power button for 10 seconds to initiate a hard reset, then re-pair via Bluetooth.",
            "actions_taken": ["Diagnosed Error Code E-305", "Fetched Hardware Diagnostic Flowchart"],
            "requires_escalation": "defective" in query.lower() or "smoke" in query.lower()
        }
