import { Request, Response } from "express";
import { z } from "zod";
import { Property } from "../models/Property";
import { Enquiry } from "../models/Enquiry";
import { Lead } from "../models/Lead";
import { nextSequence } from "../models/Counter";
import { AuthRequest } from "../middleware/auth";
import { logActivity, notify } from "../services/leadActivity";
import { resolveDefaultTeamLeader, listSuperAdminIds } from "./leadController";

const nearbyLandmarkSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["transit", "essentials", "utility", "shopping"]),
  distance: z.string().optional(),
});

const createSchema = z.object({
  title: z.string().min(3),
  societyName: z.string().optional(),
  description: z.string().min(10),
  type: z.enum(["apartment", "villa", "house", "commercial", "plot", "pg_hostel", "penthouse", "studio"]),
  transactionType: z.enum(["sale", "rent", "lease"]),
  price: z.number().positive(),
  priceNegotiable: z.boolean().optional(),
  address: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().optional(),
  landmark: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  nearbyLandmarks: z.array(nearbyLandmarkSchema).optional(),
  size: z.number().positive(),
  builtupArea: z.number().positive().optional(),
  carpetArea: z.number().positive().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  balconies: z.number().int().min(0).optional(),
  parking: z.number().int().min(0).optional(),
  parkingType: z.enum(["car", "bike", "both", "none"]).optional(),
  floors: z.number().int().min(1).optional(),
  floorNumber: z.number().int().min(0).optional(),
  furnishing: z.enum(["unfurnished", "semi_furnished", "fully_furnished"]).optional(),
  amenities: z.array(z.string()).optional(),
  possessionStatus: z.enum(["ready_to_move", "under_construction"]).optional(),
  possessionDate: z.coerce.date().optional(),
  ageOfBuilding: z.string().optional(),
  ownershipType: z.enum(["freehold", "leasehold", "self_owned"]).optional(),
  maintenanceCharges: z.number().min(0).optional(),
  flooringType: z.string().optional(),
  facingDirection: z.enum(["north", "south", "east", "west", "north_east", "north_west", "south_east", "south_west"]).optional(),
  powerBackup: z.enum(["full", "partial", "none"]).optional(),
  gatedSecurity: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  brochureUrl: z.string().optional(),
  amenitiesPdfUrl: z.string().optional(),
  contactName: z.string().min(2),
  contactPhone: z.string().min(10),
  contactEmail: z.string().email(),
  yearBuilt: z.number().int().min(1800).max(2100).optional(),
  returnRate: z.string().optional(),
  rentalYield: z.string().optional(),
  appreciation: z.string().optional(),
  minInvestment: z.number().positive().optional(),
  featured: z.boolean().optional(),
  verificationStatus: z.enum(["verified", "unverified"]).optional(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateUniqueSlug(title: string, city: string): Promise<string> {
  const base = slugify(`${title}-${city}`);
  let slug = base;
  let suffix = 1;
  while (await Property.exists({ slug })) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

// Public: only approved properties
export async function listProperties(req: Request, res: Response): Promise<void> {
  const { city, type, transactionType, featured, page = "1", limit = "12", search } = req.query;

  const filter: Record<string, unknown> = { approvalStatus: "approved" };
  if (city) filter.city = new RegExp(city as string, "i");
  if (type) filter.type = type;
  if (transactionType) filter.transactionType = transactionType;
  if (featured === "true") filter.featured = true;
  if (search) {
    (filter as Record<string, unknown>).$or = [
      { title: new RegExp(search as string, "i") },
      { city: new RegExp(search as string, "i") },
      { address: new RegExp(search as string, "i") },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [properties, total] = await Promise.all([
    Property.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    Property.countDocuments(filter),
  ]);

  res.json({ properties, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}

// Admin: all properties with any approval status
export async function adminListProperties(req: Request, res: Response): Promise<void> {
  const { approvalStatus, city, type, page = "1", limit = "20", search } = req.query;

  const filter: Record<string, unknown> = {};
  if (approvalStatus) filter.approvalStatus = approvalStatus;
  if (city) filter.city = new RegExp(city as string, "i");
  if (type) filter.type = type;
  if (search) {
    (filter as Record<string, unknown>).$or = [
      { title: new RegExp(search as string, "i") },
      { city: new RegExp(search as string, "i") },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [properties, total] = await Promise.all([
    Property.find(filter)
      .populate("submittedBy", "name email role agencyName")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Property.countDocuments(filter),
  ]);

  res.json({ properties, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}

export async function getProperty(req: Request, res: Response): Promise<void> {
  const property = await Property.findById(req.params.id).populate("submittedBy", "name email agencyName");
  if (!property) { res.status(404).json({ error: "Property not found" }); return; }

  // Increment views for approved properties
  if (property.approvalStatus === "approved") {
    Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();
  }

  res.json(property);
}

export async function createProperty(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const role = req.userRole as string;
  const submitterRole = role === "super_admin" ? "super_admin" : role === "agent" ? "agent" : "owner";
  // Super admin submissions are auto-approved
  const approvalStatus = role === "super_admin" ? "approved" : "pending";
  const approvedBy = role === "super_admin" ? req.userId : undefined;
  const approvedAt = role === "super_admin" ? new Date() : undefined;
  const slug = await generateUniqueSlug(parsed.data.title, parsed.data.city);
  // featured/verificationStatus are admin-only moderation controls — strip them for non-admin submitters
  const { featured, verificationStatus, ...rest } = parsed.data;
  const adminFields = role === "super_admin" ? { featured, verificationStatus } : {};

  const property = await Property.create({
    ...rest,
    ...adminFields,
    slug,
    submittedBy: req.userId,
    submitterRole,
    approvalStatus,
    ...(approvedBy ? { approvedBy, approvedAt } : {}),
  });

  res.status(201).json(property);
}

export async function updateProperty(req: AuthRequest, res: Response): Promise<void> {
  const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!property) { res.status(404).json({ error: "Property not found" }); return; }
  res.json(property);
}

export async function deleteProperty(req: AuthRequest, res: Response): Promise<void> {
  const property = await Property.findByIdAndDelete(req.params.id);
  if (!property) { res.status(404).json({ error: "Property not found" }); return; }
  res.json({ message: "Deleted" });
}

export async function approveProperty(req: AuthRequest, res: Response): Promise<void> {
  const property = await Property.findByIdAndUpdate(
    req.params.id,
    { approvalStatus: "approved", approvedBy: req.userId, approvedAt: new Date(), rejectionReason: undefined },
    { new: true }
  );
  if (!property) { res.status(404).json({ error: "Property not found" }); return; }
  res.json(property);
}

export async function rejectProperty(req: AuthRequest, res: Response): Promise<void> {
  const { reason } = req.body as { reason?: string };
  const property = await Property.findByIdAndUpdate(
    req.params.id,
    { approvalStatus: "rejected", rejectionReason: reason ?? "Did not meet listing standards." },
    { new: true }
  );
  if (!property) { res.status(404).json({ error: "Property not found" }); return; }
  res.json(property);
}

// Public enquiry — optionalAuth (userId captured if logged in)
export async function submitEnquiry(req: AuthRequest, res: Response): Promise<void> {
  const { name, email, phone, message } = req.body as Record<string, string>;
  if (!name || !email || !phone || !message) {
    res.status(400).json({ error: "All fields required" }); return;
  }

  const property = await Property.findOne({ _id: req.params.id, approvalStatus: "approved" });
  if (!property) { res.status(404).json({ error: "Property not found" }); return; }

  const enquiry = await Enquiry.create({
    property: property._id,
    name, email, phone, message,
    ...(req.userId ? { userId: req.userId } : {}),
  });
  await Property.findByIdAndUpdate(property._id, { $inc: { enquiryCount: 1 } } as object);

  // Every property enquiry automatically becomes a CRM lead, visible to
  // Super Admin and the default Team Leader until routed further.
  const defaultTeamLeader = await resolveDefaultTeamLeader();
  const seq = await nextSequence("leadId");
  const lead = await Lead.create({
    leadId: `LD-${String(seq).padStart(6, "0")}`,
    enquiry: enquiry._id,
    property: property._id,
    propertyName: property.title,
    source: "property_enquiry",
    customerName: name,
    mobile: phone,
    email,
    location: `${property.city}, ${property.state}`,
    assignedTeamLeader: defaultTeamLeader,
    status: defaultTeamLeader ? "assigned_team_leader" : "new_enquiry",
    remarks: message,
  });

  await logActivity({
    lead: lead._id,
    action: "created",
    remarks: "Lead auto-created from property enquiry",
  });

  const recipients = await listSuperAdminIds();
  if (defaultTeamLeader) recipients.push(defaultTeamLeader);
  await Promise.all(
    recipients.map((recipient) =>
      notify({
        recipient,
        type: "lead_assigned",
        lead: lead._id,
        message: `New enquiry lead ${lead.leadId} for "${property.title}" from ${name}.`,
      })
    )
  );

  res.status(201).json(enquiry);
}

// Public: increments contact-click counter (called when a visitor reveals/contacts the owner)
export async function trackContact(req: Request, res: Response): Promise<void> {
  const property = await Property.findByIdAndUpdate(req.params.id, { $inc: { contactCount: 1 } }, { new: true });
  if (!property) { res.status(404).json({ error: "Property not found" }); return; }
  res.json({ contactCount: property.contactCount });
}

// Public: flag a listing as incorrect/misleading
export async function reportProperty(req: Request, res: Response): Promise<void> {
  const property = await Property.findByIdAndUpdate(req.params.id, { $inc: { reportCount: 1 } }, { new: true });
  if (!property) { res.status(404).json({ error: "Property not found" }); return; }
  res.json({ message: "Reported. Our team will review this listing." });
}

// Public: similar properties — same city + type, excluding self
export async function getSimilarProperties(req: Request, res: Response): Promise<void> {
  const property = await Property.findById(req.params.id);
  if (!property) { res.status(404).json({ error: "Property not found" }); return; }

  const similar = await Property.find({
    _id: { $ne: property._id },
    approvalStatus: "approved",
    city: property.city,
    $or: [{ type: property.type }, { transactionType: property.transactionType }],
  })
    .limit(4)
    .sort({ createdAt: -1 });

  res.json(similar);
}

// Public: nearby localities in the same city, for SEO/browsing links
export async function getNearbyLocalities(req: Request, res: Response): Promise<void> {
  const property = await Property.findById(req.params.id);
  if (!property) { res.status(404).json({ error: "Property not found" }); return; }

  const landmarks = await Property.find({
    _id: { $ne: property._id },
    approvalStatus: "approved",
    city: property.city,
  })
    .distinct("landmark");

  res.json({ city: property.city, localities: landmarks.filter(Boolean).slice(0, 8) });
}
