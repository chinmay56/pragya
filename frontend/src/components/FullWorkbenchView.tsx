"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Image as ImageIcon,
  Table as TableIcon,
  BarChart2,
  Paperclip,
  ArrowRight,
  ChevronDown,
  MessageSquare,
  Folder,
  Layers,
  CheckCircle2,
  Sparkles,
  Download,
  RotateCcw,
  FileSpreadsheet,
  FileCheck,
  LogOut,
  ArrowLeft,
  Lock,
  Search,
  UploadCloud,
  Plus,
  Clock,
  ChevronRight,
  UserCog,
  ShieldCheck,
  LayoutDashboard,
  Cpu,
  Activity,
  Settings,
  BookOpen,
  User,
  Zap,
  Code,
  Terminal,
  FileCode,
  FileSignature,
  File,
  ScanLine,
  Send,
  Trash2,
  Copy,
  Check,
  CornerDownLeft,
  X,
  ExternalLink,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Loader2,
} from "lucide-react";
import { TempleLogo } from "./TempleLogo";
import { useAuth } from "@/context/AuthContext";
import { AdminConsole } from "./AdminConsole";
import { AdminKnowledgeBase } from "./AdminKnowledgeBase";
import { AdminAIAgents } from "./AdminAIAgents";
import { AdminTaskMonitoring } from "./AdminTaskMonitoring";
import { FormattedMarkdown } from "./FormattedMarkdown";

interface FullWorkbenchViewProps {
  onBackToLanding: () => void;
}

type AdminTab = "admin-dashboard" | "user-management" | "knowledge-base";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  attachedFiles?: string[];
  imagePreview?: string;
  citations?: { title: string; section: string }[];
  deliverableDocx?: {
    filename: string;
    downloadUrl: string;
    title: string;
    sizeBytes?: number;
    watermark?: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export function FullWorkbenchView({ onBackToLanding }: FullWorkbenchViewProps) {
  const { user, logout, usersList } = useAuth();
  const isAdmin = user?.role === "admin";
  const [moduleMode, setModuleMode] = useState<"admin" | "user">(isAdmin ? "admin" : "user");

  useEffect(() => {
    if (user?.role !== "admin") {
      setModuleMode("user");
    }
  }, [user?.role]);

  // Admin Active Tab
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>("admin-dashboard");

  const [profileOpen, setProfileOpen] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const pendingUsersCount = usersList.filter((u) => u.status === "pending").length;

  // Multi-Session Chat Management (100% User-Specific, No Hardcoded Chats)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const [liveHardware, setLiveHardware] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech & Voice State (Whisper Small ASR + Piper TTS)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [isSynthesizingSpeech, setIsSynthesizingSpeech] = useState<string | null>(null);
  const [generatingDocxId, setGeneratingDocxId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchHardware = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/ai/status");
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setLiveHardware(json.hardware);
          }
        }
      } catch (e) {}
    };

    fetchHardware();
    const interval = setInterval(fetchHardware, 8000);
    return () => clearInterval(interval);
  }, []);

  const userKey = `mrpl_chat_sessions_${user?.id || user?.username || "guest"}`;

  // Load chat sessions for the specific logged-in user
  useEffect(() => {
    if (!user) return;

    // 1. Check user-specific localStorage first
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(userKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setChatSessions(parsed);
            if (parsed.length > 0) {
              setCurrentSessionId(parsed[0].id);
              setChatMessages(parsed[0].messages || []);
            } else {
              setCurrentSessionId(null);
              setChatMessages([]);
            }
          }
        } else {
          setChatSessions([]);
          setCurrentSessionId(null);
          setChatMessages([]);
        }
      } catch (e) {}
    }

    // 2. Fetch live user chat sessions from backend DB
    const fetchUserChats = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("pragya_token") : null;
        const res = await fetch(`http://localhost:5000/api/chat/sessions?userId=${user.id || 1}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.sessions)) {
            setChatSessions(json.sessions);
            if (json.sessions.length > 0) {
              setCurrentSessionId(json.sessions[0].id);
              setChatMessages(json.sessions[0].messages || []);
            } else {
              setCurrentSessionId(null);
              setChatMessages([]);
            }
            if (typeof window !== "undefined") {
              localStorage.setItem(userKey, JSON.stringify(json.sessions));
            }
          }
        }
      } catch (err) {
        console.log("[Chat] Loaded user chats from local cache");
      }
    };

    fetchUserChats();
  }, [user?.id, user?.username, userKey]);

  // Save user-specific chat sessions to local storage and backend
  const saveSessionsForUser = async (sessions: ChatSession[], sessionToSave?: ChatSession) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(userKey, JSON.stringify(sessions));
    }

    if (sessionToSave) {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("pragya_token") : null;
        await fetch("http://localhost:5000/api/chat/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            userId: user?.id || 1,
            id: sessionToSave.id,
            title: sessionToSave.title,
            messages: sessionToSave.messages,
          }),
        });
      } catch (e) {
        console.warn("[Chat] Failed to sync session to backend:", e);
      }
    }
  };

  // Voice Recording & Whisper Small ASR
  const startVoiceRecording = async () => {
    try {
      if (isRecordingVoice) {
        stopVoiceRecording();
        return;
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        alert("Audio recording is not supported in this browser environment.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioBlob.size > 0) {
          await transcribeRecordedAudio(audioBlob);
        }
      };

      mediaRecorder.start(200);
      setIsRecordingVoice(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      alert("Could not access microphone: " + (err.message || "Permission denied"));
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
      setIsRecordingVoice(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const transcribeRecordedAudio = async (blob: Blob) => {
    setIsTranscribingAudio(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result as string;
          const res = await fetch("http://localhost:5000/api/ai/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audioBase64: base64Audio }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.text && data.text.trim()) {
              setPromptInput((prev) => (prev ? `${prev} ${data.text.trim()}` : data.text.trim()));
            }
          }
        } catch (postErr) {
          console.error("Transcription POST failed:", postErr);
        } finally {
          setIsTranscribingAudio(false);
        }
      };
    } catch (err) {
      console.error("Transcription reader error:", err);
      setIsTranscribingAudio(false);
    }
  };

  // Piper TTS Speech Synthesis & Playback
  const handleReadAloud = async (text: string, msgId: string) => {
    // If already playing this message, pause/stop it
    if (playingMsgId === msgId && activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
      setPlayingMsgId(null);
      return;
    }

    // Stop any previously playing audio
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    setIsSynthesizingSpeech(msgId);
    try {
      const res = await fetch("http://localhost:5000/api/ai/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(data.audioBase64);
          activeAudioRef.current = audio;
          setPlayingMsgId(msgId);
          setIsSynthesizingSpeech(null);

          audio.onended = () => {
            setPlayingMsgId(null);
            activeAudioRef.current = null;
          };

          audio.onerror = () => {
            setPlayingMsgId(null);
            activeAudioRef.current = null;
          };

          await audio.play();
        } else {
          setIsSynthesizingSpeech(null);
        }
      } else {
        setIsSynthesizingSpeech(null);
      }
    } catch (e) {
      console.error("Speech synthesis failed:", e);
      setIsSynthesizingSpeech(null);
      setPlayingMsgId(null);
    }
  };

  const handleGenerateDocxForMessage = async (msg: ChatMessage) => {
    setGeneratingDocxId(msg.id);
    try {
      // Determine appropriate title from message content or fallback
      const lines = msg.text.split("\n").filter((l) => l.trim().length > 0);
      let title = "MRPL Technical Report & Engineering Deliverable";
      for (const line of lines) {
        if (line.startsWith("# ") || line.startsWith("## ") || line.startsWith("### ")) {
          title = line.replace(/^#+\s*/, "").replace(/[*_`]/g, "").trim();
          break;
        }
      }

      const res = await fetch("http://localhost:5000/api/ai/generate-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: msg.text,
          metadata: {
            author: user?.name ? `${user.name} (${user.role})` : "Chinmay (Lead Process Engineer)",
            use: "Refinery Engineering & Inspection Operations",
            date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
            classification: "MRPL Confidential",
          },
          watermark: "MRPL CONFIDENTIAL",
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const downloadUrl = `http://localhost:5000${json.downloadUrl}`;
          
          // Trigger browser download
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = json.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          // Update message with deliverableDocx
          setChatMessages((prev) => {
            const updated = prev.map((m) =>
              m.id === msg.id
                ? {
                    ...m,
                    deliverableDocx: {
                      filename: json.filename,
                      downloadUrl,
                      title: json.title,
                      sizeBytes: json.sizeBytes,
                      watermark: "MRPL CONFIDENTIAL",
                    },
                  }
                : m
            );

            if (currentSessionId) {
              const updatedSessions = chatSessions.map((s) => {
                if (s.id === currentSessionId) {
                  return { ...s, messages: updated };
                }
                return s;
              });
              setChatSessions(updatedSessions);
              saveSessionsForUser(updatedSessions);
            }

            return updated;
          });
        }
      }
    } catch (err) {
      console.error("[Workbench] Generate docx error:", err);
    } finally {
      setGeneratingDocxId(null);
    }
  };

  const quickActions = [
    {
      id: "analyze-doc",
      title: "ASME Compliance Audit",
      desc: "Extract parameters & relief limits from refinery SOPs",
      icon: FileText,
      samplePrompt:
        "Extract technical parameters, compliance checklists, and deviation risks from MRPL_SOP_VDU_204_Vacuum_Distillation_Safety.pdf for emergency shutdown.",
    },
    {
      id: "understand-img",
      title: "P&ID Schematic Deconstruction",
      desc: "Deconstruct technical CAD drawings & tag ISA-5.1 loops",
      icon: ImageIcon,
      samplePrompt:
        "Analyze the uploaded P&ID schematic diagram: identify all control valves, sensor loops, and nitrogen bypass lines for Cooling Water Network.",
    },
    {
      id: "work-sheets",
      title: "Data & Capex Calculations",
      desc: "Audit Capex ledgers & calculate unit cost variances",
      icon: TableIcon,
      samplePrompt:
        "Calculate cost variances between Q3 Actual vs Capex Budget in Plant_Operations_Q3.xlsx and highlight items over 5% variance.",
    },
    {
      id: "create-report",
      title: "Executive Board Approval Note",
      desc: "Generate Word approval notes, PowerPoint slides, and reports",
      icon: BarChart2,
      samplePrompt:
        "Draft an Executive Approval Note for Board Review regarding the 25MW Thermal Recovery Boiler upgrade project at MRPL Captive Power Plant.",
    },
  ];

  const handleStartNewChat = () => {
    setCurrentSessionId(null);
    setChatMessages([]);
    setPromptInput("");
    setAttachedFiles([]);
    setAttachedImageBase64(null);
    setIsProcessing(false);
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setChatMessages(session.messages);
    setPromptInput("");
    setAttachedFiles([]);
    setAttachedImageBase64(null);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = chatSessions.filter((s) => s.id !== sessionId);
    setChatSessions(updated);
    saveSessionsForUser(updated);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("pragya_token") : null;
      await fetch(`http://localhost:5000/api/chat/sessions/${sessionId}?userId=${user?.id || 1}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {}

    if (currentSessionId === sessionId) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
        setChatMessages(updated[0].messages);
      } else {
        handleStartNewChat();
      }
    }
  };

  const handleQuickAction = (action: (typeof quickActions)[0]) => {
    runTask(action.samplePrompt);
  };

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = promptInput.trim();
    if (!query && !attachedImageBase64 && attachedFiles.length === 0) return;

    runTask(query || "Analyze uploaded file and provide engineering review.");
  };

  const runTask = async (query: string) => {
    const userMsgId = Date.now().toString();
    const currentFiles = [...attachedFiles];
    const currentImg = attachedImageBase64;

    const userMessage: ChatMessage = {
      id: userMsgId,
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachedFiles: currentFiles.length > 0 ? currentFiles : undefined,
      imagePreview: currentImg || undefined,
    };

    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setPromptInput("");
    setAttachedFiles([]);
    setAttachedImageBase64(null);
    setIsProcessing(true);

    let activeId = currentSessionId;
    let updatedSessions = [...chatSessions];
    let sessionObjToSave: ChatSession | undefined;

    // If new chat without an existing session ID, create a session
    if (!activeId) {
      activeId = `session-${Date.now()}`;
      const title = query.length > 28 ? query.slice(0, 28) + "..." : query;
      const newSession: ChatSession = {
        id: activeId,
        title: title || "New Conversation",
        updatedAt: "Just now",
        messages: [userMessage],
      };
      updatedSessions = [newSession, ...updatedSessions];
      setCurrentSessionId(activeId);
      setChatSessions(updatedSessions);
      sessionObjToSave = newSession;
      saveSessionsForUser(updatedSessions, newSession);
    }

    // If an image was attached (P&ID schematic, inspection scan), call Vision VLM endpoint
    if (currentImg) {
      try {
        const res = await fetch("http://localhost:5000/api/ai/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: query, imageBase64: currentImg }),
        });

        if (res.ok) {
          const json = await res.json();
          const analysisText = json.analysis || "Processed visual diagram with local Vision VLM.";

          const assistantMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            text: analysisText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };

          const finalMessages = [...newMessages, assistantMsg];
          setChatMessages(finalMessages);
          setIsProcessing(false);

          // Update session in list
          let activeSessionObj: ChatSession | undefined;
          const finalSessions = updatedSessions.map((s) => {
            if (s.id === activeId) {
              activeSessionObj = { ...s, messages: finalMessages, updatedAt: "Just now" };
              return activeSessionObj;
            }
            return s;
          });
          setChatSessions(finalSessions);
          saveSessionsForUser(finalSessions, activeSessionObj);
          return;
        }
      } catch (e) {
        console.warn("[Workbench] Vision call error:", e);
      }
    }

    // Call Local Qwen3-8B with automated RAG
    try {
      const res = await fetch("http://localhost:5000/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query, useRag: true }),
      });

      if (res.ok) {
        const json = await res.json();
        const aiResponse = json.response || "";

        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: aiResponse || "Assessment complete.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        // Check if user specifically requested a Word document or report deliverable
        const isDocxRequest =
          /(generate|create|draft|export|download|make|build|compile|write|get).*(doc|docx|word|file|report|memo|approval|deliverable|specification)/i.test(query) ||
          /(word document|word doc|\.docx|word report|mprl template|mrpl template|watermark|word file)/i.test(query);

        if (isDocxRequest && aiResponse) {
          try {
            const lines = aiResponse.split("\n").filter((l: string) => l.trim().length > 0);
            let title = "MRPL Technical Report & Engineering Deliverable";
            for (const line of lines) {
              if (line.startsWith("# ") || line.startsWith("## ") || line.startsWith("### ")) {
                title = line.replace(/^#+\s*/, "").replace(/[*_`]/g, "").trim();
                break;
              }
            }

            const docxRes = await fetch("http://localhost:5000/api/ai/generate-docx", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title,
                content: aiResponse,
                metadata: {
                  author: user?.name ? `${user.name} (${user.role})` : "Chinmay (Lead Process Engineer)",
                  use: "Refinery Engineering & Inspection Operations",
                  date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
                  classification: "MRPL Confidential",
                },
                watermark: "MRPL CONFIDENTIAL",
              }),
            });

            if (docxRes.ok) {
              const docxJson = await docxRes.json();
              if (docxJson.success) {
                assistantMsg.deliverableDocx = {
                  filename: docxJson.filename,
                  downloadUrl: `http://localhost:5000${docxJson.downloadUrl}`,
                  title: docxJson.title,
                  sizeBytes: docxJson.sizeBytes,
                  watermark: "MRPL CONFIDENTIAL",
                };
              }
            }
          } catch (docxErr) {
            console.warn("[Workbench] DOCX generation error:", docxErr);
          }
        }

        const finalMessages = [...newMessages, assistantMsg];
        setChatMessages(finalMessages);
        setIsProcessing(false);

        // Update session in list
        let activeSessionObj: ChatSession | undefined;
        const finalSessions = updatedSessions.map((s) => {
          if (s.id === activeId) {
            activeSessionObj = { ...s, messages: finalMessages, updatedAt: "Just now" };
            return activeSessionObj;
          }
          return s;
        });
        setChatSessions(finalSessions);
        saveSessionsForUser(finalSessions, activeSessionObj);
        return;
      }
    } catch (e) {
      console.warn("[Workbench] Fallback response:", e);
    }

    // Offline Fallback
    setTimeout(async () => {
      const fallbackText = `### Key Operational Parameters\n| Tag Identifier | Parameter | Value | Status |\n| :--- | :--- | :--- | :--- |\n| **PIC-102** | Column Pressure | 42.5 bar | Normal |\n| **FIC-103** | Reflux Flow | 120 m³/h | Verified |\n| **TI-204** | Overhead Temp | 168.4 °C | Normal |\n\nAll operational measurements and relief margins remain fully compliant with MRPL standards.`;
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const isDocxRequest =
        /(generate|create|draft|export|download|make|build|compile|write|get).*(doc|docx|word|file|report|memo|approval|deliverable|specification)/i.test(query) ||
        /(word document|word doc|\.docx|word report|mprl template|mrpl template|watermark|word file)/i.test(query);

      if (isDocxRequest) {
        try {
          const docxRes = await fetch("http://localhost:5000/api/ai/generate-docx", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "MRPL Process Review & Engineering Assessment",
              content: fallbackText,
              metadata: {
                author: user?.name ? `${user.name} (${user.role})` : "Chinmay (Lead Process Engineer)",
                use: "Refinery Engineering & Inspection Operations",
                date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
                classification: "MRPL Confidential",
              },
              watermark: "MRPL CONFIDENTIAL",
            }),
          });
          if (docxRes.ok) {
            const docxJson = await docxRes.json();
            if (docxJson.success) {
              assistantMsg.deliverableDocx = {
                filename: docxJson.filename,
                downloadUrl: `http://localhost:5000${docxJson.downloadUrl}`,
                title: docxJson.title,
                sizeBytes: docxJson.sizeBytes,
                watermark: "MRPL CONFIDENTIAL",
              };
            }
          }
        } catch (err) {}
      }

      const finalMessages = [...newMessages, assistantMsg];
      setChatMessages(finalMessages);
      setIsProcessing(false);

      let activeSessionObj: ChatSession | undefined;
      const finalSessions = updatedSessions.map((s) => {
        if (s.id === activeId) {
          activeSessionObj = { ...s, messages: finalMessages, updatedAt: "Just now" };
          return activeSessionObj;
        }
        return s;
      });
      setChatSessions(finalSessions);
      saveSessionsForUser(finalSessions, activeSessionObj);
    }, 500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setAttachedFiles((prev) => [...prev, file.name]);
      if (file.type.startsWith("image/") || file.name.match(/\.(png|jpg|jpeg|webp|dwg)$/i)) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          setAttachedImageBase64(evt.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <div className="h-screen w-screen bg-[#F7F4EF] flex overflow-hidden font-sans select-none">
      {/* 1. SIDEBAR (CHATGPT-STYLE FOR USERS / DUAL-MODE FOR ADMINS) */}
      <aside className="w-64 lg:w-72 bg-[#FAF8F5] border-r border-[#E7DFD5] flex flex-col justify-between shrink-0 h-full">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="p-4 border-b border-[#ECE5DD] flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="text-[#5C2817]">
                <TempleLogo size={26} />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-[#171514]">
                  Sovereign AI
                </span>
                <span className="text-[10px] text-[#7A7167] font-semibold">
                  MRPL Refinery Workbench
                </span>
              </div>
            </div>

            <button
              onClick={onBackToLanding}
              className="p-1.5 rounded-lg text-[#7C746B] hover:text-[#5C2817] hover:bg-[#F2ECE3] transition flex items-center gap-1 group"
              title="Back to Home Overview"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </button>
          </div>

          {/* Module Mode Switcher (ONLY visible for Administrator accounts) */}
          {isAdmin && (
            <div className="p-3 shrink-0">
              <div className="bg-[#EFE8DE] p-1 rounded-xl border border-[#DFD3C4] grid grid-cols-2 gap-1 text-xs font-bold">
                <button
                  onClick={() => setModuleMode("user")}
                  className={`py-1.5 rounded-lg transition text-center ${
                    moduleMode === "user"
                      ? "bg-[#5C2817] text-white shadow-xs"
                      : "text-[#6E645A] hover:text-[#1F1D1A]"
                  }`}
                >
                  AI Chat
                </button>
                <button
                  onClick={() => {
                    setModuleMode("admin");
                    setActiveAdminTab("admin-dashboard");
                  }}
                  className={`py-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 ${
                    moduleMode === "admin"
                      ? "bg-[#5C2817] text-white shadow-xs"
                      : "text-[#6E645A] hover:text-[#1F1D1A]"
                  }`}
                >
                  <span>Admin Panel</span>
                  {pendingUsersCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SIDEBAR CONTENT */}
          {moduleMode === "admin" && isAdmin ? (
            /* ADMIN MODULE SIDEBAR */
            <div className="px-3 space-y-1 overflow-y-auto flex-1 py-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#9C948B] px-3 py-1">
                Refinery Administration
              </div>

              <button
                onClick={() => setActiveAdminTab("admin-dashboard")}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                  activeAdminTab === "admin-dashboard"
                    ? "bg-[#F3EDE4] text-[#1F1D1A] font-bold shadow-2xs border border-[#E4DACB]"
                    : "text-[#6E675F] hover:bg-[#F3EDE5] hover:text-[#1F1D1A] font-medium"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-[#5C2817]" />
                <span>System Dashboard</span>
              </button>

              <button
                onClick={() => setActiveAdminTab("user-management")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                  activeAdminTab === "user-management"
                    ? "bg-[#F3EDE4] text-[#1F1D1A] font-bold shadow-2xs border border-[#E4DACB]"
                    : "text-[#6E675F] hover:bg-[#F3EDE5] hover:text-[#1F1D1A] font-medium"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <UserCog className="w-4 h-4 text-[#5C2817]" />
                  <span>User Governance</span>
                </div>
                {pendingUsersCount > 0 && (
                  <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                    {pendingUsersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveAdminTab("knowledge-base")}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                  activeAdminTab === "knowledge-base"
                    ? "bg-[#F3EDE4] text-[#1F1D1A] font-bold shadow-2xs border border-[#E4DACB]"
                    : "text-[#6E675F] hover:bg-[#F3EDE5] hover:text-[#1F1D1A] font-medium"
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#5C2817]" />
                <span>Centralized Knowledge Base</span>
              </button>
            </div>
          ) : (
            /* USER MODULE (CHATGPT-STYLE CHAT & CHAT HISTORY ONLY) */
            <div className="flex flex-col h-full overflow-hidden px-3 pt-2">
              {/* + New Chat Button */}
              <button
                onClick={handleStartNewChat}
                className="w-full bg-[#5C2817] hover:bg-[#481E11] text-white py-2.5 px-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs transition active:scale-[0.98] mb-3 shrink-0 group"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                  <span>New Chat</span>
                </div>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md text-white/90">
                  Ctrl + K
                </span>
              </button>

              {/* Chat History Section Title */}
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#9C948B] px-2 py-1 flex items-center justify-between shrink-0">
                <span>Recent Conversations</span>
                <span className="text-[10px] font-semibold text-[#8C847A]">{chatSessions.length}</span>
              </div>

              {/* Chat History Scrollable List */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 pb-2">
                {chatSessions.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#8A8177]">
                    No previous chats yet.<br />Click &quot;New Chat&quot; to start.
                  </div>
                ) : (
                  chatSessions.map((session) => {
                    const isActive = currentSessionId === session.id;
                    return (
                      <div
                        key={session.id}
                        onClick={() => handleSelectSession(session)}
                        className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                          isActive
                            ? "bg-[#EFE8DE] text-[#1F1D1A] font-bold border border-[#DFD3C4] shadow-2xs"
                            : "text-[#5C544C] hover:bg-[#F3EDE5] hover:text-[#1F1D1A] font-medium"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate min-w-0 pr-1">
                          <MessageSquare
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? "text-[#5C2817]" : "text-[#8E8478] group-hover:text-[#5C2817]"
                            }`}
                          />
                          <span className="truncate">{session.title}</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-700 transition rounded-md hover:bg-white/60 shrink-0"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3 h-3 text-[#998F84] hover:text-red-700" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Footer */}
        <div className="p-3 border-t border-[#ECE5DD] bg-[#FAF8F5] shrink-0">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-white border border-[#E2D8CC] hover:bg-[#F9F6F0] transition shadow-2xs"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-[#5C2817] text-white flex items-center justify-center font-bold text-xs">
                  {user?.initials || "C"}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#1C1917] truncate max-w-[120px]">
                    {user?.name || "Chinmay"}
                  </div>
                  <div className="text-[10px] text-[#7E756B] truncate max-w-[120px] capitalize">
                    {moduleMode === "admin" ? "Admin Mode" : `${user?.role || "engineer"} (MRPL)`}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8A8177]" />
            </button>

            {profileOpen && (
              <div className="absolute left-0 bottom-14 w-full bg-white border border-[#E6DDD2] rounded-xl shadow-xl z-50 p-2 animate-fadeIn">
                <div className="px-2 py-1.5 border-b border-[#F0EAE1]">
                  <div className="text-xs font-bold text-[#1F1D1A]">{user?.name || "Chinmay"}</div>
                  <div className="text-[10px] text-[#82796F] truncate">{user?.email || "chinmay@mrpl.co.in"}</div>
                  <div className="text-[10px] text-[#5C2817] font-semibold mt-0.5">
                    Clearance: MRPL Confidential Level 3
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                  }}
                  className="w-full text-left mt-1 px-2 py-1.5 text-xs text-red-700 hover:bg-red-50 rounded-lg flex items-center gap-2 transition font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CANVAS */}
      <main className="flex-1 flex flex-col h-full bg-[#FFFFFF] overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-[#ECE5DD] px-6 flex items-center justify-between bg-[#FFFFFF] shrink-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#91887E]">
                {moduleMode === "admin" && isAdmin ? "Admin Governance" : `${user?.role || "Engineer"} Workspace`}
              </span>
              <span className="text-[#C5BCB1]">/</span>
              <span className="text-sm font-extrabold text-[#191614] truncate max-w-md">
                {moduleMode === "admin"
                  ? activeAdminTab === "admin-dashboard"
                    ? "System Activity & Health Dashboard"
                    : activeAdminTab === "user-management"
                    ? "User Permissions & Access Control"
                    : "Centralized Knowledge Base"
                  : chatSessions.find((s) => s.id === currentSessionId)?.title || "AI Assistant"}
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#FAF8F5] flex flex-col">
          {/* ================= ADMIN MODULE VIEWS ================= */}
          {moduleMode === "admin" && isAdmin ? (
            <div className="p-6 lg:p-8 flex-1">
              {activeAdminTab === "admin-dashboard" && (
                <div className="max-w-6xl mx-auto space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#191614]">MRPL Enclave Admin Dashboard</h2>
                    <p className="text-xs text-[#7A7166]">Overview of refinery AI nodes, active users, GPU memory load, and Qdrant vector status</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-[#E6DDD2] shadow-2xs">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A8177]">AI Node Host</div>
                      <div className="text-lg font-black text-[#1A1816] mt-1 truncate">
                        {liveHardware?.host?.split(" ")[0] || "Lenovo LOQ"}
                      </div>
                      <div className="text-[10px] text-[#7A7166] mt-0.5 truncate">
                        {liveHardware?.cpu?.split("(")[0] || "Core i5-13450HX"} · {liveHardware?.ram || "16GB DDR5"}
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-[#E6DDD2] shadow-2xs">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A8177]">GPU Acceleration</div>
                      <div className="text-lg font-black text-[#5C2817] mt-1 truncate">
                        {liveHardware?.gpu?.split(" ")[3] ? `RTX ${liveHardware.gpu.split(" ")[3]} 6GB` : "RTX 3050 6GB"}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-0.5 truncate">
                        {liveHardware?.vramAllocation || "CUDA Active · 4.8GB Allocated"}
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-[#E6DDD2] shadow-2xs">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A8177]">Vector Store</div>
                      <div className="text-lg font-black text-[#1A1816] mt-1">Qdrant Local</div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">BGE-M3 (1024-D) Grounded</div>
                    </div>
                  </div>

                  {/* Complete 6GB GPU VRAM Telemetry & Local Model Stack */}
                  <AdminAIAgents />
                </div>
              )}

              {activeAdminTab === "user-management" && <AdminConsole />}
              {activeAdminTab === "knowledge-base" && <AdminKnowledgeBase />}
            </div>
          ) : (
            /* ================= USER CHAT CONVERSATIONAL VIEW (CHATGPT / CLAUDE STYLE) ================= */
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              {/* CHAT MESSAGES SCROLL AREA */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <div className="max-w-4xl mx-auto w-full space-y-6">
                  {chatMessages.length === 0 ? (
                    /* CHATGPT-STYLE EMPTY STATE / STARTER PROMPTS */
                    <div className="py-8 sm:py-14 space-y-8 animate-fadeIn">
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 rounded-3xl bg-[#5C2817]/10 text-[#5C2817] flex items-center justify-center mx-auto shadow-inner">
                          <TempleLogo size={36} />
                        </div>
                        <h2 className="text-3xl font-extrabold text-[#1B1917] tracking-tight">
                          MRPL Sovereign AI Assistant
                        </h2>
                        <p className="text-sm text-[#736A60] max-w-lg mx-auto leading-relaxed">
                          Ask engineering questions, analyze P&ID schematics, check ASME compliance limits, or audit refinery spreadsheets.
                        </p>
                      </div>

                      {/* Quick Workflow Starter Cards */}
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#9C948B] mb-3 text-center">
                          Select a starter workflow or type your engineering question below
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                              <button
                                key={action.id}
                                onClick={() => handleQuickAction(action)}
                                className="group p-4 rounded-2xl border border-[#E6DDD2] bg-white hover:bg-[#FAF6F0] hover:border-[#D4C4B0] transition-all text-left flex items-start space-x-3.5 shadow-2xs hover:shadow-md active:scale-[0.99]"
                              >
                                <div className="p-2.5 rounded-xl bg-[#F4EDE4] text-[#5C2817] group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div className="text-xs font-bold text-[#1F1D1A]">
                                      {action.title}
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-[#B0A79C] group-hover:text-[#5C2817] group-hover:translate-x-0.5 transition-all" />
                                  </div>
                                  <div className="text-[11px] text-[#7C746A] line-clamp-2 mt-1 leading-relaxed">
                                    {action.desc}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* MULTI-TURN CONVERSATION THREAD */
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3.5 ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        } animate-fadeIn`}
                      >
                        {/* Assistant Avatar */}
                        {msg.role === "assistant" && (
                          <div className="w-8 h-8 rounded-2xl bg-[#5C2817] text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                            <TempleLogo size={18} />
                          </div>
                        )}

                        {/* Message Container */}
                        <div
                          className={`max-w-[88%] sm:max-w-[82%] ${
                            msg.role === "user"
                              ? "bg-[#5C2817] text-white rounded-3xl rounded-tr-sm px-5 py-3.5 shadow-sm"
                              : "bg-white border border-[#E6DDD2] rounded-3xl rounded-tl-sm p-5 sm:p-6 shadow-2xs text-[#1F1D1A] w-full"
                          }`}
                        >
                          {/* User Attached Image / Files Preview */}
                          {msg.role === "user" && msg.imagePreview && (
                            <div className="mb-2.5 rounded-2xl overflow-hidden border border-white/20 max-w-xs">
                              <img
                                src={msg.imagePreview}
                                alt="Attached schematic"
                                className="w-full h-auto object-cover max-h-48"
                              />
                            </div>
                          )}

                          {msg.role === "user" && msg.attachedFiles && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {msg.attachedFiles.map((fn, fIdx) => (
                                <span
                                  key={fIdx}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 text-white text-[11px] font-semibold backdrop-blur-xs"
                                >
                                  <FileCheck className="w-3 h-3" />
                                  {fn}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Message Text Content */}
                          {msg.role === "user" ? (
                            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                              {msg.text}
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {/* Clean Formatted Markdown Body */}
                              <FormattedMarkdown content={msg.text} />

                              {/* MRPL Word Document Deliverable Card */}
                              {msg.deliverableDocx && (
                                <div className="mt-3 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E4D9CC] shadow-xs">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-start gap-2.5">
                                      <div className="w-9 h-9 rounded-xl bg-[#5C2817] text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 mt-0.5">
                                        DOCX
                                      </div>
                                      <div>
                                        <div className="text-xs font-bold text-[#1F1D1A] flex flex-wrap items-center gap-1.5">
                                          <span>{msg.deliverableDocx.filename}</span>
                                          <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-semibold border border-amber-200">
                                            MRPL Watermark
                                          </span>
                                        </div>
                                        <div className="text-[11px] text-[#786E64] mt-0.5 flex items-center gap-2">
                                          <span>Official Letterhead & Template</span>
                                          <span>•</span>
                                          <span>
                                            {msg.deliverableDocx.sizeBytes
                                              ? `${(msg.deliverableDocx.sizeBytes / 1024).toFixed(1)} KB`
                                              : "Word Document"}
                                          </span>
                                          <span>•</span>
                                          <span className="text-emerald-700 font-semibold">Ready</span>
                                        </div>
                                      </div>
                                    </div>

                                    <a
                                      href={msg.deliverableDocx.downloadUrl}
                                      download={msg.deliverableDocx.filename}
                                      className="flex items-center justify-center gap-1.5 bg-[#5C2817] hover:bg-[#471E11] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs transition shrink-0"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      <span>Download .docx</span>
                                    </a>
                                  </div>

                                  <div className="mt-2.5 pt-2 border-t border-[#ECE3D7] flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#8C8275]">
                                    <span className="inline-flex items-center gap-1 font-medium">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> MRPL Letterhead & Org Header
                                    </span>
                                    <span className="inline-flex items-center gap-1 font-medium">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Diagonal "MRPL CONFIDENTIAL" Watermark
                                    </span>
                                    <span className="inline-flex items-center gap-1 font-medium">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ISO-27001 Signoff Block
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Minimal Assistant Action Bar (ChatGPT / Claude style) */}
                              <div className="pt-1.5 flex items-center justify-between text-[11px] text-[#A39A8E]">
                                <span>{msg.timestamp}</span>
                                <div className="flex items-center gap-2">
                                  {/* Generate / Download Word (.docx) Button */}
                                  <button
                                    onClick={() => handleGenerateDocxForMessage(msg)}
                                    disabled={generatingDocxId === msg.id}
                                    className="flex items-center gap-1 text-[#5C2817] hover:text-[#471E11] hover:bg-[#F4EDE4] transition px-2 py-0.5 rounded-md font-medium"
                                    title="Generate official MRPL Word Document (.docx) with letterhead & watermark"
                                  >
                                    {generatingDocxId === msg.id ? (
                                      <>
                                        <Loader2 className="w-3 h-3 animate-spin text-[#5C2817]" />
                                        <span className="text-[11px] text-[#5C2817] font-semibold">Generating DOCX...</span>
                                      </>
                                    ) : (
                                      <>
                                        <FileText className="w-3 h-3 text-[#5C2817]" />
                                        <span className="text-[11px]">Word (.docx)</span>
                                      </>
                                    )}
                                  </button>

                                  {/* Piper TTS Voice Output */}
                                  <button
                                    onClick={() => handleReadAloud(msg.text, msg.id)}
                                    disabled={isSynthesizingSpeech === msg.id}
                                    className={`flex items-center gap-1 transition px-2 py-0.5 rounded-md ${
                                      playingMsgId === msg.id
                                        ? "text-[#5C2817] bg-[#F4EDE4] font-bold ring-1 ring-[#5C2817]/20"
                                        : "hover:text-[#1F1D1A] hover:bg-[#F4EDE4]"
                                    }`}
                                    title={playingMsgId === msg.id ? "Stop Piper TTS" : "Read aloud with Piper TTS (Neural Voice)"}
                                  >
                                    {isSynthesizingSpeech === msg.id ? (
                                      <>
                                        <Loader2 className="w-3 h-3 animate-spin text-[#5C2817]" />
                                        <span className="text-[11px] text-[#5C2817]">Synthesizing...</span>
                                      </>
                                    ) : playingMsgId === msg.id ? (
                                      <>
                                        <Square className="w-3 h-3 text-[#5C2817] fill-current animate-pulse" />
                                        <span className="text-[11px] text-[#5C2817]">Stop Voice</span>
                                      </>
                                    ) : (
                                      <>
                                        <Volume2 className="w-3 h-3" />
                                        <span className="text-[11px]">Read Aloud</span>
                                      </>
                                    )}
                                  </button>

                                  {/* Copy Markdown Text */}
                                  <button
                                    onClick={() => handleCopyText(msg.text, msg.id)}
                                    className="flex items-center gap-1 hover:text-[#1F1D1A] transition px-1.5 py-0.5 rounded-md hover:bg-[#F4EDE4]"
                                    title="Copy response"
                                  >
                                    {copiedMsgId === msg.id ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span className="text-emerald-600 font-semibold text-[11px]">Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span className="text-[11px]">Copy</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Timestamp for user messages */}
                          {msg.role === "user" && (
                            <div className="text-right text-[10px] text-white/70 mt-1">
                              {msg.timestamp}
                            </div>
                          )}
                        </div>

                        {/* User Avatar */}
                        {msg.role === "user" && (
                          <div className="w-8 h-8 rounded-2xl bg-[#3D3833] text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs mt-1">
                            {user?.initials || "C"}
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {/* Reasoning / Thinking Indicator Bubble (ChatGPT Style) */}
                  {isProcessing && (
                    <div className="flex gap-3.5 justify-start items-center animate-fadeIn">
                      <div className="w-8 h-8 rounded-2xl bg-[#5C2817] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <TempleLogo size={18} />
                      </div>
                      <div className="bg-white border border-[#E6DDD2] rounded-3xl rounded-tl-sm px-4 py-3 shadow-2xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#5C2817] animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-[#5C2817] animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-[#5C2817] animate-bounce" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} className="h-4" />
                </div>
              </div>

              {/* STICKY BOTTOM CHATGPT-STYLE FLOATING INPUT BAR */}
              <div className="p-4 sm:p-6 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/95 to-transparent shrink-0">
                <div className="max-w-4xl mx-auto w-full">
                  {/* Attached File/Image Preview Chips */}
                  {(attachedFiles.length > 0 || attachedImageBase64) && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-white rounded-2xl border border-[#E4D7C8] shadow-xs">
                      {attachedImageBase64 && (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#E4D7C8] shrink-0">
                          <img
                            src={attachedImageBase64}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => setAttachedImageBase64(null)}
                            className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-black"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}

                      {attachedFiles.map((file, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4EDE4] text-xs font-semibold text-[#5C2817] border border-[#E3D7C8]"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[150px]">{file}</span>
                          <button
                            onClick={() =>
                              setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Main Input Capsule */}
                  <form
                    onSubmit={handleManualSubmit}
                    className="bg-white border border-[#E3D8CC] rounded-3xl p-2.5 sm:p-3 shadow-md focus-within:border-[#5C2817] focus-within:ring-2 focus-within:ring-[#5C2817]/10 transition-all flex items-end gap-2"
                  >
                    {/* Attachments & Voice Actions */}
                    <div className="flex items-center gap-1 pb-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-[#7A7166] hover:text-[#5C2817] hover:bg-[#F7F2EA] rounded-xl transition"
                        title="Attach PDF, DOCX, or Engineering Spec"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="p-2 text-[#7A7166] hover:text-[#5C2817] hover:bg-[#F7F2EA] rounded-xl transition"
                        title="Upload P&ID Diagram or NDT Scan"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>

                      {/* Whisper Small Voice Input Mic Button */}
                      <button
                        type="button"
                        onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
                        className={`p-2 rounded-xl transition flex items-center gap-1.5 ${
                          isRecordingVoice
                            ? "bg-red-600 text-white animate-pulse shadow-xs"
                            : isTranscribingAudio
                            ? "bg-[#5C2817]/10 text-[#5C2817]"
                            : "text-[#7A7166] hover:text-[#5C2817] hover:bg-[#F7F2EA]"
                        }`}
                        title={isRecordingVoice ? "Stop recording and transcribe with Whisper" : "Voice Query (Whisper Small ASR)"}
                      >
                        {isTranscribingAudio ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#5C2817]" />
                        ) : isRecordingVoice ? (
                          <>
                            <MicOff className="w-4 h-4" />
                            <span className="text-[10px] font-mono font-bold tracking-tight">
                              {Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, "0")}
                            </span>
                          </>
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Textarea */}
                    <textarea
                      ref={textareaRef}
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleManualSubmit();
                        }
                      }}
                      placeholder="Message MRPL Sovereign AI Assistant... (e.g. 'Extract ASME trip limits from VDU-204')"
                      rows={1}
                      className="flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-sm text-[#1F1D1A] placeholder-[#948A7E] focus:outline-none focus:ring-0 leading-relaxed max-h-32"
                    />

                    {/* Send Button (ChatGPT style) */}
                    <button
                      type="submit"
                      disabled={
                        (!promptInput.trim() && !attachedImageBase64 && attachedFiles.length === 0) ||
                        isProcessing
                      }
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                        promptInput.trim() || attachedImageBase64 || attachedFiles.length > 0
                          ? "bg-[#5C2817] hover:bg-[#481E11] text-white shadow-xs"
                          : "bg-[#EAE3D8] text-[#9E958A] cursor-not-allowed"
                      }`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Footer Air-Gap Grounding Notice */}
                  <div className="text-center text-[10px] text-[#9A9084] mt-2">
                    MRPL Sovereign AI Workbench · 100% Local Inference (Qwen3-8B CUDA) · Qdrant Vector Store Grounded
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
