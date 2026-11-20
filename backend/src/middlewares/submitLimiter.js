import rateLimit from "express-rate-limit";

export const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: "error",
      message: "Too many reports submitted. Try again later.",
    });
  },
});
