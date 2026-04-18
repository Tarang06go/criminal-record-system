require("dotenv").config();

const cors = require("cors");
const express = require("express");
const morgan = require('morgan');

const { testConnection } = require("./db");
const authRoutes = require("./routes/authRoutes");
const caseRoutes = require("./routes/caseRoutes");
const officerRoutes = require("./routes/officerRoutes");
const criminalRoutes = require("./routes/criminalRoutes");

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

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
      "GET /api/officers",
      "POST /api/officers",
      "DELETE /api/officers/:id",
      "GET /api/criminals"
    ]
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "criminal-record-management-system-api"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/officers", officerRoutes);
app.use("/api/criminals", criminalRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found."
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);

  res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error."
  });
});

async function startServer() {
  try {
    await testConnection();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start the server:", error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;