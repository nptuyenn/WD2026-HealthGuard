import express from "express";
import cors from "cors";
import "dotenv/config";
import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";
import { meRouter } from "./routes/me";
import { profilesRouter } from "./routes/profiles";
import { emergencyCardsRouter } from "./routes/emergency-cards";
import { emergencyPublicRouter } from "./routes/emergency-public";
import { medicationsRouter } from "./routes/medications";
import { medicationLogsRouter } from "./routes/medication-logs";
import { appointmentsRouter } from "./routes/appointments";
import { errorHandler } from "./middleware/error";

const app = express();

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());

app.use("/health", healthRouter);
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/me", meRouter);
app.use("/api/v1/profiles", profilesRouter);
app.use("/api/v1/profiles/:profileId/emergency-card", emergencyCardsRouter);
app.use("/api/v1/profiles/:profileId/medications", medicationsRouter);
app.use("/api/v1/profiles/:profileId/appointments", appointmentsRouter);
app.use("/api/v1/medication-logs", medicationLogsRouter);
app.use("/emergency", emergencyPublicRouter);

app.use(errorHandler);

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`HealthGuard API listening on :${port}`);
});
