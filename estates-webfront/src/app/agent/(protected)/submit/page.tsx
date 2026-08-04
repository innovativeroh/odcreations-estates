"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { agentApi, uploadToR2 } from "@/lib/agentAuth";
import toast from "react-hot-toast";

const PROPERTY_TYPES = ["apartment", "villa", "house", "commercial", "plot", "pg_hostel", "penthouse", "studio"] as const;
const TRANSACTION_TYPES = ["sale", "rent", "lease"] as const;
const FURNISHING_OPTIONS = ["unfurnished", "semi_furnished", "fully_furnished"] as const;
const PARKING_TYPES = ["car", "bike", "both", "none"] as const;
const POSSESSION_STATUSES = ["ready_to_move", "under_construction"] as const;
const OWNERSHIP_TYPES = ["freehold", "leasehold", "self_owned"] as const;
const FACING_DIRECTIONS = ["north", "south", "east", "west", "north_east", "north_west", "south_east", "south_west"] as const;
const POWER_BACKUP_OPTIONS = ["full", "partial", "none"] as const;
const LANDMARK_CATEGORIES = ["transit", "essentials", "utility", "shopping"] as const;
const AGE_OF_BUILDING_OPTIONS = ["New / Under Construction", "0-1 years", "1-5 years", "5-10 years", "10+ years"];
const AMENITIES = [
  "Swimming Pool", "Gym", "Security", "Parking", "Lift", "Power Backup", "Gas Pipeline", "Club House", "Intercom", "Rainwater Harvesting",
  "Fire Safety", "Sewage Treatment", "Wi-Fi", "Kids Play Area", "Servant Room", "Visitor Parking", "Park",
];

type PropertyType = typeof PROPERTY_TYPES[number];
type TransactionType = typeof TRANSACTION_TYPES[number];
type FurnishingType = typeof FURNISHING_OPTIONS[number];
type ParkingType = typeof PARKING_TYPES[number];
type PossessionStatus = typeof POSSESSION_STATUSES[number];
type OwnershipType = typeof OWNERSHIP_TYPES[number];
type FacingDirection = typeof FACING_DIRECTIONS[number];
type PowerBackupType = typeof POWER_BACKUP_OPTIONS[number];
type LandmarkCategory = typeof LANDMARK_CATEGORIES[number];

interface NearbyLandmark {
  name: string;
  category: LandmarkCategory;
  distance: string;
}

interface FormData {
  // Step 1
  title: string;
  societyName: string;
  description: string;
  type: PropertyType | "";
  transactionType: TransactionType | "";
  // Step 2
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  latitude: string;
  longitude: string;
  nearbyLandmarks: NearbyLandmark[];
  // Step 3
  price: string;
  priceNegotiable: boolean;
  size: string;
  builtupArea: string;
  carpetArea: string;
  bedrooms: string;
  bathrooms: string;
  balconies: string;
  parking: string;
  parkingType: ParkingType | "";
  floors: string;
  floorNumber: string;
  furnishing: FurnishingType | "";
  amenities: string[];
  yearBuilt: string;
  possessionStatus: PossessionStatus | "";
  possessionDate: string;
  ageOfBuilding: string;
  ownershipType: OwnershipType | "";
  maintenanceCharges: string;
  flooringType: string;
  facingDirection: FacingDirection | "";
  powerBackup: PowerBackupType | "";
  gatedSecurity: boolean;
  // Step 4
  images: string[];
  brochureUrl: string;
  amenitiesPdfUrl: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

const EMPTY: FormData = {
  title: "", societyName: "", description: "", type: "", transactionType: "",
  address: "", city: "", state: "", pincode: "", landmark: "", latitude: "", longitude: "", nearbyLandmarks: [],
  price: "", priceNegotiable: false, size: "", builtupArea: "", carpetArea: "", bedrooms: "", bathrooms: "", balconies: "", parking: "", parkingType: "", floors: "", floorNumber: "", furnishing: "", amenities: [],
  yearBuilt: "", possessionStatus: "", possessionDate: "", ageOfBuilding: "", ownershipType: "", maintenanceCharges: "", flooringType: "", facingDirection: "", powerBackup: "", gatedSecurity: false,
  images: [], brochureUrl: "", amenitiesPdfUrl: "", contactName: "", contactPhone: "", contactEmail: "",
};

const STEPS = ["Basics", "Location", "Details", "Media & Contact"];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-bold text-neutral-500 block mb-2 uppercase tracking-wide">
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3.5 outline-none text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-300 transition-colors ${props.className ?? ""}`}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3.5 outline-none text-sm text-neutral-800 focus:border-neutral-300 transition-colors ${props.className ?? ""}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3.5 outline-none text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-300 transition-colors resize-none ${props.className ?? ""}`}
    />
  );
}

export default function SubmitPropertyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [brochureUploading, setBrochureUploading] = useState(false);
  const [amenitiesPdfUploading, setAmenitiesPdfUploading] = useState(false);
  const [newLandmark, setNewLandmark] = useState<{ name: string; category: LandmarkCategory | ""; distance: string }>({ name: "", category: "", distance: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const brochureRef = useRef<HTMLInputElement>(null);
  const amenitiesPdfRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof FormData, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  function toggleAmenity(a: string) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));
  }

  function addLandmark() {
    if (!newLandmark.name || !newLandmark.category) {
      toast.error("Enter a landmark name and category.");
      return;
    }
    setForm((f) => ({
      ...f,
      nearbyLandmarks: [...f.nearbyLandmarks, { name: newLandmark.name, category: newLandmark.category as LandmarkCategory, distance: newLandmark.distance }],
    }));
    setNewLandmark({ name: "", category: "", distance: "" });
  }

  function removeLandmark(i: number) {
    setForm((f) => ({ ...f, nearbyLandmarks: f.nearbyLandmarks.filter((_, j) => j !== i) }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setUploadProgress(0);
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadToR2(files[i], "properties");
        urls.push(url);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      } catch {
        toast.error(`Failed to upload ${files[i].name}`);
      }
    }
    setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleBrochureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBrochureUploading(true);
    try {
      const url = await uploadToR2(file, "documents");
      set("brochureUrl", url);
    } catch {
      toast.error("Failed to upload brochure.");
    }
    setBrochureUploading(false);
    if (brochureRef.current) brochureRef.current.value = "";
  }

  async function handleAmenitiesPdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAmenitiesPdfUploading(true);
    try {
      const url = await uploadToR2(file, "documents");
      set("amenitiesPdfUrl", url);
    } catch {
      toast.error("Failed to upload amenities PDF.");
    }
    setAmenitiesPdfUploading(false);
    if (amenitiesPdfRef.current) amenitiesPdfRef.current.value = "";
  }

  function validateStep(s: number): string | null {
    if (s === 0) {
      if (!form.title || form.title.length < 3) return "Title must be at least 3 characters.";
      if (!form.description || form.description.length < 10) return "Description must be at least 10 characters.";
      if (!form.type) return "Select a property type.";
      if (!form.transactionType) return "Select a transaction type.";
    }
    if (s === 1) {
      if (!form.address || form.address.length < 3) return "Address is required.";
      if (!form.city || form.city.length < 2) return "City is required.";
      if (!form.state || form.state.length < 2) return "State is required.";
    }
    if (s === 2) {
      if (!form.price || Number(form.price) <= 0) return "Enter a valid price.";
      if (!form.size || Number(form.size) <= 0) return "Enter a valid size.";
    }
    if (s === 3) {
      if (!form.contactName || form.contactName.length < 2) return "Contact name required.";
      if (!form.contactPhone || form.contactPhone.length < 10) return "Valid phone number required.";
      if (!form.contactEmail || !form.contactEmail.includes("@")) return "Valid email required.";
    }
    return null;
  }

  function next() {
    const err = validateStep(step);
    if (err) { toast.error(err); return; }
    setStep((s) => s + 1);
  }

  function prev() {
    setStep((s) => s - 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStep(3);
    if (err) { toast.error(err); return; }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        ...(form.societyName ? { societyName: form.societyName } : {}),
        description: form.description,
        type: form.type,
        transactionType: form.transactionType,
        price: Number(form.price),
        priceNegotiable: form.priceNegotiable,
        address: form.address,
        city: form.city,
        state: form.state,
        ...(form.pincode ? { pincode: form.pincode } : {}),
        ...(form.landmark ? { landmark: form.landmark } : {}),
        ...(form.latitude ? { latitude: Number(form.latitude) } : {}),
        ...(form.longitude ? { longitude: Number(form.longitude) } : {}),
        ...(form.nearbyLandmarks.length ? { nearbyLandmarks: form.nearbyLandmarks } : {}),
        size: Number(form.size),
        ...(form.builtupArea ? { builtupArea: Number(form.builtupArea) } : {}),
        ...(form.carpetArea ? { carpetArea: Number(form.carpetArea) } : {}),
        ...(form.bedrooms ? { bedrooms: Number(form.bedrooms) } : {}),
        ...(form.bathrooms ? { bathrooms: Number(form.bathrooms) } : {}),
        ...(form.balconies ? { balconies: Number(form.balconies) } : {}),
        ...(form.parking ? { parking: Number(form.parking) } : {}),
        ...(form.parkingType ? { parkingType: form.parkingType } : {}),
        ...(form.floors ? { floors: Number(form.floors) } : {}),
        ...(form.floorNumber ? { floorNumber: Number(form.floorNumber) } : {}),
        ...(form.furnishing ? { furnishing: form.furnishing } : {}),
        amenities: form.amenities,
        ...(form.possessionStatus ? { possessionStatus: form.possessionStatus } : {}),
        ...(form.possessionStatus === "under_construction" && form.possessionDate ? { possessionDate: form.possessionDate } : {}),
        ...(form.ageOfBuilding ? { ageOfBuilding: form.ageOfBuilding } : {}),
        ...(form.ownershipType ? { ownershipType: form.ownershipType } : {}),
        ...(form.maintenanceCharges ? { maintenanceCharges: Number(form.maintenanceCharges) } : {}),
        ...(form.flooringType ? { flooringType: form.flooringType } : {}),
        ...(form.facingDirection ? { facingDirection: form.facingDirection } : {}),
        ...(form.powerBackup ? { powerBackup: form.powerBackup } : {}),
        gatedSecurity: form.gatedSecurity,
        images: form.images,
        ...(form.brochureUrl ? { brochureUrl: form.brochureUrl } : {}),
        ...(form.amenitiesPdfUrl ? { amenitiesPdfUrl: form.amenitiesPdfUrl } : {}),
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        ...(form.yearBuilt ? { yearBuilt: Number(form.yearBuilt) } : {}),
      };
      const res = await agentApi.post("/api/properties", payload);
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.message ?? "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }
      const created = await res.json();
      // Save to localStorage
      const submissions = JSON.parse(localStorage.getItem("agentSubmissions") ?? "[]");
      submissions.push({
        id: created._id ?? created.id ?? Date.now().toString(),
        title: form.title,
        city: form.city,
        type: form.type,
        transactionType: form.transactionType,
        price: Number(form.price),
        status: "pending",
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem("agentSubmissions", JSON.stringify(submissions));
      toast.success("Property submitted for review!");
      router.push("/agent/dashboard");
    } catch {
      toast.error("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Agent Portal</p>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Submit Property</h1>
      </div>

      {/* Step indicator */}
      <div className="bg-white rounded-[24px] border border-neutral-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-5">
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    i < step
                      ? "bg-emerald-500 text-white"
                      : i === step
                      ? "bg-neutral-950 text-white"
                      : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {i < step ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wide hidden sm:block ${i === step ? "text-neutral-900" : "text-neutral-400"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px transition-all ${i < step ? "bg-emerald-300" : "bg-neutral-100"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-[32px] border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-5">
                <h2 className="text-base font-bold text-neutral-900 mb-6">Basics</h2>
                <div>
                  <Label>Property Title *</Label>
                  <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Spacious 3BHK in Whitefield" />
                </div>
                <div>
                  <Label>Society / Project Name</Label>
                  <Input value={form.societyName} onChange={(e) => set("societyName", e.target.value)} placeholder="e.g. Prestige Lakeside Habitat" />
                </div>
                <div>
                  <Label>Description *</Label>
                  <Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the property, its features, surroundings…" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label>Property Type *</Label>
                    <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
                      <option value="">Select type</option>
                      {PROPERTY_TYPES.map((t) => (
                        <option key={t} value={t}>{t.replace("_", " ")}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Transaction Type *</Label>
                    <Select value={form.transactionType} onChange={(e) => set("transactionType", e.target.value)}>
                      <option value="">Select</option>
                      {TRANSACTION_TYPES.map((t) => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-5">
                <h2 className="text-base font-bold text-neutral-900 mb-6">Location</h2>
                <div>
                  <Label>Address *</Label>
                  <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street address, building name" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label>City *</Label>
                    <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Bengaluru" />
                  </div>
                  <div>
                    <Label>State *</Label>
                    <Input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="e.g. Karnataka" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label>Pincode</Label>
                    <Input value={form.pincode} onChange={(e) => set("pincode", e.target.value)} placeholder="e.g. 560066" />
                  </div>
                  <div>
                    <Label>Landmark</Label>
                    <Input value={form.landmark} onChange={(e) => set("landmark", e.target.value)} placeholder="Near school, metro, etc." />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label>Latitude</Label>
                    <Input type="number" step="any" value={form.latitude} onChange={(e) => set("latitude", e.target.value)} placeholder="e.g. 12.9716" />
                  </div>
                  <div>
                    <Label>Longitude</Label>
                    <Input type="number" step="any" value={form.longitude} onChange={(e) => set("longitude", e.target.value)} placeholder="e.g. 77.5946" />
                  </div>
                </div>

                <div className="border-t border-neutral-50 pt-5 space-y-4">
                  <Label>Nearby Landmarks</Label>
                  {form.nearbyLandmarks.length > 0 && (
                    <div className="space-y-2">
                      {form.nearbyLandmarks.map((lm, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-2.5">
                          <div className="text-sm text-neutral-700">
                            <span className="font-bold">{lm.name}</span>
                            <span className="text-neutral-400"> · {lm.category}{lm.distance ? ` · ${lm.distance}` : ""}</span>
                          </div>
                          <button type="button" onClick={() => removeLandmark(i)} className="text-neutral-400 hover:text-neutral-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <Input className="sm:col-span-2" value={newLandmark.name} onChange={(e) => setNewLandmark((n) => ({ ...n, name: e.target.value }))} placeholder="Landmark name" />
                    <Select value={newLandmark.category} onChange={(e) => setNewLandmark((n) => ({ ...n, category: e.target.value as LandmarkCategory }))}>
                      <option value="">Category</option>
                      {LANDMARK_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </Select>
                    <Input value={newLandmark.distance} onChange={(e) => setNewLandmark((n) => ({ ...n, distance: e.target.value }))} placeholder="Distance (e.g. 1.2 km)" />
                  </div>
                  <button
                    type="button"
                    onClick={addLandmark}
                    className="px-4 py-2 border border-neutral-200 text-neutral-700 text-xs font-bold rounded-full hover:border-neutral-300 transition-colors"
                  >
                    + Add Landmark
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-5">
                <h2 className="text-base font-bold text-neutral-900 mb-6">Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label>Price (₹) *</Label>
                    <Input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. 4500000" />
                  </div>
                  <div>
                    <Label>Size (sq ft) *</Label>
                    <Input type="number" min="0" value={form.size} onChange={(e) => set("size", e.target.value)} placeholder="e.g. 1200" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="negotiable"
                    checked={form.priceNegotiable}
                    onChange={(e) => set("priceNegotiable", e.target.checked)}
                    className="w-4 h-4 accent-neutral-950"
                  />
                  <label htmlFor="negotiable" className="text-sm font-medium text-neutral-700">Price is negotiable</label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label>Built-up Area (sq ft)</Label>
                    <Input type="number" min="0" value={form.builtupArea} onChange={(e) => set("builtupArea", e.target.value)} placeholder="e.g. 1350" />
                  </div>
                  <div>
                    <Label>Carpet Area (sq ft)</Label>
                    <Input type="number" min="0" value={form.carpetArea} onChange={(e) => set("carpetArea", e.target.value)} placeholder="e.g. 1100" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  <div>
                    <Label>Bedrooms</Label>
                    <Input type="number" min="0" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <Label>Bathrooms</Label>
                    <Input type="number" min="0" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <Label>Balconies</Label>
                    <Input type="number" min="0" value={form.balconies} onChange={(e) => set("balconies", e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <Label>Parking</Label>
                    <Input type="number" min="0" value={form.parking} onChange={(e) => set("parking", e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <Label>Parking Type</Label>
                    <Select value={form.parkingType} onChange={(e) => set("parkingType", e.target.value)}>
                      <option value="">Select</option>
                      {PARKING_TYPES.map((p) => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Total Floors</Label>
                    <Input type="number" min="0" value={form.floors} onChange={(e) => set("floors", e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <Label>Floor Number</Label>
                    <Input type="number" min="0" value={form.floorNumber} onChange={(e) => set("floorNumber", e.target.value)} placeholder="0" />
                  </div>
                </div>
                <div>
                  <Label>Furnishing</Label>
                  <Select value={form.furnishing} onChange={(e) => set("furnishing", e.target.value)}>
                    <option value="">Select furnishing</option>
                    {FURNISHING_OPTIONS.map((f) => (
                      <option key={f} value={f}>{f.replace(/_/g, " ")}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Amenities</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {AMENITIES.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAmenity(a)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          form.amenities.includes(a)
                            ? "bg-neutral-950 text-white border-neutral-950"
                            : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-neutral-50 pt-5 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label>Year Built</Label>
                      <Input type="number" min="1800" max="2100" value={form.yearBuilt} onChange={(e) => set("yearBuilt", e.target.value)} placeholder="e.g. 2021" />
                    </div>
                    <div>
                      <Label>Age of Building</Label>
                      <Select value={form.ageOfBuilding} onChange={(e) => set("ageOfBuilding", e.target.value)}>
                        <option value="">Select</option>
                        {AGE_OF_BUILDING_OPTIONS.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label>Possession Status</Label>
                      <Select value={form.possessionStatus} onChange={(e) => set("possessionStatus", e.target.value)}>
                        <option value="">Select</option>
                        {POSSESSION_STATUSES.map((p) => (
                          <option key={p} value={p}>{p.replace(/_/g, " ")}</option>
                        ))}
                      </Select>
                    </div>
                    {form.possessionStatus === "under_construction" && (
                      <div>
                        <Label>Possession Date</Label>
                        <Input type="date" value={form.possessionDate} onChange={(e) => set("possessionDate", e.target.value)} />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label>Ownership Type</Label>
                      <Select value={form.ownershipType} onChange={(e) => set("ownershipType", e.target.value)}>
                        <option value="">Select</option>
                        {OWNERSHIP_TYPES.map((o) => (
                          <option key={o} value={o}>{o.replace(/_/g, " ")}</option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label>Maintenance Charges (₹/sq.ft/month)</Label>
                      <Input type="number" min="0" value={form.maintenanceCharges} onChange={(e) => set("maintenanceCharges", e.target.value)} placeholder="e.g. 3.5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label>Flooring Type</Label>
                      <Input value={form.flooringType} onChange={(e) => set("flooringType", e.target.value)} placeholder="e.g. Vitrified Tiles" />
                    </div>
                    <div>
                      <Label>Facing Direction</Label>
                      <Select value={form.facingDirection} onChange={(e) => set("facingDirection", e.target.value)}>
                        <option value="">Select</option>
                        {FACING_DIRECTIONS.map((d) => (
                          <option key={d} value={d}>{d.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
                    <div>
                      <Label>Power Backup</Label>
                      <Select value={form.powerBackup} onChange={(e) => set("powerBackup", e.target.value)}>
                        <option value="">Select</option>
                        {POWER_BACKUP_OPTIONS.map((p) => (
                          <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex items-center gap-3 pb-3.5">
                      <input
                        type="checkbox"
                        id="gatedSecurity"
                        checked={form.gatedSecurity}
                        onChange={(e) => set("gatedSecurity", e.target.checked)}
                        className="w-4 h-4 accent-neutral-950"
                      />
                      <label htmlFor="gatedSecurity" className="text-sm font-medium text-neutral-700">Gated security</label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-5">
                <h2 className="text-base font-bold text-neutral-900 mb-6">Media & Contact</h2>
                {/* Image Upload */}
                <div>
                  <Label>Property Images</Label>
                  <div
                    className="border-2 border-dashed border-neutral-200 rounded-2xl p-8 text-center hover:border-neutral-300 transition-colors cursor-pointer"
                    onClick={() => fileRef.current?.click()}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {uploading ? (
                      <div className="space-y-3">
                        <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto" />
                        <p className="text-xs font-medium text-neutral-500">Uploading… {uploadProgress}%</p>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-neutral-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm font-bold text-neutral-700">Click to upload images</p>
                        <p className="text-xs text-neutral-400 mt-1">JPG, PNG — auto-compressed to 1920px, 82% quality</p>
                      </>
                    )}
                  </div>
                  {form.images.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      {form.images.map((url, i) => (
                        <div key={i} className="relative group w-20 h-20 rounded-2xl overflow-hidden border border-neutral-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`upload-${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Documents */}
                <div className="border-t border-neutral-50 pt-5 space-y-5">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Documents</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label>Brochure (PDF)</Label>
                      <input
                        ref={brochureRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleBrochureUpload}
                        className="hidden"
                        id="brochure-upload"
                      />
                      <div
                        className="border-2 border-dashed border-neutral-200 rounded-2xl p-4 text-center hover:border-neutral-300 transition-colors cursor-pointer"
                        onClick={() => brochureRef.current?.click()}
                      >
                        {brochureUploading ? (
                          <p className="text-xs font-medium text-neutral-500">Uploading…</p>
                        ) : form.brochureUrl ? (
                          <p className="text-xs font-bold text-emerald-600">Brochure uploaded ✓</p>
                        ) : (
                          <p className="text-xs font-bold text-neutral-700">Click to upload brochure</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Amenities PDF</Label>
                      <input
                        ref={amenitiesPdfRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleAmenitiesPdfUpload}
                        className="hidden"
                        id="amenities-pdf-upload"
                      />
                      <div
                        className="border-2 border-dashed border-neutral-200 rounded-2xl p-4 text-center hover:border-neutral-300 transition-colors cursor-pointer"
                        onClick={() => amenitiesPdfRef.current?.click()}
                      >
                        {amenitiesPdfUploading ? (
                          <p className="text-xs font-medium text-neutral-500">Uploading…</p>
                        ) : form.amenitiesPdfUrl ? (
                          <p className="text-xs font-bold text-emerald-600">Amenities PDF uploaded ✓</p>
                        ) : (
                          <p className="text-xs font-bold text-neutral-700">Click to upload amenities PDF</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="border-t border-neutral-50 pt-5 space-y-5">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Contact Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label>Contact Name *</Label>
                      <Input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Your name" />
                    </div>
                    <div>
                      <Label>Contact Phone *</Label>
                      <Input type="tel" value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} placeholder="10-digit number" />
                    </div>
                  </div>
                  <div>
                    <Label>Contact Email *</Label>
                    <Input type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="email@example.com" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-50">
            <button
              type="button"
              onClick={prev}
              disabled={step === 0}
              className="px-5 py-2.5 border border-neutral-200 text-neutral-700 text-xs font-bold rounded-full hover:border-neutral-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Back
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={next}
                className="px-6 py-2.5 bg-neutral-950 text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting || uploading}
                className="px-6 py-2.5 bg-neutral-950 text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit for Review"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
}
