import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { pool } from "../config/db";

export interface StoredUser {
  id: number | string;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: "admin" | "engineer" | "auditor" | "analyst";
  status: "approved" | "pending" | "rejected";
  auth_provider: string;
  is_active: boolean;
  approved_by?: number | string | null;
  approved_at?: string | null;
  last_login_at?: string | null;
  created_at: string;
}

const DATA_DIR = path.join(__dirname, "../../data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Default initial seeds
const defaultUsers: StoredUser[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@pragya.internal",
    password_hash: bcrypt.hashSync("PragyaPass2026!", 10),
    full_name: "System Administrator",
    role: "admin",
    status: "approved",
    auth_provider: "local",
    is_active: true,
    created_at: "2026-09-20T10:00:00Z",
  },
  {
    id: 2,
    username: "chinmay",
    email: "chinmay@enterprise.internal",
    password_hash: bcrypt.hashSync("PragyaPass2026!", 10),
    full_name: "Chinmay",
    role: "engineer",
    status: "approved",
    auth_provider: "local",
    is_active: true,
    created_at: "2026-09-22T10:00:00Z",
  },
  {
    id: 3,
    username: "rajesh",
    email: "rajesh.analyst@enterprise.internal",
    password_hash: bcrypt.hashSync("PragyaPass2026!", 10),
    full_name: "Rajesh Patel",
    role: "analyst",
    status: "pending",
    auth_provider: "local",
    is_active: true,
    created_at: "2026-09-25T10:00:00Z",
  },
  {
    id: 4,
    username: "priya",
    email: "priya.audit@enterprise.internal",
    password_hash: bcrypt.hashSync("PragyaPass2026!", 10),
    full_name: "Priya Menon",
    role: "auditor",
    status: "pending",
    auth_provider: "local",
    is_active: true,
    created_at: "2026-09-25T10:00:00Z",
  },
];

class UserStoreService {
  private users: StoredUser[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(USERS_FILE)) {
        const raw = fs.readFileSync(USERS_FILE, "utf-8");
        this.users = JSON.parse(raw);
      } else {
        this.users = [...defaultUsers];
        this.saveToFile();
      }
      this.isInitialized = true;
    } catch (err) {
      console.warn("[UserStore] Initialized in-memory fallback:", err);
      this.users = [...defaultUsers];
    }
  }

  private saveToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(USERS_FILE, JSON.stringify(this.users, null, 2), "utf-8");
    } catch (err) {
      console.error("[UserStore] Error writing to users.json:", err);
    }
  }

  // Get all users
  public async getAllUsers(): Promise<StoredUser[]> {
    // 1. Try MySQL
    try {
      const [rows]: any = await pool.query(
        `SELECT id, username, email, full_name, role, status, auth_provider, is_active, approved_at, last_login_at, created_at 
         FROM users ORDER BY created_at DESC`
      );
      if (rows && rows.length > 0) {
        return rows;
      }
    } catch (err) {
      // MySQL unavailable, fall back to file store
    }

    return this.users.map((u) => ({
      ...u,
      password_hash: undefined as any, // omit hash
    }));
  }

  // Find user for login
  public async findByUsernameOrEmail(identifier: string): Promise<StoredUser | null> {
    const cleanId = identifier.trim().toLowerCase();

    // 1. Try MySQL
    try {
      const [rows]: any = await pool.query(
        `SELECT id, username, email, password_hash, full_name, role, status, auth_provider, is_active 
         FROM users 
         WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1`,
        [cleanId, cleanId]
      );
      if (rows && rows.length > 0) {
        return rows[0];
      }
    } catch (err) {
      // Fall back to disk file
    }

    const found = this.users.find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId
    );

    return found || null;
  }

  // Check existence
  public async exists(username: string, email: string): Promise<boolean> {
    const uClean = username.trim().toLowerCase();
    const eClean = email.trim().toLowerCase();

    try {
      const [existing]: any = await pool.query(
        "SELECT id FROM users WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1",
        [uClean, eClean]
      );
      if (existing && existing.length > 0) return true;
    } catch (err) {}

    return this.users.some(
      (u) => u.username.toLowerCase() === uClean || u.email.toLowerCase() === eClean
    );
  }

  // Create new user (pending status)
  public async createUser(userData: {
    username: string;
    email: string;
    passwordHash: string;
    fullName: string;
    role?: "admin" | "engineer" | "auditor" | "analyst";
    authProvider?: string;
  }): Promise<StoredUser> {
    const newId = Date.now();
    const newUser: StoredUser = {
      id: newId,
      username: userData.username.trim(),
      email: userData.email.trim(),
      password_hash: userData.passwordHash,
      full_name: userData.fullName.trim(),
      role: userData.role || "engineer",
      status: "pending", // ALWAYS PENDING
      auth_provider: userData.authProvider || "local",
      is_active: true,
      created_at: new Date().toISOString(),
    };

    // 1. Save to File Store immediately
    this.users.unshift(newUser);
    this.saveToFile();

    // 2. Try MySQL sync
    try {
      const [result]: any = await pool.query(
        `INSERT INTO users (username, email, password_hash, full_name, role, status, auth_provider) 
         VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
        [newUser.username, newUser.email, newUser.password_hash, newUser.full_name, newUser.role, newUser.auth_provider]
      );
      if (result?.insertId) {
        newUser.id = result.insertId;
        this.saveToFile();
      }
    } catch (err) {
      console.log("[UserStore] MySQL offline; user saved persistently to local users.json");
    }

    return newUser;
  }

  // Update Status (Approved / Rejected)
  public async updateStatus(userId: number | string, status: "approved" | "rejected" | "pending", adminId: number | string = 1): Promise<boolean> {
    const idStr = String(userId);
    const index = this.users.findIndex((u) => String(u.id) === idStr);
    
    if (index !== -1) {
      this.users[index].status = status;
      this.users[index].approved_by = status === "approved" ? adminId : null;
      this.users[index].approved_at = status === "approved" ? new Date().toISOString() : null;
      this.saveToFile();
    }

    // Try MySQL
    try {
      await pool.query(
        `UPDATE users 
         SET status = ?, approved_by = ?, approved_at = IF(? = 'approved', NOW(), NULL) 
         WHERE id = ?`,
        [status, status === "approved" ? adminId : null, status, userId]
      );
    } catch (err) {}

    return true;
  }

  // Update Role
  public async updateRole(userId: number | string, role: "admin" | "engineer" | "auditor" | "analyst"): Promise<boolean> {
    const idStr = String(userId);
    const index = this.users.findIndex((u) => String(u.id) === idStr);
    
    if (index !== -1) {
      this.users[index].role = role;
      this.saveToFile();
    }

    try {
      await pool.query("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
    } catch (err) {}

    return true;
  }

  // Update last login
  public async recordLogin(userId: number | string) {
    const idStr = String(userId);
    const index = this.users.findIndex((u) => String(u.id) === idStr);
    if (index !== -1) {
      this.users[index].last_login_at = new Date().toISOString();
      this.saveToFile();
    }
    try {
      await pool.query("UPDATE users SET last_login_at = NOW() WHERE id = ?", [userId]);
    } catch (err) {}
  }
}

export const userStore = new UserStoreService();
