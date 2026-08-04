import "dotenv/config";
import mongoose from "mongoose";
import { Property, IProperty } from "../models/Property";
import { User } from "../models/User";
import { Enquiry } from "../models/Enquiry";
import { Lead } from "../models/Lead";

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const admin = await User.findOne({ role: "super_admin" });
  if (!admin) throw new Error("No super_admin found — run createAdmin seed first.");

  const existingIds = (await Property.find({}, "_id")).map((p) => p._id);
  const removed = await Property.deleteMany({});
  console.log(`Removed ${removed.deletedCount} existing properties.`);

  if (existingIds.length) {
    const enq = await Enquiry.deleteMany({ property: { $in: existingIds } });
    const leads = await Lead.deleteMany({ property: { $in: existingIds } });
    console.log(`Cascaded: removed ${enq.deletedCount} enquiries, ${leads.deletedCount} leads tied to old properties.`);
  }

  const base = {
    submittedBy: admin._id,
    submitterRole: "super_admin" as const,
    approvalStatus: "approved" as const,
    approvedBy: admin._id,
    approvedAt: new Date(),
    verificationStatus: "verified" as const,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200",
    ],
    brochureUrl: "https://example.com/brochures/sample-brochure.pdf",
    amenitiesPdfUrl: "https://example.com/brochures/sample-amenities.pdf",
  };

  const properties: Array<Partial<IProperty>> = [
    {
      ...base,
      title: "3 BHK Flat for Sale in Prestige Lakeside Habitat",
      societyName: "Prestige Lakeside Habitat",
      description:
        "A spacious, sunlit 3 BHK apartment in one of Bengaluru's most sought-after gated communities. Overlooking the society's central lake and landscaped gardens, this ready-to-move home offers premium fittings, ample ventilation, and a peaceful lakeside lifestyle just minutes from Whitefield's IT corridor.",
      type: "apartment",
      transactionType: "sale",
      price: 14500000,
      priceNegotiable: true,
      address: "Prestige Lakeside Habitat, Varthur Road",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560087",
      landmark: "Near Varthur Lake",
      latitude: 12.9382,
      longitude: 77.749,
      nearbyLandmarks: [
        { name: "Varthur Metro Station", category: "transit", distance: "1.2 km" },
        { name: "Columbia Asia Hospital", category: "essentials", distance: "2.5 km" },
        { name: "Whitefield ITPL Tech Park", category: "utility", distance: "4 km" },
        { name: "Phoenix Marketcity", category: "shopping", distance: "6 km" },
      ],
      size: 1850,
      builtupArea: 2050,
      carpetArea: 1650,
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      parking: 2,
      parkingType: "car",
      floors: 24,
      floorNumber: 14,
      furnishing: "semi_furnished",
      amenities: ["Swimming Pool", "Gym", "Security", "Parking", "Lift", "Power Backup", "Club House", "Intercom", "Kids Play Area", "Visitor Parking", "Fire Safety", "Sewage Treatment"],
      possessionStatus: "ready_to_move",
      ageOfBuilding: "1-5 years",
      ownershipType: "freehold",
      maintenanceCharges: 4,
      flooringType: "Vitrified Tiles",
      facingDirection: "east",
      powerBackup: "full",
      gatedSecurity: true,
      contactName: "Ramesh Iyer",
      contactPhone: "9845012345",
      contactEmail: "ramesh.iyer@example.com",
      yearBuilt: 2022,
    },
    {
      ...base,
      title: "2 BHK Apartment for Rent in Hiranandani Gardens",
      societyName: "Hiranandani Gardens",
      description:
        "Elegant 2 BHK rental home in Hiranandani Gardens, Powai — a self-contained township with schools, hospitals, and retail all within walking distance. Fully furnished with modern interiors, this apartment suits working professionals and families looking for a hassle-free move-in.",
      type: "apartment",
      transactionType: "rent",
      price: 68000,
      priceNegotiable: false,
      address: "Hiranandani Gardens, Powai",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400076",
      landmark: "Near Powai Lake",
      latitude: 19.1197,
      longitude: 72.9051,
      nearbyLandmarks: [
        { name: "Powai Bus Depot", category: "transit", distance: "0.8 km" },
        { name: "Hiranandani Hospital", category: "essentials", distance: "1 km" },
        { name: "IIT Bombay", category: "utility", distance: "2 km" },
        { name: "R City Mall", category: "shopping", distance: "3.5 km" },
      ],
      size: 1150,
      builtupArea: 1280,
      carpetArea: 1020,
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      parking: 1,
      parkingType: "car",
      floors: 18,
      floorNumber: 9,
      furnishing: "fully_furnished",
      amenities: ["Swimming Pool", "Gym", "Security", "Lift", "Power Backup", "Gas Pipeline", "Intercom", "Rainwater Harvesting", "Wi-Fi"],
      possessionStatus: "ready_to_move",
      ageOfBuilding: "5-10 years",
      ownershipType: "leasehold",
      maintenanceCharges: 3.5,
      flooringType: "Marble",
      facingDirection: "north_west",
      powerBackup: "full",
      gatedSecurity: true,
      contactName: "Priya Nair",
      contactPhone: "9820098765",
      contactEmail: "priya.nair@example.com",
      yearBuilt: 2017,
    },
    {
      ...base,
      title: "4 BHK Independent Villa for Sale in Jaipur Greens",
      societyName: "Jaipur Greens Villa Enclave",
      description:
        "A grand 4 BHK independent villa set on a private plot within a gated villa community. Featuring a private garden, servant quarters, and premium Italian marble flooring, this under-construction villa is ideal for large families seeking privacy and space, with possession expected in a year.",
      type: "villa",
      transactionType: "sale",
      price: 32000000,
      priceNegotiable: true,
      address: "Jaipur Greens, Ajmer Road",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302026",
      landmark: "Near Ajmer Highway",
      latitude: 26.8858,
      longitude: 75.7027,
      nearbyLandmarks: [
        { name: "Ajmer Road Bus Stand", category: "transit", distance: "2 km" },
        { name: "Manipal Hospital", category: "essentials", distance: "3 km" },
        { name: "Sitapura Industrial Area", category: "utility", distance: "5 km" },
        { name: "World Trade Park", category: "shopping", distance: "7 km" },
      ],
      size: 4200,
      builtupArea: 4800,
      carpetArea: 3900,
      bedrooms: 4,
      bathrooms: 5,
      balconies: 4,
      parking: 3,
      parkingType: "both",
      floors: 3,
      floorNumber: 0,
      furnishing: "unfurnished",
      amenities: ["Security", "Parking", "Power Backup", "Club House", "Park", "Servant Room", "Visitor Parking", "Fire Safety"],
      possessionStatus: "under_construction",
      possessionDate: new Date("2027-06-01"),
      ageOfBuilding: "New",
      ownershipType: "freehold",
      maintenanceCharges: 2.5,
      flooringType: "Italian Marble",
      facingDirection: "south_east",
      powerBackup: "partial",
      gatedSecurity: true,
      contactName: "Vikram Singh",
      contactPhone: "9414056789",
      contactEmail: "vikram.singh@example.com",
      yearBuilt: 2027,
    },
  ];

  for (const p of properties) {
    const slug = slugify(`${p.title}-${p.city}`);
    await Property.create({ ...p, slug });
    console.log(`✓ Seeded: ${p.title}`);
  }

  console.log(`\nDone. ${properties.length} properties seeded.`);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
