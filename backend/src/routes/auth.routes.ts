import { Router } from "express";
import {
  register,
  login,
  getCurrentUser,
  listUsers,
  updateUserStatus,
  updateUserRole,
} from "../controllers/auth.controller";
import { authenticateToken, optionalAuth } from "../middleware/auth.middleware";

const router = Router();

// Public auth endpoints
router.post("/register", register);
router.post("/login", login);

// Authenticated user endpoints
router.get("/me", authenticateToken, getCurrentUser);

// Admin permission endpoints
router.get("/users", optionalAuth, listUsers);
router.patch("/users/:userId/status", optionalAuth, updateUserStatus);
router.patch("/users/:userId/role", optionalAuth, updateUserRole);

export default router;
