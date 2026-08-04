"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getAgentUser, agentApi } from "@/lib/agentAuth";
import toast from "react-hot-toast";

export default function AgentAccountPage() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUser(getAgentUser());
  }, []);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    try {
      const res = await agentApi.put("/api/users/profile", {
        currentPassword,
        password: newPassword,
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message ?? "Failed to update password.");
      } else {
        toast.success("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { label: "Full Name", value: user?.name },
    { label: "Email Address", value: user?.email },
    { label: "Phone", value: user?.phone },
    { label: "Agency Name", value: user?.agencyName },
    { label: "License Number", value: user?.licenseNumber },
    { label: "Role", value: user?.role },
  ].filter((f) => f.value != null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Agent Portal</p>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Account</h1>
      </div>

      {/* Profile info */}
      <div className="bg-white rounded-[32px] border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
        <h2 className="text-sm font-bold text-neutral-900 mb-6">Profile Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {fields.map(({ label, value }) => (
            <div key={label}>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1.5">
                {label}
              </label>
              <p className="text-sm font-semibold text-neutral-800 bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3">
                {String(value)}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-400 mt-6 font-medium">
          Profile details are managed by your admin. Contact support to update your information.
        </p>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-[32px] border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
        <h2 className="text-sm font-bold text-neutral-900 mb-6">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
          <div>
            <label className="text-xs font-bold text-neutral-500 block mb-2 uppercase tracking-wide">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3.5 outline-none text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-300 transition-colors"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-500 block mb-2 uppercase tracking-wide">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
              className="w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3.5 outline-none text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-300 transition-colors"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-500 block mb-2 uppercase tracking-wide">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3.5 outline-none text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-300 transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-neutral-950 text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating…
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
