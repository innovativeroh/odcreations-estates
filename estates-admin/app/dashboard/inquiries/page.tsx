"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { formatINR, formatDate, truncate } from "@/lib/format";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Inquiry {
  _id: string;
  user: { name: string; email: string };
  property: { title: string; city: string; images: string[] };
  amount: number;
  message: string;
  status: string;
  createdAt: string;
}

const STATUSES = ["pending", "under_review", "approved", "rejected"];

const statusColor: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/25",
  under_review: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
  approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
  rejected: "bg-red-500/10 text-red-655 dark:text-red-400 border-red-500/25",
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Inquiry[]>("/api/inquiries");
      setInquiries(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      await api.patch(`/api/inquiries/${id}/status`, { status });
      setInquiries((prev) =>
        prev.map((inq) => (inq._id === id ? { ...inq, status } : inq))
      );
      toast.success(`Status updated to ${status.replace(/_/g, " ")}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUpdating(null);
    }
  }

  const filtered = inquiries.filter((inq) => {
    const matchStatus = !filterStatus || inq.status === filterStatus;
    const matchSearch =
      !search ||
      inq.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      inq.property?.title?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const countByStatus = (s: string) => inquiries.filter((i) => i.status === s).length;

  return (
    <div className="space-y-6">
      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
            className={`bg-card-bg border p-4 text-left rounded-2xl transition-all duration-300 backdrop-blur-xl cursor-pointer hover:border-brand/20 ${
              filterStatus === s ? "border-brand shadow-[0_0_15px_rgba(255,90,54,0.03)] bg-white/5" : "border-card-border"
            }`}
          >
            <div className="text-xl font-bold text-txt-title tracking-tight">{countByStatus(s)}</div>
            <div className={`inline-flex mt-2 px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${statusColor[s]}`}>
              {s.replace(/_/g, " ")}
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card-bg border border-card-border rounded-2xl p-4 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="flex-1 min-w-[240px] relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-input-bg border border-input-border rounded-xl outline-none focus:border-brand/40 text-txt-title placeholder-text-sub transition-all duration-350"
            placeholder="Search investor or property…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="pl-4 pr-10 py-2.5 text-xs bg-input-bg border border-input-border rounded-xl outline-none focus:border-brand/45 text-txt-body appearance-none min-w-[130px] cursor-pointer hover:bg-neutral-500/5 transition-all duration-300"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="" className="bg-card-bg text-txt-title">All Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-card-bg text-txt-title capitalize">{s.replace(/_/g, " ")}</option>
            ))}
          </select>
          <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sub pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {filterStatus && (
          <button
            onClick={() => setFilterStatus("")}
            className="text-xs font-bold text-txt-muted hover:text-txt-body transition-colors cursor-pointer border-none bg-transparent"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border">
                {["Investor", "Property", "Amount", "Message", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-txt-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <svg className="w-8 h-8 animate-spin text-brand mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-txt-muted">No inquiries found.</td>
                </tr>
              )}
              {!loading && filtered.map((inq) => (
                <optgroup key={inq._id} label="" className="contents">
                  <tr
                    className="dark-table-row border-b border-card-border/50 cursor-pointer"
                    onClick={() => setExpanded(expanded === inq._id ? null : inq._id)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-txt-title text-xs">{inq.user?.name}</div>
                      <div className="text-[10px] text-txt-muted font-semibold mt-0.5">{inq.user?.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-txt-body text-xs max-w-[170px] line-clamp-1">{inq.property?.title}</div>
                      <div className="text-[10px] text-txt-muted font-semibold mt-0.5">{inq.property?.city}</div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-txt-title text-xs whitespace-nowrap">{formatINR(inq.amount)}</td>
                    <td className="px-5 py-3.5 text-xs text-txt-muted max-w-[200px] truncate">
                      {truncate(inq.message, 40)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${statusColor[inq.status]}`}>
                        {inq.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[10px] text-txt-muted font-semibold whitespace-nowrap">{formatDate(inq.createdAt)}</td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <select
                          className="pl-3 pr-7 py-1 text-[9px] font-bold bg-input-bg border border-input-border rounded-lg outline-none focus:border-brand/40 text-txt-body appearance-none disabled:opacity-50 uppercase cursor-pointer"
                          value={inq.status}
                          disabled={updating === inq._id}
                          onChange={(e) => updateStatus(inq._id, e.target.value)}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-card-bg text-txt-title uppercase">{s.replace(/_/g, " ")}</option>
                          ))}
                        </select>
                        <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-txt-sub pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {expanded === inq._id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#0b0b0f]/5 dark:bg-[#0b0b0f]/20 border-b border-card-border/50"
                      >
                        <td colSpan={7} className="px-5 py-4">
                          <div className="space-y-1">
                            <span className="text-[8px] font-bold text-brand uppercase tracking-wider block">Inquiry Message</span>
                            <p className="text-xs text-txt-body leading-relaxed max-w-4xl">{inq.message}</p>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </optgroup>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
