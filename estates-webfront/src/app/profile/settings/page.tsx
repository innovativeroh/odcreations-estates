"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authFetch, getStoredUser, setAuth, getToken } from "@/lib/auth";

export default function ProfileSettingsPage() {
  const stored = getStoredUser();
  const [name, setName] = useState(stored?.name ?? "");
  const [phone, setPhone] = useState(stored?.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    authFetch("/api/users/profile").then(async (r) => {
      if (!r.ok) return;
      const d = await r.json();
      setName(d.name ?? "");
      setPhone(d.phone ?? "");
    });
  }, []);

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(""); setSaving(true);
    try {
      const res = await authFetch("/api/users/profile", { method: "PUT", body: JSON.stringify({ name, phone: phone || undefined }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      const token = getToken()!;
      setAuth(token, { id: d._id, name: d.name, email: d.email, role: d.role, phone: d.phone, avatar: d.avatar, createdAt: d.createdAt });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err) { setProfileError((err as Error).message); }
    finally { setSaving(false); }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(""); setChangingPw(true);
    try {
      const res = await authFetch("/api/users/password", { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      setCurrentPassword(""); setNewPassword("");
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err) { setPasswordError((err as Error).message); }
    finally { setChangingPw(false); }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">Account Settings</h1>
        <p className="text-neutral-500 text-sm">Update your personal details and change your password.</p>
      </div>

      {/* Profile form */}
      <form onSubmit={handleProfile} className="bg-white border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] rounded-[32px] p-6 md:p-8 space-y-6">
        <h3 className="text-lg font-bold text-neutral-900 pb-3 border-b border-neutral-50">Personal Details</h3>
        <AnimatePresence>{profileSuccess && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-sm font-semibold">Profile updated successfully!</motion.div>}</AnimatePresence>
        {profileError && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-medium">{profileError}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-neutral-500 block mb-2 uppercase tracking-wide">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3 outline-none text-sm text-neutral-800 focus:border-neutral-300 transition-colors" />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-500 block mb-2 uppercase tracking-wide">Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3 outline-none text-sm text-neutral-800 focus:border-neutral-300 transition-colors" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="px-8 py-3 bg-neutral-950 text-white font-bold rounded-2xl text-sm hover:bg-neutral-800 transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Password form */}
      <form onSubmit={handlePassword} className="bg-white border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] rounded-[32px] p-6 md:p-8 space-y-6">
        <h3 className="text-lg font-bold text-neutral-900 pb-3 border-b border-neutral-50">Change Password</h3>
        <AnimatePresence>{passwordSuccess && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-sm font-semibold">Password changed successfully!</motion.div>}</AnimatePresence>
        {passwordError && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-medium">{passwordError}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-neutral-500 block mb-2 uppercase tracking-wide">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
              className="w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3 outline-none text-sm text-neutral-800 focus:border-neutral-300 transition-colors" />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-500 block mb-2 uppercase tracking-wide">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8}
              className="w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3 outline-none text-sm text-neutral-800 focus:border-neutral-300 transition-colors" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={changingPw} className="px-8 py-3 bg-neutral-950 text-white font-bold rounded-2xl text-sm hover:bg-neutral-800 transition-colors disabled:opacity-60">
            {changingPw ? "Updating…" : "Update Password"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
