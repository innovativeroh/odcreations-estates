"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getStoredAdminUser, roleLabel, type CrmRole } from "@/lib/auth";

// /api/dashboard/stats is super_admin-only — calling it as any other role
// gets a 403, and the shared api client treats any 403 as "log out" and
// bounces back to /login. Only fetch when the badge can actually be shown.
function usePendingCount(role: CrmRole | undefined) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (role !== "super_admin") return;
    api.get<{ pendingProperties: number }>("/api/dashboard/stats")
      .then((s) => setCount(s.pendingProperties))
      .catch(() => {});
  }, [role]);
  return count;
}

interface NavItem {
  label: string;
  href: string;
  badge?: boolean;
  icon: React.ReactNode;
  // Roles that always see this item.
  roles: CrmRole[];
  // For sub_admin: also visible if this permission key is in their granted permissions.
  permission?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const ALL_ROLES: CrmRole[] = ["super_admin", "sub_admin", "team_leader", "telecaller", "sales_agent"];

const sections: NavSection[] = [
  {
    title: "General",
    items: [
      {
        label: "Overview",
        href: "/dashboard",
        roles: ALL_ROLES,
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Lead Management",
    items: [
      {
        label: "Leads",
        href: "/dashboard/leads",
        roles: ["super_admin", "team_leader", "telecaller", "sales_agent"],
        permission: "leads",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        label: "Audit Trail",
        href: "/dashboard/audit-trail",
        roles: ["super_admin"],
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Properties",
    items: [
      {
        label: "Listings",
        href: "/dashboard/properties",
        roles: ["super_admin"],
        permission: "properties",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 21V12h6v9" />
          </svg>
        ),
      },
      {
        label: "Approvals",
        href: "/dashboard/approvals",
        badge: true,
        roles: ["super_admin"],
        permission: "approvals",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Users & Accounts",
    items: [
      {
        label: "Agents",
        href: "/dashboard/agents",
        roles: ["super_admin"],
        permission: "agents",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6a4 4 0 11-8 0 4 4 0 018 0zM12 15v7" />
          </svg>
        ),
      },
      {
        label: "Users List",
        href: "/dashboard/users",
        roles: ["super_admin"],
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        ),
      },
      {
        label: "Teams",
        href: "/dashboard/teams",
        roles: ["super_admin"],
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-3.13a4 4 0 11-8 0 4 4 0 018 0zM17 20v-2a4 4 0 00-4-4H11a4 4 0 00-4 4v2h10z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Inquiries Feed",
    items: [
      {
        label: "Enquiries",
        href: "/dashboard/enquiries",
        roles: ["super_admin"],
        permission: "enquiries",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Site Settings",
    items: [
      {
        label: "Menu Builder",
        href: "/dashboard/menu",
        roles: ["super_admin"],
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        ),
      },
    ],
  },
];

function canSee(item: NavItem, role: CrmRole | undefined, permissions: string[]): boolean {
  if (!role) return false;
  if (role === "super_admin") return true;
  if (item.roles.includes(role)) return true;
  if (role === "sub_admin" && item.permission) return permissions.includes(item.permission);
  return false;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState(getStoredAdminUser());
  const pendingCount = usePendingCount(user?.role);

  useEffect(() => {
    // AuthGuard writes adminUser slightly after mount — pick it up once available.
    if (!user) setUser(getStoredAdminUser());
  }, [user]);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const visibleSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canSee(item, user?.role, user?.permissions ?? [])),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className="w-[220px] flex-shrink-0 bg-card-bg border-r border-card-border flex flex-col h-screen sticky top-0 z-50 transition-colors duration-300">
      {/* Logo Area */}
      <div className="px-5 py-4.5 border-b border-card-border flex items-center gap-2.5 flex-shrink-0">
        <svg viewBox="0 0 32 32" className="w-6.5 h-6.5 drop-shadow-[0_0_8px_rgba(255,90,54,0.1)] flex-shrink-0" fill="none">
          <path d="M4,28V16a3,3 0 0 1 3-3v15Z" fill="#ff5a36" className="opacity-60" />
          <path d="M7,28V13a3,3 0 0 1 3 3v12Z" fill="currentColor" className="text-txt-title" />
          <path d="M12,28V10a3,3 0 0 1 3-3v18Z" fill="#ff5a36" className="opacity-60" />
          <path d="M15,28V7a3,3 0 0 1 3 3v18Z" fill="currentColor" className="text-txt-title" />
          <path d="M20,28V4a3,3 0 0 1 3-3v24Z" fill="#ff5a36" className="opacity-60" />
          <path d="M23,28V1a3,3 0 0 1 3 3v24Z" fill="currentColor" className="text-txt-title" />
        </svg>
        <span className="text-txt-title font-extrabold text-base tracking-tight font-display">Estates</span>
      </div>

      {/* Nav Menu Content */}
      <nav className="flex-1 px-3.5 py-4 overflow-y-auto space-y-4">
        {visibleSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {/* Section Title Header */}
            <div className="text-[9px] font-bold text-txt-sub/60 uppercase tracking-widest px-3.5 mb-1.5">
              {section.title}
            </div>

            {/* Menu Items (Sub Menu list) */}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 group relative ${
                      active
                        ? "bg-brand-light text-brand shadow-[0_0_10px_rgba(255,90,54,0.02)]"
                        : "text-txt-muted hover:text-txt-title hover:bg-neutral-500/5"
                    }`}
                  >
                    <span className={`transition-colors duration-200 ${active ? "text-brand" : "text-txt-sub group-hover:text-txt-muted"}`}>
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && pendingCount > 0 && (
                      <span className="ml-auto flex-shrink-0 min-w-[16px] h-[16px] px-1 rounded-md bg-brand text-white text-[9px] font-extrabold flex items-center justify-center shadow-[0_0_5px_var(--brand)]">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {user && (
        <div className="px-4 py-3.5 border-t border-card-border flex-shrink-0">
          <div className="text-[11px] font-bold text-txt-title truncate">{user.name}</div>
          <div className="text-[9px] font-bold text-txt-sub uppercase tracking-wider mt-0.5">{roleLabel(user.role)}</div>
        </div>
      )}
    </aside>
  );
}
