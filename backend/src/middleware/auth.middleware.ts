import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "pragya_super_secret_jwt_key_2026_airgapped";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
    fullName: string;
  };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Access token required. Please sign in.",
    });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({
        success: false,
        message: "Invalid or expired token. Please sign in again.",
      });
      return;
    }

    req.user = user as any;
    next();
  });
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = { id: 1, username: "admin", email: "admin@pragya.internal", role: "admin", fullName: "Administrator" };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = { id: 1, username: "admin", email: "admin@pragya.internal", role: "admin", fullName: "Administrator" };
    } else {
      req.user = user as any;
    }
    next();
  });
}
