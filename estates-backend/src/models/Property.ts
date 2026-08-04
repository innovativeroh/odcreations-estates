import { Schema, model, Document, Types } from "mongoose";

export interface INearbyLandmark {
  name: string;
  category: "transit" | "essentials" | "utility" | "shopping";
  distance?: string;
}

export interface IProperty extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  societyName?: string;
  description: string;
  type: "apartment" | "villa" | "house" | "commercial" | "plot" | "pg_hostel" | "penthouse" | "studio";
  transactionType: "sale" | "rent" | "lease";
  price: number;
  priceNegotiable: boolean;

  // Location
  address: string;
  city: string;
  state: string;
  pincode?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  nearbyLandmarks: INearbyLandmark[];

  // Features
  size: number;
  builtupArea?: number;
  carpetArea?: number;
  bedrooms: number;
  bathrooms: number;
  balconies?: number;
  parking?: number;
  parkingType?: "car" | "bike" | "both" | "none";
  floors?: number;
  floorNumber?: number;
  furnishing?: "unfurnished" | "semi_furnished" | "fully_furnished";
  amenities: string[];
  possessionStatus?: "ready_to_move" | "under_construction";
  possessionDate?: Date;
  ageOfBuilding?: string;
  ownershipType?: "freehold" | "leasehold" | "self_owned";
  maintenanceCharges?: number;
  flooringType?: string;
  facingDirection?: "north" | "south" | "east" | "west" | "north_east" | "north_west" | "south_east" | "south_west";
  powerBackup?: "full" | "partial" | "none";
  gatedSecurity?: boolean;

  // Media
  images: string[];
  brochureUrl?: string;
  amenitiesPdfUrl?: string;

  // Contact (shown after approval)
  contactName: string;
  contactPhone: string;
  contactEmail: string;

  // Workflow
  approvalStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  submittedBy: Types.ObjectId;
  submitterRole: "agent" | "owner" | "super_admin";
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  verificationStatus: "verified" | "unverified";

  // Investment metrics (optional, for fractional investment listings)
  yearBuilt?: number;
  returnRate?: string;
  rentalYield?: string;
  appreciation?: string;
  minInvestment?: number;

  // Metadata
  featured: boolean;
  views: number;
  shortlistCount: number;
  contactCount: number;
  reportCount: number;
  enquiryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const nearbyLandmarkSchema = new Schema<INearbyLandmark>(
  {
    name: { type: String, required: true },
    category: { type: String, enum: ["transit", "essentials", "utility", "shopping"], required: true },
    distance: { type: String },
  },
  { _id: false }
);

const propertySchema = new Schema<IProperty>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    societyName: { type: String },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["apartment", "villa", "house", "commercial", "plot", "pg_hostel", "penthouse", "studio"],
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["sale", "rent", "lease"],
      required: true,
    },
    price: { type: Number, required: true },
    priceNegotiable: { type: Boolean, default: false },

    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String },
    landmark: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    nearbyLandmarks: { type: [nearbyLandmarkSchema], default: [] },

    size: { type: Number, required: true },
    builtupArea: { type: Number },
    carpetArea: { type: Number },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    balconies: { type: Number, default: 0 },
    parking: { type: Number, default: 0 },
    parkingType: { type: String, enum: ["car", "bike", "both", "none"] },
    floors: { type: Number },
    floorNumber: { type: Number },
    furnishing: {
      type: String,
      enum: ["unfurnished", "semi_furnished", "fully_furnished"],
    },
    amenities: [{ type: String }],
    possessionStatus: { type: String, enum: ["ready_to_move", "under_construction"] },
    possessionDate: { type: Date },
    ageOfBuilding: { type: String },
    ownershipType: { type: String, enum: ["freehold", "leasehold", "self_owned"] },
    maintenanceCharges: { type: Number },
    flooringType: { type: String },
    facingDirection: {
      type: String,
      enum: ["north", "south", "east", "west", "north_east", "north_west", "south_east", "south_west"],
    },
    powerBackup: { type: String, enum: ["full", "partial", "none"] },
    gatedSecurity: { type: Boolean, default: false },

    images: [{ type: String }],
    brochureUrl: { type: String },
    amenitiesPdfUrl: { type: String },

    contactName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    submitterRole: {
      type: String,
      enum: ["agent", "owner", "super_admin"],
      required: true,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    verificationStatus: { type: String, enum: ["verified", "unverified"], default: "unverified" },

    yearBuilt: { type: Number },
    returnRate: { type: String },
    rentalYield: { type: String },
    appreciation: { type: String },
    minInvestment: { type: Number },

    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    shortlistCount: { type: Number, default: 0 },
    contactCount: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    enquiryCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

propertySchema.index({ approvalStatus: 1, city: 1 });
propertySchema.index({ submittedBy: 1 });
propertySchema.index({ featured: 1, approvalStatus: 1 });

export const Property = model<IProperty>("Property", propertySchema);
