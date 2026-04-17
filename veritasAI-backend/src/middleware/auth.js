import AppError from "../utils/AppError.js";

export const requireApiKey = (req, res, next) => {
  const serverKey = process.env.API_SECRET_KEY;

  // If no API key is configured, skip auth (local dev / testing)
  if (!serverKey) return next();

  const clientKey = req.headers["x-api-key"];

  if (!clientKey) {
    return next(new AppError("Missing x-api-key header", 401));
  }

  if (clientKey !== serverKey) {
    return next(new AppError("Invalid API key", 403));
  }

  next();
};
