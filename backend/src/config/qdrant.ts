import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";

dotenv.config();

const rawUrl = process.env.QDRANT_URL || "http://localhost:6333";
const QDRANT_URL = rawUrl.startsWith("https://") ? rawUrl.replace(/:6333$/, "") : rawUrl;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || undefined;

export const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
  checkCompatibility: false,
});

// MRPL Core Vector Collections
export const MRPL_COLLECTIONS = {
  SOPS: "mrpl_refinery_sops",
  INSPECTION_REPORTS: "mrpl_inspection_reports",
  TECHNICAL_MANUALS: "mrpl_technical_manuals",
  ENGINEERING_PIDS: "mrpl_engineering_pids",
  PROJECT_DOCUMENTS: "mrpl_project_documents",
};

export async function initQdrantCollections(): Promise<void> {
  try {
    const existing = await qdrantClient.getCollections();
    const existingNames = new Set(existing.collections.map((c) => c.name));

    for (const [key, collectionName] of Object.entries(MRPL_COLLECTIONS)) {
      if (!existingNames.has(collectionName)) {
        await qdrantClient.createCollection(collectionName, {
          vectors: {
            size: 384, // Standard all-MiniLM-L6-v2 or bge-small on-prem vector embedding size
            distance: "Cosine",
          },
          optimizers_config: {
            default_segment_number: 2,
          },
          replication_factor: 1,
        });
        console.log(`[Qdrant] Created collection "${collectionName}" with Cosine metric`);
      }
    }
    console.log(`[Qdrant] Vector DB collections verified successfully.`);
  } catch (error: any) {
    console.warn(`[Qdrant Notice] Qdrant cluster initialization skipped (service unreachable at ${QDRANT_URL}: ${error.message}). Local vector memory index active.`);
  }
}

export async function testQdrantConnection(): Promise<{ connected: boolean; collections: string[]; url: string }> {
  try {
    const result = await qdrantClient.getCollections();
    const names = result.collections.map((c) => c.name);
    console.log(`[Qdrant] Connected to Qdrant Vector DB at ${QDRANT_URL}. Collections:`, names);
    return { connected: true, collections: names, url: QDRANT_URL };
  } catch (error: any) {
    return { connected: false, collections: Object.values(MRPL_COLLECTIONS), url: QDRANT_URL };
  }
}
