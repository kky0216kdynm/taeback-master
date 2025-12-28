// src/utils/api.js
const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
const MASTER_KEY = import.meta.env.VITE_MASTER_KEY || "";

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(MASTER_KEY ? { "x-master-key": MASTER_KEY } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // 응답이 JSON이 아닐 수도 있어서 방어
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  del: (path) => request(path, { method: "DELETE" }),
};
