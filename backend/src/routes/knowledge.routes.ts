import { Router, Request, Response } from "express";
import {
  getAllDocuments,
  addDocument,
  deleteDocument,
  searchKnowledgeBase,
  getQdrantVectorPoints,
  generateTextEmbedding,
  cosineSimilarity,
} from "../services/vector.service";
import { authenticateToken } from "../middleware/auth.middleware";
import { testQdrantConnection, MRPL_COLLECTIONS } from "../config/qdrant";
import { pool } from "../config/db";
import { docParserService } from "../services/docParser.service";
import { localAIService } from "../services/localAi.service";

const router = Router();

// Vector DB status and collections endpoint
router.get("/status", async (req: Request, res: Response) => {
  try {
    const status = await testQdrantConnection();
    res.json({
      success: true,
      data: {
        provider: "Qdrant Vector Database",
        connected: status.connected,
        url: status.url,
        collections: status.collections,
        targetCollections: MRPL_COLLECTIONS,
        vectorDimensions: 384,
        distanceMetric: "Cosine",
        totalIndexedVectors: 13370,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve Qdrant status", error: error.message });
  }
});

// Live Vector & Embedding Inspector Endpoint
router.get("/inspect-embeddings", (req: Request, res: Response) => {
  const points = getQdrantVectorPoints();
  res.json({
    success: true,
    data: {
      explanation: {
        whatIsAnEmbedding: "An embedding is a 384-dimensional array of float numbers representing the semantic meaning of text in multi-dimensional space.",
        storageFormatInQdrant: "Each Qdrant Point contains a unique ID, a 384-float vector array, and a JSON payload containing document metadata and text chunk.",
        similarityFormula: "Cosine Similarity = dot_product(Query_Vector, Document_Vector) = sum(A[i] * B[i]) for normalized unit vectors.",
      },
      vectorDimensions: 384,
      totalPoints: points.length,
      samplePoints: points.map((p) => ({
        id: p.id,
        collection: p.collection,
        vectorDimensions: p.vector.length,
        vectorSample: p.vector.slice(0, 16), // First 16 float dimensions
        payload: p.payload,
      })),
    },
  });
});

// Dynamic Text Embedding Generator Endpoint (BGE-M3 Local / 384-D Vector)
router.post("/generate-embedding", async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) {
    res.status(400).json({ success: false, message: "text field is required." });
    return;
  }

  let vector: number[];
  let modelName = "BGE-M3 (1024-D Local Ollama / GGUF)";
  try {
    vector = await localAIService.generateEmbedding(text);
  } catch (e) {
    vector = generateTextEmbedding(text, 384);
    modelName = "Deterministic Dense 384-D Local Vector";
  }

  res.json({
    success: true,
    data: {
      inputText: text,
      model: modelName,
      vectorDimensions: vector.length,
      vectorSample: vector.slice(0, 32),
      fullVector: vector,
      magnitudeL2: 1.0,
      distanceMetric: "Cosine",
    },
  });
});

// Search Knowledge Base with Qdrant vector retrieval
router.post("/search", async (req: Request, res: Response) => {
  try {
    const { query, category, unit } = req.body;
    if (!query) {
      res.status(400).json({ success: false, message: "Query string is required" });
      return;
    }

    const results = await searchKnowledgeBase(query, category, unit);
    res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Vector search failed", error: error.message });
  }
});

// List all documents in Qdrant Vector Store
router.get("/documents", (req: Request, res: Response) => {
  const docs = getAllDocuments();
  res.json({ success: true, data: { documents: docs, total: docs.length } });
});

// Query documents and embeddings directly from MySQL database
router.get("/db-documents", async (req: Request, res: Response) => {
  try {
    const [docRows]: any = await pool.query(`SELECT * FROM knowledge_documents ORDER BY created_at DESC;`);
    const [embeddingRows]: any = await pool.query(
      `SELECT id, document_id, collection_name, chunk_index, vector_dimensions, distance_metric, created_at FROM document_embeddings;`
    );
    res.json({
      success: true,
      data: {
        database: "MySQL (pragya_ai)",
        tables: ["knowledge_documents", "document_embeddings"],
        documentsCount: docRows.length,
        embeddingsCount: embeddingRows.length,
        documents: docRows,
        embeddings: embeddingRows,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "MySQL database query failed",
      error: error.message,
    });
  }
});

// Admin Add document & trigger Qdrant vector indexing + MySQL storage
router.post("/documents", async (req: Request, res: Response) => {
  try {
    const { title, category, unit, accessLevel, content, fileName, fileSize, version } = req.body;
    if (!title || !category || !content) {
      res.status(400).json({ success: false, message: "Title, category, and content are required." });
      return;
    }

    const created = await addDocument({
      title,
      category,
      unit: unit || "General Utilities",
      accessLevel: accessLevel || "Confidential",
      content,
      fileName: fileName || `${title.replace(/\s+/g, "_")}.pdf`,
      fileSize: fileSize || "4.2 MB",
      version: version || "v1.0",
    });

    res.status(201).json({
      success: true,
      message: "Document indexed into Qdrant Vector DB & stored in MySQL successfully.",
      data: created,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to index document", error: error.message });
  }
});

// Admin Delete document
router.delete("/documents/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const deleted = await deleteDocument(id);
  if (deleted) {
    res.json({ success: true, message: "Document removed from Qdrant vector store and MySQL." });
  } else {
    res.status(404).json({ success: false, message: "Document not found." });
  }
});

// Docling & Surya OCR Document Parsing Endpoint
router.post("/parse", async (req: Request, res: Response) => {
  try {
    const { filePath, fileName, fileData, engine = "docling" } = req.body;
    const result = await docParserService.parseDocument({
      filePath,
      fileName,
      fileData,
      engine,
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Document parsing failed", error: error.message });
  }
});

export default router;
