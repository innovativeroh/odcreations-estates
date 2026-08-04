import { Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(10),
  agencyName: z.string().min(2),
  licenseNumber: z.string().optional(),
});

export async function listAgents(_req: AuthRequest, res: Response): Promise<void> {
  const agents = await User.find({ role: "agent" }).select("-password").sort({ createdAt: -1 });
  res.json(agents);
}

export async function createAgent(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const exists = await User.findOne({ email: parsed.data.email });
  if (exists) { res.status(409).json({ error: "Email already registered" }); return; }

  const hashed = await bcrypt.hash(parsed.data.password, 12);
  const agent = await User.create({
    ...parsed.data,
    password: hashed,
    role: "agent",
    createdBy: req.userId,
  });

  const { password: _pw, ...safe } = agent.toObject();
  res.status(201).json(safe);
}

export async function toggleAgentStatus(req: AuthRequest, res: Response): Promise<void> {
  const agent = await User.findOne({ _id: req.params.id, role: "agent" });
  if (!agent) { res.status(404).json({ error: "Agent not found" }); return; }

  agent.isActive = !agent.isActive;
  await agent.save();
  res.json({ id: agent._id, isActive: agent.isActive });
}

export async function deleteAgent(req: AuthRequest, res: Response): Promise<void> {
  const agent = await User.findOneAndDelete({ _id: req.params.id, role: "agent" });
  if (!agent) { res.status(404).json({ error: "Agent not found" }); return; }
  res.json({ message: "Agent removed" });
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  agencyName: z.string().optional(),
  licenseNumber: z.string().optional(),
});

export async function updateAgent(req: AuthRequest, res: Response): Promise<void> {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const agent = await User.findOneAndUpdate({ _id: req.params.id, role: "agent" }, parsed.data, { new: true }).select("-password");
  if (!agent) { res.status(404).json({ error: "Agent not found" }); return; }
  res.json(agent);
}
