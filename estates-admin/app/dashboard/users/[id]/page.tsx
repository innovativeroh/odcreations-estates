"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatDate, formatINR, initials } from "@/lib/format";
import toast from "react-hot-toast";

interface User { _id: string; name: string; email: string; phone?: string; role: string; agencyName?: string; isActive?: boolean; createdAt: string; }
interface Enquiry { _id: string; name: string; message: string; status: string; createdAt: string; property: { _id: string; title: string; price: number; city: string } | null; }

const roleColor: Record<string, string> = {
  super_admin: "bg-[#ff5a36]/10 text-[#ff5a36] border-[#ff5a36]/25",
  agent: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  owner: "bg-purple-500/10 text-purple-650 dark:text-purple-400 border-purple-500/20",
  user: "bg-neutral-500/10 text-neutral-500 dark:text-neutral-450 border-neutral-550/20",
};

const statusColor: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
  contacted: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
  closed: "bg-neutral-550/15 text-neutral-550 dark:text-neutral-450 border-neutral-550/20",
};

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingEnquiry, setDeletingEnquiry] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ user: User; enquiries: Enquiry[] }>(`/api/users/${id}`)
      .then((d) => { setUser(d.user); setEnquiries(d.enquiries); })
      .catch(() => toast.error("Failed to load user"))
      .finally(() => setLoading(false));
  }, [id]);

  async function removeEnquiry(eid: string) {
    if (!confirm("Delete this enquiry?")) return;
    setDeletingEnquiry(eid);
    try {
      await api.delete(`/api/enquiries/${eid}`);
      setEnquiries((prev) => prev.filter((e) => e._id !== eid));
      toast.success("Enquiry deleted");
    } catch (e) { toast.error((e as Error).message); }
    finally { setDeletingEnquiry(null); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="w-8 h-8 animate-spin text-brand" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!user) return <p className="text-txt-muted text-sm">User not found.</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/users"
          className="p-2 rounded-xl text-txt-sub hover:text-txt-title hover:bg-neutral-500/5 transition-all border border-card-border"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="text-xs text-txt-muted font-bold">User Profile Summary</span>
      </div>

      {/* Profile card */}
      <div className="bg-card-bg border border-card-border rounded-2xl p-6 flex flex-col md:flex-row gap-5 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-neutral-900/10 border border-card-border flex items-center justify-center flex-shrink-0">
          <span className="text-txt-title text-lg font-bold">{initials(user.name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-bold text-txt-title">{user.name}</h2>
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border ${roleColor[user.role] ?? ""}`}>{user.role.replace(/_/g, " ")}</span>
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border ${user.isActive !== false ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-neutral-500/10 text-neutral-500 border-neutral-550/20"}`}>{user.isActive !== false ? "Active" : "Inactive"}</span>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs text-txt-body">
            <span>Email: <span className="font-bold text-txt-title">{user.email}</span></span>
            <span>Phone: <span className="font-bold text-txt-title">{user.phone ?? "—"}</span></span>
            {user.agencyName && <span className="col-span-1 md:col-span-2">Agency: <span className="font-bold text-txt-title">{user.agencyName}</span></span>}
            <span className="text-txt-sub mt-2">Member since {formatDate(user.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Enquiries */}
      <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-card-border bg-[#0c0c10]/5 dark:bg-[#0c0c10]/20">
          <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider">Submitted Enquiries ({enquiries.length})</h3>
        </div>
        {enquiries.length === 0 ? (
          <div className="px-5 py-10 text-center text-xs text-txt-sub font-medium">No enquiries from this account.</div>
        ) : (
          <div className="divide-y divide-card-border/50">
            {enquiries.map((e) => (
              <div key={e._id} className="px-5 py-4 flex items-start gap-4 hover:bg-neutral-500/5 transition-colors">
                <div className="flex-1 min-w-0">
                  {e.property ? (
                    <div className="text-xs font-bold text-txt-title">{e.property.title}</div>
                  ) : <div className="text-xs text-txt-sub italic">Property details unavailable</div>}
                  {e.property && <div className="text-[10px] text-txt-muted font-semibold mt-0.5">{e.property.city} · {formatINR(e.property.price)}</div>}
                  <p className="text-xs text-txt-body mt-2 leading-relaxed bg-input-bg border border-input-border p-3 rounded-xl">{e.message}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wide border ${statusColor[e.status] ?? ""}`}>{e.status}</span>
                    <span className="text-[10px] text-txt-sub font-semibold">{formatDate(e.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeEnquiry(e._id)}
                  disabled={deletingEnquiry === e._id}
                  className="p-1.5 rounded-xl text-txt-sub hover:text-red-500 hover:bg-red-500/10 border-none transition-colors disabled:opacity-40 flex-shrink-0 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
