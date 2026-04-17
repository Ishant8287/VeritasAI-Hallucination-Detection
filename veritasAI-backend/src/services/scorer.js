import Groq from "groq-sdk";
import { withRetry } from "../utils/retry.js";
import AppError from "../utils/AppError.js";

let groqClient;

const toConfidenceScore = (value, fallback = 20) => {
  const numericValue =
    typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)));
};

export const scoreClaim = async (claim, evidence) => {
  if (!Array.isArray(evidence) || evidence.length === 0) {
    return {
      claim,
      verdict: "unverifiable",
      confidence: 20,
      reason: "No relevant documents found",
    };
  }

  if (!process.env.GROQ_API_KEY) {
    throw new AppError("Groq API key is not configured", 500);
  }

  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const evidenceText = evidence
      .map(
        (e, i) =>
          `${i + 1}. [Relevance: ${e.score}%] [Source: ${e.source}] ${e.text}`,
      )
      .join("\n");

    const prompt = `
You are a fact-checking system.

Claim:
"${claim}"

Evidence:
${evidenceText}

Task:
Decide whether the evidence:
- supports the claim
- contradicts the claim
- is unrelated to the claim

Rules:
- Return ONLY valid JSON
- No explanation outside JSON
- Format:
{
  "verdict": "verified | false | unverifiable",
  "confidence": number (0-100),
  "reason": "short explanation"
}
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
      throw new Error("Invalid JSON from LLM");
    }

    const validVerdicts = ["verified", "false", "unverifiable"];
    const normalizedVerdict =
      typeof parsed.verdict === "string" ? parsed.verdict.toLowerCase() : "";

    return {
      claim,
      verdict: validVerdicts.includes(normalizedVerdict)
        ? normalizedVerdict
        : "unverifiable",
      confidence: toConfidenceScore(parsed.confidence),
      reason: parsed.reason || "No explanation provided",
    };
  } catch (error) {
    // Surface infrastructure errors instead of masking them
    if (error.status === 401 || error.status === 403) {
      throw new AppError("Groq API authentication failed", 502);
    }
    if (error.status === 429) {
      throw new AppError("Groq API rate limit exceeded — try again later", 429);
    }
    console.error("Scoring error:", error.message);
    return {
      claim,
      verdict: "unverifiable",
      confidence: 20,
      reason: "LLM scoring failed",
    };
  }
};
