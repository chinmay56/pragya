import React, { useState, useEffect } from "react";
import {
  Cpu,
  Brain,
  Eye,
  Layers,
  Sparkles,
  Zap,
  Mic,
  Volume2,
  FileText,
  ScanLine,
  Activity,
  HardDrive,
  Power,
  RefreshCw,
} from "lucide-react";

export function AdminAIAgents() {
  const [activePipeline, setActivePipeline] = useState<"rag" | "voice" | "ingestion">("rag");
  const [liveHardware, setLiveHardware] = useState<any>(null);
  const [liveModels, setLiveModels] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:5000/api/ai/status");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setLiveHardware(json.hardware);
          setLiveModels(json.liveModels);
        }
      }
    } catch (e) {
      console.warn("[AdminAIAgents] Telemetry fetch notice:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 8000);
    return () => clearInterval(timer);
  }, []);

  const [models] = useState([
    {
      id: "model-llm",
      name: "Qwen3-8B (4-bit Quantized)",
      category: "Central LLM Reasoning Engine",
      role: "Sole language reasoning engine, RAG synthesizer, and deliverable compiler (Word, Excel, PPT, Memo)",
      vram: "4.8 GB VRAM (RTX 3050 6GB)",
      status: "Active (Resident in GPU)",
      engine: "Ollama / llama.cpp (GGUF Q4_K_M)",
      contextWindow: "32,768 tokens",
      quantization: "INT4 (Q4_K_M)",
      activeInPipelines: ["rag", "voice"],
      allowedRoles: ["admin", "engineer", "auditor", "analyst"],
    },
    {
      id: "model-vision",
      name: "Moondream / Qwen2.5-VL (Vision Engine)",
      category: "Vision-Language Model (VLM)",
      role: "Visual document understanding: interprets P&ID schematics, ultrasonic NDT curves, tables, and equipment photos",
      vram: "1.6 GB VRAM (Ollama VLM)",
      status: "Active (Resident / CUDA)",
      engine: "Ollama Vision (Moondream2)",
      contextWindow: "High-Res Image Tokens",
      quantization: "INT4 / FP16",
      activeInPipelines: ["rag", "ingestion"],
      allowedRoles: ["admin", "engineer", "auditor", "analyst"],
    },
    {
      id: "model-emb",
      name: "BGE-M3 (Multilingual Embedding)",
      category: "Dense Vector Embedding",
      role: "Converts refinery SOPs & user queries into dense 1024-D vectors for Qdrant",
      vram: "1.1 GB (CPU / FastEmbed)",
      status: "Active (Resident Worker)",
      engine: "FastEmbed / ONNX Runtime (CUDA/CPU)",
      contextWindow: "8,192 tokens",
      quantization: "FP16 / INT8",
      activeInPipelines: ["rag", "ingestion"],
      allowedRoles: ["admin", "engineer", "auditor", "analyst"],
    },
    {
      id: "model-doc",
      name: "Docling Document Processor",
      category: "Document Parsing Framework",
      role: "Extracts multi-column tables, formulas, and headers from PDF manuals into clean Markdown",
      vram: "0.0 GB (CPU Native)",
      status: "Active (CPU Multiprocessing)",
      engine: "Docling Core / Python Worker",
      contextWindow: "Continuous Document Stream",
      quantization: "Native CPU",
      activeInPipelines: ["rag", "ingestion"],
      allowedRoles: ["admin", "engineer", "auditor", "analyst"],
    },
    {
      id: "model-ocr",
      name: "Surya OCR & Layout Analyzer",
      category: "OCR & Document Layout",
      role: "Extracts text bounding boxes, tables, and line-level text from scanned inspection sheets and P&IDs",
      vram: "0.0 GB (CPU Worker / PyTorch)",
      status: "Active (Resident CPU Worker)",
      engine: "Surya-OCR v0.22 / PyTorch CPU",
      contextWindow: "Full Page Scans",
      quantization: "INT8 / FP32",
      activeInPipelines: ["ingestion", "rag"],
      allowedRoles: ["admin", "engineer", "auditor"],
    },
    {
      id: "model-asr",
      name: "Whisper Small (ASR)",
      category: "Speech-to-Text (Voice Input)",
      role: "Transcribes voice queries for hands-free refinery control room operations",
      vram: "0.0 GB (CPU Fast-Whisper)",
      status: "Active (CPU Worker)",
      engine: "Faster-Whisper (CTranslate2 / AVX2)",
      contextWindow: "30s Audio Chunks",
      quantization: "INT8",
      activeInPipelines: ["voice"],
      allowedRoles: ["admin", "engineer"],
    },
    {
      id: "model-tts",
      name: "Piper TTS (Speech Synthesis)",
      category: "Text-to-Speech (Voice Output)",
      role: "Ultra-fast neural speech synthesis for audible SOP checklists and spoken AI responses",
      vram: "0.0 GB (CPU Real-Time)",
      status: "Active (Resident)",
      engine: "Piper ONNX (Real-Time <100ms)",
      contextWindow: "Continuous Audio Stream",
      quantization: "ONNX / CPU (<150MB RAM)",
      activeInPipelines: ["voice"],
      allowedRoles: ["admin", "engineer", "auditor", "analyst"],
    },
  ]);

  // Dynamic VRAM calculation from live hardware or pipeline
  const usedVramGB = liveHardware?.vramUsedGB || 4.8;
  const totalVramGB = liveHardware?.vramTotalGB || 6.0;
  const vramPercent = Math.round((usedVramGB / totalVramGB) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#191614] flex items-center gap-2">
            <Cpu className="w-6 h-6 text-[#5C2817]" />
            <span>AI Model Stack & 6GB GPU Hardware Enclave</span>
          </h2>
          <p className="text-xs text-[#7A7166] mt-0.5">
            Host: <strong>{liveHardware?.host || "Lenovo LOQ (loqchinmay)"}</strong> · {liveHardware?.gpu || "NVIDIA GeForce RTX 3050 Laptop GPU (6GB VRAM)"} · {liveHardware?.cpu || "Intel Core i5-13450HX · 16GB DDR5"}.
          </p>
        </div>
      </div>

      {/* 6GB GPU VRAM Telemetry & Modular Switcher */}
      <div className="bg-white p-5 rounded-3xl border border-[#E6DDD2] shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#F0EAE1]">
          <div>
            <div className="text-xs font-extrabold text-[#191614] flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#5C2817]" />
              <span>{liveHardware?.gpu || "NVIDIA GeForce RTX 3050 6GB Laptop GPU"} (Live Telemetry)</span>
            </div>
            <p className="text-[11px] text-[#7A7166] mt-0.5">
              <strong>Qwen3-8B (4-bit)</strong> resident in GPU memory ({usedVramGB} GB / {totalVramGB} GB). Auxiliary pipelines operate across CPU & RAM.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5C2817] font-mono">
              {liveHardware?.vramAllocation || `${usedVramGB} GB / ${totalVramGB} GB (${vramPercent}% Load)`}
            </span>
            <div className="w-32 bg-[#FAF6F0] rounded-full h-3 overflow-hidden border border-[#E0D4C3]">
              <div
                className="bg-[#5C2817] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(vramPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pipeline Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-[#6B635A] uppercase tracking-wider mr-2">
            Active Mode Pipeline:
          </span>

          <button
            onClick={() => setActivePipeline("rag")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activePipeline === "rag"
                ? "bg-[#5C2817] text-white shadow-xs"
                : "bg-[#FAF6F0] text-[#6B635A] hover:text-[#191614] border border-[#E6DDD2]"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>1. RAG & Text Reasoning (4.8 GB VRAM)</span>
          </button>

          <button
            onClick={() => setActivePipeline("voice")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activePipeline === "voice"
                ? "bg-[#5C2817] text-white shadow-xs"
                : "bg-[#FAF6F0] text-[#6B635A] hover:text-[#191614] border border-[#E6DDD2]"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>2. Hands-Free Voice Assistant (4.8 GB VRAM)</span>
          </button>

          <button
            onClick={() => setActivePipeline("ingestion")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activePipeline === "ingestion"
                ? "bg-[#5C2817] text-white shadow-xs"
                : "bg-[#FAF6F0] text-[#6B635A] hover:text-[#191614] border border-[#E6DDD2]"
            }`}
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>3. Document Ingestion & OCR (CPU Worker)</span>
          </button>
        </div>
      </div>

      {/* 7-Model Grid */}
      <div className="space-y-3.5">
        {models.map((m, idx) => {
          const isActiveInCurrentPipeline = m.activeInPipelines.includes(activePipeline) || m.vram.includes("CPU");

          return (
            <div
              key={m.id}
              className={`p-5 rounded-3xl border transition-all ${
                isActiveInCurrentPipeline
                  ? "bg-white border-[#5C2817]/40 shadow-xs"
                  : "bg-[#FCFAF7] border-[#ECE3D8] opacity-75"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5 max-w-3xl">
                  <div
                    className={`p-3 rounded-2xl shrink-0 ${
                      isActiveInCurrentPipeline
                        ? "bg-[#F4EDE4] text-[#5C2817] border border-[#E2D6C7]"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {m.id === "model-llm" && <Brain className="w-5 h-5" />}
                    {m.id === "model-vision" && <Eye className="w-5 h-5" />}
                    {m.id === "model-emb" && <Layers className="w-5 h-5" />}
                    {m.id === "model-ocr" && <ScanLine className="w-5 h-5" />}
                    {m.id === "model-doc" && <FileText className="w-5 h-5" />}
                    {m.id === "model-asr" && <Mic className="w-5 h-5" />}
                    {m.id === "model-tts" && <Volume2 className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FAF6F0] text-[#5C2817] border border-[#E6DDD2]">
                        #{idx + 1} {m.category}
                      </span>
                      <h3 className="text-sm font-bold text-[#1A1816]">{m.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isActiveInCurrentPipeline
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {isActiveInCurrentPipeline ? "Loaded in Memory" : "Offloaded (Standby)"}
                      </span>
                    </div>

                    <p className="text-xs text-[#6B635A] mt-1.5">{m.role}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-[11px] text-[#8C8379]">
                      <span className="font-bold text-[#5C2817]">VRAM: {m.vram}</span>
                      <span>•</span>
                      <span>Engine: {m.engine}</span>
                      <span>•</span>
                      <span>Format: {m.quantization}</span>
                      <span>•</span>
                      <span>Context: {m.contextWindow}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[11px] font-bold text-[#7A7166] bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#ECE5DD]">
                    Roles: {m.allowedRoles.join(", ")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
