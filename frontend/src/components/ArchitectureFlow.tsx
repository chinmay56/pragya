"use client";

import React from "react";
import {
  FileText,
  Image as ImageIcon,
  Database,
  Brain,
  Cpu,
  Layers,
  Settings,
  FileCheck,
  FileSpreadsheet,
  PieChart,
  FileSignature,
  WifiOff,
  Sparkles,
} from "lucide-react";
import { TempleLogo } from "./TempleLogo";

interface ArchitectureFlowProps {
  onCardClick?: () => void;
}

export function ArchitectureFlow({ onCardClick }: ArchitectureFlowProps) {
  return (
    <div className="relative w-full py-4 flex items-center justify-center select-none">
      {/* Subtle concentric background halos */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full border border-[#EBDDCF]/60 -z-10" />
        <div className="w-[360px] h-[360px] rounded-full border border-[#E7D6C5]/70 -z-10" />
        <div className="w-[220px] h-[220px] rounded-full bg-radial from-[#F5ECE0]/80 to-transparent -z-10" />
      </div>

      {/* Main 3-Column Diagram Container */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-3 items-center relative z-10">
        {/* 1. LEFT CARD: Your Internal Data */}
        <div
          onClick={onCardClick}
          className="md:col-span-4 bg-[#FFFFFF] border border-[#E8DFC0]/60 rounded-2xl p-4 sm:p-5 shadow-[0_10px_30px_rgba(40,25,15,0.04)] hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="text-xs font-bold text-[#1F1D1A] mb-3.5 tracking-tight">
            Your Internal Data
          </div>

          <div className="space-y-2.5">
            {/* Documents */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF8F5] border border-[#EFE8DE] hover:border-[#E0D5C5] transition-colors">
              <div className="p-2 rounded-lg bg-white border border-[#E5DDD2] text-[#5C2817] shadow-2xs">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1C1917]">Documents</div>
                <div className="text-[10px] text-[#7C746B]">PDF, Reports, SOPs</div>
              </div>
            </div>

            {/* Images */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF8F5] border border-[#EFE8DE] hover:border-[#E0D5C5] transition-colors">
              <div className="p-2 rounded-lg bg-white border border-[#E5DDD2] text-[#5C2817] shadow-2xs">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1C1917]">Images</div>
                <div className="text-[10px] text-[#7C746B]">Drawings, Photos</div>
              </div>
            </div>

            {/* Internal Knowledge */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF8F5] border border-[#EFE8DE] hover:border-[#E0D5C5] transition-colors">
              <div className="p-2 rounded-lg bg-white border border-[#E5DDD2] text-[#5C2817] shadow-2xs">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1C1917]">Internal Knowledge</div>
                <div className="text-[10px] text-[#7C746B]">Manuals, Records</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center SVG connector line (visible on desktop) */}
        <div className="hidden md:flex md:col-span-4 flex-col items-center justify-center relative">
          {/* 2. CENTER CARD: Pragya AI Agentic Workbench */}
          <div
            onClick={onCardClick}
            className="w-full bg-[#FFFFFF] border-2 border-[#E7D6C4] rounded-3xl p-4 sm:p-5 shadow-[0_15px_40px_rgba(92,40,23,0.08)] ring-4 ring-[#5C2817]/5 relative transition-all duration-200 hover:scale-[1.01] cursor-pointer"
          >
            {/* Header with Temple Logo */}
            <div className="flex flex-col items-center text-center pb-3 mb-3 border-b border-[#F0E8DE]">
              <div className="text-[#5C2817] mb-1">
                <TempleLogo size={24} />
              </div>
              <div className="text-sm font-bold text-[#1A1816]">Pragya AI</div>
              <div className="text-[10px] text-[#7A7166] mt-0.5">
                On-Premise Agentic AI Workbench
              </div>
            </div>

            {/* 4 Stacked Components */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EDE4D8]">
                <Brain className="w-3.5 h-3.5 text-[#5C2817]" />
                <span className="text-xs font-bold text-[#201D1A]">AI Agent</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EDE4D8]">
                <Cpu className="w-3.5 h-3.5 text-[#5C2817]" />
                <span className="text-xs font-bold text-[#201D1A]">Model Router</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EDE4D8]">
                <Layers className="w-3.5 h-3.5 text-[#5C2817]" />
                <span className="text-xs font-bold text-[#201D1A]">Knowledge Base</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EDE4D8]">
                <Settings className="w-3.5 h-3.5 text-[#5C2817]" />
                <span className="text-xs font-bold text-[#201D1A]">Local Tools</span>
              </div>
            </div>
          </div>

          {/* Vertical connection to bottom badge */}
          <div className="h-4 w-px border-l-2 border-dashed border-[#D9CEBF] my-1" />

          {/* Bottom Floating Badge: No External Calls */}
          <div className="w-full bg-[#FFFFFF] border border-[#E7DDD0] rounded-xl px-3 py-2 shadow-sm flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#F4EDE4] text-[#5C2817] shrink-0">
              <WifiOff className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1C1917]">No External Calls</div>
              <div className="text-[10px] text-[#7C746A]">
                Runs entirely on your infrastructure
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-only view for center card */}
        <div className="md:hidden flex flex-col items-center gap-3">
          <div
            onClick={onCardClick}
            className="w-full bg-[#FFFFFF] border-2 border-[#E7D6C4] rounded-3xl p-4 shadow-md"
          >
            <div className="flex flex-col items-center text-center pb-3 mb-3 border-b border-[#F0E8DE]">
              <div className="text-[#5C2817] mb-1">
                <TempleLogo size={24} />
              </div>
              <div className="text-sm font-bold text-[#1A1816]">Pragya AI</div>
              <div className="text-[10px] text-[#7A7166]">
                On-Premise Agentic AI Workbench
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EDE4D8]">
                <Brain className="w-3.5 h-3.5 text-[#5C2817]" />
                <span className="text-xs font-bold text-[#201D1A]">AI Agent</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EDE4D8]">
                <Cpu className="w-3.5 h-3.5 text-[#5C2817]" />
                <span className="text-xs font-bold text-[#201D1A]">Model Router</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EDE4D8]">
                <Layers className="w-3.5 h-3.5 text-[#5C2817]" />
                <span className="text-xs font-bold text-[#201D1A]">Knowledge Base</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EDE4D8]">
                <Settings className="w-3.5 h-3.5 text-[#5C2817]" />
                <span className="text-xs font-bold text-[#201D1A]">Local Tools</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-[#FFFFFF] border border-[#E7DDD0] rounded-xl px-3 py-2 shadow-sm flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#F4EDE4] text-[#5C2817] shrink-0">
              <WifiOff className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1C1917]">No External Calls</div>
              <div className="text-[10px] text-[#7C746A]">
                Runs entirely on your infrastructure
              </div>
            </div>
          </div>
        </div>

        {/* 3. RIGHT CARD: Your Deliverables */}
        <div
          onClick={onCardClick}
          className="md:col-span-4 bg-[#FFFFFF] border border-[#E8DFC0]/60 rounded-2xl p-4 sm:p-5 shadow-[0_10px_30px_rgba(40,25,15,0.04)] hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="text-xs font-bold text-[#1F1D1A] mb-3.5 tracking-tight">
            Your Deliverables
          </div>

          <div className="space-y-2.5">
            {/* Approval Notes */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF8F5] border border-[#EFE8DE] hover:border-[#E0D5C5] transition-colors">
              <div className="p-2 rounded-lg bg-white border border-[#E5DDD2] text-[#5C2817] shadow-2xs">
                <FileSignature className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1C1917]">Approval Notes</div>
                <div className="text-[10px] text-[#7C746B]">Word, PDF</div>
              </div>
            </div>

            {/* Analysis & Reports */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF8F5] border border-[#EFE8DE] hover:border-[#E0D5C5] transition-colors">
              <div className="p-2 rounded-lg bg-white border border-[#E5DDD2] text-[#5C2817] shadow-2xs">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1C1917]">Analysis & Reports</div>
                <div className="text-[10px] text-[#7C746B]">Excel, PDF</div>
              </div>
            </div>

            {/* Presentations */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF8F5] border border-[#EFE8DE] hover:border-[#E0D5C5] transition-colors">
              <div className="p-2 rounded-lg bg-white border border-[#E5DDD2] text-[#5C2817] shadow-2xs">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1C1917]">Presentations</div>
                <div className="text-[10px] text-[#7C746B]">PowerPoint</div>
              </div>
            </div>

            {/* Insights & Summaries */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF8F5] border border-[#EFE8DE] hover:border-[#E0D5C5] transition-colors">
              <div className="p-2 rounded-lg bg-white border border-[#E5DDD2] text-[#5C2817] shadow-2xs">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1C1917]">Insights & Summaries</div>
                <div className="text-[10px] text-[#7C746B]">Key findings</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
