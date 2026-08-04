"use client";

import { use, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getToken, authFetch } from "@/lib/auth";
import PreFooterSEO from "@/components/sections/PreFooterSEO";
import {
  FiMapPin,
  FiMaximize2,
  FiArrowLeft,
  FiZap,
  FiCheckCircle,
  FiHeart,
  FiPhoneCall,
  FiMail,
  FiCheck,
  FiUser,
  FiDownload,
  FiFlag,
  FiPhone,
  FiNavigation,
  FiHome,
  FiLayers,
  FiCalendar,
  FiEye,
  FiGrid,
  FiShoppingBag,
  FiBriefcase,
  FiTruck,
  FiX,
} from "react-icons/fi";
import { BiBed, BiBath, BiCar } from "react-icons/bi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface NearbyLandmark {
  name: string;
  category: "transit" | "essentials" | "utility" | "shopping";
  distance?: string;
}

interface BackendProperty {
  _id: string;
  title: string;
  slug?: string;
  societyName?: string;
  description: string;
  type: string;
  transactionType: string;
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
  nearbyLandmarks?: NearbyLandmark[];

  // Features
  size: number;
  builtupArea?: number;
  carpetArea?: number;
  bedrooms: number;
  bathrooms: number;
  balconies?: number;
  parking?: number;
  parkingType?: string;
  floors?: number;
  floorNumber?: number;
  furnishing?: string;
  amenities: string[];
  possessionStatus?: string;
  possessionDate?: string;
  ageOfBuilding?: string;
  ownershipType?: string;
  maintenanceCharges?: number;
  flooringType?: string;
  facingDirection?: string;
  powerBackup?: string;
  gatedSecurity?: boolean;

  // Media
  images: string[];
  brochureUrl?: string;
  amenitiesPdfUrl?: string;

  // Contact
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;

  // Workflow
  approvalStatus?: string;
  submittedBy?: { name: string; email: string; agencyName?: string };
  submitterRole?: string;
  verificationStatus?: string;

  // Investment metrics
  yearBuilt?: number;
  returnRate?: string;
  rentalYield?: string;
  appreciation?: string;
  minInvestment?: number;

  // Metadata
  featured?: boolean;
  views?: number;
  shortlistCount?: number;
  contactCount?: number;
  reportCount?: number;
  enquiryCount?: number;
  createdAt: string;
  updatedAt?: string;
}

interface SimilarProperty {
  _id: string;
  title: string;
  images: string[];
  price: number;
  city: string;
}

const FALLBACK_RELATED_PROPERTIES: SimilarProperty[] = [
  {
    _id: "rel-1",
    title: "Sobha Neopolis 3BHK Luxury Residence",
    city: "Bengaluru",
    price: 24000000,
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"]
  },
  {
    _id: "rel-2",
    title: "Prestige City High-Rise Duplex",
    city: "Bengaluru",
    price: 36000000,
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"]
  },
  {
    _id: "rel-3",
    title: "Godrej Woodsville Modern Penthouse",
    city: "Bengaluru",
    price: 18000000,
    images: ["https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80"]
  }
];

function formatPrice(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2).replace(/\.?0+$/, "")} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

function titleCase(s?: string): string {
  if (!s) return "";
  return s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function estimateEMI(price: number): number {
  const annualRate = 0.085;
  const tenureYears = 20;
  const r = annualRate / 12;
  const n = tenureYears * 12;
  const factor = Math.pow(1 + r, n);
  const emi = (price * r * factor) / (factor - 1);
  return Math.round(emi);
}

const LANDMARK_CATEGORY_LABEL: Record<string, string> = {
  transit: "Transit",
  essentials: "Essentials",
  utility: "Utility",
  shopping: "Shopping",
};

function LandmarkIcon({ category }: { category: string }) {
  switch (category) {
    case "transit":
      return <FiTruck className="w-4 h-4" />;
    case "essentials":
      return <FiBriefcase className="w-4 h-4" />;
    case "utility":
      return <FiZap className="w-4 h-4" />;
    case "shopping":
      return <FiShoppingBag className="w-4 h-4" />;
    default:
      return <FiMapPin className="w-4 h-4" />;
  }
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [property, setProperty] = useState<BackendProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const isLoggedIn = !!getToken();

  const [contactRevealed, setContactRevealed] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  const [similar, setSimilar] = useState<SimilarProperty[]>([]);
  const [nearbyLocalities, setNearbyLocalities] = useState<string[]>([]);

  const checkSaved = useCallback(async () => {
    if (!isLoggedIn) return;
    const r = await authFetch("/api/users/saved");
    if (r.ok) {
      const list = await r.json();
      setSaved(Array.isArray(list) && list.some((p: { _id: string }) => p._id === id));
    }
  }, [id, isLoggedIn]);

  const toggleSave = async () => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    setSaveLoading(true);
    const method = saved ? "DELETE" : "POST";
    await authFetch(`/api/users/saved/${id}`, { method });
    setSaved((s) => !s);
    setSaveLoading(false);
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/properties/${id}`);
        if (res.ok) {
          const data: BackendProperty = await res.json();
          setProperty(data);
        } else {
          setProperty(null);
        }
      } catch {
        setProperty(null);
      } finally {
        setLoading(false);
      }
    }
    load();
    checkSaved();
  }, [id, checkSaved]);

  useEffect(() => {
    async function loadExtras() {
      try {
        const [simRes, localRes] = await Promise.all([
          fetch(`${API_BASE}/api/properties/${id}/similar`),
          fetch(`${API_BASE}/api/properties/${id}/nearby-localities`),
        ]);
        if (simRes.ok) {
          const data = await simRes.json();
          if (Array.isArray(data)) setSimilar(data);
        }
        if (localRes.ok) {
          const data = await localRes.json();
          if (Array.isArray(data?.localities)) setNearbyLocalities(data.localities);
        }
      } catch {
        // silently ignore — non-critical sections
      }
    }
    if (property) loadExtras();
  }, [id, property]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!property) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/properties/${id}/enquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed");
      setFormSubmitted(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => setFormSubmitted(false), 5000);
    } catch {
      setFormSubmitted(true);
      setTimeout(() => setFormSubmitted(false), 5000);
    } finally {
      setSubmitting(false);
    }
  }

  function handleScheduleVisit() {
    setFormData((f) => ({ ...f, message: "I'd like to schedule a site visit." }));
    const el = document.getElementById("enquiry-form-card");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleContactReveal() {
    if (contactRevealed) return;
    setContactLoading(true);
    try {
      await fetch(`${API_BASE}/api/properties/${id}/contact`, { method: "POST" });
    } catch {
      // non-blocking
    } finally {
      setContactRevealed(true);
      setContactLoading(false);
    }
  }

  async function handleReport() {
    setReportLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/properties/${id}/report`, { method: "POST" });
      if (res.ok) {
        toast.success("Thanks, we'll review this listing.");
      } else {
        toast.error("Could not submit the report. Please try again.");
      }
    } catch {
      toast.error("Could not submit the report. Please try again.");
    } finally {
      setReportLoading(false);
    }
  }

  function openLightbox(idx: number) {
    if (!property) return;
    setLightboxIndex(idx);
    setLightboxImage(property.images[idx]);
  }

  if (loading) {
    return (
      <div className="bg-[#F4F0FE] min-h-screen pt-28 pb-20 px-4 sm:px-6 md:px-12">
        <div className="max-w-[1380px] mx-auto space-y-8 animate-pulse">
          <div className="h-6 bg-white rounded-full w-48" />
          <div className="h-10 bg-white rounded-full w-2/3" />
          <div className="h-[400px] bg-white rounded-[32px] border border-purple-100/80" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#F4F0FE] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold text-[#111827] mb-4">Property Listing Not Found</h1>
        <Link href="/properties" className="px-6 py-2.5 rounded-full bg-[#18181B] text-white text-xs font-bold shadow-md">
          Return to Verified Directory
        </Link>
      </div>
    );
  }

  const isSale = property.transactionType === "sale";
  const emi = isSale ? estimateEMI(property.price) : null;
  const extraPhotosCount = Math.max(0, property.images.length - 3);

  const highlightChips: { icon: React.ReactNode; label: string }[] = [];
  if (property.bedrooms) highlightChips.push({ icon: <BiBed className="w-4 h-4" />, label: `${property.bedrooms} Bedrooms` });
  if (property.bathrooms) highlightChips.push({ icon: <BiBath className="w-4 h-4" />, label: `${property.bathrooms} Bathrooms` });
  if (property.balconies) highlightChips.push({ icon: <FiLayers className="w-4 h-4" />, label: `${property.balconies} Balconies` });
  if (property.createdAt) highlightChips.push({ icon: <FiCalendar className="w-4 h-4" />, label: `Posted on ${formatDate(property.createdAt)}` });
  if (property.possessionStatus === "ready_to_move") {
    highlightChips.push({ icon: <FiCheckCircle className="w-4 h-4" />, label: "Ready to Move" });
  } else if (property.possessionStatus === "under_construction") {
    highlightChips.push({
      icon: <FiHome className="w-4 h-4" />,
      label: property.possessionDate
        ? `Under Construction — possession by ${formatDate(property.possessionDate)}`
        : "Under Construction",
    });
  }
  if (property.type) highlightChips.push({ icon: <FiGrid className="w-4 h-4" />, label: titleCase(property.type) });
  if (property.parkingType) highlightChips.push({ icon: <BiCar className="w-4 h-4" />, label: `Parking: ${titleCase(property.parkingType)}` });
  if (property.powerBackup) highlightChips.push({ icon: <FiZap className="w-4 h-4" />, label: `Power Backup: ${titleCase(property.powerBackup)}` });

  const specRows: { label: string; value: string }[] = [];
  if (property.ageOfBuilding) specRows.push({ label: "Age of Building", value: property.ageOfBuilding });
  if (property.ownershipType) specRows.push({ label: "Ownership", value: titleCase(property.ownershipType) });
  if (property.maintenanceCharges) specRows.push({ label: "Maintenance", value: `₹${property.maintenanceCharges.toLocaleString("en-IN")} /sq.ft/month` });
  if (property.flooringType) specRows.push({ label: "Flooring", value: property.flooringType });
  if (property.builtupArea) specRows.push({ label: "Built-up Area", value: `${property.builtupArea.toLocaleString("en-IN")} sq.ft` });
  if (property.carpetArea) specRows.push({ label: "Carpet Area", value: `${property.carpetArea.toLocaleString("en-IN")} sq.ft` });
  if (property.furnishing) specRows.push({ label: "Furnishing", value: titleCase(property.furnishing) });
  if (property.facingDirection) specRows.push({ label: "Facing", value: titleCase(property.facingDirection) });
  if (property.floorNumber && property.floors) specRows.push({ label: "Floor", value: `${property.floorNumber} / ${property.floors}` });
  else if (property.floors) specRows.push({ label: "Total Floors", value: `${property.floors}` });
  if (property.parking) specRows.push({ label: "Parking", value: `${property.parking}${property.parkingType ? ` (${titleCase(property.parkingType)})` : ""}` });
  if (typeof property.gatedSecurity === "boolean") specRows.push({ label: "Gated Security", value: property.gatedSecurity ? "Yes" : "No" });

  const groupedLandmarks: Record<string, NearbyLandmark[]> = {};
  (property.nearbyLandmarks || []).forEach((lm) => {
    if (!groupedLandmarks[lm.category]) groupedLandmarks[lm.category] = [];
    groupedLandmarks[lm.category].push(lm);
  });
  const hasLandmarks = (property.nearbyLandmarks?.length ?? 0) > 0;
  const hasMap = typeof property.latitude === "number" && typeof property.longitude === "number";

  const submitterRoleLabel =
    property.submitterRole === "owner"
      ? "Owner"
      : property.submitterRole === "agent"
      ? "Agent"
      : property.submitterRole === "super_admin"
      ? "Builder/Admin"
      : undefined;

  return (
    <div className="bg-[#F4F0FE] min-h-screen pt-28 pb-24 px-4 sm:px-6 md:px-12 select-none text-left">
      <div className="max-w-[1380px] mx-auto w-full">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-200/80 text-xs font-extrabold text-[#111827] hover:bg-[#F7F5FC] transition-all shadow-xs"
          >
            <FiArrowLeft className="w-4 h-4 text-[#7C3AED]" />
            <span>Back to Listings</span>
          </Link>

          <div className="flex items-center gap-3">
            {property.brochureUrl && (
              <a
                href={property.brochureUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-200/80 text-xs font-extrabold text-[#111827] hover:bg-[#F7F5FC] transition-all shadow-xs"
              >
                <FiDownload className="w-4 h-4 text-[#7C3AED]" />
                <span>Brochure</span>
              </a>
            )}
            {property.amenitiesPdfUrl && (
              <a
                href={property.amenitiesPdfUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-200/80 text-xs font-extrabold text-[#111827] hover:bg-[#F7F5FC] transition-all shadow-xs"
              >
                <FiDownload className="w-4 h-4 text-[#7C3AED]" />
                <span>Amenities List</span>
              </a>
            )}
            <button
              onClick={toggleSave}
              disabled={saveLoading}
              className={`p-2.5 rounded-full border border-purple-200/80 transition-all cursor-pointer shadow-xs ${
                saved ? "bg-rose-500 text-white" : "bg-white text-[#111827] hover:bg-[#FAF8FF]"
              }`}
              title="Save Property"
            >
              <FiHeart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        {/* Title Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-2">
            <FiZap className="w-4 h-4" />
            <span>{titleCase(property.type)} • {isSale ? "For Sale" : property.transactionType === "rent" ? "For Rent" : "For Lease"}</span>
            {property.verificationStatus === "verified" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 normal-case tracking-normal">
                <FiCheckCircle className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] tracking-tight mb-2">
            {property.title}
          </h1>
          {property.societyName && (
            <p className="text-sm sm:text-base font-semibold text-[#64748B] mb-2">{property.societyName}</p>
          )}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#64748B] font-medium">
            <FiMapPin className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
            <span>
              {property.address}, {property.city}, {property.state}
            </span>
          </div>
        </div>

        {/* Gallery Image Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Main Hero Image */}
          <div
            onClick={() => openLightbox(0)}
            className="lg:col-span-8 relative h-[360px] sm:h-[450px] rounded-[32px] overflow-hidden border border-purple-100/80 bg-white cursor-pointer shadow-lg group"
          >
            {property.images[0] && (
              <Image
                src={property.images[0]}
                alt={property.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            )}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#18181B] text-white uppercase tracking-wider">
                {isSale ? "For Sale" : property.transactionType === "rent" ? "For Rent" : "For Lease"}
              </span>
              {property.approvalStatus === "approved" && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500 text-white uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </span>
              )}
            </div>
          </div>

          {/* Sub Gallery Column */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {property.images.slice(1, 3).map((img, idx) => (
              <div
                key={idx}
                onClick={() => openLightbox(idx + 1)}
                className="relative h-[170px] sm:h-[210px] rounded-[28px] overflow-hidden border border-purple-100/80 bg-white cursor-pointer shadow-md group"
              >
                <Image
                  src={img}
                  alt={`${property.title} photo ${idx + 2}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {idx === 1 && extraPhotosCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllPhotos(true);
                    }}
                    className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-sm font-extrabold"
                  >
                    View all {property.images.length} photos
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Activity Stats Row */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-12 text-xs text-[#64748B] font-semibold px-1">
          <div className="flex items-center gap-1.5">
            <FiEye className="w-4 h-4 text-[#7C3AED]" />
            <span>{(property.views ?? 0).toLocaleString("en-IN")} Views</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FiHeart className="w-4 h-4 text-[#7C3AED]" />
            <span>{(property.shortlistCount ?? 0).toLocaleString("en-IN")} Shortlisted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FiPhoneCall className="w-4 h-4 text-[#7C3AED]" />
            <span>{(property.contactCount ?? 0).toLocaleString("en-IN")} Enquiries</span>
          </div>
        </div>

        {/* Detail Specs & Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Description & Specs */}
          <div className="lg:col-span-8 space-y-8">
            {/* Price & Overview Bar */}
            <div className="bg-white border border-purple-100/80 rounded-[28px] p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider block mb-1">
                  Asking Price
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#111827] flex items-center gap-3">
                  {formatPrice(property.price)}
                  {property.priceNegotiable && (
                    <span className="text-xs font-bold text-[#64748B] bg-[#F4F0FE] border border-purple-100 px-2.5 py-1 rounded-full">
                      Negotiable
                    </span>
                  )}
                </div>
                {emi !== null && (
                  <p className="text-xs text-[#64748B] font-medium mt-2">
                    Estimated EMI: <span className="font-extrabold text-[#111827]">₹{emi.toLocaleString("en-IN")}/month</span>{" "}
                    <span className="text-[10px]">(indicative, @8.5% p.a. for 20 yrs)</span>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 text-xs text-[#64748B] font-semibold pt-4 sm:pt-0 border-t sm:border-t-0 border-purple-100 w-full sm:w-auto">
                <div className="flex items-center gap-1.5">
                  <FiMaximize2 className="w-4 h-4 text-[#7C3AED]" />
                  <span>{property.size.toLocaleString("en-IN")} sq.ft</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BiBed className="w-5 h-5 text-[#7C3AED]" />
                  <span>{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BiBath className="w-5 h-5 text-[#7C3AED]" />
                  <span>{property.bathrooms} Baths</span>
                </div>
              </div>
            </div>

            {/* Key Highlights Row */}
            {highlightChips.length > 0 && (
              <div className="bg-white border border-purple-100/80 rounded-[28px] p-6 sm:p-8 shadow-md">
                <h3 className="text-xl font-bold text-[#111827] mb-6">Key Highlights</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {highlightChips.map((chip, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#111827] bg-[#FAF8FF] border border-purple-100/80 rounded-2xl px-3.5 py-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                        {chip.icon}
                      </div>
                      <span>{chip.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overview Description */}
            <div className="bg-white border border-purple-100/80 rounded-[28px] p-6 sm:p-8 shadow-md">
              <h3 className="text-xl font-bold text-[#111827] mb-4">Property Description</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed font-normal">
                {property.description}
              </p>
            </div>

            {/* Specifications */}
            {specRows.length > 0 && (
              <div className="bg-white border border-purple-100/80 rounded-[28px] p-6 sm:p-8 shadow-md">
                <h3 className="text-xl font-bold text-[#111827] mb-6">Overview &amp; Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {specRows.map((row, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-purple-100/70 pb-3">
                      <span className="text-xs font-semibold text-[#64748B]">{row.label}</span>
                      <span className="text-xs font-extrabold text-[#111827] text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities Grid */}
            {property.amenities?.length > 0 && (
              <div className="bg-white border border-purple-100/80 rounded-[28px] p-6 sm:p-8 shadow-md">
                <h3 className="text-xl font-bold text-[#111827] mb-6">Key Amenities &amp; Highlights</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {property.amenities.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#111827]">
                      <div className="w-5 h-5 rounded-full bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                        <FiCheck className="w-3.5 h-3.5" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Neighbourhood: Map + Landmarks */}
            {(hasMap || hasLandmarks) && (
              <div className="bg-white border border-purple-100/80 rounded-[28px] p-6 sm:p-8 shadow-md">
                <h3 className="text-xl font-bold text-[#111827] mb-6">Neighbourhood &amp; Nearby</h3>

                {hasMap && (
                  <div className="w-full h-[280px] rounded-2xl overflow-hidden border border-purple-100/80 mb-6">
                    <iframe
                      title="Property location map"
                      className="w-full h-full border-0"
                      src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&output=embed`}
                      loading="lazy"
                    />
                  </div>
                )}

                {hasLandmarks && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {Object.entries(groupedLandmarks).map(([category, landmarks]) => (
                      <div key={category}>
                        <h4 className="text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-3">
                          {LANDMARK_CATEGORY_LABEL[category] || titleCase(category)}
                        </h4>
                        <div className="space-y-2.5">
                          {landmarks.map((lm, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-[#111827]">
                              <div className="w-7 h-7 rounded-full bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                                <LandmarkIcon category={category} />
                              </div>
                              <span>{lm.name}</span>
                              {lm.distance && <span className="text-[#64748B] font-medium">— {lm.distance}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Nearby Localities */}
            {nearbyLocalities.length > 0 && (
              <div className="bg-white border border-purple-100/80 rounded-[28px] p-6 sm:p-8 shadow-md">
                <h3 className="text-xl font-bold text-[#111827] mb-5">Explore Nearby Localities</h3>
                <div className="flex flex-wrap gap-2.5">
                  {nearbyLocalities.map((locality, idx) => (
                    <Link
                      key={idx}
                      href={`/properties?city=${encodeURIComponent(property.city)}&search=${encodeURIComponent(locality)}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FAF8FF] border border-purple-200/80 text-xs font-bold text-[#111827] hover:bg-[#EAE4FF] transition-all"
                    >
                      <FiNavigation className="w-3.5 h-3.5 text-[#7C3AED]" />
                      {locality}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Similar Properties */}
            {similar.length > 0 && (
              <div className="bg-white border border-purple-100/80 rounded-[28px] p-6 sm:p-8 shadow-md">
                <h3 className="text-xl font-bold text-[#111827] mb-6">Similar Properties</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {similar.map((sp) => (
                    <Link
                      key={sp._id}
                      href={`/properties/${sp._id}`}
                      className="group rounded-2xl border border-purple-100/80 overflow-hidden bg-[#FAF8FF] hover:shadow-md transition-all"
                    >
                      <div className="relative h-[140px] w-full bg-white">
                        {sp.images?.[0] && (
                          <Image
                            src={sp.images[0]}
                            alt={sp.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-bold text-[#111827] mb-1 line-clamp-1">{sp.title}</h4>
                        <p className="text-xs text-[#64748B] font-medium mb-1.5">{sp.city}</p>
                        <p className="text-sm font-extrabold text-[#7C3AED]">{formatPrice(sp.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Contact Advisor Card */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            <div className="bg-white border border-purple-100/80 rounded-[28px] p-6 sm:p-8 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center font-bold text-lg flex-shrink-0 border border-purple-200">
                  <FiUser className="w-6 h-6" />
                </div>
                <div className="flex flex-col text-left">
                  <h4 className="text-base font-bold text-[#111827]">
                    {property.submittedBy?.name || property.contactName || "Listing Advisor"}
                  </h4>
                  <span className="text-xs text-[#7C3AED] font-extrabold">
                    {property.submittedBy?.agencyName || "BookUrVisit Senior Advisor"}
                  </span>
                </div>
              </div>

              {submitterRoleLabel && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F0FE] border border-purple-100 text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-wider mb-5">
                  Listed by {submitterRoleLabel}
                </span>
              )}

              <div className="grid grid-cols-1 gap-3 mb-2">
                {!contactRevealed ? (
                  <button
                    onClick={handleContactReveal}
                    disabled={contactLoading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
                  >
                    <FiPhone className="w-4 h-4" />
                    {contactLoading ? "Loading..." : "Contact Owner / Broker"}
                  </button>
                ) : (
                  <div className="space-y-2.5">
                    {property.contactPhone && (
                      <a
                        href={`tel:${property.contactPhone}`}
                        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-extrabold shadow-md transition-all"
                      >
                        <FiPhoneCall className="w-4 h-4" />
                        {property.contactPhone}
                      </a>
                    )}
                    {property.contactEmail && (
                      <a
                        href={`mailto:${property.contactEmail}`}
                        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-white border border-purple-200/80 text-[#111827] text-xs font-extrabold shadow-xs transition-all"
                      >
                        <FiMail className="w-4 h-4 text-[#7C3AED]" />
                        {property.contactEmail}
                      </a>
                    )}
                  </div>
                )}

                <button
                  onClick={handleScheduleVisit}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
                >
                  <FiCalendar className="w-4 h-4" />
                  Schedule Visit
                </button>
              </div>

              <button
                onClick={handleReport}
                disabled={reportLoading}
                className="w-full inline-flex items-center justify-center gap-1.5 mt-4 text-[10px] font-bold text-[#94A3B8] hover:text-rose-500 transition-all cursor-pointer"
              >
                <FiFlag className="w-3.5 h-3.5" />
                {reportLoading ? "Reporting..." : "Report listing / flag incorrect info"}
              </button>
            </div>

            <div id="enquiry-form-card" className="bg-white border border-purple-100/80 rounded-[28px] p-6 sm:p-8 shadow-md">
              {formSubmitted ? (
                <div className="bg-[#FAF8FF] border border-purple-200 rounded-2xl p-6 text-center">
                  <FiCheckCircle className="w-8 h-8 text-[#7C3AED] mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-[#111827] mb-1">Enquiry Sent!</h4>
                  <p className="text-xs text-[#64748B]">Our advisor will call you back within 30 minutes.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h4 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-2">Book Site Visit / Inquiry</h4>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#FAF8FF] border border-purple-200/80 focus:border-[#7C3AED] rounded-xl px-4 py-2.5 text-xs font-bold text-[#111827] outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number (+91)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#FAF8FF] border border-purple-200/80 focus:border-[#7C3AED] rounded-xl px-4 py-2.5 text-xs font-bold text-[#111827] outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#FAF8FF] border border-purple-200/80 focus:border-[#7C3AED] rounded-xl px-4 py-2.5 text-xs font-bold text-[#111827] outline-none"
                  />
                  <textarea
                    rows={3}
                    placeholder="I am interested in this property. Please call me."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#FAF8FF] border border-purple-200/80 focus:border-[#7C3AED] rounded-xl px-4 py-2.5 text-xs font-bold text-[#111827] outline-none resize-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-full bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
                  >
                    {submitting ? "Submitting..." : "Schedule Site Visit Now"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ── RELATED / SIMILAR PROPERTIES SECTION ── */}
        <section className="mt-16 sm:mt-20 border-t border-purple-200/80 pt-12 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-1">
                <FiZap className="w-4 h-4" />
                <span>Recommendations</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
                Related Properties You May Like
              </h2>
            </div>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-[#7C3AED] hover:underline"
            >
              <span>Explore All Listings</span>
              <FiArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(similar.length > 0 ? similar : FALLBACK_RELATED_PROPERTIES).slice(0, 3).map((relProp, idx) => (
              <motion.div
                key={relProp._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <Link
                  href={`/properties/${relProp._id}`}
                  className="bg-white border border-purple-100/80 rounded-[28px] p-4 sm:p-5 shadow-md hover:shadow-2xl hover:border-purple-200 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group cursor-pointer text-left"
                >
                  <div>
                    <div className="relative w-full h-[200px] rounded-[22px] overflow-hidden mb-4 bg-neutral-100 border border-purple-100/60">
                      <Image
                        src={relProp.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"}
                        alt={relProp.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#18181B] text-white shadow-xs">
                          Verified
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-[#111827] group-hover:text-[#7C3AED] transition-colors line-clamp-1 mb-1">
                      {relProp.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-[#64748B] font-medium mb-3">
                      <FiMapPin className="w-3.5 h-3.5 text-[#7C3AED]" />
                      <span>{relProp.city}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-purple-100 flex items-center justify-between">
                    <span className="text-lg font-extrabold text-[#111827]">
                      {formatPrice(relProp.price)}
                    </span>
                    <span className="text-xs font-extrabold text-[#7C3AED] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      <span>Explore</span>
                      <FiArrowLeft className="w-3.5 h-3.5 rotate-180" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

      </div>

      {/* ── PROPERTY OPTIONS DIRECTORY (PRE-FOOTER SEO) ── */}
      <div className="-mx-4 sm:-mx-6 md:-mx-12 mt-16">
        <PreFooterSEO />
      </div>

      {/* Lightbox Image Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="relative max-w-5xl max-h-[85vh] w-full h-full">
              <Image src={lightboxImage} alt="Enlarged property photo" fill className="object-contain" />
            </div>
            {property.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full">
                {lightboxIndex + 1} / {property.images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Photos Modal */}
      <AnimatePresence>
        {showAllPhotos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center p-4 sm:p-10 overflow-y-auto"
          >
            <div className="bg-white rounded-[28px] max-w-5xl w-full p-6 sm:p-8 relative">
              <button
                onClick={() => setShowAllPhotos(false)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#F4F0FE] text-[#111827] flex items-center justify-center cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
              <h3 className="text-xl font-bold text-[#111827] mb-6">All Photos ({property.images.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {property.images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setShowAllPhotos(false);
                      openLightbox(idx);
                    }}
                    className="relative h-[150px] rounded-2xl overflow-hidden border border-purple-100/80 cursor-pointer group"
                  >
                    <Image src={img} alt={`${property.title} photo ${idx + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
