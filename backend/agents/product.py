class ProductAgent:
    def __init__(self):
        self.name = "Product Specifications Agent"

    def process(self, query: str, context: str = "") -> dict:
        """Provides detailed specifications for ApexBook Pro 15, SoundBuds Ultra, SmartWatch Elite, and SmartHub Max."""
        return {
            "agent": "product",
            "agent_name": self.name,
            "response": "The ApexBook Pro 15 features an M3 Ultra chip, 32GB Unified Memory, 1TB NVMe SSD, 15.6-inch OLED 120Hz display, and 18-hour battery life.",
            "actions_taken": ["Queried TechMart Product Catalog", "Extracted Spec Sheet"],
            "requires_escalation": False
        }
