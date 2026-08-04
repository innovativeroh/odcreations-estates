"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { formatINR, formatDate } from "@/lib/format";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import PropertyViewDrawer from "@/components/PropertyViewDrawer";

interface Property {
  _id: string;
  title: string;
  description: string;
  type: string;
  transactionType: string;
  price: number;
  address: string;
  city: string;
  state: string;
  size: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  approvalStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  submittedBy: { _id: string; name: string; email: string; agencyName?: string; role: string };
  createdAt: string;
}

export default function ApprovalsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [viewId, setViewId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ properties: Property[] }>(
        "/api/properties/admin/all?approvalStatus=pending&limit=50"
      );
      setProperties(data.properties);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(id: string) {
    setActing(id);
    try {
      await api.patch(`/api/properties/${id}/approve`, {});
      setProperties((prev) => prev.filter((p) => p._id !== id));
      toast.success("Property approved — now live");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setActing(null);
    }
  }

  async function handleReject() {
    if (!rejectModal) return;
    setActing(rejectModal.id);
    try {
      await api.patch(`/api/properties/${rejectModal.id}/reject`, { reason: rejectReason || undefined });
      setProperties((prev) => prev.filter((p) => p._id !== rejectModal.id));
      toast.success("Property rejected");
      setRejectModal(null);
      setRejectReason("");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Description header */}
      <div className="text-xs text-txt-muted font-bold">
        {loading ? "Syncing queue..." : `${properties.length} listings awaiting validation`}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48">
          <svg className="w-8 h-8 animate-spin text-brand" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {!loading && properties.length === 0 && (
        <div className="bg-card-bg border border-card-border rounded-2xl p-16 text-center max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-txt-title">Review Queue Empty</h3>
          <p className="text-xs text-txt-muted mt-1 font-medium">All submitted properties have been processed.</p>
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {properties.map((p) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -8 }}
              transition={{ duration: 0.25 }}
              className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-sm hover:border-brand/20 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row gap-5 p-5">
                {/* Image */}
                <div className="w-full md:w-40 h-32 rounded-xl overflow-hidden bg-neutral-900/10 border border-card-border flex-shrink-0 relative">
                  {p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-txt-sub">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-txt-title tracking-wide leading-tight">{p.title}</h3>
                        <p className="text-xs text-txt-muted font-semibold mt-1">{p.address}, {p.city}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-base font-extrabold text-txt-title tracking-tight">{formatINR(p.price)}</div>
                        <div className="text-[9px] text-brand uppercase tracking-wider font-bold mt-1">{p.transactionType}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3.5">
                      {[
                        p.type,
                        `${p.size} sq ft`,
                        p.bedrooms > 0 ? `${p.bedrooms} BHK` : null,
                        p.bathrooms > 0 ? `${p.bathrooms} Bath` : null,
                      ].filter(Boolean).map((tag) => (
                        <span key={tag} className="px-2.5 py-0.5 rounded-full bg-input-bg border border-input-border text-txt-body text-[9px] font-bold capitalize">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-card-border/50 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[10px] text-txt-muted font-semibold">
                      Submitted by <span className="text-txt-body font-bold">{p.submittedBy?.name}</span>
                      {p.submittedBy?.agencyName && ` (${p.submittedBy.agencyName})`}
                      <span className="text-txt-sub"> · {formatDate(p.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {p.description && (
                <div className="px-5 pb-4">
                  <p className="text-xs text-txt-body leading-relaxed bg-input-bg border border-input-border p-3 rounded-xl line-clamp-2">{p.description}</p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="border-t border-card-border bg-[#0c0c10]/5 dark:bg-[#0c0c10]/20 px-5 py-3 flex items-center justify-between gap-3">
                <button
                  onClick={() => setViewId(p._id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-txt-body border border-card-border bg-input-bg hover:bg-neutral-500/10 hover:text-txt-title transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Full Details
                </button>
                <div className="flex items-center gap-3">
                <button
                  onClick={() => { setRejectModal({ id: p._id, title: p.title }); setRejectReason(""); }}
                  disabled={acting === p._id}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 transition-all cursor-pointer border-none"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(p._id)}
                  disabled={acting === p._id}
                  className="px-4.5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover active:bg-brand transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-brand/10 border-none"
                >
                  {acting === p._id ? (
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  Approve & Publish
                </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-card-bg border border-card-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
            >
              <div>
                <h3 className="text-sm font-bold text-txt-title">Reject Property</h3>
                <p className="text-xs text-txt-muted mt-0.5 truncate">{rejectModal.title}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Reason (optional)</label>
                <textarea
                  className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-3 text-xs text-txt-title placeholder-text-sub outline-none focus:border-brand/40 resize-none transition-all duration-300"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection..."
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button
                  onClick={() => setRejectModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-txt-body border border-card-border bg-input-bg hover:bg-neutral-500/5 transition-all cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={acting === rejectModal.id}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-650 transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-red-500/10 border-none"
                >
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewId && (
          <PropertyViewDrawer propertyId={viewId} onClose={() => setViewId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
