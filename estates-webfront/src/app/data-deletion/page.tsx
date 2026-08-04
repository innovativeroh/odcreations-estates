"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function DataDeletionPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "",
    confirm: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({
      name: "",
      email: "",
      reason: "",
      confirm: false,
    });
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pt-28 pb-20">
      <div className="max-w-xl mx-auto px-6">
        
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Link href="/privacy" className="text-xs font-bold text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7 7-7" />
            </svg>
            Privacy Policy
          </Link>
        </div>

        {/* Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-[32px] border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] p-8 md:p-10 space-y-6"
        >
          <div>
            <span className="text-[#ff5a36] font-semibold text-xs mb-3 block tracking-wide uppercase">User Control</span>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">Delete User Account & Data</h1>
            <p className="text-neutral-400 text-xs mt-1.5 leading-relaxed">
              Submit a formal request to purge your investor profile, Kyc logs, and banking links from our servers.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-sm font-semibold text-center space-y-4"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 mb-1">Request Received</h3>
                  <p className="text-xs text-neutral-500 font-medium max-w-xs mx-auto leading-relaxed">
                    Your data deletion ticket has been successfully queued. A compliance officer will review pending fractional liquidations and contact you shortly.
                  </p>
                </div>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition-colors"
                >
                  New Request
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-neutral-500 block mb-2 uppercase tracking-wide">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Lohith Kumar"
                    className="w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3 outline-none text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-300 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-500 block mb-2 uppercase tracking-wide">Registered Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="lohith@example.com"
                    className="w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3 outline-none text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-300 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-500 block mb-2 uppercase tracking-wide">Reason for Wiping Data</label>
                  <textarea 
                    name="reason"
                    rows={4}
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Help us understand your decision (optional)..."
                    className="w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3 outline-none text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-300 transition-colors resize-none"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer select-none group mt-4">
                  <input 
                    type="checkbox"
                    name="confirm"
                    checked={formData.confirm}
                    onChange={handleInputChange}
                    className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 accent-neutral-900"
                    required
                  />
                  <span className="text-xs text-neutral-500 group-hover:text-neutral-800 transition-colors leading-relaxed">
                    I understand that account deletion is permanent and will forfeit access to active fractional property shares.
                  </span>
                </label>

                <button 
                  type="submit"
                  className="w-full py-4 bg-neutral-950 text-white font-bold rounded-xl text-sm hover:bg-neutral-800 transition-colors shadow-md shadow-neutral-950/10 mt-6"
                >
                  Submit Deletion Request
                </button>
              </form>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}
