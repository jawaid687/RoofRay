export interface KnowledgeChunk {
  id: string;
  sourceTitle: string;
  authorOrg: string;
  officialUrl?: string;
  publicationYear: number;
  category: 'policy_bangladesh' | 'tariff_bangladesh' | 'pv_engineering' | 'climatology' | 'carbon_accounting';
  title: string;
  content: string;
  keywords: string[];
}

export interface RetrievalResult {
  chunk: KnowledgeChunk;
  score: number;
  matchedTerms: string[];
}
