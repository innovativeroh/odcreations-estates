import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role:
    | "super_admin"
    | "sub_admin"
    | "team_leader"
    | "telecaller"
    | "sales_agent"
    | "agent"
    | "owner"
    | "user";
  // agent-specific
  agencyName?: string;
  licenseNumber?: string;
  createdBy?: Types.ObjectId;
  isActive: boolean;
  savedProperties: Types.ObjectId[];
  // CRM (lead-management) fields
  permissions: string[]; // meaningful only for sub_admin — granted dashboard/section access
  teamId?: Types.ObjectId; // ref Team — for team_leader/telecaller/sales_agent
  createdAt: Date;
  updatedAt: Date;
}

export const CRM_ROLES = ["super_admin", "sub_admin", "team_leader", "telecaller", "sales_agent"] as const;

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    phone: { type: String },
    avatar: { type: String },
    role: {
      type: String,
      enum: ["super_admin", "sub_admin", "team_leader", "telecaller", "sales_agent", "agent", "owner", "user"],
      default: "user",
    },
    agencyName: { type: String },
    licenseNumber: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
    savedProperties: [{ type: Schema.Types.ObjectId, ref: "Property" }],
    permissions: [{ type: String }],
    teamId: { type: Schema.Types.ObjectId, ref: "Team" },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
