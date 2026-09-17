const express = require("express");

const cors = require("cors");

const helmet = require("helmet");

const morgan = require("morgan");

const compression = require("compression");

require("dotenv").config();

const userRoutes = require("./routes/userRoutes");

const authRoutes = require("./routes/authRoutes");

const activityRoutes = require("./routes/activityRoutes");

const reminderRoutes = require("./routes/reminderRoutes");

const expenseRoutes = require("./routes/expense.js");

const app = express();

// Middleware

app.use(helmet());
app.use((req, res, next) => {
  console.log("========== CORS DEBUG ==========");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Origin:", req.headers.origin);
  console.log("================================");
  next();
});

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(compression());

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Routes

app.use("/api/reminders", reminderRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/activities", activityRoutes);

app.use("/api/users", userRoutes);

app.use("/api/expenses", expenseRoutes);

// Health check

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Test route

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth/register, /api/auth/login, /api/auth/me",
      activities: "/api/activities",
    },
  });
});

// Error handling

app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  res.status(err.status || 500).json({
    message: err.message || "Something went wrong!",
  });
});

// 404 handler

app.use((req, res) => {
  console.log("404 Not Found:", req.method, req.url);

  res.status(404).json({
    message: "Route not found",
    path: req.url,
    method: req.method,
  });
});

module.exports = app;
