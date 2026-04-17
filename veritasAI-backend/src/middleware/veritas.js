import { extractClaims } from "../services/claimExtractor.js";
import { verifyClaims } from "../services/verifier.js";
import { scoreClaim } from "../services/scorer.js";
import { AuditLog } from "../models/AuditLog.js";

const normalizeSource = (source) =>
  source === "llm" ? "llm" : "pinecone";

export const factCheckResponse = async (req, res, next) => {
  try {
    const { llmResponse } = req.body;
    const normalizedResponse =
      typeof llmResponse === "string" ? llmResponse.trim() : "";

    if (!normalizedResponse) {
      return res.status(400).json({
        status: "fail",
        message: "llmResponse is required and must be a non-empty string",
      });
    }

    if (normalizedResponse.length > 10_000) {
      return res.status(400).json({
        status: "fail",
        message: "llmResponse exceeds 10,000 character limit",
      });
    }

    //Extract claims
    const claims = await extractClaims(normalizedResponse);

    if (claims.length === 0) {
      return res.status(200).json({
        status: "success",
        data: {
          claims: [],
          message: "No factual claims found in the response",
        },
      });
    }

    //Verify claims — vector search → evidence
    const verifiedResults = (await verifyClaims(claims)).filter(Boolean);

    //Score each claim — LLM results pass through; KB results go through scoreClaim()
    const finalResults = await Promise.all(
      verifiedResults.map(async (item) => {
        // verifyClaim() already called the LLM → use its verdict directly
        if (item.source === "llm") {
          return {
            claim: item.claim,
            verdict: item.verdict,
            confidence: item.confidence,
            reason: item.reason,
            evidence: [],
            source: normalizeSource(item.source),
          };
        }

        // Auto-learned KB hit (has a stored verdict) → pass through directly
        if (item.verdict) {
          return {
            claim: item.claim,
            verdict: item.verdict,
            confidence: item.confidence,
            reason: item.reason,
            evidence: [],
            source: normalizeSource(item.source),
          };
        }

        // Knowledge base hit with raw evidence — run LLM scorer
        const scored = await scoreClaim(item.claim, item.evidence);
        return {
          claim: item.claim,
          verdict: scored.verdict,
          confidence: scored.confidence,
          reason: scored.reason,
          evidence: item.evidence,
          source: "pinecone",
        };
      }),
    );

    //Save to MongoDB
    const audit = await AuditLog.create({
      originalResponse: normalizedResponse,
      claims: finalResults,
    });

    //Return response
    return res.status(200).json({
      status: "success",
      data: {
        claims: finalResults,
        auditId: audit._id,
      },
    });
  } catch (error) {
    next(error);
  }
};
