"use client";

import React, { useState } from "react";
import { ArrowRight, LogOut } from "lucide-react";
import { TempleLogo } from "./TempleLogo";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  onGetStartedClick?: () => void;
}

export function Navbar({ onGetStartedClick }: NavbarProps) {
  const { isLoggedIn, user, openAuthModal, logout, requireAuth } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="w-full bg-[#FAF8F5] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3.5 group cursor-pointer">
          <div className="text-[#5C2817]">
            <TempleLogo size={34} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[#171514] font-sans leading-none">
              Pragya AI
            </span>
            <span className="text-xs font-normal text-[#756E65] mt-1 tracking-normal">
              On-Premise Agentic AI Workbench
            </span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => openAuthModal()}
                className="text-sm font-medium text-[#302C28] hover:text-[#5C2817] transition-colors px-2 py-1.5"
              >
                Sign in
              </button>
              
              <button
                onClick={() => {
                  requireAuth(() => {
                    if (onGetStartedClick) onGetStartedClick();
                  });
                }}
                className="inline-flex items-center gap-2 bg-[#5C2817] hover:bg-[#481E11] text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all duration-200 group active:scale-95"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </>
          ) : (
            <div className="relative flex items-center space-x-3">
              <button
                onClick={() => {
                  if (onGetStartedClick) onGetStartedClick();
                }}
                className="inline-flex items-center gap-2 bg-[#5C2817] hover:bg-[#481E11] text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm transition"
              >
                <span>Open Workbench</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 text-xs font-semibold text-[#1F1D1A] bg-[#EFE8DE] hover:bg-[#E5DCD0] px-3 py-2 rounded-xl transition"
              >
                <div className="w-6 h-6 rounded-full bg-[#5C2817] text-white flex items-center justify-center text-[10px]">
                  {user?.initials || "C"}
                </div>
                <span>{user?.name}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white border border-[#E6DDD2] rounded-xl shadow-xl z-50 p-2 animate-fadeIn">
                  <div className="px-2 py-1.5 border-b border-[#F0EAE1]">
                    <div className="text-xs font-bold text-[#1F1D1A]">{user?.name}</div>
                    <div className="text-[10px] text-[#82796F] truncate">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                    }}
                    className="w-full text-left mt-1 px-2 py-1.5 text-xs text-red-700 hover:bg-red-50 rounded-lg flex items-center gap-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
