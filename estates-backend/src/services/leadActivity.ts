import { Types } from "mongoose";
import { LeadActivity, LeadActivityAction } from "../models/LeadActivity";
import { Notification, INotification } from "../models/Notification";

interface LogActivityParams {
  lead: Types.ObjectId | string;
  actor?: Types.ObjectId | string;
  actorRole?: string;
  action: LeadActivityAction;
  fromValue?: string;
  toValue?: string;
  callOutcome?: string;
  interestLevel?: string;
  remarks?: string;
  nextContactAt?: Date;
}

// Single write path for the lead audit trail — every lead mutation must go
// through this so the activity timeline is never incomplete.
export async function logActivity(params: LogActivityParams): Promise<void> {
  await LeadActivity.create(params);
}

interface NotifyParams {
  recipient: Types.ObjectId | string;
  type: INotification["type"];
  lead: Types.ObjectId | string;
  message: string;
}

export async function notify(params: NotifyParams): Promise<void> {
  await Notification.create(params);
}
