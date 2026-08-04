"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatDate, initials } from "@/lib/format";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "super_admin" | "sub_admin" | "team_leader" | "telecaller" | "sales_agent" | "agent" | "owner" | "user";
  agencyName?: string;
  isActive?: boolean;
  teamId?: string;
  permissions?: string[];
  createdAt: string;
}

interface Team {
  _id: string;
  name: string;
}

const ROLES = ["user", "agent", "owner", "super_admin", "sub_admin", "team_leader", "telecaller", "sales_agent"] as const;
const CRM_ROLES = ["super_admin", "sub_admin", "team_leader", "telecaller", "sales_agent"] as const;
const TEAM_ROLES = ["team_leader", "telecaller", "sales_agent"];
const PERMISSION_KEYS = ["properties", "approvals", "agents", "enquiries", "leads"];

const roleColor: Record<string, string> = {
  super_admin: "bg-[#ff5a36]/10 text-[#ff5a36] border-[#ff5a36]/25",
  sub_admin: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  team_leader: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  telecaller: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  sales_agent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  agent: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  owner: "bg-purple-500/10 text-purple-650 dark:text-purple-400 border-purple-500/20",
  user: "bg-neutral-500/10 text-neutral-500 dark:text-neutral-400 border-neutral-500/20",
};

const emptyCreateForm = { name: "", email: "", password: "", phone: "", role: "telecaller" as string, teamId: "", permissions: [] as string[] };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; phone: string; role: string; isActive: boolean; teamId: string; permissions: string[] }>({ name: "", phone: "", role: "user", isActive: true, teamId: "", permissions: [] });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [createSaving, setCreateSaving] = useState(false);

  useEffect(() => {
    api.get<User[]>("/api/users").then(setUsers).finally(() => setLoading(false));
    api.get<Team[]>("/api/teams").then(setTeams).catch(() => {});
  }, []);

  async function handleCreate() {
    setCreateSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        phone: createForm.phone || undefined,
        role: createForm.role,
      };
      if (TEAM_ROLES.includes(createForm.role) && createForm.teamId) payload.teamId = createForm.teamId;
      if (createForm.role === "sub_admin") payload.permissions = createForm.permissions;

      const created = await api.post<User>("/api/users", payload);
      setUsers((prev) => [created, ...prev]);
      toast.success("Account created");
      setCreating(false);
      setCreateForm(emptyCreateForm);
    } catch (e) { toast.error((e as Error).message); }
    finally { setCreateSaving(false); }
  }

  const filtered = users.filter((u) => {
    const matchRole = !filterRole || u.role === filterRole;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  function openEdit(u: User) {
    setEditForm({ name: u.name, phone: u.phone ?? "", role: u.role, isActive: u.isActive !== false, teamId: u.teamId ?? "", permissions: u.permissions ?? [] });
    setEditing(u._id);
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { name: editForm.name, phone: editForm.phone, role: editForm.role, isActive: editForm.isActive };
      if (TEAM_ROLES.includes(editForm.role)) payload.teamId = editForm.teamId || null;
      if (editForm.role === "sub_admin") payload.permissions = editForm.permissions;

      const updated = await api.patch<User>(`/api/users/${editing}`, payload);
      setUsers((prev) => prev.map((u) => (u._id === editing ? { ...u, ...updated } : u)));
      toast.success("User updated");
      setEditing(null);
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch (e) { toast.error((e as Error).message); }
    finally { setDeleting(null); }
  }

  const countByRole = (r: string) => users.filter((u) => u.role === r).length;
  const summaryCards = [
    { label: "Super Admin", role: "super_admin", color: "text-[#ff5a36] bg-[#ff5a36]/10 border-[#ff5a36]/20" },
    { label: "Sub Admin", role: "sub_admin", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    { label: "Team Leaders", role: "team_leader", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
    { label: "Telecallers", role: "telecaller", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
    { label: "Sales Agents", role: "sales_agent", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { label: "Agents", role: "agent", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    { label: "Owners", role: "owner", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
    { label: "Users", role: "user", color: "text-neutral-550 bg-neutral-900/10 border-card-border" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((s) => (
          <button
            key={s.role}
            onClick={() => setFilterRole(filterRole === s.role ? "" : s.role)}
            className={`bg-card-bg border p-4 text-left rounded-2xl transition-all duration-300 backdrop-blur-xl cursor-pointer hover:border-brand/20 ${
              filterRole === s.role ? "border-brand shadow-[0_0_15px_rgba(255,90,54,0.03)] bg-white/5" : "border-card-border"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs mb-3 border ${s.color}`}>{countByRole(s.role)}</div>
            <div className="text-xs font-bold text-txt-muted tracking-wide">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-card-border flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[240px] relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-input-bg border border-input-border rounded-xl outline-none focus:border-brand/40 text-txt-title placeholder-text-sub transition-all duration-350"
              placeholder="Search users by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="pl-4 pr-10 py-2.5 text-xs bg-input-bg border border-input-border rounded-xl outline-none focus:border-brand/45 text-txt-body appearance-none min-w-[130px] cursor-pointer hover:bg-neutral-500/5 transition-all duration-300"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="" className="bg-card-bg text-txt-title">All Roles</option>
              {ROLES.map((r) => <option key={r} value={r} className="bg-card-bg text-txt-title capitalize">{r.replace(/_/g, " ")}</option>)}
            </select>
            <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sub pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover transition-all cursor-pointer border-none shadow-md shadow-brand/10 whitespace-nowrap"
          >
            + Create Account
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border">
                {["User", "Email", "Phone", "Role", "Status", "Agency", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-txt-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="py-20 text-center"><svg className="w-8 h-8 animate-spin text-brand mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-xs text-txt-muted">No users found.</td></tr>}
              {!loading && filtered.map((u) => (
                <tr key={u._id} className="dark-table-row border-b border-card-border/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-neutral-900/10 dark:bg-neutral-900 border border-card-border flex items-center justify-center flex-shrink-0">
                        <span className="text-txt-title text-[9px] font-bold">{initials(u.name)}</span>
                      </div>
                      <span className="font-bold text-txt-title text-xs">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-txt-body font-semibold">{u.email}</td>
                  <td className="px-5 py-3.5 text-xs text-txt-muted font-medium">{u.phone ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${roleColor[u.role] ?? ""}`}>{u.role.replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${u.isActive !== false ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/20" : "bg-neutral-500/10 text-neutral-500 border-neutral-550/20"}`}>
                      {u.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-txt-muted font-semibold">{u.agencyName ?? "—"}</td>
                  <td className="px-5 py-3.5 text-[10px] text-txt-muted font-semibold whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-txt-sub hover:text-txt-title hover:bg-neutral-900/5 dark:hover:bg-white/[0.04] transition-all cursor-pointer border-none" title="Edit">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(u._id, u.name)} disabled={deleting === u._id} className="p-1.5 rounded-lg text-txt-sub hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 disabled:opacity-40 cursor-pointer border-none" title="Delete">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-card-bg border border-card-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-txt-title">Edit User Account</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg text-txt-sub hover:text-txt-title hover:bg-neutral-900/5 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border-none bg-transparent">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Full Name</label>
                  <input className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-xs text-txt-title placeholder-text-sub outline-none focus:border-brand/40 transition-all duration-300" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Phone Number</label>
                  <input className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-xs text-txt-title placeholder-text-sub outline-none focus:border-brand/40 transition-all duration-300" value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Role Type</label>
                  <select className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-xs text-txt-body outline-none focus:border-brand/45 cursor-pointer hover:bg-neutral-500/5 transition-all duration-300" value={editForm.role} onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value as User["role"] }))}>
                    {ROLES.map((r) => <option key={r} value={r} className="bg-card-bg text-txt-title capitalize">{r.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                {TEAM_ROLES.includes(editForm.role) && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Team</label>
                    <select className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-xs text-txt-body outline-none focus:border-brand/45 cursor-pointer hover:bg-neutral-500/5 transition-all duration-300" value={editForm.teamId} onChange={(e) => setEditForm((p) => ({ ...p, teamId: e.target.value }))}>
                      <option value="" className="bg-card-bg text-txt-title">No team</option>
                      {teams.map((t) => <option key={t._id} value={t._id} className="bg-card-bg text-txt-title">{t.name}</option>)}
                    </select>
                  </div>
                )}
                {editForm.role === "sub_admin" && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Section Permissions</label>
                    <div className="flex flex-wrap gap-2">
                      {PERMISSION_KEYS.map((perm) => {
                        const active = editForm.permissions.includes(perm);
                        return (
                          <button
                            key={perm}
                            type="button"
                            onClick={() => setEditForm((p) => ({ ...p, permissions: active ? p.permissions.filter((x) => x !== perm) : [...p.permissions, perm] }))}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize border transition-colors cursor-pointer ${active ? "bg-brand text-white border-brand" : "bg-input-bg text-txt-body border-input-border hover:bg-neutral-500/5"}`}
                          >
                            {perm}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 pt-1">
                  <button onClick={() => setEditForm((p) => ({ ...p, isActive: !p.isActive }))} className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer outline-none border-none ${editForm.isActive ? "bg-emerald-500" : "bg-neutral-500/20 dark:bg-neutral-800"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${editForm.isActive ? "left-4.5" : "left-0.5"}`} />
                  </button>
                  <span className="text-xs font-bold text-txt-muted">{editForm.isActive ? "Active" : "Inactive"}</span>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-txt-body border border-card-border bg-input-bg hover:bg-neutral-500/5 transition-all cursor-pointer border-none">Cancel</button>
                <button onClick={saveEdit} disabled={saving} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover active:bg-brand transition-all disabled:opacity-60 cursor-pointer flex items-center gap-2 shadow-md shadow-brand/10 border-none">
                  {saving && (
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create account modal */}
      <AnimatePresence>
        {creating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-card-bg border border-card-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-txt-title">Create CRM Account</h3>
                <button onClick={() => setCreating(false)} className="p-1.5 rounded-lg text-txt-sub hover:text-txt-title hover:bg-neutral-900/5 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border-none bg-transparent">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Full Name</label>
                  <input className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-xs text-txt-title placeholder-text-sub outline-none focus:border-brand/40 transition-all duration-300" value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Email</label>
                  <input type="email" className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-xs text-txt-title placeholder-text-sub outline-none focus:border-brand/40 transition-all duration-300" value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Temporary Password</label>
                  <input type="text" className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-xs text-txt-title placeholder-text-sub outline-none focus:border-brand/40 transition-all duration-300" placeholder="Min. 8 characters" value={createForm.password} onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Phone Number</label>
                  <input className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-xs text-txt-title placeholder-text-sub outline-none focus:border-brand/40 transition-all duration-300" value={createForm.phone} onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Role</label>
                  <select className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-xs text-txt-body outline-none focus:border-brand/45 cursor-pointer hover:bg-neutral-500/5 transition-all duration-300" value={createForm.role} onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value }))}>
                    {CRM_ROLES.map((r) => <option key={r} value={r} className="bg-card-bg text-txt-title capitalize">{r.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                {TEAM_ROLES.includes(createForm.role) && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Team</label>
                    <select className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-xs text-txt-body outline-none focus:border-brand/45 cursor-pointer hover:bg-neutral-500/5 transition-all duration-300" value={createForm.teamId} onChange={(e) => setCreateForm((p) => ({ ...p, teamId: e.target.value }))}>
                      <option value="" className="bg-card-bg text-txt-title">No team</option>
                      {teams.map((t) => <option key={t._id} value={t._id} className="bg-card-bg text-txt-title">{t.name}</option>)}
                    </select>
                  </div>
                )}
                {createForm.role === "sub_admin" && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Section Permissions</label>
                    <div className="flex flex-wrap gap-2">
                      {PERMISSION_KEYS.map((perm) => {
                        const active = createForm.permissions.includes(perm);
                        return (
                          <button
                            key={perm}
                            type="button"
                            onClick={() => setCreateForm((p) => ({ ...p, permissions: active ? p.permissions.filter((x) => x !== perm) : [...p.permissions, perm] }))}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize border transition-colors cursor-pointer ${active ? "bg-brand text-white border-brand" : "bg-input-bg text-txt-body border-input-border hover:bg-neutral-500/5"}`}
                          >
                            {perm}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button onClick={() => setCreating(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-txt-body border border-card-border bg-input-bg hover:bg-neutral-500/5 transition-all cursor-pointer border-none">Cancel</button>
                <button onClick={handleCreate} disabled={createSaving || !createForm.name || !createForm.email || createForm.password.length < 8} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover active:bg-brand transition-all disabled:opacity-60 cursor-pointer flex items-center gap-2 shadow-md shadow-brand/10 border-none">
                  {createSaving && (
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  Create Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
