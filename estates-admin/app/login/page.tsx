"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { setAdminUser } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("adminToken", data.token);
        setAdminUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          teamId: data.user.teamId,
          permissions: data.user.permissions,
        });
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Unable to reach server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 overflow-hidden">

      {/* ── Left Panel ── */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center min-h-screen px-6 sm:px-16 py-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <svg
              viewBox="0 0 32 32"
              className="w-8 h-8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4,28V16a3,3 0 0 1 3-3v15Z" fill="#A3A3A3" />
              <path d="M7,28V13a3,3 0 0 1 3 3v12Z" fill="#171717" />
              <path d="M12,28V10a3,3 0 0 1 3-3v18Z" fill="#A3A3A3" />
              <path d="M15,28V7a3,3 0 0 1 3 3v18Z" fill="#171717" />
              <path d="M20,28V4a3,3 0 0 1 3-3v24Z" fill="#A3A3A3" />
              <path d="M23,28V1a3,3 0 0 1 3 3v24Z" fill="#171717" />
            </svg>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-[20px] tracking-tight text-neutral-900 leading-none">
                Estates
              </span>
              <span className="font-sans text-[10px] text-neutral-500 tracking-wider font-semibold mt-0.5 leading-none uppercase">
                by Lohith
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff1ee] text-[#ff5a36] text-[10px] font-bold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a36]" />
              Admin Portal
            </span>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">
              Command Centre
            </h1>
            <p className="text-neutral-400 text-sm font-medium leading-relaxed">
              Authorized access only. Sign in to manage properties,
              investors, and platform operations.
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-50 border border-red-100"
            >
              <svg
                className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
              </svg>
              <span className="text-sm text-red-600 font-medium">{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-neutral-500 block mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@estates.in"
                autoComplete="email"
                required
                className="w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3.5 outline-none text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-300 focus:bg-white transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#ff5a36] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3.5 pr-12 outline-none text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-300 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-neutral-950 text-white font-bold rounded-xl text-sm hover:bg-neutral-800 active:bg-neutral-950 transition-colors shadow-md shadow-neutral-950/15 mt-3 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authenticating…
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-xs text-neutral-400 mt-8 leading-relaxed">
            This portal is restricted to authorized administrators.
            <br />
            Unauthorized access attempts are logged and monitored.
          </p>
        </motion.div>
      </div>

      {/* ── Right Panel — Dark Command Visual ── */}
      <div className="hidden lg:block lg:col-span-7 relative overflow-hidden bg-[#080808]">

        {/* Architectural grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Radial coral bloom — top right */}
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.12]"
          style={{
            background: "radial-gradient(circle at center, #ff5a36 0%, transparent 70%)",
          }}
        />

        {/* Radial soft white bloom — bottom left */}
        <div
          className="absolute -bottom-60 -left-40 w-[700px] h-[700px] rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle at center, #ffffff 0%, transparent 70%)",
          }}
        />

        {/* Cityline silhouette — SVG */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full opacity-[0.06]"
          viewBox="0 0 1200 300"
          fill="white"
          preserveAspectRatio="xMidYMax meet"
        >
          <rect x="0" y="200" width="60" height="100" />
          <rect x="20" y="160" width="20" height="140" />
          <rect x="80" y="130" width="80" height="170" />
          <rect x="120" y="100" width="20" height="200" />
          <rect x="180" y="150" width="60" height="150" />
          <rect x="200" y="110" width="20" height="190" />
          <rect x="260" y="60" width="100" height="240" />
          <rect x="300" y="30" width="20" height="270" />
          <rect x="380" y="120" width="70" height="180" />
          <rect x="400" y="80" width="30" height="220" />
          <rect x="470" y="140" width="90" height="160" />
          <rect x="510" y="90" width="30" height="210" />
          <rect x="580" y="50" width="110" height="250" />
          <rect x="620" y="10" width="30" height="290" />
          <rect x="710" y="100" width="80" height="200" />
          <rect x="750" y="60" width="20" height="240" />
          <rect x="810" y="130" width="70" height="170" />
          <rect x="900" y="90" width="90" height="210" />
          <rect x="940" y="50" width="20" height="250" />
          <rect x="1010" y="140" width="60" height="160" />
          <rect x="1090" y="110" width="80" height="190" />
          <rect x="1130" y="70" width="20" height="230" />
        </svg>

        {/* Thin horizontal accent line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff5a36]/20 to-transparent" />

        {/* Top-left branding mark */}
        <div className="absolute top-12 left-12 flex items-center gap-2 opacity-30">
          <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
            <path d="M4,28V16a3,3 0 0 1 3-3v15Z" fill="#A3A3A3" />
            <path d="M7,28V13a3,3 0 0 1 3 3v12Z" fill="#ffffff" />
            <path d="M12,28V10a3,3 0 0 1 3-3v18Z" fill="#A3A3A3" />
            <path d="M15,28V7a3,3 0 0 1 3 3v18Z" fill="#ffffff" />
            <path d="M20,28V4a3,3 0 0 1 3-3v24Z" fill="#A3A3A3" />
            <path d="M23,28V1a3,3 0 0 1 3 3v24Z" fill="#ffffff" />
          </svg>
          <span className="text-white font-bold text-sm tracking-tight">Estates</span>
        </div>

        {/* Floating glassmorphism stats card */}
        <div className="absolute bottom-14 left-14 right-14 max-w-lg">
          <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.10] rounded-[28px] p-8">
            <span className="text-[#ff5a36] font-bold text-[10px] uppercase tracking-widest mb-4 block">
              Platform Overview
            </span>
            <h2 className="text-white text-2xl font-bold tracking-tight leading-snug mb-6">
              One dashboard to manage every corner of the Estates platform.
            </h2>

            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
              <div>
                <span className="text-neutral-500 text-[10px] uppercase tracking-wider block mb-1.5">
                  Properties
                </span>
                <span className="text-white text-lg font-bold">Live DB</span>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px] uppercase tracking-wider block mb-1.5">
                  Investors
                </span>
                <span className="text-white text-lg font-bold">All Users</span>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px] uppercase tracking-wider block mb-1.5">
                  Inquiries
                </span>
                <span className="text-white text-lg font-bold">Pipeline</span>
              </div>
            </div>
          </div>

          {/* Three small floating data chips */}
          <div className="flex gap-3 mt-4">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-white/60 text-[10px] font-semibold tracking-wide">R2 Storage Active</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-white/60 text-[10px] font-semibold tracking-wide">MongoDB Connected</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a36]" />
              <span className="text-white/60 text-[10px] font-semibold tracking-wide">Admin Only</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
