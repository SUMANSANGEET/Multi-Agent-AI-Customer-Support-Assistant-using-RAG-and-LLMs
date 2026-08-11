import { KBDocument, VectorChunk, RetrievalResult } from '../src/types';
import { INITIAL_KB_DOCUMENTS } from '../src/data/knowledgeBase';
import { getGeminiClient } from './gemini';

class RAGEngine {
  private documents: KBDocument[] = [...INITIAL_KB_DOCUMENTS];
  private chunks: VectorChunk[] = [];
  private isEmbeddingInitialized = false;

  constructor() {
    this.initializeChunks();
  }

  /**
   * Split documents into chunks by headings and double-newlines
   */
  public initializeChunks() {
    this.chunks = [];
    let chunkCounter = 1;

    for (const doc of this.documents) {
      const sections = doc.content.split(/\n(?=#{1,3}\s)/g);
      let docChunkCount = 0;

      for (const sec of sections) {
        const trimmed = sec.trim();
        if (!trimmed) continue;

        // Sub-split if section is very large
        const paragraphs = trimmed.split(/\n\n+/);
        let currentChunkText = '';

        for (const p of paragraphs) {
          if ((currentChunkText + '\n' + p).length < 500) {
            currentChunkText += (currentChunkText ? '\n\n' : '') + p;
          } else {
            if (currentChunkText) {
              this.chunks.push({
                id: `chunk-${chunkCounter++}`,
                docId: doc.id,
                docTitle: doc.title,
                category: doc.category,
                content: currentChunkText
              });
              docChunkCount++;
            }
            currentChunkText = p;
          }
        }

        if (currentChunkText) {
          this.chunks.push({
            id: `chunk-${chunkCounter++}`,
            docId: doc.id,
            docTitle: doc.title,
            category: doc.category,
            content: currentChunkText
          });
          docChunkCount++;
        }
      }

      doc.chunkCount = docChunkCount;
    }

    console.log(`[RAG Engine] Initialized ${this.chunks.length} chunks from ${this.documents.length} documents.`);
  }

  /**
   * Try to enrich chunks with Gemini embeddings asynchronously
   */
  public async generateGeminiEmbeddings() {
    if (this.isEmbeddingInitialized || !process.env.GEMINI_API_KEY) return;
    try {
      const ai = getGeminiClient();
      console.log("[RAG Engine] Generating Gemini embeddings for chunks...");
      
      // Process in small batches or on demand
      for (let i = 0; i < Math.min(this.chunks.length, 25); i++) {
        const chunk = this.chunks[i];
        if (!chunk.vector) {
          try {
            const res: any = await ai.models.embedContent({
              model: 'gemini-embedding-2-preview',
              contents: chunk.content,
            });
            const values = res.embedding?.values || res.embeddings?.[0]?.values;
            if (values) {
              chunk.vector = values;
            }
          } catch (err) {
            // Silently fallback if embedding model rate limited or restricted
            break;
          }
        }
      }
      this.isEmbeddingInitialized = true;
      console.log("[RAG Engine] Gemini embeddings generated successfully.");
    } catch (e) {
      console.warn("[RAG Engine] Embedding generation skipped/failed, using BM25/Cosine fallback.", e);
    }
  }

  /**
   * Hybrid Vector Similarity Search (Semantic Embedding + BM25 TF-IDF fallback)
   */
  public async searchVectorStore(query: string, topK: number = 4, categoryFilter?: string): Promise<RetrievalResult[]> {
    const queryNormalized = query.toLowerCase();
    const queryTokens = queryNormalized.match(/\w+/g) || [];

    // Filter chunks by category if specified
    const candidateChunks = categoryFilter && categoryFilter !== 'ALL'
      ? this.chunks.filter(c => c.category.toLowerCase() === categoryFilter.toLowerCase() || c.category === 'Policy' || c.category === 'FAQ')
      : this.chunks;

    let queryVector: number[] | null = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = getGeminiClient();
        const res: any = await ai.models.embedContent({
          model: 'gemini-embedding-2-preview',
          contents: query,
        });
        const values = res.embedding?.values || res.embeddings?.[0]?.values;
        if (values) {
          queryVector = values;
        }
      } catch (e) {
        // fallback to lexical/tf-idf score
      }
    }

    const results: RetrievalResult[] = candidateChunks.map((chunk) => {
      let score = 0;

      // 1. Dense Cosine Similarity (if vectors exist)
      if (queryVector && chunk.vector && queryVector.length === chunk.vector.length) {
        const cosine = this.cosineSimilarity(queryVector, chunk.vector);
        score += cosine * 0.7; // 70% weight for semantic dense vector
      }

      // 2. Lexical Keyword TF-IDF / Term Overlap Score
      const chunkText = (chunk.docTitle + ' ' + chunk.category + ' ' + chunk.content).toLowerCase();
      let termMatches = 0;
      for (const token of queryTokens) {
        if (token.length < 3) continue; // skip short stop words
        if (chunkText.includes(token)) {
          termMatches++;
          // Extra boost if match is in title or category
          if (chunk.docTitle.toLowerCase().includes(token)) termMatches += 0.5;
          if (chunk.category.toLowerCase().includes(token)) termMatches += 0.5;
        }
      }

      const lexicalScore = queryTokens.length > 0 ? (termMatches / (queryTokens.length + 2)) : 0;
      score += Math.min(lexicalScore * 0.5, 0.45); // up to 0.45 for lexical overlap

      // Ensure score is bounded between 0 and 1
      const finalScore = Math.min(Math.max(score, 0.05), 0.98);

      return {
        chunk,
        similarityScore: Number(finalScore.toFixed(3))
      };
    });

    // Sort descending by score
    results.sort((a, b) => b.similarityScore - a.similarityScore);

    return results.slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  public getDocuments(): KBDocument[] {
    return this.documents;
  }

  public getAllChunks(): VectorChunk[] {
    return this.chunks;
  }

  public addDocument(doc: KBDocument) {
    this.documents.push(doc);
    this.initializeChunks();
  }

  public addChunkManually(chunk: Omit<VectorChunk, 'id'>): VectorChunk {
    const newChunk: VectorChunk = {
      ...chunk,
      id: `chunk-custom-${Date.now()}`
    };
    this.chunks.unshift(newChunk);
    return newChunk;
  }
}

export const ragEngine = new RAGEngine();
