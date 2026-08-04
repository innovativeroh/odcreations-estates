import { Response } from "express";
import { Types } from "mongoose";
import { User } from "../models/User";
import { Property } from "../models/Property";
import { Enquiry } from "../models/Enquiry";
import { Lead } from "../models/Lead";
import { LeadActivity } from "../models/LeadActivity";
import { AuthRequest } from "../middleware/auth";

export async function getDashboardStats(_req: AuthRequest, res: Response): Promise<void> {
  const [
    totalUsers, totalAgents, totalProperties,
    pendingProperties, approvedProperties, rejectedProperties,
    totalEnquiries, newEnquiries,
    recentPending, recentEnquiries, recentAgents,
  ] = await Promise.all([
    User.countDocuments({ role: { $in: ["owner", "user"] } }),
    User.countDocuments({ role: "agent" }),
    Property.countDocuments(),
    Property.countDocuments({ approvalStatus: "pending" }),
    Property.countDocuments({ approvalStatus: "approved" }),
    Property.countDocuments({ approvalStatus: "rejected" }),
    Enquiry.countDocuments(),
    Enquiry.countDocuments({ status: "new" }),
    Property.find({ approvalStatus: "pending" })
      .populate("submittedBy", "name email role agencyName")
      .sort({ createdAt: -1 }).limit(5),
    Enquiry.find()
      .populate("property", "title city")
      .sort({ createdAt: -1 }).limit(8),
    User.find({ role: "agent" }).select("name email agencyName isActive createdAt").sort({ createdAt: -1 }).limit(5),
  ]);

  res.json({
    totalUsers, totalAgents, totalProperties,
    pendingProperties, approvedProperties, rejectedProperties,
    totalEnquiries, newEnquiries,
    recentPending, recentEnquiries, recentAgents,
  });
}

export async function getTelecallerDashboard(req: AuthRequest, res: Response): Promise<void> {
  const telecallerId = req.userRole === "super_admin" && req.query.userId ? String(req.query.userId) : req.userId;
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const now = new Date();

  const [
    assignedLeads, todaysCalls, pendingFollowUps, overdueFollowUps, callOutcomesRaw,
  ] = await Promise.all([
    Lead.countDocuments({ assignedTelecaller: telecallerId }),
    LeadActivity.countDocuments({ actor: telecallerId, action: "call_logged", createdAt: { $gte: startOfDay } }),
    Lead.countDocuments({ assignedTelecaller: telecallerId, nextContactAt: { $gte: now } }),
    Lead.countDocuments({ assignedTelecaller: telecallerId, nextContactAt: { $lt: now } }),
    LeadActivity.aggregate([
      { $match: { actor: new Types.ObjectId(telecallerId), action: "call_logged", createdAt: { $gte: startOfDay } } },
      { $group: { _id: "$callOutcome", count: { $sum: 1 } } },
    ]),
  ]);

  const callOutcomes = Object.fromEntries(callOutcomesRaw.map((r: { _id: string; count: number }) => [r._id, r.count]));

  res.json({ assignedLeads, todaysCalls, pendingFollowUps, overdueFollowUps, callOutcomes, dailyProductivity: todaysCalls });
}

export async function getTeamLeaderDashboard(req: AuthRequest, res: Response): Promise<void> {
  const teamLeaderId = req.userRole === "super_admin" && req.query.userId ? String(req.query.userId) : req.userId;
  const teamLeaderObjectId = new Types.ObjectId(teamLeaderId);
  const now = new Date();
  const base = { assignedTeamLeader: teamLeaderId };
  const baseAgg = { assignedTeamLeader: teamLeaderObjectId };

  const [
    newLeads, unassignedLeads, assignedToTelecallers, qualifiedAwaitingSales,
    salesPipelineRaw, dueFollowUps, overdueFollowUps, teamPerformanceRaw,
  ] = await Promise.all([
    Lead.countDocuments({ ...base, status: { $in: ["new_enquiry", "assigned_team_leader"] } }),
    Lead.countDocuments({ ...base, assignedTelecaller: { $exists: false } }),
    Lead.countDocuments({ ...base, assignedTelecaller: { $exists: true } }),
    Lead.countDocuments({ ...base, status: "interested_qualified" }),
    Lead.aggregate([
      { $match: { ...baseAgg, assignedSalesAgent: { $exists: true } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Lead.countDocuments({ ...base, nextContactAt: { $gte: now } }),
    Lead.countDocuments({ ...base, nextContactAt: { $lt: now } }),
    Lead.aggregate([
      { $match: { ...baseAgg, assignedTelecaller: { $exists: true } } },
      { $group: { _id: "$assignedTelecaller", total: { $sum: 1 }, qualified: { $sum: { $cond: [{ $eq: ["$status", "interested_qualified"] }, 1, 0] } } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { name: "$user.name", total: 1, qualified: 1 } },
    ]),
  ]);

  const salesPipeline = Object.fromEntries(salesPipelineRaw.map((r: { _id: string; count: number }) => [r._id, r.count]));

  res.json({
    newLeads, unassignedLeads, assignedToTelecallers, qualifiedAwaitingSales,
    salesPipeline, dueFollowUps, overdueFollowUps, teamPerformance: teamPerformanceRaw,
  });
}

export async function getSalesDashboard(req: AuthRequest, res: Response): Promise<void> {
  const salesAgentId = req.userRole === "super_admin" && req.query.userId ? String(req.query.userId) : req.userId;
  const now = new Date();
  const base = { assignedSalesAgent: salesAgentId };
  const baseAgg = { assignedSalesAgent: new Types.ObjectId(salesAgentId) };

  const [
    assignedLeads, scheduledSiteVisits, pendingFollowUps, bookings, closedWon, closedLost, pipelineRaw,
  ] = await Promise.all([
    Lead.countDocuments(base),
    Lead.countDocuments({ ...base, status: "site_visit_scheduled" }),
    Lead.countDocuments({ ...base, nextContactAt: { $gte: now } }),
    Lead.countDocuments({ ...base, status: "booking_confirmed" }),
    Lead.countDocuments({ ...base, status: "closed_won" }),
    Lead.countDocuments({ ...base, status: "closed_lost" }),
    Lead.aggregate([{ $match: baseAgg }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const conversionPipeline = Object.fromEntries(pipelineRaw.map((r: { _id: string; count: number }) => [r._id, r.count]));

  res.json({ assignedLeads, scheduledSiteVisits, pendingFollowUps, bookings, closedWon, closedLost, conversionPipeline });
}
