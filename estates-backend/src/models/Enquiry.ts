import { Schema, model, Document, Types } from "mongoose";

export interface IEnquiry extends Document {
  _id: Types.ObjectId;
  property: Types.ObjectId;
  userId?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "contacted" | "closed";
  createdAt: Date;
}

const enquirySchema = new Schema<IEnquiry>(
  {
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

enquirySchema.index({ property: 1 });
enquirySchema.index({ status: 1 });

export const Enquiry = model<IEnquiry>("Enquiry", enquirySchema);
