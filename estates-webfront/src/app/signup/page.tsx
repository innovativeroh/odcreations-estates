"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupUser } from "@/lib/auth";
import { FiZap, FiUser, FiMail, FiPhone, FiLock, FiArrowRight } from "react-icons/fi";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signupUser(name, email, password, phone || undefined);
      const next = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
      router.push(next || "/profile");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F0FE] flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 md:px-12 select-none text-left">
      <div className="w-full max-w-5xl bg-white border border-purple-100/80 rounded-[32px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Form Container */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-2">
                <FiZap className="w-4 h-4" />
                <span>Join BookUrVisit</span>
              </div>
              <h2 className="text-3xl font-bold text-[#111827] tracking-tight">Create Account</h2>
              <p className="text-xs sm:text-sm text-[#64748B] font-normal mt-1">Register to save listings, receive market trends, and schedule site visits.</p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 bg-rose-50 border-2 border-rose-200 rounded-2xl text-rose-700 text-xs font-bold">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-extrabold text-[#7C3AED] block mb-1.5 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <FiUser className="w-4 h-4 text-neutral-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full bg-[#FAF8FF] border border-purple-200/80 focus:border-[#7C3AED] rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold text-[#111827] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-[#7C3AED] block mb-1.5 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <FiMail className="w-4 h-4 text-neutral-400 absolute left-4 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rohan@example.com"
                    required
                    className="w-full bg-[#FAF8FF] border border-purple-200/80 focus:border-[#7C3AED] rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold text-[#111827] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-[#7C3AED] block mb-1.5 uppercase tracking-wider">Phone Number (Optional)</label>
                <div className="relative">
                  <FiPhone className="w-4 h-4 text-neutral-400 absolute left-4 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#FAF8FF] border border-purple-200/80 focus:border-[#7C3AED] rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold text-[#111827] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-[#7C3AED] block mb-1.5 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <FiLock className="w-4 h-4 text-neutral-400 absolute left-4 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    className="w-full bg-[#FAF8FF] border border-purple-200/80 focus:border-[#7C3AED] rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold text-[#111827] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#18181B] hover:bg-[#27272A] text-white font-extrabold rounded-full text-xs shadow-md transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "Get Started Now"}
                <FiArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </form>

            <div className="text-center text-xs text-[#64748B] mt-6 pt-4 border-t border-purple-100 font-bold">
              Already have an account?{" "}
              <Link href="/login" className="text-[#7C3AED] hover:underline font-extrabold">Sign In Here</Link>
            </div>
          </motion.div>
        </div>

        {/* Right Image Showcase */}
        <div className="hidden lg:block lg:col-span-6 relative bg-neutral-900">
          <Image src="/property-4.png" alt="BookUrVisit Luxury Property" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#18181B]/80 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-md border border-purple-100/80 rounded-[24px] p-6 text-[#111827] shadow-lg">
            <span className="text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-wider mb-1 block">Verified Real Estate</span>
            <h3 className="text-xl font-bold mb-1">Empowering Smart Property Decisions</h3>
            <p className="text-xs text-[#64748B] font-normal">Full RERA legal check & direct advisor support across India.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
