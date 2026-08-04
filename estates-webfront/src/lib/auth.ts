const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  createdAt?: string;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userToken");
}

export function setAuth(token: string, user: AuthUser) {
  localStorage.setItem("userToken", token);
  localStorage.setItem("userInfo", JSON.stringify(user));
  window.dispatchEvent(new Event("auth-change"));
}

export function clearAuth() {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("agentToken");
  localStorage.removeItem("agentUser");
  window.dispatchEvent(new Event("auth-change"));
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("userInfo");
  return u ? JSON.parse(u) : null;
}

export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  return fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
}

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Login failed");
  setAuth(data.token, data.user);
  // If the account has agent-level access, also seed the agent session
  // so the same email works on both portals without a second login.
  if (["agent", "owner", "super_admin"].includes(data.user.role)) {
    localStorage.setItem("agentToken", data.token);
    localStorage.setItem("agentUser", JSON.stringify(data.user));
  }
  return data.user;
}

export async function signupUser(name: string, email: string, password: string, phone?: string): Promise<AuthUser> {
  const res = await fetch(`${API}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, ...(phone ? { phone } : {}) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Signup failed");
  setAuth(data.token, data.user);
  return data.user;
}

export async function fetchMe(): Promise<AuthUser> {
  const res = await authFetch("/api/auth/me");
  if (!res.ok) { clearAuth(); throw new Error("Session expired"); }
  return res.json();
}
