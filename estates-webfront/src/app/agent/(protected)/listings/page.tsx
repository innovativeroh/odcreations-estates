"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Submission {
  id: string;
  title: string;
  city: string;
  type: string;
  transactionType: string;
  price: number;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

function getSubmissions(): Submission[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("agentSubmissions") ?? "[]");
  } catch {
    return [];
  }
}

const statusConfig = {
  pending: { label: "Pending Review", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
  approved: { label: "Approved", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
  rejected: { label: "Rejected", bg: "bg-red-50", text: "text-red-600", border: "border-red-100" },
};

function formatPrice(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function MyListingsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    setSubmissions(getSubmissions().reverse());
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Agent Portal</p>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">My Listings</h1>
        </div>
        <Link
          href="/agent/submit"
          className="px-5 py-2.5 bg-neutral-950 text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Submit New
        </Link>
      </div>

      {/* Status note */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-3">
        <svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs font-medium text-blue-600">
          Status updates when admin reviews your submission. Approved properties go live on the platform.
        </p>
      </div>

      {/* List */}
      {submissions.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-12 text-center">
          <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-base font-bold text-neutral-900 mb-2">No listings yet</p>
          <p className="text-sm text-neutral-400 mb-6">Your submitted properties will appear here.</p>
          <Link
            href="/agent/submit"
            className="px-6 py-3 bg-neutral-950 text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors"
          >
            Submit Your First Property
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
          <div className="divide-y divide-neutral-50">
            {submissions.map((sub) => {
              const cfg = statusConfig[sub.status];
              return (
                <div key={sub.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-neutral-800 truncate">{sub.title}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                      <span>{sub.city}</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-300" />
                      <span>{sub.type?.replace("_", " ")}</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-300" />
                      <span>{sub.transactionType}</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-300" />
                      <span>{formatPrice(sub.price)}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1.5 font-medium">
                      Submitted {new Date(sub.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
