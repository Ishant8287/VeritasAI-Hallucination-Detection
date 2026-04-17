const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

/**
 * Verify an LLM response — extracts claims, checks against knowledge base.
 * @param {string} llmResponse — the raw LLM text to fact-check
 */
export async function verifyResponse(llmResponse) {
  const res = await fetch(`${API_BASE}/api/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "123456",
    },
    body: JSON.stringify({ llmResponse }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Verification failed (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}
