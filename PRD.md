# Sovereign AI Workbench for MRPL

**Organization:** Mangalore Refinery and Petrochemicals Limited (MRPL)  
**Product Type:** Secure, Self-Hosted, Air-Gapped Multi-Model AI Workbench  
**Version:** 2.4 (NVIDIA RTX 3050 6GB Laptop GPU + Single Qwen3-8B LLM Architecture)  
**Host Target:** Lenovo LOQ (`loqchinmay`) — Intel Core i5-13450HX (10 Cores, 16 Threads), 16GB RAM, NVIDIA GeForce RTX 3050 6GB Laptop GPU  
**User Roles:** System Administrator (`admin`), Refinery Engineer (`engineer`), Technical Auditor (`auditor`), Process Analyst (`analyst`)  
**Hardware Constraint Target:** Dedicated 6.0 GB VRAM GPU Budget + 16GB System RAM + ~52GB Storage Headroom  
**Data Classification:** Strictly Confidential / On-Premises Only  

---

## 1. Product Overview & Vision

The **Sovereign AI Workbench for MRPL** is a secure, 100% locally hosted, air-gapped enterprise AI platform tailored for the mission-critical operations of **Mangalore Refinery and Petrochemicals Limited (MRPL)**.

The platform enables authorized refinery personnel, chemical engineers, inspection auditors, and plant managers to:
1. Interactively query organizational knowledge (Standard Operating Procedures, Non-Destructive Testing inspection reports, Piping & Instrumentation Diagrams, and catalyst manuals).
2. Process multi-modal engineering documents, P&IDs, and scanned inspection sheets.
3. Interact via voice inputs (hands-free plant operations) and receive spoken responses.
4. Automatically generate operational deliverables (Executive Approval Notes, Board Review Memorandums, Technical Audit Spreadsheets, and Slide Decks) formatted for instant download (`.docx`, `.xlsx`, `.pptx`, `.pdf`).
5. Maintain strict sovereignty with **Zero External Cloud Data Egress** and ISO-27001 compliant audit logging on a **6GB RTX 3050 GPU budget**.

---

## 2. Refined AI Model Stack (NVIDIA RTX 3050 6GB + 16GB RAM)

The architecture leverages **Qwen3-8B (4-bit quantized)** as the single resident reasoning LLM inside the 6GB GPU VRAM, while routing embedding, parsing, OCR, and speech tools to the high-performance 10-core Intel Core i5-13450HX CPU and 16GB System RAM:

| No. | Model / Tool | Category | Primary Role | Memory & Execution Profile |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Qwen3-8B (4-bit quantized)** | Central Reasoning LLM | Sole language reasoning engine, RAG answer generation, and deliverable report compiler | **~4.8 GB VRAM** (RTX 3050 6GB GPU) |
| **2** | **LLaVA-7B / Qwen2.5-VL (Full Vision Model)** | Vision-Language Model (VLM) | High-fidelity visual document reasoning, P&ID schematics, chart curves & layout understanding | **~3.8–4.2 GB VRAM/RAM** (On-Demand Multi-Modal Engine) |
| **3** | **BGE-M3** | Dense Text Embedding Model | Multilingual dense 1024-D vector retrieval for Qdrant knowledge base | **0.0 GB VRAM** (~0.8 GB System RAM / FastEmbed CPU) |
| **4** | **Docling** | Document Processing Framework | High-fidelity PDF structure, table, and formula extraction into clean Markdown | **0.0 GB VRAM** (~1.2 GB System RAM / CPU Multiprocessing) |
| **5** | **Surya OCR** | OCR & Document Layout Engine | Text recognition and bbox layout analysis for scanned NDT sheets | **0.0 GB VRAM** (~1.0 GB System RAM / PyTorch CPU) |
| **6** | **Whisper Small** | Speech-to-Text (ASR) | Voice query transcription for hands-free control room operations | **0.0 GB VRAM** (~0.8 GB System RAM / Faster-Whisper CPU) |
| **7** | **Piper TTS** | Text-to-Speech (TTS) | Ultra-fast local neural voice synthesis for audible SOP checklists | **0.0 GB VRAM** (~0.15 GB System RAM / ONNX CPU) |

---

## 3. Detailed Model Use Cases & Justifications

### 1. Qwen3-8B (4-bit Quantized)
- **Category:** Large Language Model (LLM)
- **Role:** Central reasoning and deliverable synthesis engine.
- **Use Cases:**
  - Answering operational queries grounded on MRPL standard operating procedures.
  - Summarizing high-pressure boiler NDT inspection audits.
  - Generating structured Word (.docx), PowerPoint (.pptx), and Excel (.xlsx) reports.
  - Multi-turn conversational engineering assistance with reasoning traces.
- **Justification:** State-of-the-art reasoning benchmark in the 8B class. 4-bit quantization reduces memory footprint to ~4.8 GB, fitting comfortably within the 8GB GPU constraint while retaining mathematical fidelity.

### 2. Qwen2.5-VL-3B-Instruct
- **Category:** Vision-Language Model (VLM)
- **Role:** Visual understanding and technical diagram analysis.
- **Use Cases:**
  - Deconstructing scanned Piping & Instrumentation Diagrams (P&IDs) and identifying ISA-5.1 tags.
  - Interpreting ultrasonic weld thickness inspection curves and heat exchanger schematics.
  - Answering visual queries over equipment photographs from turnaround inspections.
- **Justification:** Provides direct pixel-to-token visual understanding without requiring complex external multi-stage OCR pipelines, consuming only ~3.2 GB VRAM.

### 3. BGE-M3
- **Category:** Multilingual Text Embedding Model
- **Role:** Semantic vector search and retrieval for the Qdrant knowledge base.
- **Use Cases:**
  - Converting refinery documents and SOPs into dense 1024-D / 384-D vector points.
  - Converting user queries into high-precision vectors for Cosine distance retrieval.
  - Multilingual semantic matching (cross-lingual technical terminology).
- **Justification:** Superior retrieval performance across complex technical phrasing and dense engineering standards; operates efficiently with low memory footprint (~0.8 GB).

### 4. Surya OCR
- **Category:** Optical Character Recognition & Document Layout Engine
- **Role:** Text extraction and layout segmentation for scanned archives.
- **Use Cases:**
  - Segmenting columns, tables, headers, and stamps on legacy MRPL scanned PDFs.
  - Detecting bounding boxes on P&ID legend blocks and equipment data plates.
- **Justification:** Modern line-level OCR with exceptional layout awareness, outperforming legacy OCR on rotated text and dense industrial tabular scans.

### 5. Docling
- **Category:** Document Processing Framework
- **Role:** Document structure extraction and table decomposition.
- **Use Cases:**
  - Converting native PDF SOPs into clean Markdown / JSON AST representations.
  - Extracting multi-column data sheets into clean tabular structures for RAG chunking.
- **Justification:** Preserves structural hierarchy (headers, sub-clauses, table grids) vital for refinery standard references.

### 6. Whisper Small
- **Category:** Speech-to-Text (ASR)
- **Role:** Converts spoken user voice queries into text prompts.
- **Use Cases:**
  - Enabling hands-free voice search for field engineers in control rooms or plant units.
  - Transcribing voice memos into formal incident summaries.
- **Justification:** High accuracy on accented English and technical terms with low latency and lightweight footprint (~1.0 GB).

### 7. Piper TTS
- **Category:** Text-to-Speech (TTS)
- **Role:** Converts AI responses into natural spoken audio.
- **Use Cases:**
  - Reading emergency shutdown SOP checklists aloud in real time.
  - Voice feedback for hands-free operational verification.
- **Justification:** Ultra-fast, lightweight, deterministic CPU speech synthesis with zero GPU VRAM overhead.

---

## 4. End-to-End Multimodal Execution Pipelines

### Pipeline A: Document Ingestion & RAG
```
[ Document Upload: SOP / NDT PDF ]
               │
               ▼
           [ Docling ] ──(If Scanned)──► [ Surya OCR ]
               │
               ▼
     [ Structured Markdown & Tables ]
               │
               ▼
     [ Semantic Chunking (512 tokens) ]
               │
               ▼
        [ BGE-M3 Embedding ]
               │
               ▼
  [ Qdrant Vector DB (Dense Points) ]
               │
        (User Question)
               │
               ▼
      [ Relevant SOP Passages ]
               │
               ▼
    [ Qwen3-8B (4-bit Quantized) ]
               │
               ▼
  [ Grounded Answer & Deliverable ]
```

### Pipeline B: Multimodal Diagram & P&ID Analysis
```
[ P&ID Drawing / Equipment Image ]
               │
               ▼
    [ Qwen2.5-VL-3B-Instruct ]
               │
               ▼
  [ Visual Feature & Tag Extraction ]
               │
               ▼
    [ Qwen3-8B Reasoning Bridge ]
               │
               ▼
  [ Technical Specification & Analysis ]
```

### Pipeline C: Hands-Free Voice Interaction
```
[ Engineer Voice Input (Mic) ]
               │
               ▼
      [ Whisper Small ASR ]
               │
               ▼
         [ Text Query ]
               │
               ▼
  [ RAG Context + Qwen3-8B ]
               │
               ▼
      [ Generated Response ]
               │
               ▼
       [ Piper TTS Audio ]
               │
               ▼
    [ Spoken Audio Output ]
```

---

## 5. Modular Memory Management for 8GB GPU Constraint

To operate reliably within an **8GB VRAM envelope**, the workbench uses a **Dynamic Modular Offload & Pipeline Swapping Strategy**:

| Active Task Mode | GPU Resident Models (VRAM) | CPU / RAM Resident Models | Total VRAM Used |
| :--- | :--- | :--- | :--- |
| **Standard RAG / Text Workflow** | `Qwen3-8B 4-bit` (4.8 GB) + `BGE-M3` (0.8 GB) | `Docling` (CPU) + `Piper TTS` (CPU) | **~5.6 GB / 8.0 GB** ✅ |
| **Visual / P&ID Analysis Mode** | `Qwen2.5-VL-3B` (3.2 GB) + `Surya OCR` (1.2 GB) | `Docling` (CPU) | **~4.4 GB / 8.0 GB** ✅ |
| **Voice Interaction Mode** | `Qwen3-8B 4-bit` (4.8 GB) + `Whisper Small` (1.0 GB) | `Piper TTS` (CPU) | **~5.8 GB / 8.0 GB** ✅ |
| **Batch Ingestion Mode** | `BGE-M3` (0.8 GB) + `Surya OCR` (1.2 GB) | `Docling` (CPU) | **~2.0 GB / 8.0 GB** ✅ |

---

## 6. Full Workbench Module Specifications

### Module 1: Admin Module (Governance & Infrastructure)
1. **Admin Dashboard:** Telemetry on active models, 8GB GPU VRAM allocation, Qdrant vector counts, and throughput.
2. **User Management & RBAC:** Enforce strict **Admin Approval** workflow (`pending` $\rightarrow$ `approved`/`rejected`).
3. **Central Knowledge Base:** Manage Qdrant collections (`mrpl_refinery_sops`, `mrpl_inspection_reports`, `mrpl_technical_manuals`, `mrpl_engineering_pids`, `mrpl_project_documents`) with Vector Inspector.
4. **AI Models & Agents Engine:** Dynamic runtime controller for the 7 models with temperature, context limit, and VRAM throttle controls.
5. **Task Monitoring & ISO-27001 Audit Trail:** Log user, timestamp, model ID, latency, and operational unit.
6. **Sovereign Enclave Settings:** Manage air-gap security keys, network isolation, and cluster storage.

### Module 2: User Module (Engineering Execution & Deliverables)
1. **User Dashboard:** Unit projects, quick actions (Generate Note, Boiler NDT Audit, Turnaround Plan).
2. **AI Engineering Assistant:** Text, image upload (P&ID analysis via Qwen2.5-VL), and voice dictation (Whisper Small + Piper TTS).
3. **My Projects:** CDU Turnaround 2026, DHDS Catalyst Reactivation, 25MW Captive Boiler Inspection.
4. **Semantic Knowledge Search:** Vector search powered by BGE-M3 + Qdrant with source citations.
5. **Task Execution History:** Deliverable downloads (`.docx`, `.xlsx`, `.pptx`, `.pdf`).
6. **User Profile & Credentials:** Role badge, security clearance, and access logs.

---

## 7. Context Persistence Rules for AI Development
1. **Strict 8GB GPU Budget:** Never assume multi-H100 cloud infrastructure; all components must respect the modular 8GB memory budget and 4-bit quantization.
2. **Folder Architecture:** Keep `frontend/` (Next.js) and `backend/` (Express) strictly organized in their respective directories.
3. **Airtight Approval Gatekeeping:** Users must be approved by an Admin before accessing the workbench.
4. **100% Offline & Sovereign:** Zero internet or external API calls permitted.
