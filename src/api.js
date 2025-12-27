const API_BASE = import.meta.env.VITE_API_BASE;
const MASTER_KEY = import.meta.env.VITE_MASTER_KEY;

export async function api(path, { method = "GET", body, isForm = false } = {}) {
  const headers = { "x-master-key": MASTER_KEY };

  if (!isForm) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let msg = "Request failed";
    try {
      const j = await res.json();
      msg = j.message || j.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
