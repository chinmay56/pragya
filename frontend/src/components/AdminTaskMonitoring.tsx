"use client";

import React, { useState } from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export function AdminTaskMonitoring() {
  const [tasks] = useState([
    {
      id: "TSK-9402",
      user: "Chinmay (Lead Process Engineer)",
      taskName: "ASME Section VIII Div 1 Boiler Inspection Synthesis",
      type: "Document Analysis",
      model: "DeepSeek-R1 (671B Air-gapped)",
      status: "Completed",
      duration: "4.2s",
      timestamp: "12 mins ago",
      deliverable: "Turbine_Compliance_Audit_Report.pdf",
      tokens: "2,420 tokens",
    },
    {
      id: "TSK-9403",
      user: "Chinmay",
      taskName: "P&ID Drawing OCR & Valve Schedule Decomposition",
      type: "Multimodal Vision",
      model: "Qwen 2.5 Coder 32B (Vision)",
      status: "Completed",
      duration: "6.8s",
      timestamp: "45 mins ago",
      deliverable: "PID_Instrument_Schedule_RevD.xlsx",
      tokens: "3,890 tokens",
    },
    {
      id: "TSK-9404",
      user: "Rajesh Patel (Process Analyst)",
      taskName: "DHDS Sulfur Equilibrium & Capex Variance Ledger",
      type: "Spreadsheet Math",
      model: "Qwen3 (Auto Router)",
      status: "Completed",
      duration: "2.1s",
      timestamp: "2 hours ago",
      deliverable: "Q3_Capex_Variance_Executive.xlsx",
      tokens: "1,840 tokens",
    },
    {
      id: "TSK-9405",
      user: "Priya Menon (Compliance Auditor)",
      taskName: "ISO-14001 Flare Stack Emission SOP Retrieval",
      type: "Knowledge Search",
      model: "Llama-3.3 70B",
      status: "Completed",
      duration: "1.4s",
      timestamp: "Yesterday",
      deliverable: "Flare_Stack_SOP_Verification.docx",
      tokens: "920 tokens",
    },
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#191614] flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#5C2817]" />
            <span>Task Execution & Audit Monitoring</span>
          </h2>
          <p className="text-xs text-[#7A7166] mt-0.5">
            Real-time audit log of ongoing, completed, and error-traced agentic tasks across MRPL refinery units.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Audit Trail: Immutable (ISO-27001)</span>
          </span>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-2xl border border-[#E5DDD2] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#ECE5DD] text-[11px] font-bold text-[#7E756B] uppercase tracking-wider">
                <th className="py-3 px-4">Task ID & Name</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Agent / Model</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Deliverable Output</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1] text-xs">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-mono text-[10px] text-[#5C2817] font-bold">{t.id}</div>
                    <div className="font-bold text-[#1A1816] truncate">{t.taskName}</div>
                    <div className="text-[10px] text-[#8C8379]">{t.type}</div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-[#2F2B28]">{t.user}</td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#1F1D1A]">{t.model}</div>
                    <div className="text-[10px] text-[#867E74]">{t.tokens}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      <span>{t.status}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#6E655C]">
                    <div>{t.duration}</div>
                    <div className="text-[9px] text-[#9A9187]">{t.timestamp}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C2817] bg-[#F4EDE4] px-2.5 py-1 rounded-lg border border-[#E3D7C8]">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[150px]">{t.deliverable}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
