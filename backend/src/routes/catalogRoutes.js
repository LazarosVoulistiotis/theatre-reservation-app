const express = require("express");
const catalogController = require("../controllers/catalogController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/theatres", asyncHandler(catalogController.getTheatres));
router.get("/shows", asyncHandler(catalogController.getShows));
router.get("/showtimes", asyncHandler(catalogController.getShowtimes));
router.get("/seats", asyncHandler(catalogController.getSeats));

module.exports = router;