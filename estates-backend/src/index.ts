import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import { connectDB } from "./config/db";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth";
import propertyRoutes from "./routes/properties";
import agentRoutes from "./routes/agents";
import enquiryRoutes from "./routes/enquiries";
import userRoutes from "./routes/users";
import teamRoutes from "./routes/teams";
import leadRoutes from "./routes/leads";
import notificationRoutes from "./routes/notifications";
import uploadRoutes from "./routes/uploads";
import dashboardRoutes from "./routes/dashboard";
import menuRoutes from "./routes/menu";

const app = express();
const PORT = process.env.PORT ?? 4000;

const allowedOrigins = [
  process.env.CORS_ORIGIN ?? "http://localhost:3000",
  process.env.ADMIN_URL ?? "http://localhost:3001",
].filter(Boolean);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Swagger UI
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  swaggerOptions: { persistAuthorization: true },
}));

// Redoc — reliable behind Cloudflare
app.get("/api/redoc", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>Estates API Docs</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>body { margin: 0; padding: 0; }</style>
  </head>
  <body>
    <redoc spec-url='/api/docs.json'></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"></script>
  </body>
</html>`);
});

app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/menu", menuRoutes);

app.use(errorHandler);

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server running on :${PORT}`)))
  .catch((err) => { console.error("DB connection failed:", err); process.exit(1); });
