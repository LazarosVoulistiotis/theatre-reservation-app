// Reservation API routes.
// These endpoints are protected because reservations belong to authenticated users.

const express = require("express");

const reservationController = require("../controllers/reservationController");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

/*
  Returns reservation history for the logged-in user.

  Must be declared before /reservations/:reservationId so route matching
  remains predictable.
*/
router.get(
    "/user/reservations",
    authMiddleware,
    asyncHandler(reservationController.getUserReservations)
);

/*
  Creates a new reservation from selected showtime and seats.
*/
router.post(
    "/reservations",
    authMiddleware,
    asyncHandler(reservationController.createReservation)
);

/*
  Updates a future reservation owned by the logged-in user.
*/
router.put(
    "/reservations/:reservationId",
    authMiddleware,
    asyncHandler(reservationController.updateReservation)
);

/*
  Cancels a future reservation owned by the logged-in user.
*/
router.delete(
    "/reservations/:reservationId",
    authMiddleware,
    asyncHandler(reservationController.cancelReservation)
);

module.exports = router;