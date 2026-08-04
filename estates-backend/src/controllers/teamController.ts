import { Response } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { Team } from "../models/Team";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";

const createSchema = z.object({
  name: z.string().min(2),
  teamLeader: z.string(),
  telecallers: z.array(z.string()).optional(),
  salesAgents: z.array(z.string()).optional(),
  isDefault: z.boolean().optional(),
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  teamLeader: z.string().optional(),
  telecallers: z.array(z.string()).optional(),
  salesAgents: z.array(z.string()).optional(),
  isDefault: z.boolean().optional(),
});

async function syncMemberTeamIds(team: { _id: Types.ObjectId; teamLeader: Types.ObjectId; telecallers: Types.ObjectId[]; salesAgents: Types.ObjectId[] }): Promise<void> {
  const memberIds = [team.teamLeader, ...team.telecallers, ...team.salesAgents];
  await User.updateMany({ _id: { $in: memberIds } }, { teamId: team._id });
}

export async function listTeams(_req: AuthRequest, res: Response): Promise<void> {
  const teams = await Team.find()
    .populate("teamLeader", "name email")
    .populate("telecallers", "name email")
    .populate("salesAgents", "name email")
    .sort({ createdAt: -1 });
  res.json(teams);
}

export async function getTeam(req: AuthRequest, res: Response): Promise<void> {
  const team = await Team.findById(req.params.id)
    .populate("teamLeader", "name email")
    .populate("telecallers", "name email")
    .populate("salesAgents", "name email");
  if (!team) { res.status(404).json({ error: "Team not found" }); return; }
  res.json(team);
}

export async function createTeam(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  if (parsed.data.isDefault) {
    await Team.updateMany({ isDefault: true }, { isDefault: false });
  }

  const team = await Team.create({
    ...parsed.data,
    telecallers: parsed.data.telecallers ?? [],
    salesAgents: parsed.data.salesAgents ?? [],
  });
  await syncMemberTeamIds(team);
  res.status(201).json(team);
}

export async function updateTeam(req: AuthRequest, res: Response): Promise<void> {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  if (parsed.data.isDefault) {
    await Team.updateMany({ isDefault: true, _id: { $ne: req.params.id } }, { isDefault: false });
  }

  const team = await Team.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!team) { res.status(404).json({ error: "Team not found" }); return; }
  await syncMemberTeamIds(team);
  res.json(team);
}

export async function deleteTeam(req: AuthRequest, res: Response): Promise<void> {
  const team = await Team.findByIdAndDelete(req.params.id);
  if (!team) { res.status(404).json({ error: "Team not found" }); return; }
  await User.updateMany({ teamId: team._id }, { $unset: { teamId: "" } });
  res.json({ message: "Team deleted" });
}
