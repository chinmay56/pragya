import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { userStore } from "../services/userStore.service";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "pragya_super_secret_jwt_key_2026_airgapped";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// 1. User Registration (Created in 'pending' status awaiting Admin Permission)
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password, fullName, role = "engineer", authProvider = "local" } = req.body;

    if (!username || !email || !password || !fullName) {
      res.status(400).json({
        success: false,
        message: "Username, email, password, and fullName are required.",
      });
      return;
    }

    // Check if user already exists
    const exists = await userStore.exists(username, email);
    if (exists) {
      res.status(409).json({
        success: false,
        message: "A user with this username or email already exists in the system.",
      });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Save user with status = 'pending'
    const newUser = await userStore.createUser({
      username,
      email,
      passwordHash,
      fullName,
      role,
      authProvider,
    });

    res.status(201).json({
      success: true,
      status: "pending",
      message: "Account created successfully! Your account is currently in 'Pending Admin Approval' state. An administrator must approve your profile before you can access the workbench.",
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          fullName: newUser.full_name,
          role: newUser.role,
          status: "pending",
          authProvider: newUser.auth_provider,
        },
      },
    });
  } catch (error: any) {
    console.error("[Register Error]:", error);
    res.status(500).json({
      success: false,
      message: "Internal error during registration.",
      error: error.message,
    });
  }
}

// 2. User Login (Enforces Admin Permission Verification)
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      res.status(400).json({
        success: false,
        message: "Username/Email and password are required.",
      });
      return;
    }

    // Find user in userStore (checks MySQL & local JSON persistence)
    const user = await userStore.findByUsernameOrEmail(usernameOrEmail);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials. User not found.",
      });
      return;
    }

    // Check account active state
    if (!user.is_active) {
      res.status(403).json({
        success: false,
        message: "Account has been deactivated. Contact your administrator.",
      });
      return;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials. Incorrect password.",
      });
      return;
    }

    // Check ADMIN APPROVAL STATUS
    if (user.status === "pending") {
      res.status(403).json({
        success: false,
        status: "pending",
        message: "Access Denied: Your account is awaiting Administrator Permission. An administrator must approve your profile before you can access the workbench.",
      });
      return;
    }

    if (user.status === "rejected") {
      res.status(403).json({
        success: false,
        status: "rejected",
        message: "Access Denied: Your registration request was rejected by the administrator.",
      });
      return;
    }

    // Record login
    await userStore.recordLogin(user.id);

    // Create session record & JWT
    const sessionId = crypto.randomUUID();
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role, status: user.status, fullName: user.full_name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.json({
      success: true,
      message: "Sign in successful.",
      data: {
        token,
        sessionId,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          status: user.status,
          authProvider: user.auth_provider,
          initials: user.full_name.charAt(0).toUpperCase() || "C",
        },
      },
    });
  } catch (error: any) {
    console.error("[Login Error]:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
      error: error.message,
    });
  }
}

// 3. Get Current User Profile
export async function getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const user = await userStore.findByUsernameOrEmail(req.user.username);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          status: user.status,
          authProvider: user.auth_provider,
          initials: user.full_name.charAt(0).toUpperCase() || "C",
          lastLoginAt: user.last_login_at,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error: any) {
    console.error("[GetMe Error]:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
}

// 4. List All Users (for Admin Management & Workbench sync)
export async function listUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await userStore.getAllUsers();

    res.json({
      success: true,
      data: {
        users,
        total: users.length,
        pendingCount: users.filter((u: any) => u.status === "pending").length,
        approvedCount: users.filter((u: any) => u.status === "approved").length,
      },
    });
  } catch (error: any) {
    console.error("[ListUsers Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to list users.",
      error: error.message,
    });
  }
}

// 5. Admin Approve / Reject User Permission
export async function updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const { status } = req.body; // 'approved' | 'rejected' | 'pending'

    if (!["approved", "rejected", "pending"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved', 'rejected', or 'pending'.",
      });
      return;
    }

    const targetId = Array.isArray(userId) ? userId[0] : userId;
    const adminId = req.user?.id || 1;
    await userStore.updateStatus(targetId, status, adminId);

    res.json({
      success: true,
      message: `User access status updated to '${status}'.`,
    });
  } catch (error: any) {
    console.error("[UpdateUserStatus Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status.",
      error: error.message,
    });
  }
}

// 6. Admin Update User Role
export async function updateUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const targetId = Array.isArray(userId) ? userId[0] : userId;
    const { role } = req.body;

    if (!["admin", "engineer", "auditor", "analyst"].includes(role)) {
      res.status(400).json({
        success: false,
        message: "Invalid role.",
      });
      return;
    }

    await userStore.updateRole(targetId, role);

    res.json({
      success: true,
      message: `User role updated to '${role}'.`,
    });
  } catch (error: any) {
    console.error("[UpdateUserRole Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role.",
      error: error.message,
    });
  }
}
