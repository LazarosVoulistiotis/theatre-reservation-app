// Central Express application configuration.
// This file connects middleware, routes, database health checks, and error handling.

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db/pool");

const authRoutes = require("./routes/authRoutes");
const catalogRoutes = require("./routes/catalogRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Enables Cross-Origin Resource Sharing so the mobile frontend can call the API.
app.use(cors());

// Allows the API to read JSON request bodies, such as login and reservation data.
app.use(express.json());

// Health check endpoint used to verify that the API server is running.
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Theatre Reservation API is running"
  });
});

// Database connectivity test endpoint.
// It confirms that the Express backend can communicate with MariaDB.
app.get("/db-test", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS db_status");

    res.json({
      status: "ok",
      database: rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Registers the main API route groups.
app.use("/", authRoutes);
app.use("/", catalogRoutes);
app.use("/", reservationRoutes);

// Handles requests to undefined routes.
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

// Centralized error handling middleware.
// It must be registered after all routes.
app.use(errorHandler);

module.exports = app;