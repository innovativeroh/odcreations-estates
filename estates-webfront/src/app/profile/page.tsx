"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getStoredUser, authFetch } from "@/lib/auth";
import { FiHeart, FiMessageSquare, FiUser, FiSearch, FiSettings, FiArrowRight } from "react-icons/fi";

export default function ProfileOverviewPage() {
  const user = getStoredUser();
  const [savedCount, setSavedCount] = useState(0);
  const [enquiryCount, setEnquiryCount] = useState(0);

  useEffect(() => {
    authFetch("/api/users/saved").then(async (r) => { if (r.ok) { const d = await r.json(); setSavedCount(Array.isArray(d) ? d.length : 0); } });
    authFetch("/api/users/enquiries").then(async (r) => { if (r.ok) { const d = await r.json(); setEnquiryCount(Array.isArray(d) ? d.length : 0); } });
  }, []);

  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-purple-100/80 rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center mb-3">
              <FiUser className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-wider block mb-1">Account Role</span>
            <span className="text-xl font-bold text-[#111827] block capitalize">{user.role}</span>
          </div>
          <span className="text-xs text-[#64748B] font-bold mt-2 truncate">{user.email}</span>
        </div>

        <div className="bg-white border border-purple-100/80 rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center mb-3">
              <FiHeart className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-wider block mb-1">Saved Properties</span>
            <span className="text-2xl font-extrabold text-[#111827] block">{savedCount}</span>
          </div>
          <Link href="/profile/saved" className="text-xs text-[#7C3AED] font-extrabold hover:underline mt-2 flex items-center gap-1">
            <span>View saved properties</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-purple-100/80 rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center mb-3">
              <FiMessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-wider block mb-1">Enquiries Sent</span>
            <span className="text-2xl font-extrabold text-[#111827] block">{enquiryCount}</span>
          </div>
          <Link href="/profile/contacted" className="text-xs text-[#7C3AED] font-extrabold hover:underline mt-2 flex items-center gap-1">
            <span>View enquiry history</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="bg-white border border-purple-100/80 rounded-[28px] p-6 sm:p-8 shadow-md">
        <h3 className="text-lg font-bold text-[#111827] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/properties" className="flex items-center gap-3 p-4 bg-[#FAF8FF] rounded-2xl border border-purple-200/60 hover:border-[#7C3AED] transition-all group">
            <div className="w-9 h-9 bg-[#18181B] text-white rounded-xl flex items-center justify-center flex-shrink-0">
              <FiSearch className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-[#111827] group-hover:text-[#7C3AED] transition-colors">Browse Properties</span>
          </Link>
          <Link href="/profile/saved" className="flex items-center gap-3 p-4 bg-[#FAF8FF] rounded-2xl border border-purple-200/60 hover:border-[#7C3AED] transition-all group">
            <div className="w-9 h-9 bg-[#18181B] text-white rounded-xl flex items-center justify-center flex-shrink-0">
              <FiHeart className="w-4 h-4 text-rose-400" />
            </div>
            <span className="text-xs font-bold text-[#111827] group-hover:text-[#7C3AED] transition-colors">Saved Shortlist</span>
          </Link>
          <Link href="/profile/settings" className="flex items-center gap-3 p-4 bg-[#FAF8FF] rounded-2xl border border-purple-200/60 hover:border-[#7C3AED] transition-all group">
            <div className="w-9 h-9 bg-[#18181B] text-white rounded-xl flex items-center justify-center flex-shrink-0">
              <FiSettings className="w-4 h-4 text-neutral-300" />
            </div>
            <span className="text-xs font-bold text-[#111827] group-hover:text-[#7C3AED] transition-colors">Account Settings</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
