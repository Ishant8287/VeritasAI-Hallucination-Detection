import express from "express";
import { factCheckResponse } from "../middleware/veritas.js";
import { AuditLog } from "../models/AuditLog.js";

const router = express.Router();

router.post("/verify", factCheckResponse);

router.get("/logs", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(),
    ]);

    res.status(200).json({
      status: "success",
      results: logs.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
