import Groq from "groq-sdk";
import { withRetry } from "../utils/retry.js";
import AppError from "../utils/AppError.js";

let groqClient;

export const extractClaims = async (llmResponse) => {
  if (!process.env.GROQ_API_KEY) {
    throw new AppError("Groq API key is not configured", 500);
  }

  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  try {
    const prompt = `
Extract all factual claims from the following text.

Rules:
- Return ONLY a valid JSON array
- No explanation, no extra text
- Keep each claim as close as possible to the original wording from the text
- Do NOT correct, rewrite, explain, or invert any claim
- Do NOT replace false claims with true ones
- If the text says "React is a backend framework", return exactly that claim, not a corrected version
- Prefer verbatim sentence spans from the input
- Example: ["claim 1", "claim 2"]

Text:
${llmResponse}
`;

    const completion = await withRetry(
      () =>
        groqClient.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          temperature: 0,
          messages: [{ role: "user", content: prompt }],
        }),
      { retries: 2, delay: 1000 },
    );

    const output = completion.choices[0].message.content.trim();

    let parsed;
    try {
      const cleaned = output.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.warn("Claim extraction — unparseable LLM output:", output);
      throw new AppError("Claim extraction returned invalid JSON", 502);
    }

    if (!Array.isArray(parsed)) {
      throw new AppError("Claim extraction returned an invalid payload", 502);
    }

    return parsed
      .filter((claim) => typeof claim === "string")
      .map((claim) => claim.trim())
      .filter(Boolean);
  } catch (error) {
    // Surface infrastructure errors so the user knows it's a system failure
    if (error instanceof AppError) {
      throw error;
    }
    if (error.status === 401 || error.status === 403) {
      throw new AppError("Groq API authentication failed", 502);
    }
    if (error.status === 429) {
      throw new AppError("Groq API rate limit exceeded — try again later", 429);
    }
    console.error("Claim extraction error:", error.message);
    throw new AppError("Claim extraction failed", 502);
  }
};
