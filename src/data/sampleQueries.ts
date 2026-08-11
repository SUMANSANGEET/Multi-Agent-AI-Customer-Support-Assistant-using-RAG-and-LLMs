export interface BenchmarkQuery {
  id: string;
  category: 'Billing' | 'Technical' | 'Product' | 'Complaint' | 'Hybrid' | 'FAQ';
  sourceDataset: 'Banking77' | 'CFPB Complaint' | 'SQuAD QA' | 'TechMart System';
  query: string;
  description: string;
  expectedAgents: string[];
}

export const BENCHMARK_QUERIES: BenchmarkQuery[] = [
  {
    id: 'bq-1',
    category: 'Hybrid',
    sourceDataset: 'TechMart System',
    query: 'I paid $14.99 for TechMart Premium subscription yesterday, but my SoundBuds app still says locked (Error E-305). Can I get a refund or fix this?',
    description: 'Complex multi-intent query triggering both Billing Agent (payment verification/refund options) and Technical Support Agent (Error Code E-305 fix).',
    expectedAgents: ['billing', 'technical']
  },
  {
    id: 'bq-2',
    category: 'Billing',
    sourceDataset: 'Banking77',
    query: 'How do I request a refund for an accidental charge on my credit card, and how long does it take to appear in my account?',
    description: 'Standard billing and refund request matching Banking77 intent taxonomy.',
    expectedAgents: ['billing']
  },
  {
    id: 'bq-3',
    category: 'Technical',
    sourceDataset: 'TechMart System',
    query: 'My SoundBuds Ultra earbuds have no sound in the left ear and are flashing red (Error E-102). How do I factory hard reset them?',
    description: 'Technical hardware diagnostic query requiring exact procedure retrieved from User Manual.',
    expectedAgents: ['technical']
  },
  {
    id: 'bq-4',
    category: 'Product',
    sourceDataset: 'SQuAD QA',
    query: 'What are the specs and price of ApexBook Pro 15, and how does TechCare+ 2-year warranty protection work?',
    description: 'Product specifications and warranty comparison inquiry.',
    expectedAgents: ['product', 'technical']
  },
  {
    id: 'bq-5',
    category: 'Complaint',
    sourceDataset: 'CFPB Complaint',
    query: 'I am extremely furious! My order arrived damaged 5 days late, support ignored my emails, and I demand an immediate supervisor escalation and refund!',
    description: 'High urgency complaint query requiring sentiment analysis, supervisor ticket creation, and policy compensation.',
    expectedAgents: ['complaint', 'billing']
  },
  {
    id: 'bq-6',
    category: 'FAQ',
    sourceDataset: 'SQuAD QA',
    query: 'What are TechMart customer support phone operating hours, toll-free contact numbers, and return warehouse SLA times?',
    description: 'General FAQ query regarding business hours, phone number, and return SLA.',
    expectedAgents: ['faq']
  }
];
