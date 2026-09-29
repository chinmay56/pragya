import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { pool } from "../config/db";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(__dirname, "../../data");
const CHATS_FILE = path.join(DATA_DIR, "chat_sessions.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CHATS_FILE)) {
    fs.writeFileSync(CHATS_FILE, JSON.stringify({ sessions: [] }, null, 2));
  }
}

// 1. Get All Chat Sessions for the Authenticated User
export async function getUserSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || req.query.userId || 1;
    ensureDataDir();

    // 1. Try MySQL Database
    try {
      const [sessionRows]: any = await pool.query(
        "SELECT id, user_id, title, model_name, is_pinned, is_archived, created_at, updated_at FROM chat_sessions WHERE user_id = ? AND is_archived = 0 ORDER BY updated_at DESC",
        [userId]
      );

      if (Array.isArray(sessionRows) && sessionRows.length > 0) {
        const sessionIds = sessionRows.map((s: any) => s.id);
        const [msgRows]: any = await pool.query(
          "SELECT id, session_id, user_id, role, content, citations, created_at FROM chat_messages WHERE session_id IN (?) ORDER BY created_at ASC",
          [sessionIds]
        );

        const sessionsWithMsgs = sessionRows.map((s: any) => {
          const msgs = (msgRows || [])
            .filter((m: any) => m.session_id === s.id)
            .map((m: any) => ({
              id: m.id,
              role: m.role,
              text: m.content,
              timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              citations: typeof m.citations === "string" ? JSON.parse(m.citations) : m.citations || undefined,
            }));

          return {
            id: s.id,
            title: s.title,
            updatedAt: new Date(s.updated_at).toLocaleDateString(),
            messages: msgs,
          };
        });

        res.json({ success: true, sessions: sessionsWithMsgs });
        return;
      }
    } catch (dbErr: any) {
      // Fallback to JSON store
    }

    // 2. Fallback to Local JSON storage
    const raw = fs.readFileSync(CHATS_FILE, "utf-8");
    const data = JSON.parse(raw);
    const userSessions = (data.sessions || []).filter((s: any) => String(s.userId) === String(userId));

    res.json({ success: true, sessions: userSessions });
  } catch (error: any) {
    console.error("[GetSessions Error]:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// 2. Create or Update a Chat Session with Messages for the Authenticated User
export async function saveUserSession(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || req.body.userId || 1;
    const { id, title, messages = [], modelName = "qwen3:8b" } = req.body;

    if (!id || !title) {
      res.status(400).json({ success: false, message: "Session ID and title are required." });
      return;
    }

    ensureDataDir();

    // 1. Save to MySQL
    try {
      await pool.query(
        "INSERT INTO chat_sessions (id, user_id, title, model_name, updated_at) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE title = VALUES(title), updated_at = NOW()",
        [id, userId, title, modelName]
      );

      for (const msg of messages) {
        await pool.query(
          "INSERT INTO chat_messages (id, session_id, user_id, role, content, citations) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content)",
          [
            msg.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            id,
            userId,
            msg.role,
            msg.text,
            msg.citations ? JSON.stringify(msg.citations) : null,
          ]
        );
      }
    } catch (dbErr: any) {
      // MySQL error handled gracefully by JSON persistence below
    }

    // 2. Save to JSON Store
    const raw = fs.readFileSync(CHATS_FILE, "utf-8");
    const data = JSON.parse(raw);
    const sessionObj = {
      id,
      userId: Number(userId),
      title,
      updatedAt: "Just now",
      messages,
    };

    const existingIndex = (data.sessions || []).findIndex((s: any) => s.id === id);
    if (existingIndex >= 0) {
      data.sessions[existingIndex] = sessionObj;
    } else {
      data.sessions = [sessionObj, ...(data.sessions || [])];
    }

    fs.writeFileSync(CHATS_FILE, JSON.stringify(data, null, 2));

    res.json({ success: true, message: "Chat session saved successfully.", session: sessionObj });
  } catch (error: any) {
    console.error("[SaveSession Error]:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// 3. Delete a Chat Session
export async function deleteUserSession(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || req.query.userId || 1;
    const { sessionId } = req.params;

    ensureDataDir();

    // 1. Delete from MySQL
    try {
      await pool.query("DELETE FROM chat_sessions WHERE id = ? AND user_id = ?", [sessionId, userId]);
    } catch (dbErr: any) {}

    // 2. Delete from JSON Store
    const raw = fs.readFileSync(CHATS_FILE, "utf-8");
    const data = JSON.parse(raw);
    data.sessions = (data.sessions || []).filter((s: any) => !(s.id === sessionId && String(s.userId) === String(userId)));
    fs.writeFileSync(CHATS_FILE, JSON.stringify(data, null, 2));

    res.json({ success: true, message: "Chat session deleted successfully." });
  } catch (error: any) {
    console.error("[DeleteSession Error]:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
