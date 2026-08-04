import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../models/User";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const email = "admin@estates.in";
  const password = "Estates@Admin2025";

  const exists = await User.findOne({ email });
  if (exists) {
    console.log("Admin already exists:", email);
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await User.create({
    name: "Super Admin",
    email,
    password: hashed,
    role: "super_admin",
  });

  console.log("✓ Super admin created");
  console.log("  Email   :", email);
  console.log("  Password:", password);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
