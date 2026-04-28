require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db/pool");

const authRoutes = require("./routes/authRoutes");
const catalogRoutes = require("./routes/catalogRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const errorHandler = require("./middleware/errorHandler");

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

app.use("/", authRoutes);
app.use("/", catalogRoutes);
app.use("/", reservationRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

app.use(errorHandler);

module.exports = app;