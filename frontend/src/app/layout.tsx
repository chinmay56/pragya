import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Pragya AI | On-Premise Agentic AI Workbench",
  description:
    "A self-hosted agentic AI workbench for analyzing documents, understanding images, and generating real deliverables — entirely on your infrastructure.",
  keywords: [
    "Pragya AI",
    "On-premise Agentic AI",
    "Air-gapped LLM",
    "Industrial AI",
    "Document Analysis",
    "Confidential AI",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakartaSans.variable} ${monoFont.variable} h-full`}>
      <body className="min-h-full font-sans antialiased text-[#1C1917] bg-[#FAF8F5]">
        {children}
      </body>
    </html>
  );
}
