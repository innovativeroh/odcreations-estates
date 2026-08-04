import { Schema, model, Document, Types } from "mongoose";

export const LEAD_ACTIVITY_ACTIONS = [
  "created",
  "assigned",
  "reassigned",
  "status_changed",
  "call_logged",
  "remark_added",
  "returned_to_team_leader",
] as const;

export type LeadActivityAction = (typeof LEAD_ACTIVITY_ACTIONS)[number];

export interface ILeadActivity extends Document {
  _id: Types.ObjectId;
  lead: Types.ObjectId;
  actor?: Types.ObjectId;
  actorRole?: string;
  action: LeadActivityAction;
  fromValue?: string;
  toValue?: string;
  callOutcome?: string;
  interestLevel?: string;
  remarks?: string;
  nextContactAt?: Date;
  createdAt: Date;
}

const leadActivitySchema = new Schema<ILeadActivity>(
  {
    lead: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    actor: { type: Schema.Types.ObjectId, ref: "User" },
    actorRole: { type: String },
    action: { type: String, enum: LEAD_ACTIVITY_ACTIONS, required: true },
    fromValue: { type: String },
    toValue: { type: String },
    callOutcome: { type: String },
    interestLevel: { type: String },
    remarks: { type: String },
    nextContactAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

leadActivitySchema.index({ lead: 1, createdAt: -1 });

export const LeadActivity = model<ILeadActivity>("LeadActivity", leadActivitySchema);
