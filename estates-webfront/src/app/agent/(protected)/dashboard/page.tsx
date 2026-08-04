"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getAgentUser } from "@/lib/agentAuth";

interface Submission {
  id: string;
  title: string;
  city: string;
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

export default function AgentDashboard() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    setUser(getAgentUser());
    setSubmissions(getSubmissions());
  }, []);

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  };

  const recent = submissions.slice(-5).reverse();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Welcome */}
      <div className="bg-white rounded-[32px] border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Agent Dashboard</p>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          Welcome back, {String(user?.name ?? user?.email ?? "Agent")}
        </h1>
        {Boolean(user?.agencyName) && (
          <p className="text-sm text-neutral-400 font-medium mt-1">{String(user!.agencyName)}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/agent/submit"
            className="px-5 py-2.5 bg-neutral-950 text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Submit New Property
          </Link>
          <Link
            href="/agent/listings"
            className="px-5 py-2.5 border border-neutral-200 text-neutral-700 text-xs font-bold rounded-full hover:border-neutral-300 transition-colors"
          >
            View My Listings
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Submitted", value: stats.total, color: "text-neutral-900" },
          { label: "Pending Review", value: stats.pending, color: "text-amber-600" },
          { label: "Approved", value: stats.approved, color: "text-emerald-600" },
          { label: "Rejected", value: stats.rejected, color: "text-red-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-[24px] border border-neutral-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6"
          >
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent submissions */}
      <div className="bg-white rounded-[32px] border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-neutral-900">Recent Submissions</h2>
          <Link href="/agent/listings" className="text-xs font-bold text-[#ff5a36] hover:underline">
            View All
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm font-bold text-neutral-900 mb-1">No submissions yet</p>
            <p className="text-xs text-neutral-400 mb-4">Start by submitting your first property listing.</p>
            <Link
              href="/agent/submit"
              className="px-5 py-2.5 bg-neutral-950 text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors"
            >
              Submit Property
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {recent.map((sub) => {
              const cfg = statusConfig[sub.status];
              return (
                <div key={sub.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-bold text-neutral-800">{sub.title}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {sub.city} · {new Date(sub.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
