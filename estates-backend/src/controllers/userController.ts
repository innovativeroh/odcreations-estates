import { Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User, CRM_ROLES } from "../models/User";
import { Enquiry } from "../models/Enquiry";
import { Property } from "../models/Property";
import { AuthRequest } from "../middleware/auth";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  role: z.enum(CRM_ROLES),
  teamId: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  const user = await User.findById(req.userId).populate("savedProperties", "title price images city state type transactionType bedrooms bathrooms size returnRate");
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(user);
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const user = await User.findByIdAndUpdate(req.userId, parsed.data, { new: true });
  res.json(user);
}

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const user = await User.findById(req.userId).select("+password");
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!valid) { res.status(401).json({ error: "Current password is incorrect" }); return; }

  user.password = await bcrypt.hash(parsed.data.newPassword, 12);
  await user.save();
  res.json({ message: "Password updated" });
}

export async function getSavedProperties(req: AuthRequest, res: Response): Promise<void> {
  const user = await User.findById(req.userId).populate("savedProperties", "title price images city state type transactionType bedrooms bathrooms size returnRate featured");
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(user.savedProperties);
}

export async function toggleSavedProperty(req: AuthRequest, res: Response): Promise<void> {
  const { propertyId } = req.params;
  const user = await User.findById(req.userId);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const idx = user.savedProperties.findIndex((id) => id.toString() === propertyId);
  if (idx === -1) {
    user.savedProperties.push(propertyId as unknown as import("mongoose").Types.ObjectId);
  } else {
    user.savedProperties.splice(idx, 1);
  }
  await user.save();
  await Property.findByIdAndUpdate(propertyId, { $inc: { shortlistCount: idx === -1 ? 1 : -1 } });
  res.json({ saved: idx === -1, savedProperties: user.savedProperties });
}

export async function getMyEnquiries(req: AuthRequest, res: Response): Promise<void> {
  const enquiries = await Enquiry.find({ userId: req.userId })
    .populate("property", "title price images city state")
    .sort({ createdAt: -1 });
  res.json(enquiries);
}

export async function listUsers(_req: AuthRequest, res: Response): Promise<void> {
  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 });
  res.json(users);
}

// Creates a CRM-role account (Super Admin, Sub Admin, Team Leader, Telecaller,
// Sales Agent). This is the only path to create these roles today — self-signup
// only ever creates "user", and /api/agents always sets role "agent".
export async function createUser(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const exists = await User.findOne({ email: parsed.data.email });
  if (exists) { res.status(409).json({ error: "Email already registered" }); return; }

  const hashed = await bcrypt.hash(parsed.data.password, 12);
  const user = await User.create({
    ...parsed.data,
    password: hashed,
    createdBy: req.userId,
  });

  const { password: _pw, ...safe } = user.toObject();
  res.status(201).json(safe);
}

export async function adminGetUser(req: AuthRequest, res: Response): Promise<void> {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  const enquiries = await Enquiry.find({ userId: req.params.id })
    .populate("property", "title city images price")
    .sort({ createdAt: -1 })
    .limit(20);
  res.json({ user, enquiries });
}

const adminUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  role: z.enum(["user", "agent", "owner", ...CRM_ROLES]).optional(),
  isActive: z.boolean().optional(),
  teamId: z.string().nullable().optional(),
  permissions: z.array(z.string()).optional(),
});

export async function adminUpdateUser(req: AuthRequest, res: Response): Promise<void> {
  const parsed = adminUpdateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const user = await User.findByIdAndUpdate(req.params.id, parsed.data, { new: true }).select("-password");
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(user);
}

export async function adminDeleteUser(req: AuthRequest, res: Response): Promise<void> {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ message: "User deleted" });
}
