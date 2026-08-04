"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatINR, formatDate } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";

interface FullProperty {
  _id: string;
  title: string;
  description: string;
  type: string;
  transactionType: string;
  price: number;
  priceNegotiable: boolean;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  landmark?: string;
  size: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  floors?: number;
  furnishing?: string;
  amenities: string[];
  images: string[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  approvalStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  submittedBy?: { name: string; email: string; agencyName?: string; role?: string };
  approvedAt?: string;
  yearBuilt?: number;
  featured: boolean;
  views: number;
  enquiryCount: number;
  createdAt: string;
}

const statusStyle: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400 ring-amber-500/20",
  approved: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/20",
  rejected: "bg-red-500/15 text-red-400 ring-red-500/20",
};

const txStyle: Record<string, string> = {
  sale: "bg-violet-500/15 text-violet-400 ring-violet-500/20",
  rent: "bg-cyan-500/15 text-cyan-400 ring-cyan-500/20",
  lease: "bg-orange-500/15 text-orange-400 ring-orange-500/20",
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between gap-6 py-3 border-b border-card-border/60 last:border-0">
      <span className="text-xs text-txt-muted font-medium flex-shrink-0 w-28">{label}</span>
      <span className="text-xs text-txt-title font-semibold text-right">{value}</span>
    </div>
  );
}

interface Props {
  propertyId: string;
  onClose: () => void;
}

export default function PropertyViewDrawer({ propertyId, onClose }: Props) {
  const [property, setProperty] = useState<FullProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    setImgIndex(0);
    setProperty(null);
    api.get<FullProperty>(`/api/properties/${propertyId}`)
      .then(setProperty)
      .finally(() => setLoading(false));
  }, [propertyId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="relative w-full max-w-xl h-full bg-card-bg flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Loading */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <svg className="w-7 h-7 animate-spin text-brand" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {!loading && !property && (
          <div className="flex-1 flex items-center justify-center text-xs text-txt-muted">Failed to load property.</div>
        )}

        {!loading && property && (
          <div className="flex-1 overflow-y-auto">

            {/* ── Hero ── */}
            <div className="relative h-64 bg-neutral-900 flex-shrink-0">
              {property.images[imgIndex] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={property.images[imgIndex]}
                  alt=""
                  className="w-full h-full object-cover opacity-90"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14" />
                  </svg>
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Status badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ring-1 ${statusStyle[property.approvalStatus]}`}>
                  {property.approvalStatus}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ring-1 ${txStyle[property.transactionType] ?? ""}`}>
                  {property.transactionType}
                </span>
                {property.featured && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-brand/20 text-brand ring-1 ring-brand/30">
                    Featured
                  </span>
                )}
              </div>

              {/* Price + title overlay */}
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
                <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">
                  {property.type.replace(/_/g, " ")} · {property.city}, {property.state}
                </div>
                <h2 className="text-white text-lg font-bold leading-snug line-clamp-2 mb-2">{property.title}</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-white text-2xl font-extrabold tracking-tight">{formatINR(property.price)}</span>
                  {property.priceNegotiable && <span className="text-white/50 text-xs font-medium">· Negotiable</span>}
                </div>
              </div>

              {/* Thumbnail strip */}
              {property.images.length > 1 && (
                <div className="absolute bottom-0 right-4 flex gap-1.5 pb-4">
                  {property.images.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`w-10 h-8 rounded-lg overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${i === imgIndex ? "border-white" : "border-white/30 opacity-50 hover:opacity-80"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Body ── */}
            <div className="px-6 py-6 space-y-7">

              {/* Quick stats strip */}
              <div className="flex items-center gap-5">
                {[
                  { icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4", label: `${property.size.toLocaleString("en-IN")} sq ft` },
                  ...(property.bedrooms > 0 ? [{ icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: `${property.bedrooms} BHK` }] : []),
                  ...(property.bathrooms > 0 ? [{ icon: "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m0 0h2a2 2 0 012 2v10", label: `${property.bathrooms} Bath` }] : []),
                  ...(property.parking > 0 ? [{ icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", label: `${property.parking} Park` }] : []),
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-1.5 text-txt-body">
                    <svg className="w-4 h-4 text-txt-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                    </svg>
                    <span className="text-xs font-semibold whitespace-nowrap">{s.label}</span>
                  </div>
                ))}
                <div className="ml-auto flex items-center gap-3 text-[10px] text-txt-muted font-medium">
                  <span>{property.views} views</span>
                  <span className="w-px h-3 bg-card-border" />
                  <span>{property.enquiryCount} enquiries</span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-card-border" />

              {/* Description */}
              <div>
                <p className="text-sm text-txt-body leading-relaxed">{property.description}</p>
              </div>

              <div className="h-px bg-card-border" />

              {/* Location */}
              <div className="space-y-1.5">
                <h3 className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-3">Location</h3>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-txt-title">{property.address}</div>
                    <div className="text-xs text-txt-muted font-medium mt-0.5">
                      {[property.city, property.state, property.pincode].filter(Boolean).join(", ")}
                    </div>
                    {property.landmark && (
                      <div className="text-xs text-txt-muted mt-0.5">Near {property.landmark}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-px bg-card-border" />

              {/* Property Details */}
              <div>
                <h3 className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-1">Property Details</h3>
                <Row label="Property Type" value={property.type.replace(/_/g, " ")} />
                <Row label="Transaction" value={property.transactionType} />
                <Row label="Size" value={`${property.size.toLocaleString("en-IN")} sq ft`} />
                <Row label="Bedrooms" value={property.bedrooms > 0 ? `${property.bedrooms} BHK` : null} />
                <Row label="Bathrooms" value={property.bathrooms > 0 ? property.bathrooms : null} />
                <Row label="Parking Spots" value={property.parking > 0 ? property.parking : null} />
                <Row label="Floors" value={property.floors} />
                <Row label="Furnishing" value={property.furnishing?.replace(/_/g, " ")} />
                <Row label="Year Built" value={property.yearBuilt} />
              </div>

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <>
                  <div className="h-px bg-card-border" />
                  <div>
                    <h3 className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((a) => (
                        <span
                          key={a}
                          className="px-3 py-1 rounded-full bg-brand/8 text-txt-body text-[11px] font-semibold capitalize border border-brand/10"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="h-px bg-card-border" />

              {/* Contact */}
              <div>
                <h3 className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-3">Contact</h3>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-brand/10 border border-brand/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-brand">{initials(property.contactName)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-txt-title">{property.contactName}</div>
                    <div className="text-xs text-txt-muted font-medium mt-0.5">{property.contactPhone}</div>
                    <div className="text-xs text-txt-muted font-medium">{property.contactEmail}</div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-card-border" />

              {/* Submission */}
              <div>
                <h3 className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-1">Submission</h3>
                <Row
                  label="Submitted by"
                  value={
                    <span>
                      {property.submittedBy?.name}
                      {property.submittedBy?.agencyName && (
                        <span className="text-txt-muted font-medium"> · {property.submittedBy.agencyName}</span>
                      )}
                    </span>
                  }
                />
                <Row label="Email" value={property.submittedBy?.email} />
                <Row label="Submitted on" value={formatDate(property.createdAt)} />
                {property.approvedAt && <Row label="Approved on" value={formatDate(property.approvedAt)} />}
              </div>

              {/* Rejection reason */}
              {property.rejectionReason && (
                <div className="rounded-2xl border border-red-500/15 bg-red-500/5 px-5 py-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Rejection Reason</span>
                  </div>
                  <p className="text-xs text-red-300/80 leading-relaxed">{property.rejectionReason}</p>
                </div>
              )}

              {/* Bottom padding */}
              <div className="h-4" />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
