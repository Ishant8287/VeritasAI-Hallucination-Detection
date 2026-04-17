import mongoose from "mongoose";

const claimResultSchema = new mongoose.Schema(
  {
    claim: {
      type: String,
      required: true,
      trim: true,
    },
    verdict: {
      type: String,
      enum: ["verified", "true", "false", "unverifiable", "uncertain"],
      default: "unverifiable",
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    reason: {
      type: String,
      default: "",
      trim: true,
    },
    source: {
      type: String,
      enum: ["llm", "knowledge_base", "pinecone"],
      default: "pinecone",
    },
    evidence: [
      {
        score: Number,
        text: String,
        source: String,
      },
    ],
  },
  { _id: false },
);

const auditLogSchema = new mongoose.Schema(
  {
    originalResponse: {
      type: String,
      required: true,
      trim: true,
    },
    claims: [claimResultSchema],
  },
  {
    timestamps: true,
  },
);

// Indexes
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 },
);

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
