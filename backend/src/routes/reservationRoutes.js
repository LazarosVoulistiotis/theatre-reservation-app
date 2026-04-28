// Defines protected reservation routes.
// All reservation operations require a valid JWT before reaching the controller.

const express = require("express");
const reservationController = require("../controllers/reservationController");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// Creates a new reservation for the authenticated user.
router.post(
    "/reservations",
    authMiddleware,
    asyncHandler(reservationController.createReservation)
);

// Returns only the reservations that belong to the authenticated user.
router.get(
    "/user/reservations",
    authMiddleware,
    asyncHandler(reservationController.getUserReservations)
);

// Updates a future reservation owned by the authenticated user.
router.put(
    "/reservations/:id",
    authMiddleware,
    asyncHandler(reservationController.updateReservation)
);

// Cancels a future reservation owned by the authenticated user.
router.delete(
    "/reservations/:id",
    authMiddleware,
    asyncHandler(reservationController.cancelReservation)
);

module.exports = router;