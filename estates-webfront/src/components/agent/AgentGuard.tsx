"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAgentToken, clearAgentSession } from "@/lib/agentAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function AgentGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "redirect">("loading");

  useEffect(() => {
    async function validate() {
      const token = getAgentToken();
      if (!token) {
        setStatus("redirect");
        router.replace("/agent/login");
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (res.status === 401 || res.status === 403) {
          clearAgentSession();
          setStatus("redirect");
          router.replace("/agent/login");
          return;
        }
        // Any other status (including network errors caught below) → let through
        setStatus("ok");
      } catch {
        // Network down — still let the user in; per-page API calls will show errors
        setStatus("ok");
      }
    }
    validate();
  }, [router]);

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
          <p className="text-sm text-neutral-400 font-medium">Verifying session…</p>
        </div>
      </div>
    );
  }

  if (status === "redirect") return null;

  return <>{children}</>;
}
