"use client";

import React from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { CoreCapabilities } from "@/components/CoreCapabilities";
import { AuthModal } from "@/components/AuthModal";
import { FullWorkbenchView } from "@/components/FullWorkbenchView";

function MainContent() {
  const { currentView, setCurrentView } = useAuth();

  if (currentView === "app") {
    return <FullWorkbenchView onBackToLanding={() => setCurrentView("landing")} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#191614] selection:bg-[#5C2817]/15 selection:text-[#5C2817]">
      {/* Navigation Header */}
      <Navbar onGetStartedClick={() => setCurrentView("app")} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center">
        {/* Hero Section with Live Interactive Workbench Mockup */}
        <HeroSection onAccessWorkbenchClick={() => setCurrentView("app")} />

        {/* Core Capabilities Section matching bottom cards of screenshot */}
        <CoreCapabilities />
      </main>

      {/* Auth Modal */}
      <AuthModal />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
