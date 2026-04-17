import { createHash } from "crypto";
import Groq from "groq-sdk";
import { getIndex } from "../config/pinecone.js";
import { getEmbedding } from "../utils/embeddings.js";
import AppError from "../utils/AppError.js";
import { withRetry } from "../utils/retry.js";

const PINECONE_SCORE_THRESHOLD = 0.75;
const LLM_MODEL = "llama-3.3-70b-versatile";
const PINECONE_WRITE_CONFIRMATION_ATTEMPTS = 5;
const PINECONE_WRITE_CONFIRMATION_DELAY_MS = 150;
const CLAIM_CACHE_VERSION = "v2";

let groqClient;
const getGroqClient = () => {
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
};

const normalizeClaim = (claim) =>
  claim.trim().replace(/\s+/g, " ").toLowerCase();

const toConfidenceScore = (value) => {
  const numericValue =
    typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)));
};

const getClaimCacheId = (claim) =>
  `llm-cache-${CLAIM_CACHE_VERSION}-${createHash("sha256").update(normalizeClaim(claim)).digest("hex").slice(0, 24)}`;

const isAutoLearnedMatch = (match) =>
  match?.metadata?.source === "llm-auto-learned";

const toCachedClaimResult = (claim, metadata) => ({
  claim,
  verdict: metadata?.verdict || "uncertain",
  confidence: toConfidenceScore(metadata?.confidence),
  reason: metadata?.reason || "Previously verified",
  source: "pinecone",
});

const getCachedLLMResultFromPinecone = async (claim) => {
  const index = getIndex();
  const cacheId = getClaimCacheId(claim);
  const fetchResult = await withRetry(() => index.fetch([cacheId]), {
    retries: 2,
    delay: 500,
  });

  const cachedRecord = fetchResult.records?.[cacheId];
  if (!cachedRecord || cachedRecord.metadata?.source !== "llm-auto-learned") {
    return null;
  }

  return {
    ...toCachedClaimResult(claim, cachedRecord.metadata),
  };
};

const waitForPineconeRecord = async (index, cacheId) => {
  for (
    let attempt = 0;
    attempt < PINECONE_WRITE_CONFIRMATION_ATTEMPTS;
    attempt += 1
  ) {
    const fetchResult = await withRetry(() => index.fetch([cacheId]), {
      retries: 1,
      delay: 250,
    });

    if (fetchResult.records?.[cacheId]) {
      return true;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, PINECONE_WRITE_CONFIRMATION_DELAY_MS * (attempt + 1)),
    );
  }

  return false;
};

const verifyClaimWithLLM = async (claim) => {
  if (!process.env.GROQ_API_KEY) {
    throw new AppError("Groq API key is not configured", 500);
  }

  const prompt = `You are a rigorous fact-checking assistant.

Claim: "${claim}"

Evaluate the claim solely on your knowledge. Return ONLY valid JSON — no text outside the JSON object.

Format:
{
  "verdict": "true" | "false" | "uncertain",
  "confidence": <integer 0-100>,
  "reason": "<concise one-sentence explanation>"
}`;

  const completion = await withRetry(
    () =>
      getGroqClient().chat.completions.create({
        model: LLM_MODEL,
        temperature: 0,
        messages: [{ role: "user", content: prompt }],
      }),
    { retries: 2, delay: 1000 },
  );

  const raw = completion.choices[0].message.content.trim();
  const cleaned = raw.replace(/```json|```/g, "").trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Invalid JSON returned by LLM");
  }

  const validVerdicts = ["true", "false", "uncertain"];
  const normalizedVerdict =
    typeof parsed.verdict === "string" ? parsed.verdict.toLowerCase() : "";

  return {
    verdict: validVerdicts.includes(normalizedVerdict)
      ? normalizedVerdict
      : "uncertain",
    confidence: toConfidenceScore(parsed.confidence),
    reason: parsed.reason || "No explanation provided",
  };
};

const storeLLMResultInPinecone = async (claim, llmResult, claimVector) => {
  try {
    const index = getIndex();
    const id = getClaimCacheId(claim);
    await index.upsert([
      {
        id,
        values: claimVector,
        metadata: {
          text: claim,
          originalClaim: claim,
          normalizedClaim: normalizeClaim(claim),
          source: "llm-auto-learned",
          verdict: llmResult.verdict,
          confidence: llmResult.confidence,
          reason: llmResult.reason,
          learnedAt: new Date().toISOString(),
        },
      },
    ]);

    const confirmed = await waitForPineconeRecord(index, id);
    if (!confirmed) {
      console.warn(
        `[Pinecone] Record not yet visible after upsert for: "${claim}"`,
      );
    }
  } catch (err) {
    console.warn("Auto-learning upsert failed:", err.message);
  }
};

export const verifyClaim = async (claim) => {
  if (!claim || typeof claim !== "string") {
    return { claim, evidence: [] };
  }

  const normalizedClaim = normalizeClaim(claim);
  let queryVector = [];

  try {
    const cachedLLMResult = await getCachedLLMResultFromPinecone(claim);
    if (cachedLLMResult) {
      return cachedLLMResult;
    }

    queryVector = await getEmbedding(claim);
    if (!queryVector || queryVector.length === 0) {
      throw new Error("Embedding failed");
    }

    //Pinecone query
    const index = getIndex();
    const result = await withRetry(
      () =>
        index.query({
          vector: queryVector,
          topK: 3,
          includeMetadata: true,
        }),
      { retries: 2, delay: 1000 },
    );

    const matches = result.matches || [];
    const exactAutoLearnedMatch = matches.find(
      (match) =>
        isAutoLearnedMatch(match) &&
        match.metadata?.normalizedClaim === normalizedClaim,
    );

    if (exactAutoLearnedMatch) {
      return toCachedClaimResult(claim, exactAutoLearnedMatch.metadata);
    }

    const knowledgeBaseMatches = matches.filter(
      (match) => !isAutoLearnedMatch(match),
    );
    const topKnowledgeBaseScore = knowledgeBaseMatches[0]?.score ?? 0;

    //Strong Pinecone match → use knowledge-base evidence
    if (topKnowledgeBaseScore >= PINECONE_SCORE_THRESHOLD) {
      const evidence = knowledgeBaseMatches.map((m) => ({
        score: Math.round(m.score * 100),
        text: m.metadata?.text || "No content",
        source: m.metadata?.source || "unknown",
      }));

      return {
        claim,
        evidence,
        source: "pinecone",
      };
    }

    //LLM fallback (ALWAYS)
    const llmResult = await verifyClaimWithLLM(claim);
    await storeLLMResultInPinecone(claim, llmResult, queryVector);

    //Return LLM result
    return {
      claim,
      verdict: llmResult.verdict,
      confidence: llmResult.confidence,
      reason: llmResult.reason,
      source: "llm",
    };
  } catch (error) {
    console.error("Verification error:", error.message);

    if (error instanceof AppError) {
      throw error;
    }
    if (error.status === 401 || error.status === 403) {
      throw new AppError("Groq API authentication failed", 502);
    }
    if (error.status === 429) {
      throw new AppError("Groq API rate limit exceeded — try again later", 429);
    }

    try {
      const llmResult = await verifyClaimWithLLM(claim);
      if (queryVector.length > 0) {
        await storeLLMResultInPinecone(claim, llmResult, queryVector);
      }
      return {
        claim,
        verdict: llmResult.verdict,
        confidence: llmResult.confidence,
        reason: llmResult.reason,
        source: "llm",
      };
    } catch (fallbackError) {
      if (fallbackError instanceof AppError) {
        throw fallbackError;
      }
      if (fallbackError.status === 401 || fallbackError.status === 403) {
        throw new AppError("Groq API authentication failed", 502);
      }
      if (fallbackError.status === 429) {
        throw new AppError(
          "Groq API rate limit exceeded — try again later",
          429,
        );
      }

      return {
        claim,
        verdict: "uncertain",
        confidence: 0,
        reason: "All verification failed",
        source: "llm",
      };
    }
  }
};
export const verifyClaims = async (claims) => {
  if (!Array.isArray(claims) || claims.length === 0) return [];

  const claimPromises = new Map();

  return Promise.all(
    claims.map((claim) => {
      const normalizedClaim = normalizeClaim(claim);

      if (!claimPromises.has(normalizedClaim)) {
        claimPromises.set(normalizedClaim, verifyClaim(claim));
      }

      return claimPromises.get(normalizedClaim);
    }),
  );
};
