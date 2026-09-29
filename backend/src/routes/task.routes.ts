import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// MRPL Refinery Projects
const mrplProjects = [
  {
    id: "proj-cdu-01",
    name: "Phase-III CDU Turnaround & Column Reboiler Audit",
    unit: "CDU-1 & VDU",
    lead: "Chinmay (Lead Process Engineer)",
    status: "Active",
    progress: 78,
    assignedUsers: ["chinmay", "admin", "rajesh"],
    description: "Multi-disciplinary engineering review of heat exchanger fouling, hydraulic pressure margins, and ASME Section VIII compliance.",
    documentsCount: 14,
    deliverablesCount: 5,
  },
  {
    id: "proj-dhds-02",
    name: "Diesel Hydro-Desulfurization (DHDS) Unit Revamp",
    unit: "Desulfurization",
    lead: "Rajesh Patel (Process Analyst)",
    status: "In Progress",
    progress: 45,
    assignedUsers: ["chinmay", "rajesh"],
    description: "Catalyst replacement cycle modeling, hydrogen purity balance, and sulfur emission limits for BS-VI fuel compliance.",
    documentsCount: 8,
    deliverablesCount: 2,
  },
  {
    id: "proj-boiler-03",
    name: "25MW Captive Thermal Recovery Boiler Overhaul",
    unit: "Captive Power Plant",
    lead: "Chinmay",
    status: "Ready for Signoff",
    progress: 100,
    assignedUsers: ["chinmay", "admin", "priya"],
    description: "Capex approval memo, ultrasonic thickness testing results, and turbine vibration diagnostic notes.",
    documentsCount: 22,
    deliverablesCount: 8,
  },
];

// System Task Execution Logs (for Admin Task Monitoring)
const mrplTasks = [
  {
    id: "task-901",
    user: "Chinmay",
    taskName: "ASME Section VIII Div 1 Weld Inspection Synthesis",
    type: "Document Analysis",
    model: "DeepSeek-R1 (Air-Gapped)",
    status: "Completed",
    duration: "4.2s",
    timestamp: "10 mins ago",
    deliverable: "Turbine_Compliance_Audit_Report.pdf",
  },
  {
    id: "task-902",
    user: "Chinmay",
    taskName: "P&ID Drawing OCR & Valve Schedule Decomposition",
    type: "Multimodal Vision",
    model: "Qwen 2.5 Coder 32B",
    status: "Completed",
    duration: "6.8s",
    timestamp: "45 mins ago",
    deliverable: "PID_Instrument_Schedule_RevD.xlsx",
  },
  {
    id: "task-903",
    user: "Rajesh Patel",
    taskName: "DHDS Sulfur Equilibrium & Capex Variance Ledger",
    type: "Spreadsheet Calculation",
    model: "Qwen3 (Auto)",
    status: "Completed",
    duration: "2.1s",
    timestamp: "2 hours ago",
    deliverable: "Q3_Capex_Variance_Executive.xlsx",
  },
  {
    id: "task-904",
    user: "Priya Menon",
    taskName: "ISO-14001 Flare Stack Emission SOP Retrieval",
    type: "Knowledge Search",
    model: "Llama-3.3 70B",
    status: "Completed",
    duration: "1.4s",
    timestamp: "Yesterday",
    deliverable: "Flare_Stack_SOP_Verification.docx",
  },
];

// List Assigned Projects for User
router.get("/projects", authenticateToken, (req: Request, res: Response) => {
  res.json({ success: true, data: { projects: mrplProjects } });
});

// List System-Wide Tasks (for Admin Task Monitoring)
router.get("/tasks", authenticateToken, (req: Request, res: Response) => {
  res.json({ success: true, data: { tasks: mrplTasks, total: mrplTasks.length } });
});

export default router;
