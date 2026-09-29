import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import knowledgeRoutes from "./routes/knowledge.routes";
import taskRoutes from "./routes/task.routes";
import aiRoutes from "./routes/ai.routes";
import chatRoutes from "./routes/chat.routes";
import { testConnection } from "./config/db";
import { testQdrantConnection, initQdrantCollections } from "./config/qdrant";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

// Middleware
app.use(cors({
  origin: [CORS_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Request & Response performance logger
app.use((req, res, next) => {
  const start = Date.now();
  const { method, url } = req;
  const timestamp = new Date().toLocaleTimeString();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor = status >= 500 ? "❌" : status >= 400 ? "⚠️" : "✅";
    console.log(`[${timestamp}] ${statusColor} [HTTP] ${method.padEnd(6)} ${url.padEnd(35)} -> ${status} (${duration}ms)`);
  });

  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Sovereign AI Workbench for MRPL - Backend Service",
    llmEngine: "Qwen3-8B (Ollama Local CUDA)",
    vectorDB: "Qdrant (Air-gapped)",
    database: "MySQL 8.0+",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// Start Server
async function startServer() {
  console.log("---------------------------------------------------------");
  console.log("Starting Sovereign AI Workbench for MRPL (Backend API)...");
  console.log("---------------------------------------------------------");

  // Test MySQL connection
  await testConnection();

  // Test Qdrant Vector DB connection & initialize collections
  const qdrantStatus = await testQdrantConnection();
  if (qdrantStatus.connected) {
    await initQdrantCollections();
  }

  app.listen(PORT, () => {
    console.log(`[Server] MRPL Sovereign AI Backend running on http://localhost:${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/health`);
    console.log(`[Server] Auth: /api/auth | Knowledge: /api/knowledge | Tasks: /api/tasks`);
    console.log("---------------------------------------------------------");
  });
}

startServer();
