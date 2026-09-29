"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { ArchitectureFlow } from "./ArchitectureFlow";
import { useAuth } from "@/context/AuthContext";

interface HeroSectionProps {
  onAccessWorkbenchClick: () => void;
}

export function HeroSection({ onAccessWorkbenchClick }: HeroSectionProps) {
  const { requireAuth } = useAuth();

  return (
    <section className="w-full pt-8 sm:pt-12 lg:pt-14 pb-12 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Hero Text & CTA */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            {/* Top Accent Line */}
            <div className="w-10 h-0.5 bg-[#5C2817] rounded-full" />

            <div className="space-y-4">
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-[-0.03em] leading-[1.12] text-[#191614]">
                <span>AI for confidential </span>
                <span className="text-[#5C2817] block">
                  industrial work.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#585149] font-normal leading-relaxed max-w-lg">
                A self-hosted agentic AI workbench for analyzing documents,
                understanding images, and generating real deliverables — entirely
                on your infrastructure.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-1">
              <button
                onClick={() => {
                  requireAuth(() => {
                    onAccessWorkbenchClick();
                  });
                }}
                className="inline-flex items-center justify-center gap-2.5 bg-[#5C2817] hover:bg-[#481E11] text-white text-sm sm:text-base font-semibold px-6 py-3.5 rounded-xl shadow-sm hover:shadow transition-all duration-200 group active:scale-[0.98]"
              >
                <span>Access Workbench</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Visual Architecture Flow */}
          <div className="lg:col-span-7">
            <ArchitectureFlow
              onCardClick={() => {
                requireAuth(() => {
                  onAccessWorkbenchClick();
                });
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
