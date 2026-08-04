"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface UserRef { _id: string; name: string; email: string }

interface Team {
  _id: string;
  name: string;
  teamLeader: UserRef;
  telecallers: UserRef[];
  salesAgents: UserRef[];
  isDefault: boolean;
  createdAt: string;
}

interface RawUser { _id: string; name: string; email: string; role: string }

const emptyForm = { name: "", teamLeader: "", telecallers: [] as string[], salesAgents: [] as string[], isDefault: false };

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<RawUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const teamLeaders = users.filter((u) => u.role === "team_leader");
  const telecallers = users.filter((u) => u.role === "telecaller");
  const salesAgents = users.filter((u) => u.role === "sales_agent");

  function load() {
    Promise.all([api.get<Team[]>("/api/teams"), api.get<RawUser[]>("/api/users")])
      .then(([t, u]) => { setTeams(t); setUsers(u); })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setForm(emptyForm);
    setCreating(true);
  }

  function openEdit(t: Team) {
    setForm({
      name: t.name,
      teamLeader: t.teamLeader?._id ?? "",
      telecallers: t.telecallers.map((u) => u._id),
      salesAgents: t.salesAgents.map((u) => u._id),
      isDefault: t.isDefault,
    });
    setEditing(t._id);
  }

  async function handleSave() {
    if (!form.name || !form.teamLeader) { toast.error("Name and Team Leader are required"); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/api/teams/${editing}`, form);
        toast.success("Team updated");
      } else {
        await api.post("/api/teams", form);
        toast.success("Team created");
      }
      setEditing(null);
      setCreating(false);
      load();
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete team "${name}"? Members keep their accounts but lose their team assignment.`)) return;
    try {
      await api.delete(`/api/teams/${id}`);
      toast.success("Team deleted");
      load();
    } catch (e) { toast.error((e as Error).message); }
  }

  function toggleMember(field: "telecallers" | "salesAgents", id: string) {
    setForm((p) => ({
      ...p,
      [field]: p[field].includes(id) ? p[field].filter((x) => x !== id) : [...p[field], id],
    }));
  }

  const modalOpen = creating || !!editing;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-txt-muted font-semibold max-w-lg">
          Teams route leads through Team Leader &rarr; Telecaller &rarr; Sales Agent. Exactly one team should be marked default — it catches every new enquiry lead until the Team Leader routes it further.
        </p>
        <button onClick={openCreate} className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover transition-all cursor-pointer border-none shadow-md shadow-brand/10 whitespace-nowrap">
          + Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && <div className="col-span-2 py-20 text-center text-xs text-txt-muted">Loading teams…</div>}
        {!loading && teams.length === 0 && <div className="col-span-2 py-20 text-center text-xs text-txt-muted">No teams yet. Create one to start routing leads.</div>}
        {teams.map((t) => (
          <div key={t._id} className="bg-card-bg border border-card-border rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-txt-title">{t.name}</h3>
                  {t.isDefault && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-brand/10 text-brand border border-brand/20">Default</span>}
                </div>
                <p className="text-[10px] text-txt-muted font-semibold mt-1">Led by {t.teamLeader?.name ?? "Unassigned"}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-txt-sub hover:text-txt-title hover:bg-neutral-900/5 dark:hover:bg-white/[0.04] transition-all cursor-pointer border-none" title="Edit">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => handleDelete(t._id, t.name)} className="p-1.5 rounded-lg text-txt-sub hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer border-none" title="Delete">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[9px] font-bold text-txt-sub uppercase tracking-wider mb-1.5">Telecallers ({t.telecallers.length})</div>
                <div className="flex flex-wrap gap-1.5">
                  {t.telecallers.length === 0 && <span className="text-[10px] text-txt-muted">None</span>}
                  {t.telecallers.map((u) => <span key={u._id} className="px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold">{u.name}</span>)}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-bold text-txt-sub uppercase tracking-wider mb-1.5">Sales Agents ({t.salesAgents.length})</div>
                <div className="flex flex-wrap gap-1.5">
                  {t.salesAgents.length === 0 && <span className="text-[10px] text-txt-muted">None</span>}
                  {t.salesAgents.map((u) => <span key={u._id} className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">{u.name}</span>)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-card-bg border border-card-border rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-txt-title">{editing ? "Edit Team" : "Create Team"}</h3>
                <button onClick={() => { setEditing(null); setCreating(false); }} className="p-1.5 rounded-lg text-txt-sub hover:text-txt-title hover:bg-neutral-900/5 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border-none bg-transparent">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Team Name</label>
                  <input className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-xs text-txt-title placeholder-text-sub outline-none focus:border-brand/40 transition-all duration-300" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Team Leader</label>
                  <select className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-xs text-txt-body outline-none focus:border-brand/45 cursor-pointer transition-all duration-300" value={form.teamLeader} onChange={(e) => setForm((p) => ({ ...p, teamLeader: e.target.value }))}>
                    <option value="" className="bg-card-bg text-txt-title">Select a Team Leader</option>
                    {teamLeaders.map((u) => <option key={u._id} value={u._id} className="bg-card-bg text-txt-title">{u.name} ({u.email})</option>)}
                  </select>
                  {teamLeaders.length === 0 && <p className="text-[10px] text-txt-sub mt-1">No Team Leader accounts yet — create one from Users List first.</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Telecallers</label>
                  <div className="flex flex-wrap gap-2">
                    {telecallers.map((u) => (
                      <button key={u._id} type="button" onClick={() => toggleMember("telecallers", u._id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${form.telecallers.includes(u._id) ? "bg-cyan-500 text-white border-cyan-500" : "bg-input-bg text-txt-body border-input-border hover:bg-neutral-500/5"}`}>
                        {u.name}
                      </button>
                    ))}
                    {telecallers.length === 0 && <span className="text-[10px] text-txt-muted">No Telecaller accounts yet.</span>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Sales Agents</label>
                  <div className="flex flex-wrap gap-2">
                    {salesAgents.map((u) => (
                      <button key={u._id} type="button" onClick={() => toggleMember("salesAgents", u._id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${form.salesAgents.includes(u._id) ? "bg-emerald-500 text-white border-emerald-500" : "bg-input-bg text-txt-body border-input-border hover:bg-neutral-500/5"}`}>
                        {u.name}
                      </button>
                    ))}
                    {salesAgents.length === 0 && <span className="text-[10px] text-txt-muted">No Sales Agent accounts yet.</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button onClick={() => setForm((p) => ({ ...p, isDefault: !p.isDefault }))} className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer outline-none border-none ${form.isDefault ? "bg-emerald-500" : "bg-neutral-500/20 dark:bg-neutral-800"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${form.isDefault ? "left-4.5" : "left-0.5"}`} />
                  </button>
                  <span className="text-xs font-bold text-txt-muted">Default team (catches unrouted leads)</span>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-1">
                <button onClick={() => { setEditing(null); setCreating(false); }} className="px-4 py-2 rounded-xl text-xs font-bold text-txt-body border border-card-border bg-input-bg hover:bg-neutral-500/5 transition-all cursor-pointer border-none">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover active:bg-brand transition-all disabled:opacity-60 cursor-pointer flex items-center gap-2 shadow-md shadow-brand/10 border-none">
                  {saving && (
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  Save Team
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
