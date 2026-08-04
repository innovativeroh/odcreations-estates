"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AgentGuard from "@/components/agent/AgentGuard";
import { getAgentUser, clearAgentSession, agentApi } from "@/lib/agentAuth";

const navItems = [
  {
    name: "Dashboard",
    href: "/agent/dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: "Submit Property",
    href: "/agent/submit",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    name: "My Listings",
    href: "/agent/listings",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    name: "Account",
    href: "/agent/account",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

function AgentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setUser(getAgentUser());
  }, []);

  async function handleLogout() {
    try {
      await agentApi.post("/api/auth/logout", {});
    } catch {
      // ignore
    }
    clearAgentSession();
    router.push("/agent/login");
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-20 left-0 right-0 z-40 bg-white border-b border-neutral-100 px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Agent Portal</span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-neutral-600 hover:text-neutral-900"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden fixed top-[calc(5rem+49px)] left-0 right-0 z-40 bg-white border-b border-neutral-100 shadow-lg px-4 py-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${active ? "bg-neutral-950 text-white" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"}`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all mt-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white rounded-[32px] border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] p-6 sticky top-[6.5rem] self-start">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-4 px-4">
          Agent Portal
        </span>
        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all ${active ? "bg-neutral-950 text-white shadow-md shadow-neutral-950/5" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"}`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Agent info + logout */}
        <div className="border-t border-neutral-100 mt-6 pt-6">
          {user && (
            <div className="px-4 mb-4">
              <p className="text-xs font-bold text-neutral-800 truncate">
                {String(user.name ?? user.email ?? "Agent")}
              </p>
              {Boolean(user.agencyName) && (
                <p className="text-[10px] text-neutral-400 font-medium mt-0.5 truncate">
                  {String(user.agencyName)}
                </p>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default function AgentProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AgentGuard>
      <div className="bg-[#f8f9fa] min-h-screen pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <div className="flex gap-8 items-start">
            <AgentSidebar />
            <main className="flex-1 min-w-0 mt-14 lg:mt-0">{children}</main>
          </div>
        </div>
      </div>
    </AgentGuard>
  );
}
