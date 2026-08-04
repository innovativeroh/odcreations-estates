"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { getStoredAdminUser } from "@/lib/auth";

interface LeadRow {
  _id: string;
  leadId: string;
  customerName: string;
  mobile: string;
  propertyName?: string;
  status: string;
  priority: string;
  assignedTeamLeader?: { _id: string; name: string };
  assignedTelecaller?: { _id: string; name: string };
  assignedSalesAgent?: { _id: string; name: string };
  nextContactAt?: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  new_enquiry: "New Enquiry",
  assigned_team_leader: "Assigned to Team Leader",
  assigned_telecaller: "Assigned to Telecaller",
  attempted_contact: "Attempted Contact",
  contacted: "Contacted",
  interested_qualified: "Interested / Qualified",
  not_interested: "Not Interested",
  follow_up_required: "Follow-up Required",
  call_back_later: "Call Back Later",
  no_response: "No Response",
  invalid_number: "Invalid Number",
  duplicate_lead: "Duplicate Lead",
  assigned_sales: "Assigned to Sales",
  site_visit_scheduled: "Site Visit Scheduled",
  site_visit_completed: "Site Visit Completed",
  negotiation: "Negotiation",
  booking_confirmed: "Booking Confirmed",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
  on_hold: "On Hold",
};

const STATUS_COLORS: Record<string, string> = {
  new_enquiry: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
  interested_qualified: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  not_interested: "bg-red-500/10 text-red-500 border-red-500/20",
  closed_won: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  closed_lost: "bg-red-500/10 text-red-500 border-red-500/20",
  follow_up_required: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  call_back_later: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

interface UserOption { _id: string; name: string; role: string }

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [teamLeader, setTeamLeader] = useState("");
  const [telecaller, setTelecaller] = useState("");
  const [salesAgent, setSalesAgent] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [followUpFrom, setFollowUpFrom] = useState("");
  const [followUpTo, setFollowUpTo] = useState("");
  const [staffOptions, setStaffOptions] = useState<UserOption[]>([]);
  const user = getStoredAdminUser();
  const isSuperAdmin = user?.role === "super_admin" || user?.role === "sub_admin";

  useEffect(() => {
    if (isSuperAdmin) api.get<UserOption[]>("/api/users").then(setStaffOptions).catch(() => {});
  }, [isSuperAdmin]);

  const load = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ limit: "100" });
    if (search) qs.set("search", search);
    if (status) qs.set("status", status);
    if (source) qs.set("source", source);
    if (teamLeader) qs.set("teamLeader", teamLeader);
    if (telecaller) qs.set("telecaller", telecaller);
    if (salesAgent) qs.set("salesAgent", salesAgent);
    if (dateFrom) qs.set("dateFrom", dateFrom);
    if (dateTo) qs.set("dateTo", dateTo);
    if (followUpFrom) qs.set("followUpFrom", followUpFrom);
    if (followUpTo) qs.set("followUpTo", followUpTo);
    api.get<{ leads: LeadRow[] }>(`/api/leads?${qs.toString()}`)
      .then((d) => setLeads(d.leads))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false));
  }, [search, status, source, teamLeader, telecaller, salesAgent, dateFrom, dateTo, followUpFrom, followUpTo]);

  useEffect(load, [load]);

  const teamLeaderOptions = staffOptions.filter((u) => u.role === "team_leader");
  const telecallerOptions = staffOptions.filter((u) => u.role === "telecaller");
  const salesAgentOptions = staffOptions.filter((u) => u.role === "sales_agent");

  return (
    <div className="space-y-6">
      <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-card-border flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[240px] relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-input-bg border border-input-border rounded-xl outline-none focus:border-brand/40 text-txt-title placeholder-text-sub transition-all duration-350"
              placeholder="Search by name, mobile, email, Lead ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="pl-4 pr-10 py-2.5 text-xs bg-input-bg border border-input-border rounded-xl outline-none focus:border-brand/45 text-txt-body appearance-none min-w-[180px] cursor-pointer hover:bg-neutral-500/5 transition-all duration-300"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="" className="bg-card-bg text-txt-title">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-card-bg text-txt-title">{v}</option>)}
            </select>
            <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sub pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>

          <input
            className="px-3 py-2.5 text-xs bg-input-bg border border-input-border rounded-xl outline-none focus:border-brand/40 text-txt-title placeholder-text-sub min-w-[130px]"
            placeholder="Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />

          {isSuperAdmin && (
            <>
              <select className="px-3 py-2.5 text-xs bg-input-bg border border-input-border rounded-xl outline-none text-txt-body min-w-[140px] cursor-pointer" value={teamLeader} onChange={(e) => setTeamLeader(e.target.value)}>
                <option value="">All Team Leaders</option>
                {teamLeaderOptions.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
              <select className="px-3 py-2.5 text-xs bg-input-bg border border-input-border rounded-xl outline-none text-txt-body min-w-[130px] cursor-pointer" value={telecaller} onChange={(e) => setTelecaller(e.target.value)}>
                <option value="">All Telecallers</option>
                {telecallerOptions.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
              <select className="px-3 py-2.5 text-xs bg-input-bg border border-input-border rounded-xl outline-none text-txt-body min-w-[130px] cursor-pointer" value={salesAgent} onChange={(e) => setSalesAgent(e.target.value)}>
                <option value="">All Sales Agents</option>
                {salesAgentOptions.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-txt-sub uppercase">Created</span>
            <input type="date" className="px-2 py-2 text-xs bg-input-bg border border-input-border rounded-xl outline-none text-txt-body" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <span className="text-txt-sub text-xs">–</span>
            <input type="date" className="px-2 py-2 text-xs bg-input-bg border border-input-border rounded-xl outline-none text-txt-body" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-txt-sub uppercase">Follow-up</span>
            <input type="date" className="px-2 py-2 text-xs bg-input-bg border border-input-border rounded-xl outline-none text-txt-body" value={followUpFrom} onChange={(e) => setFollowUpFrom(e.target.value)} />
            <span className="text-txt-sub text-xs">–</span>
            <input type="date" className="px-2 py-2 text-xs bg-input-bg border border-input-border rounded-xl outline-none text-txt-body" value={followUpTo} onChange={(e) => setFollowUpTo(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border">
                {["Lead ID", "Customer", "Property", "Status", "Priority", "Team Leader", "Telecaller", "Sales Agent", "Next Contact", "Created"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-txt-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={10} className="py-20 text-center"><svg className="w-8 h-8 animate-spin text-brand mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></td></tr>}
              {!loading && leads.length === 0 && <tr><td colSpan={10} className="py-12 text-center text-xs text-txt-muted">No leads found.</td></tr>}
              {!loading && leads.map((l) => (
                <tr key={l._id} className="dark-table-row border-b border-card-border/50 hover:bg-neutral-500/[0.03] transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/dashboard/leads/${l._id}`} className="text-xs font-bold text-brand hover:underline">{l.leadId}</Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-xs font-bold text-txt-title">{l.customerName}</div>
                    <div className="text-[10px] text-txt-muted font-semibold">{l.mobile}</div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-txt-body font-semibold">{l.propertyName ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${STATUS_COLORS[l.status] ?? "bg-neutral-500/10 text-neutral-500 border-neutral-500/20"}`}>
                      {STATUS_LABELS[l.status] ?? l.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-txt-muted font-semibold capitalize">{l.priority}</td>
                  <td className="px-5 py-3.5 text-xs text-txt-muted font-semibold">{l.assignedTeamLeader?.name ?? "—"}</td>
                  <td className="px-5 py-3.5 text-xs text-txt-muted font-semibold">{l.assignedTelecaller?.name ?? "—"}</td>
                  <td className="px-5 py-3.5 text-xs text-txt-muted font-semibold">{l.assignedSalesAgent?.name ?? "—"}</td>
                  <td className="px-5 py-3.5 text-[10px] text-txt-muted font-semibold whitespace-nowrap">{l.nextContactAt ? formatDate(l.nextContactAt) : "—"}</td>
                  <td className="px-5 py-3.5 text-[10px] text-txt-muted font-semibold whitespace-nowrap">{formatDate(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {user?.role === "telecaller" && (
        <p className="text-[10px] text-txt-muted font-semibold px-1">Showing only leads assigned to you.</p>
      )}
    </div>
  );
}
