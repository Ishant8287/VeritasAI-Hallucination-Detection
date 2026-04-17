import express from "express";
import crypto from "crypto";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import AppError from "./src/utils/AppError.js";
import proxyRouter from "./src/routes/proxy.js";
import { requireApiKey } from "./src/middleware/auth.js";

const app = express();

// Trust proxy
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// Request ID — enables tracing a single request across all log lines
app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("x-request-id", req.id);
  next();
});

// Request logging — concise in production, verbose in dev
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Gzip compression for all responses
app.use(compression());

// Rate limiting — prevent abuse on the verify endpoint
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests — please try again later",
  },
});

// CORS
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((url) => url.trim());

const isDev = process.env.NODE_ENV !== "production";

app.use(
  cors({
    origin: isDev
      ? true // allow all origins in development
      : (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new AppError("Not allowed by CORS", 403));
          }
        },
    credentials: true,
  }),
);

// Body parser
app.use(express.json({ limit: "1mb" }));


app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Backend is live",
    endpoints: {
      health: "/health",
      api: "/api",
    },
  });
});

// Health check — useful for uptime monitors and load balancers
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Routes — rate limited + optionally authenticated
app.use("/api", apiLimiter, requireApiKey, proxyRouter);

// 404 fallback
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// Global error middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.error("UNEXPECTED ERROR:", err);
  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
});

export default app;
