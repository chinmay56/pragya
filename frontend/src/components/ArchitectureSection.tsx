"use client";

import React from "react";
import { Server, Lock, Database, Cpu, CheckCircle2, ShieldCheck, Layers, Terminal } from "lucide-react";

export function ArchitectureSection() {
  return (
    <section className="w-full py-16 bg-[#F4EFE8] border-y border-[#E8DFC0]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#5A2314]">
            ENTERPRISE DEPLOYMENT
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#191614] mt-2 tracking-tight">
            Designed from the ground up for strict air-gapped infrastructure.
          </h2>
          <p className="text-sm sm:text-base text-[#665D54] mt-3">
            No telemetry, no external API calls, and no vendor lock-in. Run your industrial intelligence on your private bare-metal servers.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#E5DDD2] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#F0E6D8] text-[#5A2314] flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1F1D1A]">Local GPU Inference Cluster</h3>
            <p className="text-xs text-[#635B52] mt-2 leading-relaxed">
              Native support for vLLM, TensorRT-LLM, and Ollama across NVIDIA H100, A100, RTX 6000, and AMD Instinct accelerators.
            </p>
            <div className="mt-4 pt-3 border-t border-[#ECE3D5] flex items-center gap-2 text-xs font-mono text-[#5A2314]">
              <Terminal className="w-3.5 h-3.5" />
              <span>vLLM + TensorRT Kernel</span>
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#E5DDD2] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#F0E6D8] text-[#5A2314] flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1F1D1A]">Private Vector & OCR Pipeline</h3>
            <p className="text-xs text-[#635B52] mt-2 leading-relaxed">
              Air-gapped vector store using Qdrant or Milvus with localized OCR engines for technical engineering drawings and scanned ledgers.
            </p>
            <div className="mt-4 pt-3 border-t border-[#ECE3D5] flex items-center gap-2 text-xs font-mono text-[#5A2314]">
              <Layers className="w-3.5 h-3.5" />
              <span>Zero-Egress Vector Engine</span>
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#E5DDD2] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#F0E6D8] text-[#5A2314] flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1F1D1A]">Strict RBAC & Audit Trails</h3>
            <p className="text-xs text-[#635B52] mt-2 leading-relaxed">
              Integrates directly with Active Directory, LDAP, and SAML 2.0. Every prompt, tool execution, and document access is immutably logged.
            </p>
            <div className="mt-4 pt-3 border-t border-[#ECE3D5] flex items-center gap-2 text-xs font-mono text-[#5A2314]">
              <Lock className="w-3.5 h-3.5" />
              <span>SOC2 & ISO-27001 Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
