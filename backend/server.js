require("dotenv").config();

const cors = require("cors");
const express = require("express");
const morgan = require("morgan");

const { testConnection } = require("./db");
const authRoutes = require("./routes/authRoutes");
const caseRoutes = require("./routes/caseRoutes");
const officerRoutes = require("./routes/officerRoutes");
const criminalRoutes = require("./routes/criminalRoutes");

const app = express();
const PORT = Number(process.env.PORT || 5000);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Criminal Record Management System API is running.",
    availableRoutes: [
      "POST /api/auth/login",
      "GET /api/auth/me",
      "GET /api/cases",
      "POST /api/cases",
      "DELETE /api/cases/:id",
      "PUT /api/cases/:id/sentence",
      "PUT /api/cases/:id/assign",
      "GET /api/officers",
      "POST /api/officers",
      "DELETE /api/officers/:id",
      "GET /api/criminals"
    ]
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "criminal-record-management-system-api"
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/officers", officerRoutes);
app.use("/api/criminals", criminalRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found."
  });
});

// Error handler
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  console.error(error);

  res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error."
  });
});

// 🚀 START SERVER (FIXED FOR RENDER)
async function startServer() {
  try {
    // ✅ Do NOT crash if DB fails (Render can't access localhost DB)
    try {
      await testConnection();
      console.log("✅ Database connected");
    } catch (dbError) {
      console.log("⚠️ Database not connected (expected on Render)");
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Unable to start server:", error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;