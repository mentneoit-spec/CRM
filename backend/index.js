const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require('path');
const prisma = require("./lib/prisma");

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT) || 5000;

// Avoid browser/proxy caching on API responses (prevents 304 responses confusing XHR clients).
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// ==================== SECURITY MIDDLEWARE ====================

// Helmet
app.use(helmet());

// CORS
const parseAllowedOrigins = (value) => {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);

// Required for Chrome's Private Network Access preflight when applicable.
app.use((req, res, next) => {
  if (req.headers["access-control-request-private-network"]) {
    res.setHeader("Access-Control-Allow-Private-Network", "true");
  }
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Non-browser clients (curl, server-to-server) often have no Origin header.
      if (!origin) return callback(null, true);

      // If ALLOWED_ORIGINS is unset OR explicitly '*', allow all origins.
      if (allowedOrigins.length === 0 || allowedOrigins.includes("*")) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`CORS blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    optionsSuccessStatus: 204,
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

// Serve locally uploaded files (used when S3 is not configured)
// Helmet defaults to Cross-Origin-Resource-Policy: same-origin, which blocks
// images from loading on a different origin (e.g. frontend :3000). Allow
// cross-origin *for uploads only*.
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);

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
  // Skip Redis connection in test environment
  if (process.env.NODE_ENV === 'test') {
    console.log('⏭ Skipping Redis connection in test mode');
    return;
  }

  const redisEnabledEnv = process.env.REDIS_ENABLED;
  const redisEnabled = redisEnabledEnv === undefined
    ? true
    : !['0', 'false', 'no', 'off'].includes(String(redisEnabledEnv).trim().toLowerCase());

  if (!redisEnabled) {
    console.log('⏭ Skipping Redis connection (REDIS_ENABLED=false)');
    return;
  }
  
  try {
    await initRedis();
  } catch (error) {
    console.warn("⚠ Redis connection failed. Continuing without cache:", error.message);
  }
}

// Only connect to Redis if not in test mode
if (process.env.NODE_ENV !== 'test') {
  connectRedis();
}

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

// Uploads
app.use('/api/upload', authMiddleware, require('./routes/upload-routes'));

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

let server; // Declare server variable

function startServer(port) {
  server = app.listen(port, () => {
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
      console.error(`✗ Port ${port} is already in use.`);
      console.error(
        "Stop the other backend process using this port, then restart this server."
      );
      process.exit(1);
    } else {
      console.error("Server Error:", err);
      process.exit(1);
    }
  });

  // Graceful Shutdown
  const gracefulShutdown = async (signal) => {
    try {
      console.log(`\nShutting down gracefully (${signal})...`);
      try {
        await prisma.$disconnect();
      } catch (err) {
        console.warn('Prisma disconnect error:', err?.message || err);
      }

      try {
        await closeRedis();
      } catch (err) {
        console.warn('Redis close error:', err?.message || err);
      }

      // queue-service initializes Bull queues at import time; only attempt to close if available.
      try {
        const { closeQueues } = require("./utils/queue-service");
        if (typeof closeQueues === 'function') {
          await closeQueues();
        }
      } catch (err) {
        console.warn('Queue shutdown skipped:', err?.message || err);
      }

      await new Promise((resolve) => server.close(resolve));
      process.exit(0);
    } catch (err) {
      console.error('Graceful shutdown failed:', err);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => { void gracefulShutdown('SIGINT'); });
  process.on("SIGTERM", () => { void gracefulShutdown('SIGTERM'); });

  return server; // Return the server
}

// Only start server if not in test mode
let startedServer;
if (process.env.NODE_ENV !== 'test') {
  startedServer = startServer(PORT);
} else {
  // In test mode, create a mock server or just export app
  startedServer = null;
}

module.exports = { app, server: startedServer };