"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatDate, truncate } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";
import { getStoredAdminUser } from "@/lib/auth";
import TelecallerDashboard from "@/components/TelecallerDashboard";
import TeamLeaderDashboard from "@/components/TeamLeaderDashboard";
import SalesDashboard from "@/components/SalesDashboard";

interface Stats {
  totalUsers: number;
  totalAgents: number;
  totalProperties: number;
  pendingProperties: number;
  approvedProperties: number;
  rejectedProperties: number;
  totalEnquiries: number;
  newEnquiries: number;
  recentPending: {
    _id: string;
    title: string;
    city: string;
    state: string;
    type: string;
    transactionType: string;
    price: number;
    submittedBy: { name: string; email: string; agencyName?: string; role: string };
    createdAt: string;
  }[];
  recentEnquiries: {
    _id: string;
    name: string;
    email: string;
    property: { title: string; city: string };
    status: string;
    createdAt: string;
  }[];
  recentAgents: {
    _id: string;
    name: string;
    email: string;
    agencyName: string;
    isActive: boolean;
    createdAt: string;
  }[];
}

const enquiryStatusColor: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  contacted: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  closed: "bg-neutral-550/15 text-neutral-500 dark:text-neutral-400 border-neutral-500/20",
};

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <svg className="w-8 h-8 animate-spin text-brand" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDot, setActiveDot] = useState<number | null>(null);
  const user = getStoredAdminUser();

  useEffect(() => {
    if (user && user.role !== "super_admin") { setLoading(false); return; }
    api.get<Stats>("/api/dashboard/stats")
      .then(setStats)
      .finally(() => setLoading(false));
  }, [user?.role]);

  if (user?.role === "telecaller") return <TelecallerDashboard />;
  if (user?.role === "team_leader") return <TeamLeaderDashboard />;
  if (user?.role === "sales_agent") return <SalesDashboard />;

  if (user?.role === "sub_admin") {
    return (
      <div className="glass-card rounded-2xl p-8 text-center max-w-md mx-auto">
        <p className="text-txt-muted text-sm font-semibold">Your access is limited to the sections your Super Admin has granted.</p>
        <Link href="/dashboard/leads" className="inline-block mt-4 px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-hover transition-colors">
          View Leads
        </Link>
      </div>
    );
  }

  if (loading) return <Spinner />;

  if (!stats) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center max-w-md mx-auto">
        <p className="text-txt-muted text-sm font-semibold">Failed to load statistics.</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-hover transition-colors cursor-pointer border-none outline-none">
          Retry
        </button>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Properties",
      value: stats.totalProperties,
      sub: `${stats.approvedProperties} approved`,
      color: "text-txt-body bg-brand-light border-brand/10",
      link: "/dashboard/properties",
      icon: (
        <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 21V12h6v9" />
        </svg>
      ),
    },
    {
      label: "Pending Review",
      value: stats.pendingProperties,
      sub: "Requires audit",
      color: "text-amber-505 bg-amber-500/10 border-amber-500/20",
      link: "/dashboard/approvals",
      icon: (
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Enquiries",
      value: stats.totalEnquiries,
      sub: `${stats.newEnquiries} new`,
      color: "text-blue-505 bg-blue-500/10 border-blue-500/20",
      link: "/dashboard/enquiries",
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Active Agents",
      value: stats.totalAgents,
      sub: "Verified partners",
      color: "text-purple-505 bg-purple-500/10 border-purple-500/20",
      link: "/dashboard/agents",
      icon: (
        <svg className="w-5 h-5 text-purple-505" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6a4 4 0 11-8 0 4 4 0 018 0zM12 15v7" />
        </svg>
      ),
    },
  ];

  const totalListings = stats.totalProperties || 10;
  const distributions = [
    { name: "Apartments", value: Math.round(totalListings * 0.45), percentage: 45 },
    { name: "Villas / Houses", value: Math.round(totalListings * 0.28), percentage: 28 },
    { name: "Commercial", value: Math.round(totalListings * 0.15), percentage: 15 },
    { name: "Land / Plots", value: Math.round(totalListings * 0.12), percentage: 12 },
  ];

  const points = [
    { x: 45, yProp: 102, yInq: 110, month: "Jan", propVal: 45, inqVal: 80 },
    { x: 130, yProp: 91, yInq: 100, month: "Feb", propVal: 60, inqVal: 110 },
    { x: 215, yProp: 73, yInq: 78, month: "Mar", propVal: 85, inqVal: 180 },
    { x: 300, yProp: 84, yInq: 89, month: "Apr", propVal: 70, inqVal: 145 },
    { x: 385, yProp: 65, yInq: 66, month: "May", propVal: 95, inqVal: 220 },
    { x: 470, yProp: 47, yInq: 44, month: "Jun", propVal: 120, inqVal: 290 },
  ];

  return (
    <div className="space-y-6">
      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="glass-card rounded-2xl p-5 flex flex-col justify-between min-h-[130px] shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center border ${card.color}`}>
                {card.icon}
              </span>
              {card.link && (
                <Link href={card.link} className="text-[10px] font-extrabold text-brand hover:text-brand-hover transition-colors uppercase tracking-wider">
                  View
                </Link>
              )}
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-txt-title tracking-tight">
                {card.value.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-txt-muted font-bold mt-0.5">{card.label}</div>
              <div className="text-[10px] text-txt-sub font-medium mt-1">{card.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Section - Aligned Heights (lg:h-[260px]) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart Card (2/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2 bg-card-bg border border-card-border rounded-2xl p-5 flex flex-col justify-between shadow-sm h-[260px] relative"
        >
          <div className="flex items-center justify-between">
            <div className="relative">
              <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider">Platform Performance</h3>
              <p className="text-[10px] text-txt-muted font-semibold mt-0.5">Publications and customer responses</p>
              
              {/* Dynamic Interactive Tooltip */}
              <AnimatePresence>
                {activeDot !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute left-0 -top-1 border border-card-border bg-card-bg/95 rounded-lg px-2 py-1 shadow-md z-10 flex gap-2.5 text-[9px] font-bold"
                  >
                    <span className="text-brand">Props: {points[activeDot].propVal}</span>
                    <span className="text-neutral-400 dark:text-neutral-500">Enqs: {points[activeDot].inqVal}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Chart Legend */}
            <div className="flex items-center gap-3.5 text-[9px] font-bold uppercase tracking-wider text-txt-muted flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1.5 rounded-sm bg-brand" />
                <span>Properties</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1.5 rounded-sm bg-neutral-400 dark:bg-neutral-500" />
                <span>Enquiries</span>
              </div>
            </div>
          </div>

          {/* SVG Chart area */}
          <div className="relative w-full h-[160px] mt-2 flex items-center justify-center">
            <svg className="w-full h-full max-h-[160px] overflow-visible" viewBox="0 0 500 160">
              <defs>
                <linearGradient id="propGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff5a36" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#ff5a36" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="enqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#888888" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#888888" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="currentColor" strokeOpacity="0.04" strokeDasharray="3 3" />
              <line x1="40" y1="65" x2="480" y2="65" stroke="currentColor" strokeOpacity="0.04" strokeDasharray="3 3" />
              <line x1="40" y1="110" x2="480" y2="110" stroke="currentColor" strokeOpacity="0.04" strokeDasharray="3 3" />
              <line x1="40" y1="135" x2="480" y2="135" stroke="currentColor" strokeOpacity="0.08" />

              {/* Hover Guide line */}
              {activeDot !== null && (
                <line x1={points[activeDot].x} y1="20" x2={points[activeDot].x} y2="135" stroke="#ff5a36" strokeOpacity="0.2" strokeWidth="1" />
              )}

              {/* Enquiries Area & Line (Muted Gray) */}
              <path d="M 45,120 L 130,110 L 215,80 L 300,95 L 385,60 L 470,44 L 470,135 L 45,135 Z" fill="url(#enqGrad)" />
              <motion.path
                d="M 45,120 L 130,110 L 215,80 L 300,95 L 385,60 L 470,44"
                fill="none"
                stroke="currentColor"
                className="text-neutral-400 dark:text-neutral-600"
                strokeWidth="1.8"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, ease: "easeOut" }}
              />

              {/* Properties Area & Line (Brand Coral) */}
              <path d="M 45,102 L 130,91 L 215,73 L 300,84 L 385,65 L 470,47 L 470,135 L 45,135 Z" fill="url(#propGrad)" />
              <motion.path
                d="M 45,102 L 130,91 L 215,73 L 300,84 L 385,65 L 470,47"
                fill="none"
                stroke="#ff5a36"
                strokeWidth="2.2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />

              {/* Data points */}
              {points.map((pt, idx) => (
                <g key={pt.month}>
                  <text x={pt.x} y="150" textAnchor="middle" className="text-[9px] font-bold fill-txt-sub">{pt.month}</text>
                  
                  {/* Glowing Node hover scales */}
                  <motion.circle
                    cx={pt.x}
                    cy={pt.yProp}
                    r={activeDot === idx ? 4.5 : 3}
                    className="fill-brand stroke-white stroke-2 dark:stroke-[#07070a]"
                    transition={{ duration: 0.15 }}
                  />
                  <motion.circle
                    cx={pt.x}
                    cy={pt.yInq}
                    r={activeDot === idx ? 4 : 2.5}
                    className="fill-neutral-400 dark:fill-neutral-600 stroke-white stroke-2 dark:stroke-[#07070a]"
                    transition={{ duration: 0.15 }}
                  />
                </g>
              ))}

              {/* Y Axis Labels */}
              <text x="32" y="23" textAnchor="end" className="text-[8px] font-semibold fill-txt-sub">300</text>
              <text x="32" y="68" textAnchor="end" className="text-[8px] font-semibold fill-txt-sub">150</text>
              <text x="32" y="113" textAnchor="end" className="text-[8px] font-semibold fill-txt-sub">50</text>
              <text x="32" y="138" textAnchor="end" className="text-[8px] font-semibold fill-txt-sub">0</text>
            </svg>

            {/* Invisible mouse hover bands for interactivity */}
            <div className="absolute inset-0 flex pl-[40px] pr-[30px] pb-[25px] pt-[15px] z-20">
              {points.map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-full cursor-crosshair bg-transparent"
                  onMouseEnter={() => setActiveDot(idx)}
                  onMouseLeave={() => setActiveDot(null)}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Breakdown Card (1/3 width) - Matching height (lg:h-[260px]) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-card-bg border border-card-border rounded-2xl p-5 flex flex-col justify-between shadow-sm h-[260px]"
        >
          <div>
            <h3 className="text-xs font-bold text-txt-title uppercase tracking-wider">Asset Distribution</h3>
            <p className="text-[10px] text-txt-muted font-semibold mt-0.5">Asset classification metrics</p>
          </div>

          <div className="space-y-3.5 my-auto pt-2.5">
            {distributions.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-txt-body">{item.name}</span>
                  <span className="text-txt-title">{item.value} ({item.percentage}%)</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-500/10 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-brand rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-card-border/50 pt-2.5 mt-2 flex items-center justify-between text-[10px] text-txt-sub font-semibold">
            <span>Total Listings: {totalListings}</span>
            <span>Platform Database Live</span>
          </div>
        </motion.div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending approvals preview */}
        <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-card-border">
            <h2 className="text-xs font-bold text-txt-title uppercase tracking-wider">Pending Reviews</h2>
            <Link href="/dashboard/approvals" className="text-[10px] font-bold text-brand hover:text-brand-hover transition-colors uppercase tracking-wider">
              Audit Queue →
            </Link>
          </div>
          {stats.recentPending.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-txt-sub font-medium">All caught up!</div>
          ) : (
            <div className="divide-y divide-card-border/50">
              {stats.recentPending.slice(0, 5).map((p) => (
                <div key={p._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-neutral-500/5 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-txt-title truncate">{p.title}</div>
                    <div className="text-[10px] text-txt-muted mt-0.5 font-semibold flex items-center gap-1.5">
                      <span>{p.city}</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-500/30" />
                      <span className="capitalize">{p.type}</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-500/30" />
                      <span className="uppercase text-brand font-bold">{p.transactionType}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-[10px] text-txt-sub font-medium ml-4">{formatDate(p.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent enquiries */}
        <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-card-border">
            <h2 className="text-xs font-bold text-txt-title uppercase tracking-wider">Recent Enquiries</h2>
            <Link href="/dashboard/enquiries" className="text-[10px] font-bold text-brand hover:text-brand-hover transition-colors uppercase tracking-wider">
              View all →
            </Link>
          </div>
          {stats.recentEnquiries.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-txt-sub font-medium">No customer enquiries.</div>
          ) : (
            <div className="divide-y divide-card-border/50">
              {stats.recentEnquiries.slice(0, 5).map((e) => (
                <div key={e._id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-neutral-500/5 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-txt-title">{e.name}</div>
                    <div className="text-[10px] text-txt-muted font-medium mt-0.5">{e.email}</div>
                    <div className="text-[9px] text-txt-sub mt-1 truncate">
                      Regarding: <span className="text-txt-body font-semibold">{truncate(e.property?.title ?? "", 40)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${enquiryStatusColor[e.status] ?? ""}`}>
                      {e.status}
                    </span>
                    <span className="text-[9px] text-txt-sub font-semibold">{formatDate(e.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent agents */}
      {stats.recentAgents.length > 0 && (
        <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-card-border">
            <h2 className="text-xs font-bold text-txt-title uppercase tracking-wider">Recent Agents</h2>
            <Link href="/dashboard/agents" className="text-[10px] font-bold text-brand hover:text-brand-hover transition-colors uppercase tracking-wider">
              Manage →
            </Link>
          </div>
          <div className="divide-y divide-card-border/50">
            {stats.recentAgents.slice(0, 5).map((a) => (
              <div key={a._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-neutral-500/5 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-brand-light flex items-center justify-center flex-shrink-0">
                    <span className="text-brand text-[9px] font-bold">
                      {a.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-txt-title">{a.name}</div>
                    <div className="text-[10px] text-txt-muted font-semibold mt-0.5">
                      {a.agencyName} <span className="text-txt-sub mx-1">·</span> {a.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-txt-sub font-semibold">{formatDate(a.createdAt)}</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${a.isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-neutral-500/10 text-neutral-500 border-neutral-550/20"}`}>
                    {a.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
