import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { seed } from "./seed.js";
import { ResponseView } from "./views/index.js";
import { authRouter } from "./routes/auth.js";
import { influencersRouter } from "./routes/influencers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(import.meta.url);

const app = express();

// Seed once per cold start (serverless note:  re-run on cold starts)
seed({ n: 2000 });

app.use(helmet());
app.use(compression());
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(morgan("dev"));

// Swagger UI setup
try {
  const swaggerDocument = JSON.parse(
    readFileSync(join(dirname(__filename), "../swagger.json"), "utf8")
  );
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get("/swagger.yaml", (req, res) => {
    res.setHeader("Content-Type", "text/yaml");
    res.sendFile(join(dirname(__filename), "../swagger.yaml"));
  });
  app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.sendFile(join(dirname(__filename), "../swagger.json"));
  });
} catch (error) {
  console.warn("Swagger documentation not loaded:", error.message);
}

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/auth", authRouter);
app.use("/influencers", influencersRouter);

// 404 + error handlers
app.use((_req, res) =>
  res.status(404).json(ResponseView.notFound("Route not found"))
);
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json(ResponseView.internalError());
});

export default app;
