// Defines public catalogue routes for theatres, shows, showtimes, and seat availability.
// These endpoints can be accessed without authentication.

const express = require("express");
const catalogController = require("../controllers/catalogController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// Returns all available theatres.
router.get("/theatres", asyncHandler(catalogController.getTheatres));

// Returns shows, optionally filtered by title, theatre, location, or date.
router.get("/shows", asyncHandler(catalogController.getShows));

// Returns future showtimes for a selected show.
router.get("/showtimes", asyncHandler(catalogController.getShowtimes));

// Returns seats for a selected showtime, including availability and price.
router.get("/seats", asyncHandler(catalogController.getSeats));

module.exports = router;