import cors from "cors";
import express from "express";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

app.disable("x-powered-by");

const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use("/api/reports", reportRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
