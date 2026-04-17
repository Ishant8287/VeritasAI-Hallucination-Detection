const API_BASE = import.meta.env.VITE_API_URL || "/api";

/**
 * Verify an LLM response — extracts claims, checks against knowledge base.
 * @param {string} llmResponse — the raw LLM text to fact-check
 * @returns {Promise<{ claims: Array, auditId: string }>}
 */
export async function verifyResponse(llmResponse) {
  const res = await fetch(`${API_BASE}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": "123456" },
    body: JSON.stringify({ llmResponse }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Verification failed (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Fetch paginated audit logs.
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<{ data: Array, total: number, page: number, totalPages: number }>}
 */
export async function fetchLogs(page = 1, limit = 20) {
  const res = await fetch(`${API_BASE}/logs?page=${page}&limit=${limit}`, {
    headers: {
      "x-api-key": "123456",
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to fetch logs (${res.status})`);
  }

  return res.json();
}

/**
 * Check backend health.
 * @returns {Promise<{ status: string, uptime: number }>}
 */
export async function checkHealth() {
  const baseUrl = API_BASE.replace(/\/api$/, "");
  const res = await fetch(`${baseUrl}/health`);
  if (!res.ok) throw new Error("Backend unreachable");
  return res.json();
}
