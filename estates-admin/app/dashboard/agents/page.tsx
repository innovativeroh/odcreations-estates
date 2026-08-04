"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  agencyName: string;
  licenseNumber?: string;
  isActive: boolean;
  createdAt: string;
}

interface CreateForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  agencyName: string;
  licenseNumber: string;
}

const empty = (): CreateForm => ({
  name: "", email: "", password: "", phone: "", agencyName: "", licenseNumber: "",
});

const inputCls = "w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-xs text-txt-title placeholder-text-sub outline-none focus:border-brand/40 transition-all duration-300";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateForm>(empty());
  const [submitting, setSubmitting] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Agent[]>("/api/agents");
      setAgents(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: keyof CreateForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const agent = await api.post<Agent>("/api/agents", form);
      setAgents((prev) => [agent, ...prev]);
      setForm(empty());
      setShowForm(false);
      toast.success("Agent created");
    } catch (ex) {
      toast.error((ex as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(id: string) {
    setActing(id);
    try {
      const { isActive } = await api.patch<{ id: string; isActive: boolean }>(`/api/agents/${id}/toggle`, {});
      setAgents((prev) => prev.map((a) => a._id === id ? { ...a, isActive } : a));
      toast.success(isActive ? "Agent activated" : "Agent deactivated");
    } catch (ex) {
      toast.error((ex as Error).message);
    } finally {
      setActing(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove agent "${name}"? This cannot be undone.`)) return;
    setActing(id);
    try {
      await api.delete(`/api/agents/${id}`);
      setAgents((prev) => prev.filter((a) => a._id !== id));
      toast.success("Agent removed");
    } catch (ex) {
      toast.error((ex as Error).message);
    } finally {
      setActing(null);
    }
  }

  const filtered = search
    ? agents.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.email.toLowerCase().includes(search.toLowerCase()) ||
          a.agencyName.toLowerCase().includes(search.toLowerCase())
      )
    : agents;

  const activeCount = agents.filter((a) => a.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xs text-txt-muted font-bold">
          {agents.length} partners · {activeCount} active
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-hover active:bg-brand transition-all duration-300 shadow-md shadow-brand/10 cursor-pointer border-none outline-none"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
          </svg>
          {showForm ? "Cancel" : "Add Agent"}
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -15 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -15 }}
            className="bg-card-bg border border-card-border rounded-2xl p-5 overflow-hidden shadow-sm"
          >
            <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider mb-4">New Agent Account</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Full Name</label>
                  <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full Name" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Email Address</label>
                  <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Email" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Password</label>
                  <input type="password" className={inputCls} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min 8 characters" required minLength={8} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Phone Number</label>
                  <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone" required minLength={10} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Agency Name</label>
                  <input className={inputCls} value={form.agencyName} onChange={(e) => set("agencyName", e.target.value)} placeholder="Agency Name" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">License Number</label>
                  <input className={inputCls} value={form.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value)} placeholder="License" />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-hover active:bg-brand transition-all duration-300 disabled:opacity-60 flex items-center gap-2 cursor-pointer shadow-md shadow-brand/10 border-none"
                >
                  {submitting && (
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  Create Account
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="bg-card-bg border border-card-border rounded-2xl p-4 shadow-sm">
        <div className="relative max-w-sm">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-input-bg border border-input-border rounded-xl outline-none focus:border-brand/40 text-txt-title placeholder-text-sub transition-all duration-350"
            placeholder="Search partners…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border">
                {["Agent", "Agency", "Phone", "License", "Status", "Joined", "Actions"].map((h) => (
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
                  <td colSpan={7} className="py-12 text-center text-xs text-txt-muted">
                    No agents found.
                  </td>
                </tr>
              )}
              {!loading && filtered.map((a) => (
                <tr key={a._id} className="dark-table-row border-b border-card-border/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-brand-light flex items-center justify-center flex-shrink-0">
                        <span className="text-brand text-[9px] font-bold">
                          {a.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-txt-title text-xs">{a.name}</div>
                        <div className="text-[10px] text-txt-muted font-semibold mt-0.5">{a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-txt-body font-bold">{a.agencyName}</td>
                  <td className="px-5 py-3.5 text-xs text-txt-muted font-semibold">{a.phone}</td>
                  <td className="px-5 py-3.5 text-xs text-txt-sub font-semibold">{a.licenseNumber ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleToggle(a._id)}
                      disabled={acting === a._id}
                      className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer disabled:opacity-40 outline-none border-none ${a.isActive ? "bg-emerald-500" : "bg-neutral-500/20 dark:bg-neutral-800"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${a.isActive ? "left-4.5" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-[10px] text-txt-muted font-semibold whitespace-nowrap">{formatDate(a.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleDelete(a._id, a.name)}
                      disabled={acting === a._id}
                      className="p-1.5 rounded-lg text-txt-sub hover:text-red-405 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all duration-300 disabled:opacity-40 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
