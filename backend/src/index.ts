import express from "express";
import cors from "cors";
import "dotenv/config";
import { healthRouter } from "./routes/health";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRouter);
app.use("/api/v1/health", healthRouter);

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`HealthGuard API listening on :${port}`);
});
