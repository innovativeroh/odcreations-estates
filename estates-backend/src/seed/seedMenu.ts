import "dotenv/config";
import mongoose from "mongoose";
import { MenuItem } from "../models/MenuItem";
import { User } from "../models/User";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const admin = await User.findOne({ role: "super_admin" });
  if (!admin) throw new Error("No super_admin found — run createAdmin seed first.");

  const removed = await MenuItem.deleteMany({});
  console.log(`Removed ${removed.deletedCount} existing menu items.`);

  const categories = [
    {
      label: "For Buyers",
      children: [
        { label: "Buy Ready-to-Move Homes", url: "/properties?intent=buy" },
        { label: "New Projects & Developers", url: "/properties?type=New+Projects" },
        { label: "Luxury Villas & Penthouses", url: "/properties?type=Villa" },
        { label: "Commercial Office Spaces", url: "/properties?intent=commercial" },
        { label: "Plots & Land Investments", url: "/properties?intent=plots" },
      ],
    },
    {
      label: "For Tenants",
      children: [
        { label: "Rental Apartments", url: "/properties?intent=rent" },
        { label: "PG & Co-Living Spaces", url: "/properties?intent=pg-co-living" },
        { label: "Commercial Office Lease", url: "/properties?intent=commercial" },
        { label: "Owner Direct Rentals", url: "/properties?intent=rent&direct=true" },
      ],
    },
    {
      label: "For Sellers",
      children: [
        { label: "Post Property FREE", url: "/profile/post-property", highlight: true, visibility: "logged_in" as const },
        { label: "Free Property Valuation", url: "/contact?type=valuation" },
        { label: "Agent & CRM Dashboard", url: "/agent/login", type: "website_url" as const },
      ],
    },
  ];

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const parent = await MenuItem.create({
      label: cat.label,
      type: "category",
      order: i,
      createdBy: admin._id,
    });
    for (let j = 0; j < cat.children.length; j++) {
      const child = cat.children[j];
      await MenuItem.create({
        label: child.label,
        type: child.type ?? "custom_url",
        url: child.url,
        parentId: parent._id,
        order: j,
        highlight: "highlight" in child ? child.highlight : false,
        visibility: "visibility" in child ? child.visibility : "always",
        createdBy: admin._id,
      });
    }
    console.log(`✓ Seeded menu category: ${cat.label} (${cat.children.length} items)`);
  }

  console.log(`\nDone. ${categories.length} top-level categories seeded.`);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
