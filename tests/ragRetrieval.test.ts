import { LexicalRetrievalEngine, retrieveGroundedContext } from '../src/rag/retrievalEngine';
import { KNOWLEDGE_CORPUS } from '../src/rag/knowledge/corpus';

export function runRagTests() {
  console.log('📚 Starting Lexical RAG & Knowledge Retrieval Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // Test 1: Corpus integrity
  assert(KNOWLEDGE_CORPUS.length >= 8, `Corpus contains ${KNOWLEDGE_CORPUS.length} verified official chunks (>= 8 required)`);
  assert(KNOWLEDGE_CORPUS.every((c) => c.officialUrl && c.authorOrg && c.publicationYear > 2017), 'All chunks possess official source attribution and publication dates');

  const engine = new LexicalRetrievalEngine(KNOWLEDGE_CORPUS);

  // Test 2: SREDA Net-Metering Retrieval
  const sredaResults = engine.search('net metering 70% sanctioned load in Bangladesh', 3);
  assert(sredaResults.length > 0, 'SREDA query returns results');
  assert(sredaResults[0].chunk.id.includes('sreda'), `Top result for net metering is SREDA (${sredaResults[0]?.chunk.id})`);
  assert(sredaResults[0].chunk.authorOrg.includes('SREDA'), 'Top result author is SREDA');

  // Test 3: NREL Shading Loss Retrieval
  const shadingResults = engine.search('shading losses bypass diode derating performance ratio', 3);
  assert(shadingResults.length > 0, 'Shading query returns results');
  assert(shadingResults[0].chunk.id === 'nrel-shading-derating-impact', `Top result for shading is NREL (${shadingResults[0]?.chunk.id})`);

  // Test 4: BPDB Tariff Retrieval
  const tariffResults = engine.search('electricity tariff slabs BPDB LT-A residential rate BDT', 3);
  assert(tariffResults.length > 0, 'Tariff query returns results');
  assert(tariffResults[0].chunk.id === 'bpdb-retail-tariff-structure', `Top result for tariff is BPDB (${tariffResults[0]?.chunk.id})`);

  // Test 5: DoE Carbon Emission Factor
  const carbonResults = engine.search('carbon grid emission factor Bangladesh DoE 0.637', 3);
  assert(carbonResults.length > 0, 'Carbon query returns results');
  assert(carbonResults[0].chunk.id === 'doe-bangladesh-grid-emission-factor', 'Top result is DoE grid emission factor');

  // Test 6: Grounded context builder with contextual enrichment
  const enriched = retrieveGroundedContext('How much can I export to the grid?', { country: 'Bangladesh', currency: 'BDT' }, 2);
  assert(enriched.length === 2, 'Enriched context returns requested top-2 chunks');
  assert(enriched.some((r) => r.chunk.id.includes('sreda')), 'Enriched context successfully included SREDA regulations');

  console.log(`\n========================================`);
  console.log(`RAG Retrieval Tests: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  return { passed, failed };
}

if (process.argv[1]?.includes('ragRetrieval.test')) {
  const res = runRagTests();
  if (res.failed > 0) process.exit(1);
}
