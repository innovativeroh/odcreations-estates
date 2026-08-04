import { Response } from "express";
import { Notification } from "../models/Notification";
import { Lead } from "../models/Lead";
import { AuthRequest } from "../middleware/auth";

// Overdue follow-ups are computed lazily here (no cron) — every time a user
// checks notifications, we backfill any newly-overdue leads they own.
async function backfillOverdueNotifications(userId: string): Promise<void> {
  const overdue = await Lead.find({
    $or: [{ assignedTeamLeader: userId }, { assignedTelecaller: userId }, { assignedSalesAgent: userId }],
    nextContactAt: { $lt: new Date() },
  }).select("_id leadId customerName nextContactAt");

  for (const lead of overdue) {
    const exists = await Notification.findOne({
      recipient: userId,
      lead: lead._id,
      type: "follow_up_overdue",
      createdAt: { $gte: lead.nextContactAt },
    });
    if (!exists) {
      await Notification.create({
        recipient: userId,
        type: "follow_up_overdue",
        lead: lead._id,
        message: `Follow-up for lead ${lead.leadId} (${lead.customerName}) is overdue.`,
      });
    }
  }
}

export async function listNotifications(req: AuthRequest, res: Response): Promise<void> {
  await backfillOverdueNotifications(req.userId!);
  const notifications = await Notification.find({ recipient: req.userId })
    .populate("lead", "leadId customerName status")
    .sort({ read: 1, createdAt: -1 })
    .limit(50);
  const unreadCount = await Notification.countDocuments({ recipient: req.userId, read: false });
  res.json({ notifications, unreadCount });
}

export async function markNotificationRead(req: AuthRequest, res: Response): Promise<void> {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.userId },
    { read: true },
    { new: true }
  );
  if (!notification) { res.status(404).json({ error: "Notification not found" }); return; }
  res.json(notification);
}

export async function markAllNotificationsRead(req: AuthRequest, res: Response): Promise<void> {
  await Notification.updateMany({ recipient: req.userId, read: false }, { read: true });
  res.json({ message: "All notifications marked read" });
}
