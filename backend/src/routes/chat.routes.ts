import { Router } from "express";
import { getUserSessions, saveUserSession, deleteUserSession } from "../controllers/chat.controller";
import { optionalAuth } from "../middleware/auth.middleware";

const router = Router();

// Routes for user-specific chat management
router.get("/sessions", optionalAuth, getUserSessions);
router.post("/sessions", optionalAuth, saveUserSession);
router.delete("/sessions/:sessionId", optionalAuth, deleteUserSession);

export default router;
