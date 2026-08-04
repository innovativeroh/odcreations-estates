import { Schema, model, Document, Types } from "mongoose";

export interface ITeam extends Document {
  _id: Types.ObjectId;
  name: string;
  teamLeader: Types.ObjectId;
  telecallers: Types.ObjectId[];
  salesAgents: Types.ObjectId[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true },
    teamLeader: { type: Schema.Types.ObjectId, ref: "User", required: true },
    telecallers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    salesAgents: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

teamSchema.index({ isDefault: 1 });

export const Team = model<ITeam>("Team", teamSchema);
