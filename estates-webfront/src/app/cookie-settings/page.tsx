"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always on
    performance: true,
    functional: false,
    targeting: false,
  });

  const handleToggle = (key: keyof typeof preferences) => {
    if (key === "essential") return; // Cannot toggle essential
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAcceptAll = () => {
    setPreferences({
      essential: true,
      performance: true,
      functional: true,
      targeting: true,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/privacy" className="text-xs font-bold text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7 7-7" />
            </svg>
            Privacy Policy
          </Link>
        </div>

        {/* Settings Container */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-[32px] border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] p-8 md:p-10 space-y-8"
        >
          <div>
            <span className="text-[#ff5a36] font-semibold text-xs mb-3 block tracking-wide uppercase">Preferences Manager</span>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">Cookie Settings</h1>
            <p className="text-neutral-400 text-xs mt-1.5 leading-relaxed">
              Customize how OD Creations utilizes cookies and data trackers to optimize your fractional real estate investment experience.
            </p>
          </div>

          <AnimatePresence>
            {saved && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Cookie preferences updated successfully!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cookie Settings Switches List */}
          <div className="space-y-6">
            
            {/* Toggle 1: Essential */}
            <div className="flex items-center justify-between gap-6 pb-6 border-b border-neutral-100">
              <div className="space-y-1 max-w-md">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  Essential Cookies
                  <span className="text-[8px] bg-neutral-100 text-neutral-500 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Required</span>
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Necessary for account security, KYC verification checks, and session authentication. These cannot be disabled.
                </p>
              </div>
              <button className="w-10 h-6 bg-neutral-900 rounded-full p-0.5 flex items-center justify-end cursor-not-allowed opacity-50">
                <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
              </button>
            </div>

            {/* Toggle 2: Performance */}
            <div className="flex items-center justify-between gap-6 pb-6 border-b border-neutral-100">
              <div className="space-y-1 max-w-md">
                <h3 className="text-sm font-bold text-neutral-900">Performance & Analytics</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Allows us to count visits, source traffic patterns, and monitor load speeds to optimize site performance.
                </p>
              </div>
              <button 
                onClick={() => handleToggle("performance")}
                className={`w-10 h-6 rounded-full p-0.5 flex items-center transition-colors ${
                  preferences.performance ? "bg-[#ff5a36] justify-end" : "bg-neutral-200 justify-start"
                }`}
              >
                <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
              </button>
            </div>

            {/* Toggle 3: Functional */}
            <div className="flex items-center justify-between gap-6 pb-6 border-b border-neutral-100">
              <div className="space-y-1 max-w-md">
                <h3 className="text-sm font-bold text-neutral-900">Functional Personalization</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Remembers preference selections (such as location cities and max budget ranges) across user sessions.
                </p>
              </div>
              <button 
                onClick={() => handleToggle("functional")}
                className={`w-10 h-6 rounded-full p-0.5 flex items-center transition-colors ${
                  preferences.functional ? "bg-[#ff5a36] justify-end" : "bg-neutral-200 justify-start"
                }`}
              >
                <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
              </button>
            </div>

            {/* Toggle 4: Targeting */}
            <div className="flex items-center justify-between gap-6">
              <div className="space-y-1 max-w-md">
                <h3 className="text-sm font-bold text-neutral-900">Targeting & Advertising</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Enables curated property recommendations matching your search metrics on secondary networks.
                </p>
              </div>
              <button 
                onClick={() => handleToggle("targeting")}
                className={`w-10 h-6 rounded-full p-0.5 flex items-center transition-colors ${
                  preferences.targeting ? "bg-[#ff5a36] justify-end" : "bg-neutral-200 justify-start"
                }`}
              >
                <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
              </button>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
            <button 
              onClick={handleSave}
              className="w-full sm:flex-1 py-3.5 bg-neutral-950 text-white font-bold rounded-xl text-xs hover:bg-neutral-800 transition-colors shadow-sm"
            >
              Save Preferences
            </button>
            <button 
              onClick={handleAcceptAll}
              className="w-full sm:flex-1 py-3.5 bg-neutral-50 text-neutral-800 border border-neutral-200 font-bold rounded-xl text-xs hover:bg-neutral-100 transition-colors"
            >
              Accept All Cookies
            </button>
          </div>

        </motion.div>

      </div>
    </div>
  );
}
