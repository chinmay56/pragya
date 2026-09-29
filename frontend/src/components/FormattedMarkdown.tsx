"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  FileCode,
  Terminal,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

interface FormattedMarkdownProps {
  content: string;
}

export function FormattedMarkdown({ content }: FormattedMarkdownProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!content) return null;

  // Split content into blocks (code blocks, tables, blockquotes, lists, headings, paragraphs)
  const renderBlocks = () => {
    const cleaned = (content || "")
      .replace(/(?:\r?\n)+\s*(\*{0,2}|_{0,2})\s*End of Report\s*(\*{0,2}|_{0,2})\s*$/gi, "")
      .replace(/(?:\r?\n)+\s*(\*{0,2}|_{0,2})\s*Prepared by:?[\s\S]*$/gi, "")
      .replace(/(?:\r?\n)+\s*---\s*(\*{0,2}|_{0,2})\s*Prepared by:?[\s\S]*$/gi, "")
      .trim();

    const lines = cleaned.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;
    let codeBlockCount = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Ignore any remaining sign-off / footer lines
      const lower = line.trim().toLowerCase();
      if (
        lower === "end of report" ||
        lower.startsWith("*prepared by") ||
        lower.startsWith("prepared by:") ||
        lower.startsWith("_prepared by")
      ) {
        i++;
        continue;
      }

      // 1. Multi-line Code block handling (```)
      if (line.trim().startsWith("```")) {
        const lang = line.trim().slice(3).trim() || "code";
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        const codeText = codeLines.join("\n");
        const currentIdx = codeBlockCount++;

        elements.push(
          <div
            key={`code-${currentIdx}-${i}`}
            className="my-3.5 rounded-2xl overflow-hidden border border-[#2D2A26] bg-[#181715] shadow-md transition-all group"
          >
            {/* Code Block Header (Claude / ChatGPT style) */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#24211E] border-b border-[#332E2A] text-xs text-[#A89F91]">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#D4C8B8]" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#E6DBD0]">
                  {lang}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(codeText, currentIdx)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#332E2A] hover:bg-[#453F39] text-[#E0D7CC] transition text-[11px] font-semibold active:scale-95 shadow-2xs"
              >
                {copiedIndex === currentIdx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#B0A79A]" />
                    <span>Copy code</span>
                  </>
                )}
              </button>
            </div>
            {/* Code Content */}
            <pre className="p-4 overflow-x-auto text-[12.5px] font-mono text-[#F4EDE4] leading-relaxed select-text font-normal">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        continue;
      }

      // 2. Markdown Tables (| ... |)
      if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
        const tableLines: string[] = [];
        while (
          i < lines.length &&
          lines[i].trim().startsWith("|") &&
          lines[i].trim().endsWith("|")
        ) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const headerCells = tableLines[0]
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim());
          const hasSeparator =
            tableLines[1].includes("---") || tableLines[1].includes(":---");
          const bodyLines = hasSeparator
            ? tableLines.slice(2)
            : tableLines.slice(1);

          elements.push(
            <div
              key={`table-${i}`}
              className="my-4 overflow-hidden rounded-2xl border border-[#E4D9CC] bg-white shadow-xs"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#F6F1EA] to-[#F1E9DE] border-b border-[#DFD3C3] text-[#3D3730]">
                      {headerCells.map((h, hIdx) => (
                        <th
                          key={hIdx}
                          className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider text-[#5C2817] first:pl-4 last:pr-4"
                        >
                          {formatInline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE7DC]">
                    {bodyLines.map((rowStr, rIdx) => {
                      const rowCells = rowStr
                        .split("|")
                        .slice(1, -1)
                        .map((c) => c.trim());
                      return (
                        <tr
                          key={rIdx}
                          className={`transition-colors ${
                            rIdx % 2 === 0
                              ? "bg-white hover:bg-[#FAF7F2]"
                              : "bg-[#FCFAF7] hover:bg-[#F7F2EA]"
                          }`}
                        >
                          {rowCells.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="py-2.5 px-4 text-[#2C2825] font-medium leading-relaxed first:pl-4 last:pr-4"
                            >
                              {formatInline(cell)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
          continue;
        }
      }

      // 3. Blockquotes & Callout alerts (> ...)
      if (line.trim().startsWith(">")) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith(">")) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
          i++;
        }
        const quoteText = quoteLines.join("\n");
        const isWarning =
          quoteText.toLowerCase().includes("warning") ||
          quoteText.toLowerCase().includes("deviation") ||
          quoteText.toLowerCase().includes("danger") ||
          quoteText.toLowerCase().includes("recalibration");
        const isSuccess =
          quoteText.toLowerCase().includes("pass") ||
          quoteText.toLowerCase().includes("verified") ||
          quoteText.toLowerCase().includes("compliant");

        elements.push(
          <div
            key={`quote-${i}`}
            className={`my-3 p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3 transition-all ${
              isWarning
                ? "bg-amber-50/70 border-amber-200/90 text-amber-950 border-l-4 border-l-amber-600"
                : isSuccess
                ? "bg-emerald-50/70 border-emerald-200/90 text-emerald-950 border-l-4 border-l-emerald-600"
                : "bg-[#F7F3ED] border-[#E5DACB] text-[#2D2824] border-l-4 border-l-[#5C2817]"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isWarning ? (
                <AlertTriangle className="w-4 h-4 text-amber-700" />
              ) : isSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              ) : (
                <Info className="w-4 h-4 text-[#5C2817]" />
              )}
            </div>
            <div className="text-xs leading-relaxed flex-1 font-medium whitespace-pre-wrap">
              {formatInline(quoteText)}
            </div>
          </div>
        );
        continue;
      }

      // 4. Headings (H1, H2, H3, H4)
      if (line.startsWith("#### ")) {
        elements.push(
          <h5
            key={`h4-${i}`}
            className="text-xs font-bold uppercase tracking-wider text-[#5C2817] mt-3.5 mb-1.5 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#5C2817]" />
            {formatInline(line.replace("#### ", ""))}
          </h5>
        );
        i++;
        continue;
      }
      if (line.startsWith("### ")) {
        elements.push(
          <h4
            key={`h3-${i}`}
            className="text-[14px] font-bold text-[#191614] mt-4 mb-2 flex items-center gap-2"
          >
            <span className="w-2 h-4 bg-[#5C2817] rounded-sm inline-block" />
            <span>{formatInline(line.replace("### ", ""))}</span>
          </h4>
        );
        i++;
        continue;
      }
      if (line.startsWith("## ")) {
        elements.push(
          <h3
            key={`h2-${i}`}
            className="text-[16px] font-extrabold text-[#171412] mt-5 mb-2.5 pb-1.5 border-b border-[#EAE1D5] flex items-center justify-between"
          >
            <span>{formatInline(line.replace("## ", ""))}</span>
          </h3>
        );
        i++;
        continue;
      }
      if (line.startsWith("# ")) {
        elements.push(
          <h2
            key={`h1-${i}`}
            className="text-lg font-black text-[#141210] mt-5 mb-3 tracking-tight"
          >
            {formatInline(line.replace("# ", ""))}
          </h2>
        );
        i++;
        continue;
      }

      // 5. Horizontal Divider (--- or ***)
      if (line.trim() === "---" || line.trim() === "***") {
        elements.push(
          <hr key={`hr-${i}`} className="my-4 border-[#E6DDD2]" />
        );
        i++;
        continue;
      }

      // 6. Unordered List Items (- or * or •)
      if (
        line.trim().startsWith("- ") ||
        line.trim().startsWith("* ") ||
        line.trim().startsWith("• ")
      ) {
        const itemText = line.trim().replace(/^[-*•]\s+/, "");
        elements.push(
          <div
            key={`li-${i}`}
            className="flex items-start gap-2.5 my-1.5 text-xs sm:text-[13px] text-[#2A2623] leading-relaxed pl-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#5C2817] mt-1.5 shrink-0" />
            <div className="flex-1 font-normal">{formatInline(itemText)}</div>
          </div>
        );
        i++;
        continue;
      }

      // 7. Numbered List Items (1. 2. etc.)
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        const num = numMatch[1];
        const itemText = numMatch[2];
        elements.push(
          <div
            key={`num-${i}`}
            className="flex items-start gap-2.5 my-2 text-xs sm:text-[13px] text-[#2A2623] leading-relaxed pl-1"
          >
            <span className="w-5 h-5 rounded-lg bg-[#F3ECE2] text-[#5C2817] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#E3D7C7] shadow-2xs">
              {num}
            </span>
            <div className="flex-1 pt-0.5 font-normal">{formatInline(itemText)}</div>
          </div>
        );
        i++;
        continue;
      }

      // 8. Empty lines
      if (!line.trim()) {
        elements.push(<div key={`empty-${i}`} className="h-2" />);
        i++;
        continue;
      }

      // 9. Regular paragraph
      elements.push(
        <p
          key={`p-${i}`}
          className="my-1.5 text-xs sm:text-[13px] text-[#2B2724] leading-relaxed font-normal"
        >
          {formatInline(line)}
        </p>
      );
      i++;
    }

    return elements;
  };

  // Helper to format inline bold, inline code, status tags, badges, and links
  const formatInline = (text: string): React.ReactNode => {
    if (!text) return "";

    // Split by inline code `...`, bold **...**, or [Badge] tags
    const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[(?:Verified|Pass|Warning|Alert|Good|Compliant|Acceptable)\])/g);

    return tokens.map((token, idx) => {
      // 1. Inline code tags `...`
      if (token.startsWith("`") && token.endsWith("`")) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded-md bg-[#F4EDE4] text-[#5C2817] font-mono text-[11.5px] font-semibold border border-[#E5DACB] mx-0.5 shadow-2xs"
          >
            {token.slice(1, -1)}
          </code>
        );
      }

      // 2. Bold text **...**
      if (token.startsWith("**") && token.endsWith("**")) {
        const innerText = token.slice(2, -2);
        return (
          <strong key={idx} className="font-bold text-[#171412]">
            {innerText}
          </strong>
        );
      }

      // 3. Status badges [Verified], [Warning], [Pass]
      if (token.startsWith("[") && token.endsWith("]")) {
        const tag = token.slice(1, -1);
        if (tag === "Verified" || tag === "Pass" || tag === "Good" || tag === "Compliant" || tag === "Acceptable") {
          return (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold mx-1"
            >
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
              {tag}
            </span>
          );
        }
        if (tag === "Warning" || tag === "Alert") {
          return (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold mx-1"
            >
              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
              {tag}
            </span>
          );
        }
      }

      return token;
    });
  };

  return <div className="space-y-0.5 select-text leading-relaxed font-sans">{renderBlocks()}</div>;
}
