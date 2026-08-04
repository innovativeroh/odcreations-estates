import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  // Authorization header takes priority — prevents a regular-user cookie from
  // shadowing the admin bearer token when both portals run on the same host.
  const token =
    req.headers.authorization?.replace("Bearer ", "") ||
    req.cookies?.adminToken ||
    req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
    req.userId = payload.id;
    req.userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== "super_admin") {
    res.status(403).json({ error: "Super admin access required" });
    return;
  }
  next();
}

// Generic role gate — replaces one-off hardcoded role checks for new endpoints.
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.userRole ?? "")) {
      res.status(403).json({ error: "Not authorized for this action" });
      return;
    }
    next();
  };
}

// Sub Admins are gated by their granted `permissions` array; every other
// CRM role is assumed to inherently have whatever a sub_admin would need
// permission for (super_admin always passes).
export function requirePermission(permission: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (req.userRole === "super_admin") { next(); return; }
    if (req.userRole !== "sub_admin") { next(); return; }

    const user = await User.findById(req.userId).select("permissions");
    if (!user || !user.permissions.includes(permission)) {
      res.status(403).json({ error: "Permission not granted" });
      return;
    }
    next();
  };
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies?.token;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
      req.userId = payload.id;
      req.userRole = payload.role;
    } catch { /* ignore invalid tokens */ }
  }
  next();
}

export function requireAgentOrAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!["super_admin", "agent", "owner", "user"].includes(req.userRole ?? "")) {
    res.status(403).json({ error: "Not authorized to submit properties" });
    return;
  }
  next();
}
