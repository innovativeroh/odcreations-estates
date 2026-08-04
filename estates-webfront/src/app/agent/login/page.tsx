"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function AgentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403 || (data.message && data.message.toLowerCase().includes("role"))) {
          setError("Access denied — agent accounts only. Please contact your admin.");
        } else {
          setError(data.message || "Invalid email or password.");
        }
        setLoading(false);
        return;
      }
      const user = data.user ?? data;
      if (user.role && !["agent", "owner", "super_admin"].includes(user.role)) {
        setError("Access denied — agent accounts only. Please contact your admin.");
        setLoading(false);
        return;
      }
      localStorage.setItem("agentToken", data.token);
      localStorage.setItem("agentUser", JSON.stringify(user));
      // Also seed the user portal session so the same email works on both portals.
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("userInfo", JSON.stringify(user));
      window.dispatchEvent(new Event("auth-change"));
      toast.success("Welcome back!");
      router.push("/agent/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
      {/* Left Column */}
      <div className="lg:col-span-5 px-6 sm:px-16 py-12 flex flex-col justify-center items-center min-h-screen pt-28 pb-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-600 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 inline-block" />
              Agent Portal
            </span>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2 tracking-tight">Agent Login</h2>
            <p className="text-neutral-400 text-sm font-medium">
              Log in to submit and manage property listings on Estates.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-neutral-500 block mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. agent@agency.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3.5 outline-none text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-300 transition-colors"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-500 block mb-2 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3.5 outline-none text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-300 transition-colors"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-neutral-950 text-white font-bold rounded-xl text-sm hover:bg-neutral-800 transition-colors shadow-md shadow-neutral-950/15 mt-3 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center text-sm text-neutral-500 mt-8">
            Not an agent?{" "}
            <Link href="/login" className="text-[#ff5a36] font-bold hover:underline">
              User Login
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Column */}
      <div className="hidden lg:block lg:col-span-7 relative h-screen">
        <Image
          src="/property-3.png"
          alt="Premium Property"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-neutral-950/40 pointer-events-none" />
        <div className="absolute bottom-16 left-16 right-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-[32px] p-8 max-w-xl text-white">
          <span className="text-[#ff5a36] font-bold text-xs uppercase tracking-widest mb-3 block">
            Agent Submission Portal
          </span>
          <h3 className="text-3xl font-bold mb-4 tracking-tight leading-tight">
            List premium properties. Reach thousands of verified buyers.
          </h3>
          <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-6 mt-6">
            <div>
              <span className="text-xs text-neutral-300 block mb-1">Listed Properties</span>
              <span className="text-xl font-bold">2,400+</span>
            </div>
            <div>
              <span className="text-xs text-neutral-300 block mb-1">Avg. Time to Approval</span>
              <span className="text-xl font-bold">24 hrs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
