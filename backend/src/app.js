require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db/pool");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Theatre Reservation API is running"
  });
});

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

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error"
  });
});

module.exports = app;