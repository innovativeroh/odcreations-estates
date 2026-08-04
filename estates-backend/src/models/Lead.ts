import { Schema, model, Document, Types } from "mongoose";

export const LEAD_STATUSES = [
  "new_enquiry",
  "assigned_team_leader",
  "assigned_telecaller",
  "attempted_contact",
  "contacted",
  "interested_qualified",
  "not_interested",
  "follow_up_required",
  "call_back_later",
  "no_response",
  "invalid_number",
  "duplicate_lead",
  "assigned_sales",
  "site_visit_scheduled",
  "site_visit_completed",
  "negotiation",
  "booking_confirmed",
  "closed_won",
  "closed_lost",
  "on_hold",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface ILead extends Document {
  _id: Types.ObjectId;
  leadId: string;

  // Origin
  enquiry: Types.ObjectId;
  property?: Types.ObjectId;
  propertyName?: string;
  source: string;

  // Customer
  customerName: string;
  mobile: string;
  email?: string;
  location?: string;

  // Routing
  assignedTeamLeader?: Types.ObjectId;
  assignedTelecaller?: Types.ObjectId;
  assignedSalesAgent?: Types.ObjectId;

  // Workflow
  status: LeadStatus;
  priority: "low" | "medium" | "high";
  notInterestedReason?: string;
  closedLostReason?: string;

  // Tracking
  nextContactAt?: Date;
  lastContactAt?: Date;
  remarks?: string;

  // Meeting details captured when a Telecaller qualifies a lead — the Team
  // Leader (and later the Sales Agent) need these to act on the handoff.
  meetingAt?: Date;
  meetingLocation?: string;

  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    leadId: { type: String, required: true, unique: true },

    enquiry: { type: Schema.Types.ObjectId, ref: "Enquiry", required: true },
    property: { type: Schema.Types.ObjectId, ref: "Property" },
    propertyName: { type: String },
    source: { type: String, default: "property_enquiry" },

    customerName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String },
    location: { type: String },

    assignedTeamLeader: { type: Schema.Types.ObjectId, ref: "User" },
    assignedTelecaller: { type: Schema.Types.ObjectId, ref: "User" },
    assignedSalesAgent: { type: Schema.Types.ObjectId, ref: "User" },

    status: { type: String, enum: LEAD_STATUSES, default: "new_enquiry" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    notInterestedReason: { type: String },
    closedLostReason: { type: String },

    nextContactAt: { type: Date },
    lastContactAt: { type: Date },
    remarks: { type: String },

    meetingAt: { type: Date },
    meetingLocation: { type: String },
  },
  { timestamps: true }
);

leadSchema.index({ assignedTeamLeader: 1 });
leadSchema.index({ assignedTelecaller: 1 });
leadSchema.index({ assignedSalesAgent: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ nextContactAt: 1 });
leadSchema.index({ customerName: 1, mobile: 1, leadId: 1 });

export const Lead = model<ILead>("Lead", leadSchema);
