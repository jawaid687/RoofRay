import { KnowledgeChunk, RetrievalResult } from './types';
import { KNOWLEDGE_CORPUS } from './knowledge/corpus';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09ff\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

export class LexicalRetrievalEngine {
  private corpus: KnowledgeChunk[];
  private docTokens: Map<string, string[]> = new Map();
  private docLengths: Map<string, number> = new Map();
  private avgDocLength: number = 0;
  private dfMap: Map<string, number> = new Map();

  constructor(corpus: KnowledgeChunk[] = KNOWLEDGE_CORPUS) {
    this.corpus = corpus;
    this.buildIndex();
  }

  private buildIndex() {
    let totalLen = 0;
    const n = this.corpus.length;

    // Tokenize each document
    for (const chunk of this.corpus) {
      const fullText = `${chunk.title} ${chunk.content} ${chunk.keywords.join(' ')} ${chunk.category}`;
      const tokens = tokenize(fullText);
      this.docTokens.set(chunk.id, tokens);
      this.docLengths.set(chunk.id, tokens.length);
      totalLen += tokens.length;

      const uniqueTokens = new Set(tokens);
      for (const t of uniqueTokens) {
        this.dfMap.set(t, (this.dfMap.get(t) || 0) + 1);
      }
    }

    this.avgDocLength = n > 0 ? totalLen / n : 1;
  }

  /**
   * Performs BM25 scoring over the corpus.
   * Parameter tuning: k1 = 1.5, b = 0.75
   */
  public search(query: string, limit: number = 3): RetrievalResult[] {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) {
      return [];
    }

    const n = this.corpus.length;
    const k1 = 1.5;
    const b = 0.75;
    const results: RetrievalResult[] = [];

    for (const chunk of this.corpus) {
      const tokens = this.docTokens.get(chunk.id) || [];
      const docLen = this.docLengths.get(chunk.id) || 1;

      // Count term frequencies in doc
      const tfMap = new Map<string, number>();
      for (const t of tokens) {
        tfMap.set(t, (tfMap.get(t) || 0) + 1);
      }

      let score = 0;
      const matchedTerms: string[] = [];

      for (const qTerm of queryTokens) {
        const tf = tfMap.get(qTerm) || 0;
        if (tf > 0) {
          matchedTerms.push(qTerm);
          const df = this.dfMap.get(qTerm) || 1;
          const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
          const num = tf * (k1 + 1);
          const denom = tf + k1 * (1 - b + b * (docLen / this.avgDocLength));
          score += idf * (num / denom);
        }
      }

      // Keyword boost
      for (const kw of chunk.keywords) {
        const kwTokens = tokenize(kw);
        if (kwTokens.some((kt) => queryTokens.includes(kt))) {
          score += 1.2;
        }
      }

      if (score > 0) {
        results.push({
          chunk,
          score: Math.round(score * 100) / 100,
          matchedTerms: Array.from(new Set(matchedTerms)),
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

// Global default engine instance
export const defaultRetrievalEngine = new LexicalRetrievalEngine();

/**
 * Retrieves pertinent knowledge chunks grounded in both user query and current solar context.
 */
export function retrieveGroundedContext(
  userQuery: string,
  context?: {
    country?: string;
    city?: string;
    hasShading?: boolean;
    currency?: string;
    panelCount?: number;
  },
  limit: number = 3
): RetrievalResult[] {
  // Construct enriched search query
  let enrichedQuery = userQuery;
  if (context?.country === 'Bangladesh' || context?.currency === 'BDT') {
    enrichedQuery += ' bangladesh sreda net metering bpdb tariff';
  }
  if (context?.hasShading) {
    enrichedQuery += ' shading losses derating obstacles';
  }

  const results = defaultRetrievalEngine.search(enrichedQuery, limit);

  // If no direct query match, provide default foundational chunks based on region
  if (results.length === 0) {
    const fallbackIds = context?.country === 'Bangladesh'
      ? ['sreda-net-metering-eligibility', 'bpdb-retail-tariff-structure', 'nrel-shading-derating-impact']
      : ['nrel-tilt-and-orientation', 'nrel-shading-derating-impact', 'sreda-technical-standards'];

    return fallbackIds
      .map((id) => KNOWLEDGE_CORPUS.find((c) => c.id === id))
      .filter((c): c is KnowledgeChunk => !!c)
      .map((chunk) => ({
        chunk,
        score: 1.0,
        matchedTerms: ['foundational_baseline'],
      }));
  }

  return results;
}
