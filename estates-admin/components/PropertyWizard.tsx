"use client";

import { useState, useRef } from "react";
import { uploadToR2 } from "@/lib/api";
import toast from "react-hot-toast";

export interface NearbyLandmark {
  name: string;
  category: string;
  distance: string;
}

export interface PropertyData {
  // Step 1
  title: string;
  description: string;
  type: string;
  transactionType: string;
  societyName: string;
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
  parkingType: string;
  floors: string;
  floorNumber: string;
  furnishing: string;
  amenities: string[];
  yearBuilt: string;
  possessionStatus: string;
  possessionDate: string;
  ageOfBuilding: string;
  ownershipType: string;
  maintenanceCharges: string;
  flooringType: string;
  facingDirection: string;
  powerBackup: string;
  gatedSecurity: boolean;
  // Admin-only
  verificationStatus: string;
  featured: boolean;
  // Step 4
  images: string[];
  brochureUrl: string;
  amenitiesPdfUrl: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

export const emptyData = (): PropertyData => ({
  title: "", description: "", type: "apartment", transactionType: "sale",
  societyName: "",
  address: "", city: "", state: "", pincode: "", landmark: "",
  latitude: "", longitude: "", nearbyLandmarks: [],
  price: "", priceNegotiable: false, size: "", builtupArea: "", carpetArea: "",
  bedrooms: "0", bathrooms: "0", balconies: "0",
  parking: "0", parkingType: "", floors: "", floorNumber: "",
  furnishing: "", amenities: [],
  yearBuilt: "",
  possessionStatus: "", possessionDate: "", ageOfBuilding: "", ownershipType: "",
  maintenanceCharges: "", flooringType: "", facingDirection: "", powerBackup: "",
  gatedSecurity: false,
  verificationStatus: "unverified", featured: false,
  images: [], brochureUrl: "", amenitiesPdfUrl: "", contactName: "", contactPhone: "", contactEmail: "",
});

interface Props {
  initial?: PropertyData;
  onSubmit: (data: PropertyData) => Promise<void>;
  submitLabel?: string;
}

const inputCls = "w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-xs text-txt-title placeholder-text-sub outline-none focus:border-brand/40 transition-all duration-300";
const selectCls = "w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-xs text-txt-body outline-none focus:border-brand/45 cursor-pointer transition-all duration-300 appearance-none";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-bold text-txt-muted uppercase tracking-wider block mb-1.5">{children}</label>;
}

function ChevronDown() {
  return (
    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sub pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

const AMENITIES = [
  "Lift", "Parking", "Power Backup", "Security", "Gym", "Swimming Pool",
  "Club House", "Play Area", "Garden", "CCTV", "Intercom", "Gas Pipeline",
  "Rainwater Harvesting", "Solar Power", "Vastu Compliant",
  "Fire Safety", "Sewage Treatment", "Wi-Fi", "Kids Play Area",
  "Servant Room", "Visitor Parking",
];

const LANDMARK_CATEGORIES = [
  { value: "transit", label: "Transit" },
  { value: "essentials", label: "Essentials" },
  { value: "utility", label: "Utility" },
  { value: "shopping", label: "Shopping" },
];

async function compressImage(file: File, maxWidth = 1920, quality = 0.82): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          const compressed = blob
            ? new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" })
            : file;
          resolve(compressed);
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

const STEPS = ["Basics", "Location", "Details", "Media & Contact"];

export default function PropertyWizard({ initial, onSubmit, submitLabel = "Submit Property" }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<PropertyData>(initial ?? emptyData());
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docUploading, setDocUploading] = useState<"brochure" | "amenities" | null>(null);
  const [landmarkDraft, setLandmarkDraft] = useState<NearbyLandmark>({ name: "", category: "transit", distance: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const brochureRef = useRef<HTMLInputElement>(null);
  const amenitiesPdfRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof PropertyData>(k: K, v: PropertyData[K]) =>
    setData((prev) => ({ ...prev, [k]: v }));

  function toggleAmenity(a: string) {
    set("amenities", data.amenities.includes(a)
      ? data.amenities.filter((x) => x !== a)
      : [...data.amenities, a]
    );
  }

  function addLandmark() {
    if (!landmarkDraft.name.trim()) { toast.error("Landmark name is required"); return; }
    set("nearbyLandmarks", [...data.nearbyLandmarks, landmarkDraft]);
    setLandmarkDraft({ name: "", category: "transit", distance: "" });
  }

  function removeLandmark(i: number) {
    set("nearbyLandmarks", data.nearbyLandmarks.filter((_, idx) => idx !== i));
  }

  async function handleDocUpload(kind: "brochure" | "amenities", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocUploading(kind);
    try {
      const url = await uploadToR2(file, "documents");
      set(kind === "brochure" ? "brochureUrl" : "amenitiesPdfUrl", url);
      toast.success("Document uploaded");
    } catch {
      toast.error("Document upload failed");
    } finally {
      setDocUploading(null);
      e.target.value = "";
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const compressed = await compressImage(file);
          return uploadToR2(compressed, "properties");
        })
      );
      set("images", [...data.images, ...urls]);
      toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded`);
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function validateStep() {
    if (step === 0) {
      if (!data.title.trim()) { toast.error("Title is required"); return false; }
      if (!data.description.trim()) { toast.error("Description is required"); return false; }
    }
    if (step === 1) {
      if (!data.address.trim()) { toast.error("Address is required"); return false; }
      if (!data.city.trim()) { toast.error("City is required"); return false; }
      if (!data.state.trim()) { toast.error("State is required"); return false; }
    }
    if (step === 2) {
      if (!data.price || Number(data.price) <= 0) { toast.error("Price is required"); return false; }
      if (!data.size || Number(data.size) <= 0) { toast.error("Size is required"); return false; }
    }
    if (step === 3) {
      if (!data.contactName.trim()) { toast.error("Contact name is required"); return false; }
      if (!data.contactPhone.trim()) { toast.error("Contact phone is required"); return false; }
      if (!data.contactEmail.trim()) { toast.error("Contact email is required"); return false; }
    }
    return true;
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="bg-card-bg border border-card-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors duration-300 ${
                  i < step ? "bg-txt-title text-background" : i === step ? "bg-brand text-white shadow-[0_0_8px_var(--brand)]" : "bg-neutral-500/10 text-txt-sub"
                }`}>
                  {i < step ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </div>
                <span className={`text-xs font-semibold truncate transition-colors duration-300 ${i === step ? "text-txt-title" : "text-txt-sub"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 min-w-[12px] transition-colors duration-300 ${i < step ? "bg-txt-title" : "bg-card-border"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 0: Basics */}
        {step === 0 && (
          <div className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider">Basic Information</h3>

            <div className="space-y-1.5">
              <Label>Property Title</Label>
              <input className={inputCls} value={data.title} onChange={(e) => set("title", e.target.value)}
                placeholder="Spacious 3BHK in Whitefield" />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea className={`${inputCls} resize-none`} rows={4} value={data.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Description of the listing..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Property Type</Label>
                <div className="relative">
                  <select className={selectCls} value={data.type} onChange={(e) => set("type", e.target.value)}>
                    <option value="apartment" className="bg-card-bg text-txt-title">Apartment</option>
                    <option value="villa" className="bg-card-bg text-txt-title">Villa</option>
                    <option value="house" className="bg-card-bg text-txt-title">House</option>
                    <option value="commercial" className="bg-card-bg text-txt-title">Commercial</option>
                    <option value="plot" className="bg-card-bg text-txt-title">Plot</option>
                    <option value="pg_hostel" className="bg-card-bg text-txt-title">PG / Hostel</option>
                    <option value="penthouse" className="bg-card-bg text-txt-title">Penthouse</option>
                    <option value="studio" className="bg-card-bg text-txt-title">Studio</option>
                  </select>
                  <ChevronDown />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Transaction Type</Label>
                <div className="relative">
                  <select className={selectCls} value={data.transactionType} onChange={(e) => set("transactionType", e.target.value)}>
                    <option value="sale" className="bg-card-bg text-txt-title">For Sale</option>
                    <option value="rent" className="bg-card-bg text-txt-title">For Rent</option>
                    <option value="lease" className="bg-card-bg text-txt-title">For Lease</option>
                  </select>
                  <ChevronDown />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Society / Project Name (optional)</Label>
              <input className={inputCls} value={data.societyName} onChange={(e) => set("societyName", e.target.value)}
                placeholder="e.g. Prestige Lakeside Habitat" />
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider">Location</h3>

            <div className="space-y-1.5">
              <Label>Full Address</Label>
              <input className={inputCls} value={data.address} onChange={(e) => set("address", e.target.value)}
                placeholder="Full Address Details" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>City</Label>
                <input className={inputCls} value={data.city} onChange={(e) => set("city", e.target.value)} placeholder="City" />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <input className={inputCls} value={data.state} onChange={(e) => set("state", e.target.value)} placeholder="State" />
              </div>
              <div className="space-y-1.5">
                <Label>Pincode</Label>
                <input className={inputCls} value={data.pincode} onChange={(e) => set("pincode", e.target.value)} placeholder="Pincode" />
              </div>
              <div className="space-y-1.5">
                <Label>Landmark (optional)</Label>
                <input className={inputCls} value={data.landmark} onChange={(e) => set("landmark", e.target.value)} placeholder="Landmark" />
              </div>
              <div className="space-y-1.5">
                <Label>Latitude (optional)</Label>
                <input type="number" className={inputCls} value={data.latitude} onChange={(e) => set("latitude", e.target.value)} placeholder="e.g. 12.9716" step="any" />
              </div>
              <div className="space-y-1.5">
                <Label>Longitude (optional)</Label>
                <input type="number" className={inputCls} value={data.longitude} onChange={(e) => set("longitude", e.target.value)} placeholder="e.g. 77.5946" step="any" />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider">Nearby Landmarks</h3>

            {data.nearbyLandmarks.length > 0 && (
              <div className="space-y-2">
                {data.nearbyLandmarks.map((lm, i) => (
                  <div key={i} className="flex items-center gap-3 bg-input-bg border border-input-border rounded-xl px-4 py-2.5">
                    <span className="text-xs font-semibold text-txt-title flex-1 truncate">{lm.name}</span>
                    <span className="text-[10px] font-bold text-txt-sub uppercase tracking-wider">{lm.category}</span>
                    {lm.distance && <span className="text-[10px] text-txt-muted">{lm.distance}</span>}
                    <button
                      type="button"
                      onClick={() => removeLandmark(i)}
                      className="text-red-400 hover:text-red-500 cursor-pointer border-none bg-transparent p-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Name</Label>
                <input className={inputCls} value={landmarkDraft.name}
                  onChange={(e) => setLandmarkDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="e.g. Metro Station" />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <div className="relative">
                  <select className={selectCls} value={landmarkDraft.category}
                    onChange={(e) => setLandmarkDraft((d) => ({ ...d, category: e.target.value }))}>
                    {LANDMARK_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value} className="bg-card-bg text-txt-title">{c.label}</option>
                    ))}
                  </select>
                  <ChevronDown />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Distance (optional)</Label>
                <input className={inputCls} value={landmarkDraft.distance}
                  onChange={(e) => setLandmarkDraft((d) => ({ ...d, distance: e.target.value }))}
                  placeholder="e.g. 1.2 km" />
              </div>
            </div>
            <button
              type="button"
              onClick={addLandmark}
              className="px-4 py-2.5 bg-input-bg border border-input-border text-txt-title text-xs font-bold rounded-xl hover:border-brand/40 transition-all duration-300 cursor-pointer"
            >
              Add Landmark
            </button>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-5 shadow-sm">
              <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider">Pricing</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Price (₹)</Label>
                  <input type="number" className={inputCls} value={data.price}
                    onChange={(e) => set("price", e.target.value)} placeholder="Price" min="0" />
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => set("priceNegotiable", !data.priceNegotiable)}
                      className={`w-9 h-5 rounded-full transition-colors relative outline-none cursor-pointer border-none ${data.priceNegotiable ? "bg-brand" : "bg-neutral-500/20 dark:bg-neutral-850"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${data.priceNegotiable ? "left-4.5" : "left-0.5"}`} />
                    </button>
                    <span className="text-xs font-bold text-txt-muted">Price Negotiable</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-5 shadow-sm">
              <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider">Property Details</h3>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                <div className="space-y-1.5">
                  <Label>Size (sq ft)</Label>
                  <input type="number" className={inputCls} value={data.size}
                    onChange={(e) => set("size", e.target.value)} placeholder="Size" min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Built-up Area (sq ft)</Label>
                  <input type="number" className={inputCls} value={data.builtupArea}
                    onChange={(e) => set("builtupArea", e.target.value)} placeholder="Built-up Area" min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Carpet Area (sq ft)</Label>
                  <input type="number" className={inputCls} value={data.carpetArea}
                    onChange={(e) => set("carpetArea", e.target.value)} placeholder="Carpet Area" min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Bedrooms</Label>
                  <input type="number" className={inputCls} value={data.bedrooms}
                    onChange={(e) => set("bedrooms", e.target.value)} placeholder="Bedrooms" min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Bathrooms</Label>
                  <input type="number" className={inputCls} value={data.bathrooms}
                    onChange={(e) => set("bathrooms", e.target.value)} placeholder="Bathrooms" min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Balconies</Label>
                  <input type="number" className={inputCls} value={data.balconies}
                    onChange={(e) => set("balconies", e.target.value)} placeholder="Balconies" min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Parking Spots</Label>
                  <input type="number" className={inputCls} value={data.parking}
                    onChange={(e) => set("parking", e.target.value)} placeholder="Parking" min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Parking Type</Label>
                  <div className="relative">
                    <select className={selectCls} value={data.parkingType} onChange={(e) => set("parkingType", e.target.value)}>
                      <option value="" className="bg-card-bg text-txt-title">Not specified</option>
                      <option value="car" className="bg-card-bg text-txt-title">Car</option>
                      <option value="bike" className="bg-card-bg text-txt-title">Bike</option>
                      <option value="both" className="bg-card-bg text-txt-title">Both</option>
                      <option value="none" className="bg-card-bg text-txt-title">None</option>
                    </select>
                    <ChevronDown />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Total Floors</Label>
                  <input type="number" className={inputCls} value={data.floors}
                    onChange={(e) => set("floors", e.target.value)} placeholder="Total Floors" min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Floor Number</Label>
                  <input type="number" className={inputCls} value={data.floorNumber}
                    onChange={(e) => set("floorNumber", e.target.value)} placeholder="Floor Number" min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Furnishing</Label>
                  <div className="relative">
                    <select className={selectCls} value={data.furnishing} onChange={(e) => set("furnishing", e.target.value)}>
                      <option value="" className="bg-card-bg text-txt-title">Not specified</option>
                      <option value="unfurnished" className="bg-card-bg text-txt-title">Unfurnished</option>
                      <option value="semi_furnished" className="bg-card-bg text-txt-title">Semi Furnished</option>
                      <option value="fully_furnished" className="bg-card-bg text-txt-title">Fully Furnished</option>
                    </select>
                    <ChevronDown />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((a) => {
                  const selected = data.amenities.includes(a);
                  return (
                    <button
                      type="button"
                      key={a}
                      onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 border cursor-pointer ${
                        selected
                          ? "bg-brand/10 border-brand/20 text-brand"
                          : "bg-input-bg text-txt-body border-input-border hover:border-txt-sub hover:text-txt-title"
                      }`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-5 shadow-sm">
              <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Year Built</Label>
                  <input type="number" className={inputCls} value={data.yearBuilt}
                    onChange={(e) => set("yearBuilt", e.target.value)} placeholder="Year Built" min="1800" max="2100" />
                </div>
                <div className="space-y-1.5">
                  <Label>Possession Status</Label>
                  <div className="relative">
                    <select className={selectCls} value={data.possessionStatus} onChange={(e) => set("possessionStatus", e.target.value)}>
                      <option value="" className="bg-card-bg text-txt-title">Not specified</option>
                      <option value="ready_to_move" className="bg-card-bg text-txt-title">Ready to Move</option>
                      <option value="under_construction" className="bg-card-bg text-txt-title">Under Construction</option>
                    </select>
                    <ChevronDown />
                  </div>
                </div>
                {data.possessionStatus === "under_construction" && (
                  <div className="space-y-1.5">
                    <Label>Possession Date</Label>
                    <input type="date" className={inputCls} value={data.possessionDate}
                      onChange={(e) => set("possessionDate", e.target.value)} />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label>Age of Building</Label>
                  <div className="relative">
                    <select className={selectCls} value={data.ageOfBuilding} onChange={(e) => set("ageOfBuilding", e.target.value)}>
                      <option value="" className="bg-card-bg text-txt-title">Not specified</option>
                      <option value="New / Under Construction" className="bg-card-bg text-txt-title">New / Under Construction</option>
                      <option value="0-1 years" className="bg-card-bg text-txt-title">0-1 years</option>
                      <option value="1-5 years" className="bg-card-bg text-txt-title">1-5 years</option>
                      <option value="5-10 years" className="bg-card-bg text-txt-title">5-10 years</option>
                      <option value="10+ years" className="bg-card-bg text-txt-title">10+ years</option>
                    </select>
                    <ChevronDown />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Ownership Type</Label>
                  <div className="relative">
                    <select className={selectCls} value={data.ownershipType} onChange={(e) => set("ownershipType", e.target.value)}>
                      <option value="" className="bg-card-bg text-txt-title">Not specified</option>
                      <option value="freehold" className="bg-card-bg text-txt-title">Freehold</option>
                      <option value="leasehold" className="bg-card-bg text-txt-title">Leasehold</option>
                      <option value="self_owned" className="bg-card-bg text-txt-title">Self Owned</option>
                    </select>
                    <ChevronDown />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Maintenance Charges (₹/month)</Label>
                  <input type="number" className={inputCls} value={data.maintenanceCharges}
                    onChange={(e) => set("maintenanceCharges", e.target.value)} placeholder="Maintenance Charges" min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Flooring Type</Label>
                  <input className={inputCls} value={data.flooringType}
                    onChange={(e) => set("flooringType", e.target.value)} placeholder="e.g. Vitrified Tiles" />
                </div>
                <div className="space-y-1.5">
                  <Label>Facing Direction</Label>
                  <div className="relative">
                    <select className={selectCls} value={data.facingDirection} onChange={(e) => set("facingDirection", e.target.value)}>
                      <option value="" className="bg-card-bg text-txt-title">Not specified</option>
                      <option value="north" className="bg-card-bg text-txt-title">North</option>
                      <option value="south" className="bg-card-bg text-txt-title">South</option>
                      <option value="east" className="bg-card-bg text-txt-title">East</option>
                      <option value="west" className="bg-card-bg text-txt-title">West</option>
                      <option value="north_east" className="bg-card-bg text-txt-title">North East</option>
                      <option value="north_west" className="bg-card-bg text-txt-title">North West</option>
                      <option value="south_east" className="bg-card-bg text-txt-title">South East</option>
                      <option value="south_west" className="bg-card-bg text-txt-title">South West</option>
                    </select>
                    <ChevronDown />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Power Backup</Label>
                  <div className="relative">
                    <select className={selectCls} value={data.powerBackup} onChange={(e) => set("powerBackup", e.target.value)}>
                      <option value="" className="bg-card-bg text-txt-title">Not specified</option>
                      <option value="full" className="bg-card-bg text-txt-title">Full</option>
                      <option value="partial" className="bg-card-bg text-txt-title">Partial</option>
                      <option value="none" className="bg-card-bg text-txt-title">None</option>
                    </select>
                    <ChevronDown />
                  </div>
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => set("gatedSecurity", !data.gatedSecurity)}
                      className={`w-9 h-5 rounded-full transition-colors relative outline-none cursor-pointer border-none ${data.gatedSecurity ? "bg-brand" : "bg-neutral-500/20 dark:bg-neutral-850"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${data.gatedSecurity ? "left-4.5" : "left-0.5"}`} />
                    </button>
                    <span className="text-xs font-bold text-txt-muted">Gated Security</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-5 shadow-sm">
              <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider">Admin Controls</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Verification Status</Label>
                  <div className="relative">
                    <select className={selectCls} value={data.verificationStatus} onChange={(e) => set("verificationStatus", e.target.value)}>
                      <option value="unverified" className="bg-card-bg text-txt-title">Unverified</option>
                      <option value="verified" className="bg-card-bg text-txt-title">Verified</option>
                    </select>
                    <ChevronDown />
                  </div>
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => set("featured", !data.featured)}
                      className={`w-9 h-5 rounded-full transition-colors relative outline-none cursor-pointer border-none ${data.featured ? "bg-brand" : "bg-neutral-500/20 dark:bg-neutral-850"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${data.featured ? "left-4.5" : "left-0.5"}`} />
                    </button>
                    <span className="text-xs font-bold text-txt-muted">Featured on Homepage</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Media & Contact */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider">Images</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {data.images.map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-card-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => set("images", data.images.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400 cursor-pointer font-bold text-xs border-none"
                    >
                      Delete
                    </button>
                    {i === 0 && (
                      <span className="absolute top-2 left-2 bg-brand text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">COVER</span>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-input-border hover:border-brand/40 hover:bg-neutral-900/10 transition-all duration-300 flex flex-col items-center justify-center gap-1 text-txt-sub hover:text-brand cursor-pointer disabled:opacity-50"
                >
                  {uploading ? (
                    <svg className="w-6 h-6 animate-spin text-brand" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-[9px] font-bold uppercase tracking-wider">Add Photos</span>
                    </>
                  )}
                </button>
              </div>

              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </div>

            <div className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider">Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Brochure (PDF)</Label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => brochureRef.current?.click()}
                      disabled={docUploading === "brochure"}
                      className="px-4 py-2.5 bg-input-bg border border-input-border text-txt-title text-xs font-bold rounded-xl hover:border-brand/40 transition-all duration-300 cursor-pointer disabled:opacity-50"
                    >
                      {docUploading === "brochure" ? "Uploading…" : data.brochureUrl ? "Replace PDF" : "Upload PDF"}
                    </button>
                    {data.brochureUrl && (
                      <a href={data.brochureUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-brand uppercase tracking-wider truncate">View</a>
                    )}
                  </div>
                  <input ref={brochureRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleDocUpload("brochure", e)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Amenities Sheet (PDF)</Label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => amenitiesPdfRef.current?.click()}
                      disabled={docUploading === "amenities"}
                      className="px-4 py-2.5 bg-input-bg border border-input-border text-txt-title text-xs font-bold rounded-xl hover:border-brand/40 transition-all duration-300 cursor-pointer disabled:opacity-50"
                    >
                      {docUploading === "amenities" ? "Uploading…" : data.amenitiesPdfUrl ? "Replace PDF" : "Upload PDF"}
                    </button>
                    {data.amenitiesPdfUrl && (
                      <a href={data.amenitiesPdfUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-brand uppercase tracking-wider truncate">View</a>
                    )}
                  </div>
                  <input ref={amenitiesPdfRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleDocUpload("amenities", e)} />
                </div>
              </div>
            </div>

            <div className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider">Contact Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Contact Name</Label>
                  <input className={inputCls} value={data.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Contact Name" />
                </div>
                <div className="space-y-1.5">
                  <Label>Contact Phone</Label>
                  <input className={inputCls} value={data.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} placeholder="Phone" />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <Label>Contact Email</Label>
                  <input type="email" className={inputCls} value={data.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="Email" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={back}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-txt-body border border-card-border bg-input-bg hover:bg-neutral-500/5 transition-all duration-300 flex items-center gap-2 cursor-pointer border-none"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="px-5 py-2.5 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-hover active:bg-brand transition-all duration-300 flex items-center gap-2 shadow-md shadow-brand/10 cursor-pointer ml-auto border-none"
            >
              Next Step
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-hover active:bg-brand transition-all duration-300 disabled:opacity-60 flex items-center gap-2 shadow-md shadow-brand/10 cursor-pointer ml-auto border-none"
            >
              {submitting ? (
                <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {submitting ? "Submitting…" : submitLabel}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
