"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getStoredUser, clearAuth, authFetch, type AuthUser } from "@/lib/auth";
import { FiGrid, FiHeart, FiMessageSquare, FiSettings, FiLogOut, FiPlusCircle } from "react-icons/fi";

const sidebarItems = [
  { name: "Overview", href: "/profile", icon: <FiGrid className="w-4 h-4" /> },
  { name: "Post Property", href: "/profile/post-property", icon: <FiPlusCircle className="w-4 h-4" /> },
  { name: "Saved Properties", href: "/profile/saved", icon: <FiHeart className="w-4 h-4" /> },
  { name: "My Enquiries", href: "/profile/contacted", icon: <FiMessageSquare className="w-4 h-4" /> },
  { name: "Account Settings", href: "/profile/settings", icon: <FiSettings className="w-4 h-4" /> },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) { router.push("/login"); return; }
    setUser(stored);
    authFetch("/api/users/profile").then(async (res) => {
      if (!res.ok) { clearAuth(); router.push("/login"); return; }
      const data = await res.json();
      setUser({ id: data._id, name: data.name, email: data.email, role: data.role, phone: data.phone, avatar: data.avatar, createdAt: data.createdAt });
      setLoading(false);
    }).catch(() => setLoading(false));
    setLoading(false);
  }, [router]);

  function handleLogout() {
    clearAuth();
    router.push("/");
  }

  if (!user) return null;

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const joinedYear = user.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

  return (
    <div className="bg-[#F4F0FE] min-h-screen pt-20 pb-24 select-none text-left">
      
      {/* Profile Header Banner */}
      <div className="relative w-full h-[180px] md:h-[220px] overflow-hidden bg-[#18181B]">
        <div className="absolute inset-0 bg-[#18181B]" />
      </div>

      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 md:px-12 relative -mt-16 md:-mt-20 z-10 mb-10">
        <div className="bg-white rounded-[32px] p-6 md:p-8 border border-purple-100/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 text-center sm:text-left">
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-[#18181B] flex-shrink-0 flex items-center justify-center">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-2xl font-extrabold">{initials}</span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl md:text-3xl font-bold text-[#111827] tracking-tight">{user.name}</h1>
                <span className="inline-flex items-center gap-1 bg-[#EAE4FF] text-[#7C3AED] border border-purple-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider capitalize">{user.role}</span>
              </div>
              <p className="text-[#64748B] text-xs font-bold">{user.email} • Member since {joinedYear}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 border border-purple-200/80 hover:bg-rose-50 hover:text-rose-600 text-[#111827] text-xs font-extrabold rounded-full transition-all shadow-xs cursor-pointer justify-center"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <aside className="lg:col-span-3 bg-white rounded-[28px] border border-purple-100/80 shadow-md p-5 text-left">
            <span className="text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-wider block mb-4 px-3">Dashboard Navigation</span>
            <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 pb-2 lg:pb-0 scrollbar-none">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-[#18181B] text-white shadow-xs"
                        : "text-[#64748B] hover:text-[#111827] hover:bg-[#F4F0FE]"
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
          <main className="lg:col-span-9 w-full">{!loading && children}</main>
        </div>
      </div>
    </div>
  );
}
