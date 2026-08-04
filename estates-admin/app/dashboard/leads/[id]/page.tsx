"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { getStoredAdminUser } from "@/lib/auth";
import toast from "react-hot-toast";

interface UserRef { _id: string; name: string; email: string }

interface LeadDetail {
  _id: string;
  leadId: string;
  customerName: string;
  mobile: string;
  email?: string;
  location?: string;
  propertyName?: string;
  property?: { _id: string; title: string; city: string; address: string };
  source: string;
  status: string;
  priority: string;
  assignedTeamLeader?: UserRef;
  assignedTelecaller?: UserRef;
  assignedSalesAgent?: UserRef;
  nextContactAt?: string;
  lastContactAt?: string;
  remarks?: string;
  notInterestedReason?: string;
  closedLostReason?: string;
  meetingAt?: string;
  meetingLocation?: string;
  createdAt: string;
}

interface Activity {
  _id: string;
  actor?: { name: string; role: string };
  actorRole?: string;
  action: string;
  fromValue?: string;
  toValue?: string;
  callOutcome?: string;
  remarks?: string;
  nextContactAt?: string;
  createdAt: string;
}

const TELECALLER_OUTCOMES = [
  "attempted_contact", "contacted", "interested_qualified", "not_interested",
  "follow_up_required", "call_back_later", "no_response", "invalid_number",
  "duplicate_lead", "on_hold",
] as const;

const OUTCOME_LABELS: Record<string, string> = {
  attempted_contact: "Attempted Contact",
  contacted: "Contacted",
  interested_qualified: "Interested / Qualified",
  not_interested: "Not Interested",
  follow_up_required: "Follow-up Required",
  call_back_later: "Call Back Later",
  no_response: "No Response",
  invalid_number: "Invalid Number",
  duplicate_lead: "Duplicate Lead",
  on_hold: "On Hold",
};

function CallLogForm({ leadId, onLogged }: { leadId: string; onLogged: () => void }) {
  const router = useRouter();
  const [outcome, setOutcome] = useState<string>("contacted");
  const [remarks, setRemarks] = useState("");
  const [interestLevel, setInterestLevel] = useState("");
  const [nextContactAt, setNextContactAt] = useState("");
  const [notInterestedReason, setNotInterestedReason] = useState("");
  const [meetingAt, setMeetingAt] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const needsNextContact = outcome === "call_back_later" || outcome === "follow_up_required";
  const needsReason = outcome === "not_interested";
  const needsMeetingDetails = outcome === "interested_qualified";
  // These outcomes clear the Telecaller's assignment and hand the lead back
  // to the Team Leader — the Telecaller loses view access to it immediately,
  // so reloading this same detail page would 404. Send them to the list instead.
  const returnsToTeamLeader = outcome === "interested_qualified" || outcome === "not_interested";

  async function handleSubmit() {
    if (!remarks.trim()) { toast.error("Remarks are required for every call outcome"); return; }
    if (needsNextContact && !nextContactAt) { toast.error("Next contact date/time is required for this outcome"); return; }
    if (needsReason && !notInterestedReason.trim()) { toast.error("A reason is required to mark Not Interested"); return; }
    if (needsMeetingDetails && (!meetingAt || !meetingLocation.trim())) { toast.error("A meeting date/time and location are required to mark Interested/Qualified"); return; }

    setSaving(true);
    try {
      await api.post(`/api/leads/${leadId}/call-log`, {
        outcome, remarks,
        interestLevel: interestLevel || undefined,
        nextContactAt: nextContactAt ? new Date(nextContactAt).toISOString() : undefined,
        notInterestedReason: notInterestedReason || undefined,
        meetingAt: meetingAt ? new Date(meetingAt).toISOString() : undefined,
        meetingLocation: meetingLocation || undefined,
      });
      if (returnsToTeamLeader) {
        toast.success("Call outcome recorded — lead returned to your Team Leader");
        router.push("/dashboard/leads");
        return;
      }
      toast.success("Call outcome recorded");
      setRemarks(""); setNextContactAt(""); setNotInterestedReason(""); setInterestLevel(""); setMeetingAt(""); setMeetingLocation("");
      onLogged();
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  }

  return (
    <div className="bg-card-bg border border-card-border rounded-2xl p-5 space-y-3">
      <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider">Log Call Outcome</h3>

      <div className="space-y-1">
        <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Outcome</label>
        <select className="w-full bg-input-bg border border-input-border rounded-xl px-3 py-2 text-xs text-txt-body outline-none" value={outcome} onChange={(e) => setOutcome(e.target.value)}>
          {TELECALLER_OUTCOMES.map((o) => <option key={o} value={o}>{OUTCOME_LABELS[o]}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Customer Interest Level</label>
        <select className="w-full bg-input-bg border border-input-border rounded-xl px-3 py-2 text-xs text-txt-body outline-none" value={interestLevel} onChange={(e) => setInterestLevel(e.target.value)}>
          <option value="">Not specified</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {needsNextContact && (
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Next Contact Date/Time *</label>
          <input type="datetime-local" className="w-full bg-input-bg border border-input-border rounded-xl px-3 py-2 text-xs text-txt-body outline-none" value={nextContactAt} onChange={(e) => setNextContactAt(e.target.value)} />
        </div>
      )}

      {needsReason && (
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Reason (Not Interested) *</label>
          <input className="w-full bg-input-bg border border-input-border rounded-xl px-3 py-2 text-xs text-txt-body outline-none" value={notInterestedReason} onChange={(e) => setNotInterestedReason(e.target.value)} placeholder="e.g. Budget mismatch, already purchased elsewhere…" />
        </div>
      )}

      {needsMeetingDetails && (
        <>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Meeting Date/Time *</label>
            <input type="datetime-local" className="w-full bg-input-bg border border-input-border rounded-xl px-3 py-2 text-xs text-txt-body outline-none" value={meetingAt} onChange={(e) => setMeetingAt(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Meeting Location *</label>
            <input className="w-full bg-input-bg border border-input-border rounded-xl px-3 py-2 text-xs text-txt-body outline-none" value={meetingLocation} onChange={(e) => setMeetingLocation(e.target.value)} placeholder="Site address, office, or meeting point…" />
          </div>
        </>
      )}

      <div className="space-y-1">
        <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Remarks *</label>
        <textarea className="w-full bg-input-bg border border-input-border rounded-xl px-3 py-2 text-xs text-txt-body outline-none min-h-[70px]" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Call notes…" />
      </div>

      <button onClick={handleSubmit} disabled={saving} className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover disabled:opacity-60 transition-all cursor-pointer border-none">
        {saving ? "Saving…" : "Save Call Outcome"}
      </button>
    </div>
  );
}

const SALES_STATUSES = [
  "site_visit_scheduled", "site_visit_completed", "negotiation",
  "booking_confirmed", "closed_won", "closed_lost", "on_hold",
] as const;

const SALES_STATUS_LABELS: Record<string, string> = {
  site_visit_scheduled: "Site Visit Scheduled",
  site_visit_completed: "Site Visit Completed",
  negotiation: "Negotiation",
  booking_confirmed: "Booking Confirmed",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
  on_hold: "On Hold",
};

function SalesStatusForm({ leadId, onUpdated }: { leadId: string; onUpdated: () => void }) {
  const [status, setStatus] = useState<string>("site_visit_scheduled");
  const [remarks, setRemarks] = useState("");
  const [closedLostReason, setClosedLostReason] = useState("");
  const [nextContactAt, setNextContactAt] = useState("");
  const [saving, setSaving] = useState(false);

  const needsReason = status === "closed_lost";

  async function handleSubmit() {
    if (!remarks.trim()) { toast.error("Remarks are required for every status update"); return; }
    if (needsReason && !closedLostReason.trim()) { toast.error("A reason is required to mark Closed Lost"); return; }

    setSaving(true);
    try {
      await api.patch(`/api/leads/${leadId}/status`, {
        status, remarks,
        closedLostReason: closedLostReason || undefined,
        nextContactAt: nextContactAt ? new Date(nextContactAt).toISOString() : undefined,
      });
      toast.success("Lead status updated");
      setRemarks(""); setClosedLostReason(""); setNextContactAt("");
      onUpdated();
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  }

  return (
    <div className="bg-card-bg border border-card-border rounded-2xl p-5 space-y-3">
      <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider">Update Sales Stage</h3>

      <div className="space-y-1">
        <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Status</label>
        <select className="w-full bg-input-bg border border-input-border rounded-xl px-3 py-2 text-xs text-txt-body outline-none" value={status} onChange={(e) => setStatus(e.target.value)}>
          {SALES_STATUSES.map((s) => <option key={s} value={s}>{SALES_STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {needsReason && (
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Reason (Closed Lost) *</label>
          <input className="w-full bg-input-bg border border-input-border rounded-xl px-3 py-2 text-xs text-txt-body outline-none" value={closedLostReason} onChange={(e) => setClosedLostReason(e.target.value)} />
        </div>
      )}

      <div className="space-y-1">
        <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Next Follow-up (optional)</label>
        <input type="datetime-local" className="w-full bg-input-bg border border-input-border rounded-xl px-3 py-2 text-xs text-txt-body outline-none" value={nextContactAt} onChange={(e) => setNextContactAt(e.target.value)} />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Remarks *</label>
        <textarea className="w-full bg-input-bg border border-input-border rounded-xl px-3 py-2 text-xs text-txt-body outline-none min-h-[70px]" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Visit notes, negotiation details…" />
      </div>

      <button onClick={handleSubmit} disabled={saving} className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover disabled:opacity-60 transition-all cursor-pointer border-none">
        {saving ? "Saving…" : "Update Status"}
      </button>
    </div>
  );
}

export default function LeadDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const user = getStoredAdminUser();

  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<{ telecallers: UserRef[]; salesAgents: UserRef[] }>({ telecallers: [], salesAgents: [] });
  const [assigning, setAssigning] = useState(false);
  const [selectedTelecaller, setSelectedTelecaller] = useState("");
  const [selectedSalesAgent, setSelectedSalesAgent] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api.get<{ lead: LeadDetail; activity: Activity[] }>(`/api/leads/${id}`)
      .then((d) => { setLead(d.lead); setActivity(d.activity); })
      .catch(() => toast.error("Could not load lead"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(load, [load]);

  useEffect(() => {
    if (user?.role === "team_leader") {
      api.get<{ telecallers: UserRef[]; salesAgents: UserRef[] }>("/api/leads/my-team").then(setTeamMembers).catch(() => {});
    }
  }, [user?.role]);

  async function handleAssign(field: "telecaller" | "salesAgent", value: string) {
    setAssigning(true);
    try {
      await api.post(`/api/leads/${id}/assign`, { [field]: value });
      toast.success("Lead assigned");
      load();
    } catch (e) { toast.error((e as Error).message); }
    finally { setAssigning(false); }
  }

  if (loading) return <div className="py-20 text-center text-xs text-txt-muted">Loading lead…</div>;
  if (!lead) return <div className="py-20 text-center text-xs text-txt-muted">Lead not found, or you don&apos;t have access to it.</div>;

  const canAssignTelecaller = user?.role === "team_leader" && lead.assignedTeamLeader?._id === user.id;
  const canAssignSalesAgent = user?.role === "team_leader" && lead.assignedTeamLeader?._id === user.id && lead.status === "interested_qualified";
  const canLogCall = user?.role === "telecaller" && lead.assignedTelecaller?._id === user.id;
  const canUpdateSalesStage = user?.role === "sales_agent" && lead.assignedSalesAgent?._id === user.id;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold text-txt-sub uppercase tracking-wider">{lead.leadId}</div>
              <h2 className="text-lg font-bold text-txt-title mt-0.5">{lead.customerName}</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border bg-brand/10 text-brand border-brand/20">{lead.status.replace(/_/g, " ")}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div><div className="text-txt-sub font-semibold uppercase text-[9px] mb-1">Mobile</div><div className="text-txt-title font-bold">{lead.mobile}</div></div>
            <div><div className="text-txt-sub font-semibold uppercase text-[9px] mb-1">Email</div><div className="text-txt-title font-bold">{lead.email ?? "—"}</div></div>
            <div><div className="text-txt-sub font-semibold uppercase text-[9px] mb-1">Property</div><div className="text-txt-title font-bold">{lead.propertyName ?? "—"}</div></div>
            <div><div className="text-txt-sub font-semibold uppercase text-[9px] mb-1">Location</div><div className="text-txt-title font-bold">{lead.location ?? "—"}</div></div>
            <div><div className="text-txt-sub font-semibold uppercase text-[9px] mb-1">Source</div><div className="text-txt-title font-bold capitalize">{lead.source.replace(/_/g, " ")}</div></div>
            <div><div className="text-txt-sub font-semibold uppercase text-[9px] mb-1">Priority</div><div className="text-txt-title font-bold capitalize">{lead.priority}</div></div>
            <div><div className="text-txt-sub font-semibold uppercase text-[9px] mb-1">Next Contact</div><div className="text-txt-title font-bold">{lead.nextContactAt ? formatDate(lead.nextContactAt) : "—"}</div></div>
            <div><div className="text-txt-sub font-semibold uppercase text-[9px] mb-1">Last Contact</div><div className="text-txt-title font-bold">{lead.lastContactAt ? formatDate(lead.lastContactAt) : "—"}</div></div>
          </div>

          {(lead.meetingAt || lead.meetingLocation) && (
            <div className="bg-brand/5 border border-brand/20 rounded-xl p-3 flex items-center gap-4">
              <div className="flex-1">
                <div className="text-brand font-bold uppercase text-[9px] mb-1">Meeting Scheduled</div>
                <div className="text-xs text-txt-title font-bold">{lead.meetingAt ? new Date(lead.meetingAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "Date/time not set"}</div>
              </div>
              <div className="flex-1">
                <div className="text-brand font-bold uppercase text-[9px] mb-1">Location</div>
                <div className="text-xs text-txt-title font-bold">{lead.meetingLocation ?? "—"}</div>
              </div>
            </div>
          )}

          {lead.remarks && (
            <div>
              <div className="text-txt-sub font-semibold uppercase text-[9px] mb-1">Remarks</div>
              <div className="text-xs text-txt-body bg-input-bg rounded-xl p-3">{lead.remarks}</div>
            </div>
          )}
        </div>

        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider mb-4">Activity Timeline</h3>
          <div className="space-y-4">
            {activity.length === 0 && <p className="text-xs text-txt-muted">No activity recorded yet.</p>}
            {activity.map((a) => (
              <div key={a._id} className="flex gap-3 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-txt-title capitalize">{a.action.replace(/_/g, " ")}</div>
                  {a.remarks && <div className="text-txt-body mt-0.5">{a.remarks}</div>}
                  {a.callOutcome && <div className="text-txt-muted mt-0.5">Outcome: {a.callOutcome}</div>}
                  <div className="text-[10px] text-txt-sub mt-1 font-semibold">
                    {a.actor?.name ?? "System"} {a.actorRole ? `(${a.actorRole.replace(/_/g, " ")})` : ""} · {formatDate(a.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-card-bg border border-card-border rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider">Assignment</h3>
          <div className="text-xs space-y-2">
            <div className="flex justify-between"><span className="text-txt-sub">Team Leader</span><span className="font-bold text-txt-title">{lead.assignedTeamLeader?.name ?? "Unassigned"}</span></div>
            <div className="flex justify-between"><span className="text-txt-sub">Telecaller</span><span className="font-bold text-txt-title">{lead.assignedTelecaller?.name ?? "Unassigned"}</span></div>
            <div className="flex justify-between"><span className="text-txt-sub">Sales Agent</span><span className="font-bold text-txt-title">{lead.assignedSalesAgent?.name ?? "Unassigned"}</span></div>
          </div>

          {canAssignTelecaller && (
            <div className="pt-2 space-y-1.5 border-t border-card-border">
              <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Assign Telecaller</label>
              <div className="flex gap-2">
                <select className="flex-1 bg-input-bg border border-input-border rounded-xl px-3 py-2 text-xs text-txt-body outline-none" value={selectedTelecaller} onChange={(e) => setSelectedTelecaller(e.target.value)}>
                  <option value="">Select…</option>
                  {teamMembers.telecallers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                <button disabled={!selectedTelecaller || assigning} onClick={() => handleAssign("telecaller", selectedTelecaller)} className="px-3 py-2 rounded-xl text-[10px] font-bold text-white bg-brand hover:bg-brand-hover disabled:opacity-50 cursor-pointer border-none">Assign</button>
              </div>
            </div>
          )}

          {canAssignSalesAgent && (
            <div className="pt-2 space-y-1.5 border-t border-card-border">
              <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider block">Assign Sales Agent</label>
              <div className="flex gap-2">
                <select className="flex-1 bg-input-bg border border-input-border rounded-xl px-3 py-2 text-xs text-txt-body outline-none" value={selectedSalesAgent} onChange={(e) => setSelectedSalesAgent(e.target.value)}>
                  <option value="">Select…</option>
                  {teamMembers.salesAgents.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                <button disabled={!selectedSalesAgent || assigning} onClick={() => handleAssign("salesAgent", selectedSalesAgent)} className="px-3 py-2 rounded-xl text-[10px] font-bold text-white bg-brand hover:bg-brand-hover disabled:opacity-50 cursor-pointer border-none">Assign</button>
              </div>
            </div>
          )}
        </div>

        {canLogCall && <CallLogForm leadId={id} onLogged={load} />}
        {canUpdateSalesStage && <SalesStatusForm leadId={id} onUpdated={load} />}
      </div>
    </div>
  );
}
