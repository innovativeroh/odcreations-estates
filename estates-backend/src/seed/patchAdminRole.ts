import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/User";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const r = await User.updateOne({ email: "admin@estates.in" }, { $set: { role: "super_admin" } });
  console.log("Patched:", r.modifiedCount, "document(s)");
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
