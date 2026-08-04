"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatINR, formatDate } from "@/lib/format";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import PropertyViewDrawer from "@/components/PropertyViewDrawer";

interface Property {
  _id: string;
  title: string;
  city: string;
  state: string;
  type: string;
  transactionType: string;
  approvalStatus: "pending" | "approved" | "rejected";
  price: number;
  size: number;
  bedrooms: number;
  images: string[];
  featured: boolean;
  submittedBy?: { name: string; email: string; agencyName?: string };
  createdAt: string;
}

const approvalColor: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/25",
  approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
  rejected: "bg-red-500/10 text-red-650 dark:text-red-400 border-red-500/25",
};

const txColor: Record<string, string> = {
  sale: "bg-purple-500/10 text-purple-650 dark:text-purple-400 border-purple-500/20",
  rent: "bg-cyan-500/10 text-cyan-650 dark:text-cyan-400 border-cyan-500/20",
  lease: "bg-orange-500/10 text-orange-650 dark:text-orange-450 border-orange-500/20",
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (filterStatus) params.set("approvalStatus", filterStatus);
      if (filterType) params.set("type", filterType);
      if (search) params.set("search", search);
      const data = await api.get<{ properties: Property[]; total: number }>(
        `/api/properties/admin/all?${params}`
      );
      setProperties(data.properties);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterType, search]);

  useEffect(() => { load(); }, [load]);

  async function toggleFeatured(p: Property) {
    try {
      await api.put(`/api/properties/${p._id}`, { featured: !p.featured });
      setProperties((prev) => prev.map((x) => (x._id === p._id ? { ...x, featured: !x.featured } : x)));
      toast.success(p.featured ? "Removed from featured" : "Marked as featured");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/api/properties/${id}`);
      setProperties((prev) => prev.filter((p) => p._id !== id));
      setTotal((t) => t - 1);
      toast.success("Property deleted");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDeleting(null);
    }
  }

  const pages = Math.ceil(total / 15);

  return (
    <div className="space-y-6">
      {/* Sub actions header */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-txt-muted font-bold">{total.toLocaleString()} listings total</div>
        <Link
          href="/dashboard/properties/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-hover active:bg-brand transition-all duration-300 shadow-md shadow-brand/10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Listing
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card-bg border border-card-border rounded-2xl p-4 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="flex-1 min-w-[240px] relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-input-bg border border-input-border rounded-xl outline-none focus:border-brand/40 text-txt-title placeholder-text-sub transition-all duration-350"
            placeholder="Search by title or city…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {[
          {
            value: filterStatus,
            set: (v: string) => { setFilterStatus(v); setPage(1); },
            options: [
              { value: "", label: "All Status" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ],
          },
          {
            value: filterType,
            set: (v: string) => { setFilterType(v); setPage(1); },
            options: [
              { value: "", label: "All Types" },
              { value: "apartment", label: "Apartment" },
              { value: "villa", label: "Villa" },
              { value: "house", label: "House" },
              { value: "commercial", label: "Commercial" },
              { value: "plot", label: "Plot" },
              { value: "pg_hostel", label: "PG / Hostel" },
            ],
          },
        ].map((filter, i) => (
          <div key={i} className="relative">
            <select
              className="pl-4 pr-10 py-2.5 text-xs bg-input-bg border border-input-border rounded-xl outline-none focus:border-brand/45 text-txt-body appearance-none min-w-[130px] cursor-pointer hover:bg-neutral-500/5 transition-all duration-300"
              value={filter.value}
              onChange={(e) => filter.set(e.target.value)}
            >
              {filter.options.map((o) => (
                <option key={o.value} value={o.value} className="bg-card-bg text-txt-title">{o.label}</option>
              ))}
            </select>
            <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sub pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border">
                {["Property", "Location", "Type", "For", "Status", "Price", "Featured", "Submitted by", "Added", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-txt-muted whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <svg className="w-8 h-8 animate-spin text-brand mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </td>
                </tr>
              )}
              {!loading && properties.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-xs text-txt-muted">No properties found.</td>
                </tr>
              )}
              {!loading && (
                <AnimatePresence>
                  {properties.map((p, i) => (
                    <motion.tr
                      key={p._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.2) }}
                      className="dark-table-row border-b border-card-border/50"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-neutral-900/10 border border-card-border flex-shrink-0 relative">
                            {p.images[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-txt-sub">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="font-bold text-txt-title text-xs leading-snug line-clamp-2 max-w-[140px]">{p.title}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-txt-body font-semibold whitespace-nowrap">{p.city}, {p.state}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border bg-input-bg text-txt-body border-input-border">
                          {p.type.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${txColor[p.transactionType] ?? ""}`}>
                          {p.transactionType}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${approvalColor[p.approvalStatus] ?? ""}`}>
                          {p.approvalStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-extrabold text-txt-title whitespace-nowrap">{formatINR(p.price)}</td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => toggleFeatured(p)}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer outline-none border-none ${p.featured ? "bg-brand" : "bg-neutral-500/20 dark:bg-neutral-800"}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${p.featured ? "left-4.5" : "left-0.5"}`} />
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-xs font-bold text-txt-body">{p.submittedBy?.name ?? "—"}</div>
                        {p.submittedBy?.agencyName && (
                          <div className="text-[10px] text-txt-muted font-semibold mt-0.5">{p.submittedBy.agencyName}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[10px] text-txt-muted font-semibold whitespace-nowrap">{formatDate(p.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewId(p._id)}
                            title="View full details"
                            className="p-1.5 rounded-lg text-txt-sub hover:text-brand hover:bg-brand/10 transition-all cursor-pointer border-none"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <Link
                            href={`/dashboard/properties/${p._id}`}
                            title="Edit property"
                            className="p-1.5 rounded-lg text-txt-sub hover:text-txt-title hover:bg-neutral-500/5 transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id, p.title)}
                            disabled={deleting === p._id}
                            className="p-1.5 rounded-lg text-txt-sub hover:text-red-500 hover:bg-red-500/10 border-none transition-all disabled:opacity-40 cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-5 py-3.5 border-t border-card-border flex items-center justify-between bg-card-bg">
            <span className="text-xs text-txt-muted font-semibold">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3.5 py-1.5 text-xs font-bold border border-card-border rounded-xl text-txt-body bg-input-bg hover:bg-neutral-500/5 disabled:opacity-30 transition-all cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3.5 py-1.5 text-xs font-bold border border-card-border rounded-xl text-txt-body bg-input-bg hover:bg-neutral-500/5 disabled:opacity-30 transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {viewId && (
          <PropertyViewDrawer propertyId={viewId} onClose={() => setViewId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
