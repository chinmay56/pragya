"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  Image as ImageIcon,
  Table as TableIcon,
  BarChart2,
  Paperclip,
  ArrowRight,
  ChevronDown,
  MessageSquare,
  Folder,
  Layers,
  CheckCircle2,
  Sparkles,
  Download,
  RotateCcw,
  FileSpreadsheet,
  FileCheck,
  LogOut,
  User,
  ScanLine,
  Lock,
  Loader2,
} from "lucide-react";
import { TempleLogo } from "./TempleLogo";
import { useAuth } from "@/context/AuthContext";

interface InteractiveWorkbenchProps {
  isFullScreen?: boolean;
  onCloseFullScreen?: () => void;
}

type TabType = "new-task" | "documents" | "projects" | "knowledge-base";

export function InteractiveWorkbench({
  isFullScreen = false,
  onCloseFullScreen,
}: InteractiveWorkbenchProps) {
  const { isLoggedIn, user, requireAuth, openAuthModal, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("new-task");
  const [selectedModel, setSelectedModel] = useState("Qwen3 (Auto)");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedResult, setCompletedResult] = useState<{
    query: string;
    title: string;
    summary: string;
    steps: string[];
    deliverableType: "pdf" | "excel" | "memo" | "cad";
    deliverableName: string;
    deliverableSize: string;
    findings: { label: string; value: string; status: "good" | "warning" | "verified" }[];
  } | null>(null);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadDeliverable = async () => {
    if (!completedResult) return;
    setIsDownloadingDocx(true);
    try {
      const findingsMarkdown = completedResult.findings
        .map((f) => `| **${f.label}** | ${f.value} | ${f.status.toUpperCase()} |`)
        .join("\n");

      const contentMarkdown = `# Executive Summary\n${completedResult.summary}\n\n` +
        `### Key Verified Metrics & Operational Parameters\n` +
        `| Parameter / Check Item | Inspection Value | Compliance Status |\n` +
        `| :--- | :--- | :--- |\n` +
        findingsMarkdown + `\n\n` +
        `### Verification & Compliance Steps Executed\n` +
        completedResult.steps.map((s, idx) => `${idx + 1}. ${s}`).join("\n") + `\n\n` +
        `> **SOVEREIGN AUDIT DIRECTIVE:** This deliverable has been generated and validated strictly on-premises on the MRPL Sovereign AI Workbench without external data egress.`;

      const res = await fetch("http://localhost:5000/api/ai/generate-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: completedResult.title,
          content: contentMarkdown,
          metadata: {
            author: user?.name ? `${user.name} (${user.role})` : "Chinmay (Lead Process Engineer)",
            use: completedResult.title,
            date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
            classification: "MRPL Confidential",
          },
          watermark: "MRPL CONFIDENTIAL",
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const a = document.createElement("a");
          a.href = `http://localhost:5000${json.downloadUrl}`;
          a.download = json.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }
    } catch (err) {
      console.error("Failed to generate and download deliverable:", err);
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  const models = [
    { id: "qwen3-auto", name: "Qwen3 (Auto)", desc: "Optimal routing across local nodes" },
    { id: "deepseek-r1", name: "DeepSeek-R1 (Air-gapped)", desc: "Full reasoning on private GPU cluster" },
    { id: "llama-3.3", name: "Llama-3.3 70B (Local)", desc: "High throughput general instruction" },
    { id: "qwen-coder", name: "Qwen 2.5 Coder 32B", desc: "Industrial automation & formula script" },
    { id: "mistral-large", name: "Mistral Large 2 (Self-Hosted)", desc: "Multilingual technical documents" },
  ];

  const quickActions = [
    {
      id: "analyze-doc",
      title: "Analyze Document",
      icon: FileText,
      samplePrompt: "Extract technical parameters, compliance checklists, and deviation risks from Turbine_Inspection_Spec_v2.pdf",
      deliverable: {
        title: "Turbine Inspection Spec Audit",
        summary: "Analyzed 48 pages of engineering specifications. All hydraulic pressure tolerances comply with ASME Section VIII with 1 flagged relief valve exception.",
        steps: [
          "Parsing on-premise PDF structure (48 pages indexed)",
          "Cross-referencing ASME Section VIII Div 1 rules",
          "Generating compliance discrepancy matrix",
          "Compiling signed Technical Audit Note",
        ],
        deliverableType: "pdf" as const,
        deliverableName: "Turbine_Compliance_Audit_Report.pdf",
        deliverableSize: "2.4 MB",
        findings: [
          { label: "Design Pressure", value: "350 PSI (Verified)", status: "verified" as const },
          { label: "Relief Valve PRV-402", value: "Recalibration required (+4.2% drift)", status: "warning" as const },
          { label: "ASME Stamp Compliance", value: "Class 1 Pass", status: "good" as const },
        ],
      },
    },
    {
      id: "understand-img",
      title: "Understand Image",
      icon: ImageIcon,
      samplePrompt: "Analyze the uploaded P&ID schematic diagram: identify all control valves, sensor loops, and bypass lines.",
      deliverable: {
        title: "P&ID Schematic Decomposition",
        summary: "Identified 14 control valves (FCV/PCV), 6 redundant sensor loops (TT-101 to TT-106), and 2 emergency shutdown bypass circuits from technical raster drawing.",
        steps: [
          "Running localized high-res vision OCR on schematics",
          "Isolating ISA-5.1 instrumentation tags",
          "Validating fail-safe actuator states (Fail-Closed)",
          "Building automated Valve Schedule spreadsheet",
        ],
        deliverableType: "cad" as const,
        deliverableName: "PID_Instrument_Schedule_RevD.xlsx",
        deliverableSize: "840 KB",
        findings: [
          { label: "Control Valves Identified", value: "14 units (ISA-5.1 std)", status: "good" as const },
          { label: "Safety Interlock Loop", value: "SIL-2 compliant", status: "verified" as const },
          { label: "Bypass Tagging", value: "Manual override verified", status: "good" as const },
        ],
      },
    },
    {
      id: "work-sheets",
      title: "Work with Spreadsheets",
      icon: TableIcon,
      samplePrompt: "Calculate cost variances between Q3 Actual vs Capex Budget in Plant_Operations_Q3.xlsx and highlight items over 5% variance.",
      deliverable: {
        title: "Capex & Operational Variance Analysis",
        summary: "Audited 1,842 line items. Discovered a total variance of $142,300 (+3.8%) driven primarily by alloy steel procurement surcharges in August.",
        steps: [
          "Loading local workbook data (1,842 rows)",
          "Executing deterministic symbolic variance formula",
          "Detecting anomaly clusters in raw material line items",
          "Generating executive variance breakdown sheet",
        ],
        deliverableType: "excel" as const,
        deliverableName: "Q3_Capex_Variance_Executive.xlsx",
        deliverableSize: "1.1 MB",
        findings: [
          { label: "Total Capex Reconciled", value: "$4,280,000", status: "verified" as const },
          { label: "Alloy Steel Cost Surge", value: "+12.4% vs Budget", status: "warning" as const },
          { label: "Labor & O&M Variance", value: "-1.1% (Under Budget)", status: "good" as const },
        ],
      },
    },
    {
      id: "create-report",
      title: "Create Report",
      icon: BarChart2,
      samplePrompt: "Draft an Executive Approval Note for Board Review regarding the 25MW Thermal Recovery Boiler upgrade project.",
      deliverable: {
        title: "Executive Approval Note: 25MW Boiler Upgrade",
        summary: "Generated a complete 5-section formal Board Approval Note covering Project Justification, Financial IRR (21.4%), Payback Period (3.2 yrs), and Risk Mitigation.",
        steps: [
          "Aggregating engineering specifications & financial models",
          "Structuring standard corporate approval memo format",
          "Applying internal governance signature block placeholders",
          "Compiling ready-to-sign executive deliverable",
        ],
        deliverableType: "memo" as const,
        deliverableName: "Board_Approval_Note_25MW_Upgrade.pdf",
        deliverableSize: "3.1 MB",
        findings: [
          { label: "IRR / NPV", value: "21.4% / $3.8M", status: "verified" as const },
          { label: "Estimated Payback", value: "3.2 Years", status: "good" as const },
          { label: "Emission Reduction", value: "14,200 MT CO2e/yr", status: "good" as const },
        ],
      },
    },
  ];

  const handleQuickAction = (action: (typeof quickActions)[0]) => {
    requireAuth(() => {
      setPromptInput(action.samplePrompt);
      runTask(action.samplePrompt, action.deliverable);
    });
  };

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim()) return;

    requireAuth(() => {
      const matched = quickActions.find(
        (a) => promptInput.toLowerCase().includes(a.title.toLowerCase()) || promptInput.length > 5
      ) || quickActions[0];

      runTask(promptInput, matched.deliverable);
    });
  };

  const handleTabClick = (tab: TabType) => {
    if (tab === "new-task") {
      setActiveTab(tab);
    } else {
      requireAuth(() => {
        setActiveTab(tab);
      });
    }
  };

  const runTask = (query: string, deliverableData: (typeof quickActions)[0]["deliverable"]) => {
    setIsProcessing(true);
    setCompletedResult(null);

    setTimeout(() => {
      setIsProcessing(false);
      setCompletedResult({
        query,
        ...deliverableData,
      });
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    requireAuth(() => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setAttachedFiles((prev) => [...prev, files[0].name]);
      }
    });
  };

  const resetTask = () => {
    setCompletedResult(null);
    setIsProcessing(false);
    setPromptInput("");
    setAttachedFiles([]);
  };

  return (
    <div
      className={`w-full bg-[#FFFFFF] border border-[#ECE5DD] rounded-2xl shadow-[0_12px_40px_rgba(45,30,20,0.06)] overflow-hidden transition-all duration-300 ${
        isFullScreen ? "max-w-6xl mx-auto my-6" : ""
      }`}
    >
      {/* macOS Window Title Bar */}
      <div className="bg-[#FAF8F5] px-4 py-3 border-b border-[#EDE7DF] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
        </div>

        {isFullScreen && onCloseFullScreen && (
          <button
            onClick={onCloseFullScreen}
            className="text-xs text-[#7B7268] hover:text-[#1F1D1A] px-2.5 py-1 rounded-md border border-[#E0D7CC] hover:bg-[#EFE7DC] transition-colors"
          >
            Exit Full View
          </button>
        )}
      </div>

      {/* Main App Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
        {/* Left Mini Sidebar */}
        <div className="md:col-span-3 lg:col-span-3 bg-[#FAF8F5] border-r border-[#EDE7DF] p-4 flex flex-col justify-start">
          {/* Sidebar Brand Header */}
          <div className="flex items-center space-x-2 pb-4 mb-3 border-b border-[#ECE5DD]">
            <div className="text-[#5C2817]">
              <TempleLogo size={20} />
            </div>
            <span className="font-bold text-sm tracking-tight text-[#1F1D1A]">
              Pragya AI
            </span>
          </div>

          {/* Nav Items */}
          <div className="space-y-1">
            <button
              onClick={() => handleTabClick("new-task")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === "new-task"
                  ? "bg-[#F3EDE4] text-[#1F1D1A] font-semibold"
                  : "text-[#6E675F] hover:bg-[#F3EDE5] hover:text-[#1F1D1A] font-medium"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#5C2817]" />
              <span>New Task</span>
            </button>

            <button
              onClick={() => handleTabClick("documents")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === "documents"
                  ? "bg-[#F3EDE4] text-[#1F1D1A] font-semibold"
                  : "text-[#6E675F] hover:bg-[#F3EDE5] hover:text-[#1F1D1A] font-medium"
              }`}
            >
              <FileText className="w-4 h-4 text-[#6E675F]" />
              <span>Documents</span>
            </button>

            <button
              onClick={() => handleTabClick("projects")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === "projects"
                  ? "bg-[#F3EDE4] text-[#1F1D1A] font-semibold"
                  : "text-[#6E675F] hover:bg-[#F3EDE5] hover:text-[#1F1D1A] font-medium"
              }`}
            >
              <Folder className="w-4 h-4 text-[#6E675F]" />
              <span>Projects</span>
            </button>

            <button
              onClick={() => handleTabClick("knowledge-base")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === "knowledge-base"
                  ? "bg-[#F3EDE4] text-[#1F1D1A] font-semibold"
                  : "text-[#6E675F] hover:bg-[#F3EDE5] hover:text-[#1F1D1A] font-medium"
              }`}
            >
              <Layers className="w-4 h-4 text-[#6E675F]" />
              <span>Knowledge Base</span>
            </button>
          </div>
        </div>

        {/* Right Main Canvas */}
        <div className="md:col-span-9 lg:col-span-9 p-5 lg:p-7 flex flex-col justify-between bg-[#FFFFFF]">
          {/* Top Bar inside Canvas */}
          <div className="flex items-center justify-between pb-3">
            {/* Automated Model & Engine Pipeline Badges */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#E4DDD3] bg-[#FCFAF8] text-xs font-semibold text-[#5C2817] shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#5C2817]" />
                <span>Qwen3-8B · Automated RAG</span>
              </div>
              <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-[#E6DDD2] bg-[#FAF8F5] text-xs font-medium text-[#6B6359]">
                <ScanLine className="w-3.5 h-3.5 text-[#5C2817]" />
                <span>Docling & Surya OCR</span>
              </div>
            </div>

            {/* User Avatar with Dropdown */}
            <div className="relative flex items-center space-x-2">
              {completedResult && (
                <button
                  onClick={resetTask}
                  className="flex items-center gap-1 text-xs text-[#6B6359] hover:text-[#1C1917] px-2.5 py-1 rounded-md border border-[#E2D8CC] hover:bg-[#F5EFE6] transition"
                  title="Reset to new prompt"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (isLoggedIn) {
                    setUserDropdownOpen(!userDropdownOpen);
                  } else {
                    openAuthModal();
                  }
                }}
                className="w-8 h-8 rounded-full bg-[#EFE8DE] hover:bg-[#E5DCD0] text-[#5C2817] flex items-center justify-center font-bold text-xs transition shadow-sm"
                title={isLoggedIn ? (user?.name || "User profile") : "Sign In"}
              >
                {isLoggedIn ? (user?.initials || "C") : "C"}
              </button>

              {/* User dropdown if logged in */}
              {userDropdownOpen && isLoggedIn && (
                <div className="absolute right-0 top-10 w-52 bg-white border border-[#E6DDD2] rounded-xl shadow-xl z-30 p-2">
                  <div className="px-2 py-1.5 border-b border-[#F0EAE1]">
                    <div className="text-xs font-bold text-[#1F1D1A]">{user?.name}</div>
                    <div className="text-[11px] text-[#82796F] truncate">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                      resetTask();
                    }}
                    className="w-full text-left mt-1.5 px-2 py-1.5 text-xs text-red-700 hover:bg-red-50 rounded-lg flex items-center gap-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Conditional View by Active Tab */}
          {activeTab === "documents" ? (
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#1F1D1A]">Confidential Documents</h3>
                  <p className="text-xs text-[#7A7268]">On-premise files and drawings</p>
                </div>
                <button
                  onClick={() => {
                    requireAuth(() => {
                      fileInputRef.current?.click();
                    });
                  }}
                  className="flex items-center gap-1.5 text-xs bg-[#5C2817] text-white px-3 py-1.5 rounded-lg hover:bg-[#471E11] transition"
                >
                  <span>Upload File</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: "P&ID_Process_Flow_v4.pdf", size: "14.2 MB", type: "P&ID Drawing" },
                  { name: "Turbine_Inspection_Spec_v2.pdf", size: "8.6 MB", type: "Spec Sheet" },
                  { name: "Q3_Plant_Expenditures.xlsx", size: "4.1 MB", type: "Spreadsheet" },
                  { name: "ISO-9001_Factory_Audit_2026.docx", size: "2.8 MB", type: "Compliance" },
                ].map((doc, i) => (
                  <div key={i} className="p-3 rounded-xl border border-[#E5DDD2] bg-[#FAF8F5] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-white border border-[#E2D7CA] text-[#5C2817]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#1F1D1A] truncate max-w-[170px]">{doc.name}</div>
                        <div className="text-[10px] text-[#857C72]">{doc.type} · {doc.size}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === "projects" ? (
            <div className="py-4 space-y-3">
              <div>
                <h3 className="text-base font-bold text-[#1F1D1A]">Active Projects</h3>
                <p className="text-xs text-[#7A7268]">Multi-step agent pipelines</p>
              </div>
              <div className="space-y-2">
                {[
                  { title: "Boiler Upgrade Capex Justification", status: "Ready for Signoff" },
                  { title: "Continuous Drawing OCR & Valve Tagging", status: "In Progress" },
                  { title: "Vendor Specification Variance Audit", status: "Completed" },
                ].map((proj, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-[#E6DDD2] bg-[#FAF8F5] flex items-center justify-between">
                    <div className="text-xs font-bold text-[#1F1D1A]">{proj.title}</div>
                    <div className="text-[11px] text-[#7F766C]">{proj.status}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === "knowledge-base" ? (
            <div className="py-4 space-y-3">
              <div>
                <h3 className="text-base font-bold text-[#1F1D1A]">Knowledge Base</h3>
                <p className="text-xs text-[#7A7268]">Proprietary manuals and standards</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: "ASME & ANSI Boiler Codes", chunks: "142,800 Vectors" },
                  { title: "Internal SOP & Safety Protocol", chunks: "38,200 Vectors" },
                  { title: "Historical Capex Ledgers", chunks: "89,400 Vectors" },
                  { title: "P&ID Standard Symbol Library", chunks: "12,100 Vectors" },
                ].map((kb, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-[#E6DDD2] bg-[#FAF8F5]">
                    <div className="text-xs font-bold text-[#1F1D1A]">{kb.title}</div>
                    <div className="text-[10px] text-[#7F766C] mt-1">{kb.chunks}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* "New Task" Main Content */
            <div className="my-auto py-2">
              {!completedResult && !isProcessing ? (
                <>
                  {/* Central Greeting */}
                  <div className="text-center my-4 lg:my-6">
                    <h2 className="text-2xl sm:text-[28px] font-bold text-[#1B1917] tracking-tight">
                      How can I help you today?
                    </h2>
                  </div>

                  {/* Input Box */}
                  <form
                    onSubmit={handleManualSubmit}
                    className="w-full bg-[#FFFFFF] border border-[#E5DDD2] rounded-2xl p-3 sm:p-4 shadow-sm focus-within:border-[#5C2817] transition-all relative"
                  >
                    <textarea
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleManualSubmit();
                        }
                      }}
                      placeholder="Ask a question, upload a file, or give a task..."
                      rows={3}
                      className="w-full resize-none border-0 bg-transparent p-1 text-sm sm:text-base text-[#1F1D1A] placeholder-[#948A7E] focus:outline-none focus:ring-0"
                    />

                    {/* Attached files preview */}
                    {attachedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pb-2">
                        {attachedFiles.map((file, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F2ECE3] text-[11px] font-medium text-[#5C2817] border border-[#E3D7C8]"
                          >
                            <FileCheck className="w-3 h-3" />
                            {file}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom Action Bar inside Input Box */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            requireAuth(() => {
                              fileInputRef.current?.click();
                            });
                          }}
                          title="Attach document"
                          className="p-1.5 text-[#7A7166] hover:text-[#5C2817] rounded-lg transition-colors"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            requireAuth(() => {
                              imageInputRef.current?.click();
                            });
                          }}
                          title="Upload image"
                          className="p-1.5 text-[#7A7166] hover:text-[#5C2817] rounded-lg transition-colors"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>

                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!promptInput.trim()}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          promptInput.trim()
                            ? "bg-[#5C2817] hover:bg-[#471E11] text-white shadow-sm"
                            : "bg-[#5C2817]/70 text-white/80 cursor-not-allowed"
                        }`}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>

                  {/* 4 Quick Action Prompt Cards Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action)}
                          className="group p-3 rounded-xl border border-[#E6DDD2] bg-[#FAF8F5] hover:bg-[#F5EEE4] hover:border-[#D9CCBE] transition-all text-left flex flex-col justify-between h-[82px] shadow-sm"
                        >
                          <Icon className="w-5 h-5 text-[#5C2817]" />
                          <span className="text-xs font-semibold text-[#2B2724] leading-tight">
                            {action.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : isProcessing ? (
                /* Processing State */
                <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#5C2817]/10 flex items-center justify-center text-[#5C2817] animate-bounce">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1917]">
                      Processing Request
                    </h3>
                    <p className="text-xs text-[#7A7166] mt-1">
                      Analyzing documents and generating deliverables...
                    </p>
                  </div>
                </div>
              ) : completedResult ? (
                /* Rich Deliverable Output State */
                <div className="py-2 space-y-3">
                  <div className="bg-[#FAF8F5] border border-[#E5DDD2] rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-[#1A1715]">
                            {completedResult.title}
                          </h4>
                          <p className="text-[11px] text-[#786F64]">
                            Query: &quot;{completedResult.query.slice(0, 60)}...&quot;
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#3E3933] mt-2.5 leading-relaxed">
                      {completedResult.summary}
                    </p>

                    {/* Key Findings Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#ECE5DD]">
                      {completedResult.findings.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-2 rounded-lg border border-[#E5DCD0]"
                        >
                          <div className="text-[10px] text-[#82796F] font-medium uppercase tracking-wider">
                            {item.label}
                          </div>
                          <div
                            className={`text-xs font-bold mt-0.5 ${
                              item.status === "warning"
                                ? "text-amber-800"
                                : item.status === "verified"
                                ? "text-emerald-800"
                                : "text-[#1F1D1A]"
                            }`}
                          >
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Deliverable Action Bar */}
                    <div className="mt-3 pt-3 border-t border-[#EAE2D6] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {completedResult.deliverableType === "excel" ? (
                          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                        ) : (
                          <FileText className="w-4 h-4 text-[#5C2817]" />
                        )}
                        <div>
                          <div className="text-xs font-bold text-[#1F1D1A]">
                            {completedResult.deliverableName}
                          </div>
                          <div className="text-[10px] text-[#857B70]">
                            {completedResult.deliverableSize}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleDownloadDeliverable}
                        disabled={isDownloadingDocx}
                        className="flex items-center gap-1.5 bg-[#5C2817] hover:bg-[#471E11] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-75"
                      >
                        {isDownloadingDocx ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Generating DOCX...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download .docx</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
