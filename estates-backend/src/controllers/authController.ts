import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import { User, CRM_ROLES } from "../models/User";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const forgotSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

// In-memory store for reset tokens — swap for DB in production
const resetTokens = new Map<string, { userId: string; expires: number }>();

function signToken(id: string, role: string): string {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as string,
  } as jwt.SignOptions);
}

function sendToken(res: Response, id: string, role: string, status: number, user: object): void {
  const token = signToken(id, role);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(status).json({ token, user });
}

// ── Investor signup ──────────────────────────────────────────────────────────

export async function signup(req: Request, res: Response): Promise<void> {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { name, email, password, phone } = parsed.data;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed, phone });

  sendToken(res, user._id.toString(), user.role, 201, {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}

// ── Investor login ───────────────────────────────────────────────────────────

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  sendToken(res, user._id.toString(), user.role, 200, {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}

// ── Admin-only login ─────────────────────────────────────────────────────────
// Separate endpoint so the admin portal can call it explicitly.
// Returns the same JWT but the cookie name is `adminToken` to avoid
// collisions with the investor portal session.

export async function adminLogin(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (!CRM_ROLES.includes(user.role as (typeof CRM_ROLES)[number])) {
    res.status(403).json({ error: "This account is not authorized for the admin portal" });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: "This account has been deactivated" });
    return;
  }

  const token = signToken(user._id.toString(), user.role);

  res.cookie("adminToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 8 * 60 * 60 * 1000, // 8-hour admin session
  });

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      teamId: user.teamId,
      permissions: user.permissions,
    },
  });
}

// ── Shared logout ────────────────────────────────────────────────────────────

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie("token");
  res.clearCookie("adminToken");
  res.json({ message: "Logged out" });
}

// ── Current user ─────────────────────────────────────────────────────────────

export async function me(req: Request & { userId?: string }, res: Response): Promise<void> {
  const user = await User.findById(req.userId).populate("savedProperties", "title price images city");
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
}

// ── Forgot password ──────────────────────────────────────────────────────────
// Generates a signed reset token. In production pipe this into
// your email provider (Resend, Nodemailer, etc.).

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const parsed = forgotSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const user = await User.findOne({ email: parsed.data.email });

  // Always 200 — don't leak whether the email exists
  if (!user) {
    res.json({ message: "If that email is registered, a reset link has been sent." });
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 15 * 60 * 1000; // 15 min
  resetTokens.set(rawToken, { userId: user._id.toString(), expires });

  const resetUrl = `${process.env.ADMIN_URL ?? "http://localhost:3001"}/reset-password?token=${rawToken}`;

  // TODO: replace with email provider
  console.log(`[DEV] Password reset link for ${user.email}: ${resetUrl}`);

  res.json({ message: "If that email is registered, a reset link has been sent." });
}

// ── Reset password ───────────────────────────────────────────────────────────

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { token, password } = parsed.data;
  const entry = resetTokens.get(token);

  if (!entry || Date.now() > entry.expires) {
    res.status(400).json({ error: "Reset link is invalid or has expired." });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await User.findByIdAndUpdate(entry.userId, { password: hashed });
  resetTokens.delete(token);

  res.json({ message: "Password updated successfully." });
}
