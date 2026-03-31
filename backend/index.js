const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require('path');
const dns = require('dns');

// Neon often returns IPv6 (AAAA) records. On some Windows networks, IPv6 routes
// are unreliable which can cause Prisma to throw P1001 even though IPv4 works.
// Prefer IPv4 first to improve local dev reliability.
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // ignore
}

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

const corsOptions = {
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

    // Dynamic allow-list for white-label custom domains.
    // If the origin's hostname matches an active CollegeDomain, allow it.
    (async () => {
      try {
        const cacheTtlMs = 5 * 60 * 1000;
        const now = Date.now();
        if (!global.__corsOriginCache) {
          global.__corsOriginCache = new Map();
        }

        const cache = global.__corsOriginCache;
        const cached = cache.get(origin);
        if (cached && cached.exp > now) {
          return callback(null, Boolean(cached.allowed));
        }

        let hostname = null;
        try {
          hostname = new URL(origin).hostname;
        } catch {
          hostname = null;
        }

        const normalized = hostname
          ? String(hostname).trim().toLowerCase().replace(/^www\./, '')
          : null;

        if (!normalized) {
          console.warn(`CORS blocked origin (invalid): ${origin}`);
          cache.set(origin, { allowed: false, exp: now + cacheTtlMs });
          return callback(null, false);
        }

        const domain = await prisma.collegeDomain.findUnique({
          where: { domain: normalized },
          select: { status: true },
        });

        const allowed = Boolean(domain && domain.status === 'active');
        cache.set(origin, { allowed, exp: now + cacheTtlMs });

        if (!allowed) {
          console.warn(`CORS blocked origin: ${origin}`);
        }
        return callback(null, allowed);
      } catch (err) {
        console.warn(`CORS check error for origin: ${origin}`, err?.message || err);
        return callback(null, false);
      }
    })();
  },
  credentials: true,
  optionsSuccessStatus: 204,
};

// Apply CORS headers on all routes
app.use(cors(corsOptions));

// IMPORTANT: Explicitly handle browser preflight requests *before* auth middleware.
// Otherwise, protected routes can reject OPTIONS (no Authorization header), and
// the browser will block the real POST/PUT/DELETE.
app.options('*', cors(corsOptions));

// Rate Limiter (relaxed for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased from 100 for development
  message: "Too many requests from this IP, please try again later.",
  skip: (req) => process.env.NODE_ENV === 'development', // Disable in development
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

// 🤖 AI Chatbot (Public - No Auth Required)
app.use("/api/ai", require("./routes/aiChatbot"));

// Protected Routes
app.use("/api/superadmin", authMiddleware, require("./routes/superadmin-routes"));
app.use("/api/admin", authMiddleware, require("./routes/admin-routes"));
app.use("/api/teacher", authMiddleware, require("./routes/teacher-routes"));
app.use("/api/student", authMiddleware, require("./routes/student-routes"));
app.use("/api/parent", authMiddleware, require("./routes/parent-routes"));
app.use("/api/accounts", authMiddleware, require("./routes/accounts-routes"));
app.use("/api/transport", authMiddleware, require("./routes/transport-routes"));
app.use("/api/hr", authMiddleware, require("./routes/hr-routes"));
app.use("/api/ai-hr", authMiddleware, require("./routes/ai-routes"));

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