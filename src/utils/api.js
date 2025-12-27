// src/utils/api.js
const BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

function buildQuery(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    usp.append(k, String(v));
  });
  const q = usp.toString();
  return q ? `?${q}` : "";
}

async function request(method, path, { params, body, headers } = {}) {
  const url = `${BASE}${path}${buildQuery(params)}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { success: false, message: text || "Invalid JSON response" };
  }

  if (!res.ok) {
    return {
      success: false,
      status: res.status,
      ...data,
    };
  }
  return data;
}

export const api = {
  get: (path, params, opts) => request("GET", path, { params, ...(opts || {}) }),
  post: (path, body, opts) => request("POST", path, { body, ...(opts || {}) }),
  patch: (path, body, opts) => request("PATCH", path, { body, ...(opts || {}) }),
  del: (path, opts) => request("DELETE", path, { ...(opts || {}) }),
};
