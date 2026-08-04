import { Response } from "express";
import { z } from "zod";
import { Lead, LeadStatus } from "../models/Lead";
import { LeadActivity } from "../models/LeadActivity";
import { Team } from "../models/Team";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";
import { logActivity, notify } from "../services/leadActivity";

// Outcomes a Telecaller can log against a call attempt.
const TELECALLER_OUTCOMES = [
  "attempted_contact",
  "contacted",
  "interested_qualified",
  "not_interested",
  "follow_up_required",
  "call_back_later",
  "no_response",
  "invalid_number",
  "duplicate_lead",
  "on_hold",
] as const;

const callLogSchema = z.object({
  outcome: z.enum(TELECALLER_OUTCOMES),
  remarks: z.string().min(1, "Remarks are required for every call outcome"),
  interestLevel: z.enum(["low", "medium", "high"]).optional(),
  nextContactAt: z.string().datetime().optional(),
  notInterestedReason: z.string().optional(),
  // Meeting details — required when qualifying a lead so the Team Leader/Sales
  // Agent know when and where to follow up.
  meetingAt: z.string().datetime().optional(),
  meetingLocation: z.string().optional(),
});

// Restricts the query to exactly what a role is allowed to see —
// this is the enforcement point for "must only view/act on leads
// permitted for their role."
function scopeFilterForRole(req: AuthRequest, filter: Record<string, unknown>): void {
  switch (req.userRole) {
    case "super_admin":
    case "sub_admin":
      break; // full visibility (sub_admin already gated at the route by requirePermission)
    case "team_leader":
      filter.assignedTeamLeader = req.userId;
      break;
    case "telecaller":
      filter.assignedTelecaller = req.userId;
      break;
    case "sales_agent":
      filter.assignedSalesAgent = req.userId;
      break;
    default:
      filter._id = null; // no other role may see leads
  }
}

export async function listLeads(req: AuthRequest, res: Response): Promise<void> {
  const {
    property, source, status, teamLeader, telecaller, salesAgent,
    dateFrom, dateTo, followUpFrom, followUpTo, search,
    page = "1", limit = "20",
  } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = {};
  scopeFilterForRole(req, filter);

  if (property) filter.property = property;
  if (source) filter.source = source;
  if (status) filter.status = status;
  if (teamLeader) filter.assignedTeamLeader = teamLeader;
  if (telecaller) filter.assignedTelecaller = telecaller;
  if (salesAgent) filter.assignedSalesAgent = salesAgent;

  if (dateFrom || dateTo) {
    filter.createdAt = {
      ...(dateFrom ? { $gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { $lte: new Date(dateTo) } : {}),
    };
  }
  if (followUpFrom || followUpTo) {
    filter.nextContactAt = {
      ...(followUpFrom ? { $gte: new Date(followUpFrom) } : {}),
      ...(followUpTo ? { $lte: new Date(followUpTo) } : {}),
    };
  }
  if (search) {
    filter.$or = [
      { customerName: new RegExp(search, "i") },
      { mobile: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
      { leadId: new RegExp(search, "i") },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .populate("assignedTeamLeader", "name email")
      .populate("assignedTelecaller", "name email")
      .populate("assignedSalesAgent", "name email")
      .populate("property", "title city")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Lead.countDocuments(filter),
  ]);

  res.json({ leads, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}

export async function getLead(req: AuthRequest, res: Response): Promise<void> {
  const filter: Record<string, unknown> = { _id: req.params.id };
  scopeFilterForRole(req, filter);

  const lead = await Lead.findOne(filter)
    .populate("assignedTeamLeader", "name email")
    .populate("assignedTelecaller", "name email")
    .populate("assignedSalesAgent", "name email")
    .populate("property", "title city address");
  if (!lead) { res.status(404).json({ error: "Lead not found" }); return; }

  const activity = await LeadActivity.find({ lead: lead._id })
    .populate("actor", "name role")
    .sort({ createdAt: -1 });

  res.json({ lead, activity });
}

export async function overdueLeads(req: AuthRequest, res: Response): Promise<void> {
  const filter: Record<string, unknown> = { nextContactAt: { $lt: new Date() } };
  scopeFilterForRole(req, filter);
  const leads = await Lead.find(filter).sort({ nextContactAt: 1 });
  res.json(leads);
}

export async function upcomingFollowUps(req: AuthRequest, res: Response): Promise<void> {
  const in48h = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const filter: Record<string, unknown> = { nextContactAt: { $gte: new Date(), $lte: in48h } };
  scopeFilterForRole(req, filter);
  const leads = await Lead.find(filter).sort({ nextContactAt: 1 });
  res.json(leads);
}

const assignSchema = z.object({
  teamLeader: z.string().optional(),
  telecaller: z.string().nullable().optional(),
  salesAgent: z.string().nullable().optional(),
});

export async function assignLead(req: AuthRequest, res: Response): Promise<void> {
  const parsed = assignSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const { teamLeader, telecaller, salesAgent } = parsed.data;

  const lead = await Lead.findById(req.params.id);
  if (!lead) { res.status(404).json({ error: "Lead not found" }); return; }

  const role = req.userRole;
  const isSuperAdmin = role === "super_admin" || role === "sub_admin";

  if (!isSuperAdmin) {
    if (role !== "team_leader") { res.status(403).json({ error: "Not authorized to assign leads" }); return; }
    if (lead.assignedTeamLeader?.toString() !== req.userId) {
      res.status(403).json({ error: "This lead does not belong to your team" });
      return;
    }
    if (teamLeader) { res.status(403).json({ error: "Team Leaders cannot reassign the owning Team Leader" }); return; }

    // Team Leaders may only hand a lead to their own team's members.
    const team = await Team.findOne({ teamLeader: req.userId });
    if (telecaller && !team?.telecallers.some((id) => id.toString() === telecaller)) {
      res.status(403).json({ error: "Telecaller is not part of your team" }); return;
    }
    if (salesAgent && !team?.salesAgents.some((id) => id.toString() === salesAgent)) {
      res.status(403).json({ error: "Sales Agent is not part of your team" }); return;
    }
    // A lead only moves to Sales once the Team Leader has reviewed it as qualified.
    if (salesAgent && lead.status !== "interested_qualified") {
      res.status(400).json({ error: "Only Interested/Qualified leads can be assigned to Sales" });
      return;
    }
  }

  const wasReassignment = Boolean(
    (telecaller !== undefined && lead.assignedTelecaller) ||
    (salesAgent !== undefined && lead.assignedSalesAgent)
  );

  if (teamLeader) lead.assignedTeamLeader = teamLeader as unknown as typeof lead.assignedTeamLeader;
  if (telecaller !== undefined) {
    lead.assignedTelecaller = (telecaller || undefined) as unknown as typeof lead.assignedTelecaller;
    if (telecaller) lead.status = "assigned_telecaller";
  }
  if (salesAgent !== undefined) {
    lead.assignedSalesAgent = (salesAgent || undefined) as unknown as typeof lead.assignedSalesAgent;
    if (salesAgent) lead.status = "assigned_sales";
  }

  await lead.save();

  await logActivity({
    lead: lead._id,
    actor: req.userId,
    actorRole: req.userRole,
    action: wasReassignment ? "reassigned" : "assigned",
    toValue: telecaller ?? salesAgent ?? teamLeader ?? undefined,
  });

  const recipient = telecaller ?? salesAgent ?? teamLeader;
  if (recipient) {
    await notify({
      recipient,
      type: wasReassignment ? "lead_reassigned" : "lead_assigned",
      lead: lead._id,
      message: `Lead ${lead.leadId} (${lead.customerName}) has been ${wasReassignment ? "reassigned" : "assigned"} to you.`,
    });
  }

  res.json(lead);
}

export async function logCall(req: AuthRequest, res: Response): Promise<void> {
  const parsed = callLogSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const { outcome, remarks, interestLevel, nextContactAt, notInterestedReason, meetingAt, meetingLocation } = parsed.data;

  // Mandatory-field rules from the spec — never allow these transitions through
  // without the data the workflow depends on.
  if ((outcome === "call_back_later" || outcome === "follow_up_required") && !nextContactAt) {
    res.status(400).json({ error: "A next contact date/time is required for Call Back Later / Follow-up Required" });
    return;
  }
  if (outcome === "not_interested" && !notInterestedReason) {
    res.status(400).json({ error: "A reason is required to mark a lead Not Interested" });
    return;
  }
  // Qualifying a lead hands it to the Team Leader for a Sales assignment —
  // they need the meeting date/time and location to act on it.
  if (outcome === "interested_qualified" && (!meetingAt || !meetingLocation)) {
    res.status(400).json({ error: "A meeting date/time and location are required to mark a lead Interested/Qualified" });
    return;
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) { res.status(404).json({ error: "Lead not found" }); return; }

  if (req.userRole !== "super_admin" && lead.assignedTelecaller?.toString() !== req.userId) {
    res.status(403).json({ error: "This lead is not assigned to you" });
    return;
  }

  const previousStatus = lead.status;
  lead.status = outcome as LeadStatus;
  lead.lastContactAt = new Date();
  lead.remarks = remarks;
  if (nextContactAt) lead.nextContactAt = new Date(nextContactAt);
  if (notInterestedReason) lead.notInterestedReason = notInterestedReason;
  if (meetingAt) lead.meetingAt = new Date(meetingAt);
  if (meetingLocation) lead.meetingLocation = meetingLocation;

  // Telecallers may not hand a lead directly to Sales — qualifying it always
  // routes back through the Team Leader for review and Sales assignment.
  const returnedToTeamLeader = outcome === "interested_qualified" || outcome === "not_interested";
  if (returnedToTeamLeader) {
    lead.assignedTelecaller = undefined;
  }

  await lead.save();

  await logActivity({
    lead: lead._id,
    actor: req.userId,
    actorRole: req.userRole,
    action: "call_logged",
    fromValue: previousStatus,
    toValue: outcome,
    callOutcome: outcome,
    interestLevel,
    remarks,
    nextContactAt: nextContactAt ? new Date(nextContactAt) : undefined,
  });

  if (returnedToTeamLeader) {
    const meetingNote = outcome === "interested_qualified" && meetingAt && meetingLocation
      ? ` Meeting scheduled ${new Date(meetingAt).toLocaleString()} at ${meetingLocation}.`
      : "";
    await logActivity({
      lead: lead._id,
      actor: req.userId,
      actorRole: req.userRole,
      action: "returned_to_team_leader",
      remarks: `Returned as "${outcome.replace(/_/g, " ")}".${meetingNote}`,
    });
    if (lead.assignedTeamLeader) {
      await notify({
        recipient: lead.assignedTeamLeader,
        type: "lead_returned",
        lead: lead._id,
        message: `Lead ${lead.leadId} (${lead.customerName}) was marked "${outcome.replace(/_/g, " ")}" and returned to you for review.${meetingNote}`,
      });
    }
  }

  res.json(lead);
}

// Sales-stage outcomes a Sales Agent can move a lead through.
const SALES_STATUSES = [
  "site_visit_scheduled",
  "site_visit_completed",
  "negotiation",
  "booking_confirmed",
  "closed_won",
  "closed_lost",
  "on_hold",
] as const;

const statusUpdateSchema = z.object({
  status: z.enum(SALES_STATUSES),
  remarks: z.string().min(1, "Remarks are required for every status update"),
  closedLostReason: z.string().optional(),
  nextContactAt: z.string().datetime().optional(),
});

export async function updateLeadStatus(req: AuthRequest, res: Response): Promise<void> {
  const parsed = statusUpdateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const { status, remarks, closedLostReason, nextContactAt } = parsed.data;

  if (status === "closed_lost" && !closedLostReason) {
    res.status(400).json({ error: "A reason is required to mark a lead Closed Lost" });
    return;
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) { res.status(404).json({ error: "Lead not found" }); return; }

  if (req.userRole !== "super_admin" && lead.assignedSalesAgent?.toString() !== req.userId) {
    res.status(403).json({ error: "This lead is not assigned to you" });
    return;
  }

  const previousStatus = lead.status;
  lead.status = status;
  lead.remarks = remarks;
  lead.lastContactAt = new Date();
  if (closedLostReason) lead.closedLostReason = closedLostReason;
  if (nextContactAt) lead.nextContactAt = new Date(nextContactAt);

  await lead.save();

  await logActivity({
    lead: lead._id,
    actor: req.userId,
    actorRole: req.userRole,
    action: "status_changed",
    fromValue: previousStatus,
    toValue: status,
    remarks,
    nextContactAt: nextContactAt ? new Date(nextContactAt) : undefined,
  });

  res.json(lead);
}

const remarkSchema = z.object({ remarks: z.string().min(1) });

export async function addRemark(req: AuthRequest, res: Response): Promise<void> {
  const parsed = remarkSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const filter: Record<string, unknown> = { _id: req.params.id };
  scopeFilterForRole(req, filter);
  const lead = await Lead.findOne(filter);
  if (!lead) { res.status(404).json({ error: "Lead not found" }); return; }

  lead.remarks = parsed.data.remarks;
  await lead.save();

  await logActivity({
    lead: lead._id,
    actor: req.userId,
    actorRole: req.userRole,
    action: "remark_added",
    remarks: parsed.data.remarks,
  });

  res.json(lead);
}

// Super Admin's full cross-lead audit trail — who did what, when, across every lead.
export async function auditTrail(req: AuthRequest, res: Response): Promise<void> {
  const { page = "1", limit = "50" } = req.query as Record<string, string>;
  const skip = (Number(page) - 1) * Number(limit);

  const [entries, total] = await Promise.all([
    LeadActivity.find()
      .populate("actor", "name role")
      .populate("lead", "leadId customerName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    LeadActivity.countDocuments(),
  ]);

  res.json({ entries, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}

export async function myTeamMembers(req: AuthRequest, res: Response): Promise<void> {
  const team = await Team.findOne({ teamLeader: req.userId })
    .populate("telecallers", "name email")
    .populate("salesAgents", "name email");
  if (!team) { res.json({ telecallers: [], salesAgents: [] }); return; }
  res.json({ telecallers: team.telecallers, salesAgents: team.salesAgents });
}

// exported for propertyController's submitEnquiry hook & any admin tooling
export async function resolveDefaultTeamLeader(): Promise<string | undefined> {
  const team = await Team.findOne({ isDefault: true });
  return team?.teamLeader?.toString();
}

export async function listSuperAdminIds(): Promise<string[]> {
  const admins = await User.find({ role: "super_admin", isActive: true }).select("_id");
  return admins.map((a) => a._id.toString());
}
