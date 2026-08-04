import { Schema, model, Document, Types } from "mongoose";

export interface IMenuItem extends Document {
  _id: Types.ObjectId;
  label: string;
  type: "category" | "custom_url" | "website_url";
  url?: string;
  parentId?: Types.ObjectId | null;
  order: number;
  isActive: boolean;
  openInNewTab: boolean;
  highlight: boolean;
  icon?: string;
  visibility: "always" | "logged_in" | "logged_out" | "role";
  roles: string[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    label: { type: String, required: true, trim: true },
    type: { type: String, enum: ["category", "custom_url", "website_url"], required: true },
    url: { type: String },
    parentId: { type: Schema.Types.ObjectId, ref: "MenuItem", default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    openInNewTab: { type: Boolean, default: false },
    highlight: { type: Boolean, default: false },
    icon: { type: String },
    visibility: { type: String, enum: ["always", "logged_in", "logged_out", "role"], default: "always" },
    roles: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

menuItemSchema.index({ parentId: 1, order: 1 });

export const MenuItem = model<IMenuItem>("MenuItem", menuItemSchema);
