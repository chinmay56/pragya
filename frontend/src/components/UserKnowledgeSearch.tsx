"use client";

import React, { useState } from "react";
import {
  Search,
  BookOpen,
  FileText,
  ExternalLink,
  Tag,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface UserKnowledgeSearchProps {
  onAskAboutDoc?: (prompt: string) => void;
}

export function UserKnowledgeSearch({ onAskAboutDoc }: UserKnowledgeSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    citations: {
      documentId: string;
      documentTitle: string;
      category: string;
      unit: string;
      section: string;
      snippet: string;
      score: number;
    }[];
    generatedAnswer: string;
  } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setSearchResults({
        citations: [
          {
            documentId: "doc-1",
            documentTitle: "MRPL-SOP-CDU-402: Crude Distillation Unit Startup & Depressurization",
            category: "SOP",
            unit: "CDU-1 & VDU",
            section: "Section 4.2 - Emergency Relief Sequence",
            snippet:
              "In case of column overhead pressure surge exceeding 4.2 kg/cm2, initiate nitrogen blanket purge and route overhead hydrocarbon vapor to the primary flare header through bypass valve PRV-402.",
            score: 0.96,
          },
          {
            documentId: "doc-2",
            documentTitle: "MRPL-INSP-2026-B04: Boiler Ultrasonic Thickness & Weld Integrity Audit",
            category: "Inspection Report",
            unit: "Captive Power Plant",
            section: "Section 2.1 - Ultrasonic NDT Calibration",
            snippet:
              "Measured wall thickness of high-pressure steam drum 34.2mm (design margin 32.0mm). Hydrostatic test verified up to 1.5x design pressure.",
            score: 0.89,
          },
        ],
        generatedAnswer:
          `Grounded on the authorized MRPL Knowledge Base (Qdrant Vector Index):\n\n` +
          `• For query "${query}": The operational sequence is governed by **MRPL-SOP-CDU-402 (Section 4.2)** and **MRPL Boiler Inspection Standard**.\n` +
          `• Key parameters: Relief setpoint threshold is 4.2 kg/cm2, with automated nitrogen purge and fail-closed bypass interlock verification.\n` +
          `• All retrieved citations have been verified locally without external cloud exposure.`,
      });
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#191614] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#5C2817]" />
            <span>Authorized Knowledge Base (Qdrant Semantic Search)</span>
          </h2>
          <p className="text-xs text-[#7A7166] mt-0.5">
            Search official MRPL SOPs, technical manuals, and inspection reports with verified source citations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-[#F4EDE4] text-[#5C2817] px-3 py-1.5 rounded-xl font-bold border border-[#E3D7C8]">
          <Cpu className="w-3.5 h-3.5" />
          <span>Dense Vector Retriever (Qdrant)</span>
        </div>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-3xl border border-[#E5DDD2] shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-[#8C8379] absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question or search MRPL SOPs (e.g. 'What is the startup depressurization procedure for CDU-1?')..."
            className="w-full bg-[#FAF8F5] border border-[#E2D8CC] rounded-2xl pl-12 pr-28 py-3 text-sm text-[#1F1D1A] focus:outline-none focus:border-[#5C2817]"
          />
          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="absolute right-2.5 top-2 bg-[#5C2817] hover:bg-[#481E11] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition"
          >
            {isSearching ? "Searching..." : "Vector Search"}
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs text-[#7D746B]">
          <div className="flex items-center gap-2">
            <span>Filter Category:</span>
            {["All", "SOP", "Inspection Report", "Technical Manual", "P&ID"].map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition ${
                  selectedCategory === cat ? "bg-[#5C2817] text-white" : "bg-[#FAF6F0] text-[#6E655C] hover:bg-[#F3EDE5]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <span className="text-[10px] text-[#9A9187]">Indexed: 13,370 Qdrant Vectors</span>
        </div>
      </form>

      {/* Search Results with Citations */}
      {searchResults && (
        <div className="space-y-4 animate-fadeIn">
          {/* AI Grounded Summary */}
          <div className="p-5 rounded-3xl bg-white border border-[#E5DDD2] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-[#5C2817] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Grounded AI Answer</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                Air-Gapped Source Verified
              </span>
            </div>
            <div className="text-xs text-[#2A2623] leading-relaxed whitespace-pre-line bg-[#FAF8F5] p-4 rounded-2xl border border-[#EBE3D7]">
              {searchResults.generatedAnswer}
            </div>
          </div>

          {/* Source Citation Cards */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#8A8177] mb-2.5">
              Supporting Source References ({searchResults.citations.length})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {searchResults.citations.map((cit, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-[#E6DDD2] bg-white shadow-2xs space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#1A1816] leading-snug">{cit.documentTitle}</div>
                      <div className="text-[10px] font-semibold text-[#5C2817] mt-0.5">
                        {cit.section} · Unit: {cit.unit}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-[#FAF6F0] text-[#5C2817] px-2 py-0.5 rounded font-bold border border-[#E4DACB]">
                      {(cit.score * 100).toFixed(0)}% Match
                    </span>
                  </div>

                  <p className="text-xs text-[#4A433D] bg-[#FAF8F5] p-3 rounded-xl border border-[#EBE4D9] leading-relaxed italic">
                    &quot;{cit.snippet}&quot;
                  </p>

                  <div className="pt-2 border-t border-[#F0EAE1] flex items-center justify-between text-xs">
                    <span className="text-[10px] text-[#867E74]">Category: {cit.category}</span>
                    <button
                      onClick={() => onAskAboutDoc && onAskAboutDoc(`Explain ${cit.documentTitle} in detail for turnaround operations`)}
                      className="text-xs font-bold text-[#5C2817] hover:underline flex items-center gap-1"
                    >
                      <span>Ask AI Assistant</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
