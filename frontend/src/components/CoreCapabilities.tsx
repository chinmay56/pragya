"use client";

import React from "react";
import { FileText, Image as ImageIcon, Database, BarChart2 } from "lucide-react";

export function CoreCapabilities() {
  const capabilities = [
    {
      id: "doc-analysis",
      title: "Document Analysis",
      description: "Understand PDFs, reports, scans and internal documents.",
      icon: FileText,
    },
    {
      id: "multimodal",
      title: "Multimodal Understanding",
      description: "Analyze drawings, images, photographs and handwritten notes.",
      icon: ImageIcon,
    },
    {
      id: "knowledge-context",
      title: "Knowledge & Context",
      description: "Grounded in your manuals, SOPs and past correspondence.",
      icon: Database,
    },
    {
      id: "real-deliverables",
      title: "Real Deliverables",
      description: "Create approval notes, presentations, Excel files and other working outputs.",
      icon: BarChart2,
    },
  ];

  return (
    <section className="w-full pb-16 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Accent Line */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-6 h-0.5 bg-[#5C2817] rounded-full" />
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#7A7268]">
            CORE CAPABILITIES
          </h3>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((cap) => {
            const Icon = cap.icon;

            return (
              <div
                key={cap.id}
                className="p-5 sm:p-6 rounded-2xl border border-[#ECE5DD] bg-[#FFFFFF] shadow-sm flex flex-col justify-start hover:shadow-md transition-shadow"
              >
                {/* Icon badge in warm terracotta/cream tint */}
                <div className="w-11 h-11 rounded-xl bg-[#F4EDE4] flex items-center justify-center text-[#5C2817] mb-4">
                  <Icon className="w-5 h-5" />
                </div>

                {/* Title */}
                <h4 className="text-base font-bold text-[#191615] tracking-tight">
                  {cap.title}
                </h4>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#615A52] mt-1.5 leading-relaxed">
                  {cap.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
