import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { ensureDb } from "./middleware/ensureDb.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import sessionNoteRoutes from "./routes/sessionNoteRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.VERCEL) {
  dotenv.config({ path: path.join(__dirname, "../.env") });
}

function getAllowedOrigins() {
  const origins = new Set(["http://localhost:5173"]);
  if (process.env.CORS_ORIGINS) {
    process.env.CORS_ORIGINS.split(",").forEach((o) => origins.add(o.trim()));
  }
  if (process.env.FRONTEND_URL) {
    origins.add(process.env.FRONTEND_URL.replace(/\/$/, ""));
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.VERCEL_BRANCH_URL) {
    origins.add(`https://${process.env.VERCEL_BRANCH_URL}`);
  }
  return [...origins];
}

const app = express();

app.use(
  cors({
    origin: getAllowedOrigins(),
    credentials: true,
  })
);

app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

app.use(ensureDb);

app.get("/api/health", (_req, res) => {
  const dbState = mongoose.connection?.readyState;
  const dbOk = dbState === 1;
  res.status(dbOk ? 200 : 503).json({
    ok: dbOk,
    db: dbOk ? "connected" : "disconnected",
    env: process.env.VERCEL ? "vercel" : "local",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/session-notes", sessionNoteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/leads", leadRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Ruta API no encontrada" });
});

export default app;
