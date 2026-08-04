import { Schema, model, Document, Types } from "mongoose";

export const NOTIFICATION_TYPES = [
  "lead_assigned",
  "lead_reassigned",
  "lead_returned",
  "follow_up_overdue",
] as const;

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  type: (typeof NOTIFICATION_TYPES)[number];
  lead: Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    lead: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export const Notification = model<INotification>("Notification", notificationSchema);
