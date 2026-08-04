"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface TeamLeaderStats {
  newLeads: number;
  unassignedLeads: number;
  assignedToTelecallers: number;
  qualifiedAwaitingSales: number;
  salesPipeline: Record<string, number>;
  dueFollowUps: number;
  overdueFollowUps: number;
  teamPerformance: { name: string; total: number; qualified: number }[];
}

const STAT_CARDS: { key: keyof Pick<TeamLeaderStats, "newLeads" | "unassignedLeads" | "assignedToTelecallers" | "qualifiedAwaitingSales" | "dueFollowUps" | "overdueFollowUps">; label: string; color: string }[] = [
  { key: "newLeads", label: "New Leads", color: "text-brand bg-brand/10 border-brand/20" },
  { key: "unassignedLeads", label: "Unassigned", color: "text-neutral-500 bg-neutral-500/10 border-neutral-500/20" },
  { key: "assignedToTelecallers", label: "With Telecallers", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
  { key: "qualifiedAwaitingSales", label: "Qualified — Awaiting Sales", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  { key: "dueFollowUps", label: "Due Follow-ups", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { key: "overdueFollowUps", label: "Overdue Follow-ups", color: "text-red-500 bg-red-500/10 border-red-500/20" },
];

export default function TeamLeaderDashboard() {
  const [stats, setStats] = useState<TeamLeaderStats | null>(null);

  useEffect(() => {
    api.get<TeamLeaderStats>("/api/dashboard/team-leader").then(setStats).catch(() => {});
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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_CARDS.map((c) => (
          <div key={c.key} className="bg-card-bg border border-card-border p-4 rounded-2xl">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm mb-3 border ${c.color}`}>{stats[c.key]}</div>
            <div className="text-xs font-bold text-txt-muted tracking-wide">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider mb-4">Sales Pipeline</h3>
          {Object.keys(stats.salesPipeline).length === 0 ? (
            <p className="text-xs text-txt-muted">No leads with Sales yet.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(stats.salesPipeline).map(([status, count]) => (
                <div key={status} className="flex justify-between text-xs">
                  <span className="text-txt-body capitalize">{status.replace(/_/g, " ")}</span>
                  <span className="font-bold text-txt-title">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider mb-4">Telecaller Performance</h3>
          {stats.teamPerformance.length === 0 ? (
            <p className="text-xs text-txt-muted">No Telecaller activity yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.teamPerformance.map((t) => (
                <div key={t.name} className="flex justify-between text-xs">
                  <span className="text-txt-body">{t.name}</span>
                  <span className="font-bold text-txt-title">{t.qualified} / {t.total} qualified</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Link href="/dashboard/leads" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover transition-all">
        Manage Team Leads →
      </Link>
    </div>
  );
}
