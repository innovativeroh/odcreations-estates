"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface TelecallerStats {
  assignedLeads: number;
  todaysCalls: number;
  pendingFollowUps: number;
  overdueFollowUps: number;
  callOutcomes: Record<string, number>;
  dailyProductivity: number;
}

type NumericStatKey = "assignedLeads" | "todaysCalls" | "pendingFollowUps" | "overdueFollowUps";

const STAT_CARDS: { key: NumericStatKey; label: string; color: string }[] = [
  { key: "assignedLeads", label: "Assigned Leads", color: "text-brand bg-brand/10 border-brand/20" },
  { key: "todaysCalls", label: "Today's Calls", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
  { key: "pendingFollowUps", label: "Pending Follow-ups", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { key: "overdueFollowUps", label: "Overdue Follow-ups", color: "text-red-500 bg-red-500/10 border-red-500/20" },
];

export default function TelecallerDashboard() {
  const [stats, setStats] = useState<TelecallerStats | null>(null);

  useEffect(() => {
    api.get<TelecallerStats>("/api/dashboard/telecaller").then(setStats).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="w-8 h-8 animate-spin text-brand" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((c) => (
          <div key={c.key} className="bg-card-bg border border-card-border p-4 rounded-2xl">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm mb-3 border ${c.color}`}>{stats[c.key]}</div>
            <div className="text-xs font-bold text-txt-muted tracking-wide">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card-bg border border-card-border rounded-2xl p-6">
        <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider mb-4">Today&apos;s Call Outcomes</h3>
        {Object.keys(stats.callOutcomes).length === 0 ? (
          <p className="text-xs text-txt-muted">No calls logged yet today.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.callOutcomes).map(([outcome, count]) => (
              <div key={outcome} className="px-4 py-2.5 rounded-xl bg-input-bg border border-input-border">
                <div className="text-[9px] font-bold text-txt-sub uppercase tracking-wider">{outcome.replace(/_/g, " ")}</div>
                <div className="text-sm font-bold text-txt-title mt-0.5">{count}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link href="/dashboard/leads" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover transition-all">
        View My Leads →
      </Link>
    </div>
  );
}
