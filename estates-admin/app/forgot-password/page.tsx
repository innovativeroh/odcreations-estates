"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Request failed");
        return;
      }

      setSent(true);
    } catch {
      setError("Unable to reach server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">

      {/* Background grid echo */}
      <div
        className="fixed inset-0 opacity-[0.018] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md relative"
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

        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">
                  Reset Password
                </h1>
                <p className="text-neutral-400 text-sm font-medium leading-relaxed">
                  Enter your admin email and we&apos;ll send a secure reset link
                  to your inbox.
                </p>
              </div>

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

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-neutral-500 block mb-2 uppercase tracking-wide">
                    Admin Email Address
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-neutral-950 text-white font-bold rounded-xl text-sm hover:bg-neutral-800 transition-colors shadow-md shadow-neutral-950/15 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              <div className="text-center mt-8">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to sign in
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center py-8"
            >
              {/* Success icon */}
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-3">
                Check your inbox
              </h2>
              <p className="text-neutral-400 text-sm font-medium leading-relaxed mb-8 max-w-xs mx-auto">
                A password reset link has been sent to{" "}
                <span className="text-neutral-700 font-semibold">{email}</span>.
                It expires in 15 minutes.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="w-full py-3.5 bg-[#f8f9fa] border border-neutral-100 text-neutral-700 font-bold rounded-xl text-sm hover:bg-neutral-100 transition-colors"
                >
                  Try a different email
                </button>
                <Link
                  href="/login"
                  className="block w-full py-3.5 bg-neutral-950 text-white font-bold rounded-xl text-sm hover:bg-neutral-800 transition-colors text-center"
                >
                  Back to sign in
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
