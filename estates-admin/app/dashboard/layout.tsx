"use client";

import { useEffect, useState, useRef } from "react";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredAdminUser, clearAdminAuth, roleLabel } from "@/lib/auth";
import NotificationBell from "@/components/NotificationBell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(getStoredAdminUser());

  useEffect(() => {
    if (!user) setUser(getStoredAdminUser());
  }, [user]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme ?? "dark";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setMounted(true);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  function handleLogout() {
    clearAdminAuth();
    router.replace("/login");
  }

  // Generate breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);
  const pageName = segments[segments.length - 1] ?? "Overview";
  const formattedPageName = pageName.replace(/_/g, " ").replace(/-/g, " ");

  const adminEmail = user?.email ?? "admin@estates.in";
  const adminName = user?.name ?? "Admin";
  const adminInitials = adminName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const adminRoleLabel = user ? roleLabel(user.role) : "Admin";

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
        {/* Sidebar Navigation */}
        {mounted && <Sidebar />}
        {!mounted && <div className="w-[220px] flex-shrink-0 bg-card-bg border-r border-card-border h-screen" />}
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Top Sticky Header */}
          <header className="h-16 flex-shrink-0 bg-card-bg border-b border-card-border px-6 md:px-8 flex items-center justify-between z-40 sticky top-0 transition-colors duration-300">
            {/* Left: Breadcrumbs & Page title */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-txt-sub uppercase tracking-wider">
                <Link href="/dashboard" className="hover:text-brand transition-colors">
                  Estates
                </Link>
                {segments.map((seg, idx) => {
                  if (seg === "dashboard" && segments.length > 1) return null;
                  const href = "/" + segments.slice(0, idx + 1).join("/");
                  const isLast = idx === segments.length - 1;
                  const label = seg.replace(/_/g, " ").replace(/-/g, " ");
                  return (
                    <span key={seg} className="flex items-center gap-1.5">
                      <span className="opacity-40">/</span>
                      {isLast ? (
                        <span className="text-txt-muted">{label}</span>
                      ) : (
                        <Link href={href} className="hover:text-brand transition-colors">
                          {label}
                        </Link>
                      )}
                    </span>
                  );
                })}
              </div>
              <h1 className="text-sm font-extrabold text-txt-title capitalize tracking-tight font-display mt-0.5">
                {formattedPageName}
              </h1>
            </div>

            {/* Right: Controls & Profile Dropdown */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-card-border hover:bg-neutral-500/5 text-txt-body hover:text-txt-title transition-all cursor-pointer bg-card-bg"
                title={theme === "dark" ? "Light Mode" : "Dark Mode"}
              >
                {theme === "dark" ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                )}
              </button>

              {/* Notification Bell */}
              <NotificationBell />

              {/* Divider */}
              <div className="h-6 w-px bg-card-border" />

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-neutral-500/5 transition-all cursor-pointer border border-transparent hover:border-card-border"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-light border border-brand/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-brand text-xs font-bold">{adminInitials}</span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-txt-title leading-none">{adminName}</div>
                    <div className="text-[9px] text-txt-sub leading-none mt-1 font-semibold">{adminEmail}</div>
                  </div>
                  <svg className={`w-3.5 h-3.5 text-txt-sub transition-transform duration-300 ${profileOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu Card */}
                {profileOpen && (
                  <div className="absolute right-0 top-12 mt-1 w-56 bg-card-bg border border-card-border rounded-2xl shadow-xl z-50 p-2 focus:outline-none animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="px-3.5 py-2.5">
                      <div className="text-xs font-bold text-txt-title">{adminRoleLabel} Portal</div>
                      <div className="text-[10px] text-txt-sub truncate mt-0.5 font-semibold">{adminEmail}</div>
                    </div>
                    <div className="h-px bg-card-border my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all cursor-pointer border-none"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out Account
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-[1400px] mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#171717",
            color: "#fff",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 500,
          },
          success: { iconTheme: { primary: "#34d399", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ff5a36", secondary: "#fff" } },
        }}
      />
    </AuthGuard>
  );
}
