export type CrmRole = "super_admin" | "sub_admin" | "team_leader" | "telecaller" | "sales_agent";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: CrmRole;
  teamId?: string;
  permissions?: string[];
}

export function setAdminUser(user: AdminUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem("adminUser", JSON.stringify(user));
}

export function getStoredAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("adminUser");
  return raw ? (JSON.parse(raw) as AdminUser) : null;
}

export function clearAdminAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
}

const ROLE_LABELS: Record<CrmRole, string> = {
  super_admin: "Super Admin",
  sub_admin: "Sub Admin",
  team_leader: "Team Leader",
  telecaller: "Telecaller",
  sales_agent: "Sales Agent",
};

export function roleLabel(role: string): string {
  return ROLE_LABELS[role as CrmRole] ?? role.replace(/_/g, " ");
}
