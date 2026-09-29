"use client";

import React, { useState } from "react";
import {
  Folder,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Users,
  Layers,
  Sparkles,
  Plus,
} from "lucide-react";

interface UserProjectsProps {
  onOpenProjectAssistant?: (project: any) => void;
}

export function UserProjects({ onOpenProjectAssistant }: UserProjectsProps) {
  const [projects] = useState([
    {
      id: "proj-cdu-01",
      title: "Phase-III CDU Turnaround & Column Reboiler Audit",
      unit: "CDU-1 & VDU",
      lead: "Chinmay (Lead Process Engineer)",
      status: "Active",
      progress: 78,
      description:
        "Comprehensive engineering review of column tray fouling, hydraulic pressure margins, and ASME Section VIII compliance for the upcoming scheduled turnaround.",
      documents: [
        "MRPL_SOP_CDU_402_Rev4.pdf",
        "Column_Tray_Fouling_Analysis.xlsx",
        "ASME_SecVIII_Depressurization.pdf",
      ],
      deliverables: [
        "CDU_Turnaround_Compliance_Report.pdf",
        "Tray_Inspection_Variance_Sheet.xlsx",
      ],
    },
    {
      id: "proj-dhds-02",
      title: "Diesel Hydro-Desulfurization (DHDS) Unit Revamp",
      unit: "Desulfurization Unit",
      lead: "Rajesh Patel (Process Analyst)",
      status: "In Progress",
      progress: 45,
      description:
        "Catalyst replacement cycle modeling, hydrogen purity mass balance, and sulfur emission limits to ensure BS-VI ultra-low sulfur diesel standard compliance.",
      documents: [
        "DHDS_Catalyst_Operating_Manual.pdf",
        "Hydrogen_Mass_Balance_Calculations.xlsx",
      ],
      deliverables: ["DHDS_Catalyst_Capex_Justification.docx"],
    },
    {
      id: "proj-boiler-03",
      title: "25MW Captive Thermal Recovery Boiler Overhaul",
      unit: "Captive Power Plant",
      lead: "Chinmay",
      status: "Ready for Signoff",
      progress: 100,
      description:
        "Board review Capex approval note, ultrasonic thickness inspection logs, and turbine vibration diagnostic reports for boiler life extension.",
      documents: [
        "MRPL_Boiler_Inspection_2026_Q1.pdf",
        "Steam_Drum_NDT_Weld_Records.pdf",
      ],
      deliverables: [
        "Board_Approval_Note_25MW_Upgrade.pdf",
        "Boiler_Weld_Ultrasonic_Summary.xlsx",
        "Executive_Board_Deck_25MW.pptx",
      ],
    },
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#191614] flex items-center gap-2">
            <Folder className="w-6 h-6 text-[#5C2817]" />
            <span>My Assigned Projects (MRPL Workspaces)</span>
          </h2>
          <p className="text-xs text-[#7A7166] mt-0.5">
            Project-based organization linking technical documents, specialized AI agents, and generated deliverables.
          </p>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-6 rounded-3xl border border-[#E6DDD2] bg-white shadow-2xs hover:shadow-md transition-all space-y-4"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0EAE1]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-[#191614]">{proj.title}</h3>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF6F0] text-[#5C2817] border border-[#E4D9CA]">
                    {proj.unit}
                  </span>
                </div>
                <div className="text-xs text-[#7F766C] mt-0.5">Project Lead: {proj.lead}</div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    proj.status === "Ready for Signoff"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}
                >
                  {proj.status} ({proj.progress}%)
                </span>

                <button
                  onClick={() => onOpenProjectAssistant && onOpenProjectAssistant(proj)}
                  className="inline-flex items-center gap-1.5 bg-[#5C2817] hover:bg-[#481E11] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open AI Assistant</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-[#4A433D] leading-relaxed">{proj.description}</p>

            {/* Progress Bar */}
            <div className="w-full bg-[#EAE2D5] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#5C2817] h-full rounded-full transition-all"
                style={{ width: `${proj.progress}%` }}
              />
            </div>

            {/* Attached Documents & Deliverables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Authorized Documents */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ECE4D8]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#7E756B] mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#5C2817]" />
                  <span>Authorized Project Documents ({proj.documents.length})</span>
                </div>
                <div className="space-y-1">
                  {proj.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-[#2A2623] truncate flex items-center gap-1.5 py-0.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5C2817]" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Deliverables */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ECE4D8]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#7E756B] mb-2 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Generated Project Deliverables ({proj.deliverables.length})</span>
                </div>
                <div className="space-y-1">
                  {proj.deliverables.map((del, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-[#2A2623] truncate flex items-center gap-1.5 py-0.5 font-semibold text-[#5C2817]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      <span>{del}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
