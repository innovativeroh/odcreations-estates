"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";

interface AuditEntry {
  _id: string;
  actor?: { name: string; role: string };
  actorRole?: string;
  action: string;
  fromValue?: string;
  toValue?: string;
  callOutcome?: string;
  remarks?: string;
  lead?: { _id: string; leadId: string; customerName: string };
  createdAt: string;
}

export default function AuditTrailPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ entries: AuditEntry[] }>("/api/leads/audit-trail?limit=100")
      .then((d) => setEntries(d.entries))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <p className="text-xs text-txt-muted font-semibold">
        Every assignment, reassignment, status change, call outcome, and remark across every lead — the full cross-team audit trail.
      </p>

      <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border">
                {["Lead", "Action", "Detail", "Actor", "When"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-txt-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="py-20 text-center"><svg className="w-8 h-8 animate-spin text-brand mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></td></tr>}
              {!loading && entries.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-xs text-txt-muted">No activity recorded yet.</td></tr>}
              {!loading && entries.map((e) => (
                <tr key={e._id} className="dark-table-row border-b border-card-border/50">
                  <td className="px-5 py-3.5">
                    {e.lead ? (
                      <Link href={`/dashboard/leads/${e.lead._id}`} className="text-xs font-bold text-brand hover:underline">{e.lead.leadId}</Link>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-xs font-bold text-txt-title capitalize">{e.action.replace(/_/g, " ")}</td>
                  <td className="px-5 py-3.5 text-xs text-txt-body">
                    {e.remarks ?? (e.fromValue && e.toValue ? `${e.fromValue} → ${e.toValue}` : e.toValue ?? "—")}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-txt-muted font-semibold">
                    {e.actor?.name ?? "System"} {e.actorRole ? `(${e.actorRole.replace(/_/g, " ")})` : ""}
                  </td>
                  <td className="px-5 py-3.5 text-[10px] text-txt-muted font-semibold whitespace-nowrap">{formatDate(e.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
