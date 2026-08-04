const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function getAgentToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("agentToken");
}

export function getAgentUser(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("agentUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAgentSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("agentToken");
  localStorage.removeItem("agentUser");
}

export async function agentRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAgentToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    clearAgentSession();
    if (typeof window !== "undefined") {
      window.location.href = "/agent/login";
    }
  }
  return res;
}

export const agentApi = {
  get: (path: string) => agentRequest(path, { method: "GET" }),
  post: (path: string, body: unknown) =>
    agentRequest(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path: string, body: unknown) =>
    agentRequest(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path: string, body: unknown) =>
    agentRequest(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => agentRequest(path, { method: "DELETE" }),
};

async function compressImage(file: File, maxPx = 1920, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) {
          height = Math.round((height / width) * maxPx);
          width = maxPx;
        } else {
          width = Math.round((width / height) * maxPx);
          height = maxPx;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context unavailable"));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob failed"));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function uploadToR2(
  file: File,
  folder = "properties",
  tokenOverride?: string | null
): Promise<string> {
  const token = tokenOverride ?? getAgentToken();
  // Compress if image
  let uploadBlob: Blob = file;
  if (file.type.startsWith("image/")) {
    uploadBlob = await compressImage(file);
  }

  // Get presigned URL
  const presignRes = await fetch(`${API_URL}/api/uploads/presign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      filename: file.name,
      contentType: "image/jpeg",
      folder,
    }),
  });
  if (!presignRes.ok) throw new Error("Failed to get presigned URL");
  const { uploadUrl, publicUrl } = await presignRes.json();

  // Upload to R2
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: uploadBlob,
  });
  if (!uploadRes.ok) throw new Error("Upload to R2 failed");

  return publicUrl as string;
}
