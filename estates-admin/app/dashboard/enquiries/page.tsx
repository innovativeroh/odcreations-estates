"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { api } from "@/lib/api";
import { formatDate, truncate } from "@/lib/format";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  property: { _id: string; title: string; city: string };
  status: "new" | "contacted" | "closed";
  createdAt: string;
}

const STATUSES: Enquiry["status"][] = ["new", "contacted", "closed"];

const statusColor: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
  contacted: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
  closed: "bg-neutral-500/10 text-neutral-500 dark:text-neutral-450 border-neutral-500/25",
};

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Enquiry[]>("/api/enquiries");
      setEnquiries(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this enquiry? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await api.delete(`/api/enquiries/${id}`);
      setEnquiries((prev) => prev.filter((e) => e._id !== id));
      toast.success("Enquiry deleted");
    } catch (ex) { toast.error((ex as Error).message); }
    finally { setDeleting(null); }
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      await api.patch(`/api/enquiries/${id}/status`, { status });
      setEnquiries((prev) => prev.map((e) => (e._id === id ? { ...e, status: status as Enquiry["status"] } : e)));
      toast.success(`Marked as ${status}`);
    } catch (ex) {
      toast.error((ex as Error).message);
    } finally {
      setUpdating(null);
    }
  }

  const countBy = (s: string) => enquiries.filter((e) => e.status === s).length;

  const filtered = enquiries.filter((e) => {
    const matchStatus = !filterStatus || e.status === filterStatus;
    const matchSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.property?.title?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Status summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
            className={`bg-card-bg border p-4 text-left rounded-2xl transition-all duration-300 backdrop-blur-xl cursor-pointer hover:border-brand/20 ${
              filterStatus === s ? "border-brand shadow-[0_0_15px_rgba(255,90,54,0.03)] bg-white/5" : "border-card-border"
            }`}
          >
            <div className="text-xl font-bold text-txt-title tracking-tight">{countBy(s)}</div>
            <span className={`inline-flex mt-2 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${statusColor[s]}`}>
              {s}
            </span>
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
            placeholder="Search name, email, or property…"
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
              <option key={s} value={s} className="bg-card-bg text-txt-title capitalize">{s}</option>
            ))}
          </select>
          <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sub pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {filterStatus && (
          <button onClick={() => setFilterStatus("")} className="text-xs font-bold text-txt-muted hover:text-txt-body transition-colors cursor-pointer border-none bg-transparent">
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
                {["From", "Property", "Phone", "Message", "Status", "Date", "Action"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-txt-muted whitespace-nowrap">
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
                  <td colSpan={7} className="py-12 text-center text-xs text-txt-muted">No enquiries found.</td>
                </tr>
              )}
              {!loading && filtered.map((e) => (
                <Fragment key={e._id}>
                  <tr
                    className="dark-table-row border-b border-card-border/50 cursor-pointer"
                    onClick={() => setExpanded(expanded === e._id ? null : e._id)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-txt-title text-xs">{e.name}</div>
                      <div className="text-[10px] text-txt-muted font-semibold mt-0.5">{e.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-txt-body text-xs max-w-[170px] line-clamp-1">{e.property?.title}</div>
                      <div className="text-[10px] text-txt-muted font-semibold mt-0.5">{e.property?.city}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-txt-body font-semibold whitespace-nowrap">{e.phone}</td>
                    <td className="px-5 py-3.5 text-xs text-txt-muted max-w-[200px] truncate">
                      {truncate(e.message, 40)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${statusColor[e.status]}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[10px] text-txt-muted font-semibold whitespace-nowrap">{formatDate(e.createdAt)}</td>
                    <td className="px-5 py-3.5" onClick={(ev) => ev.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <div className="relative">
                          <select 
                            className="pl-3 pr-7 py-1 text-[9px] font-bold bg-input-bg border border-input-border rounded-lg outline-none focus:border-brand/40 text-txt-body appearance-none disabled:opacity-50 cursor-pointer" 
                            value={e.status} 
                            disabled={updating === e._id} 
                            onChange={(ev) => updateStatus(e._id, ev.target.value)}
                          >
                            {STATUSES.map((s) => <option key={s} value={s} className="bg-card-bg text-txt-title capitalize">{s}</option>)}
                          </select>
                          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-txt-sub pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                        <button 
                          onClick={() => handleDelete(e._id)} 
                          disabled={deleting === e._id} 
                          className="p-1.5 rounded-xl text-txt-sub hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all duration-300 disabled:opacity-40 cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {expanded === e._id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#0b0b0f]/5 dark:bg-[#0b0b0f]/20 border-b border-card-border/50"
                      >
                        <td colSpan={7} className="px-5 py-4">
                          <div className="space-y-1">
                            <span className="text-[8px] font-bold text-brand uppercase tracking-wider block">Message Content</span>
                            <p className="text-xs text-txt-body leading-relaxed max-w-4xl">{e.message}</p>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
