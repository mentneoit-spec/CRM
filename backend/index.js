const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const prisma = require("./lib/prisma");

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT) || 5000;

// ==================== SECURITY MIDDLEWARE ====================

// Helmet
app.use(helmet());

// CORS
app.use(
  cors({
    origin:
      process.env.ALLOWED_ORIGINS?.split(",") || [
        "http://localhost:3000",
        "http://localhost:3001",
      ],
    credentials: true,
  })
);

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// ==================== BODY PARSER ====================

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ==================== DATABASE CONNECTION ====================

async function connectDB() {
  try {
    await prisma.$connect();
    console.log("✓ Connected to PostgreSQL via Prisma");
  } catch (error) {
    console.error("✗ Database Connection Error:", error);
    process.exit(1);
  }
}
connectDB();

// ==================== REDIS CONNECTION ====================

const { initRedis, closeRedis } = require("./utils/redis-service");

async function connectRedis() {
  try {
    await initRedis();
  } catch (error) {
    console.warn("⚠ Redis connection failed. Continuing without cache:", error.message);
  }
}
connectRedis();

// ==================== CUSTOM MIDDLEWARE ====================

const { detectDomain, authMiddleware } = require("./middleware/auth");
const { handleWebhook } = require("./utils/razorpay-service");
const Routes = require("./routes/route.js");

// Domain detection
app.use(detectDomain);

// Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
    );
  });
  next();
});

// ==================== ROUTES ====================

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "College ERP & CRM API Server",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      documentation: "/api/docs"
    }
  });
});

// Webhook (before auth)
app.post("/api/webhooks/razorpay", handleWebhook);

// Public Auth
app.use("/api/auth", require("./routes/auth-routes"));

// Protected Routes
app.use("/api/superadmin", authMiddleware, require("./routes/superadmin-routes"));
app.use("/api/admin", authMiddleware, require("./routes/admin-routes"));
app.use("/api/teacher", authMiddleware, require("./routes/teacher-routes"));
app.use("/api/student", authMiddleware, require("./routes/student-routes"));
app.use("/api/parent", authMiddleware, require("./routes/parent-routes"));
app.use("/api/accounts", authMiddleware, require("./routes/accounts-routes"));
app.use("/api/transport", authMiddleware, require("./routes/transport-routes"));

// Admission (public if required)
app.use("/api/admission", require("./routes/admission-routes"));

// General
app.use("/api/", Routes);

// ==================== ERROR HANDLING ====================

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ==================== SERVER STARTUP ====================

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║  Multi-Tenant College ERP & CRM SaaS Platform            ║
║  Server running on port ${port.toString().padEnd(47)} ║
║  Environment: ${(process.env.NODE_ENV || "development").padEnd(45)} ║
╚══════════════════════════════════════════════════════════╝
    `);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`⚠ Port ${port} is busy. Trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("Server Error:", err);
      process.exit(1);
    }
  });

  // Graceful Shutdown
  process.on("SIGINT", async () => {
    console.log("\nShutting down gracefully...");
    await prisma.$disconnect();
    await closeRedis();
    const { closeQueues } = require("./utils/queue-service");
    await closeQueues();
    server.close(() => {
      process.exit(0);
    });
  });
}

startServer(PORT);

module.exports = app;