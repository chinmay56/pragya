"use client";

import React from "react";
import { TempleLogo } from "./TempleLogo";
import { Shield, Lock, Terminal, Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#FAF8F5] border-t border-[#EAE2D7] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#EBE4DA]">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="text-[#5A2314]">
              <TempleLogo size={28} />
            </div>
            <div>
              <div className="text-base font-bold text-[#1C1917]">Sovereign AI</div>
              <div className="text-xs text-[#7B736A]">On-Premise AI Workbench for Industrial Operations</div>
            </div>
          </div>

          {/* Enclave Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F2ECE3] border border-[#E4D9CA] text-xs text-[#524B43]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Air-Gapped Node Status: <strong>Operational (Local Enclave)</strong></span>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A8177]">
          <p>© {new Date().getFullYear()} Sovereign AI Systems Inc. Self-hosted & confidential.</p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-[#1C1917] cursor-pointer">Security Whitepaper</span>
            <span className="hover:text-[#1C1917] cursor-pointer">Deployment Docs</span>
            <span className="hover:text-[#1C1917] cursor-pointer">Architecture Spec</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
