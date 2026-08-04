"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setAdminUser, clearAdminAuth, type CrmRole } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const CRM_ROLES: CrmRole[] = ["super_admin", "sub_admin", "team_leader", "telecaller", "sales_agent"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    // Verify the token is still valid AND belongs to one of the 5 CRM roles.
    // A stale / wrong-role token gets caught here before any page loads.
    fetch(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          clearAdminAuth();
          router.replace("/login");
          return;
        }
        const user = await res.json();
        if (!CRM_ROLES.includes(user.role)) {
          clearAdminAuth();
          router.replace("/login");
          return;
        }
        setAdminUser({ id: user._id, name: user.name, email: user.email, role: user.role, teamId: user.teamId, permissions: user.permissions });
        setReady(true);
      })
      .catch(() => {
        // Network down — show dashboard optimistically so the server
        // error messages appear per-page rather than a blank screen.
        setReady(true);
      });
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <svg className="w-7 h-7 animate-spin text-neutral-300" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return <>{children}</>;
}
