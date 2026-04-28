const express = require("express");
const reservationController = require("../controllers/reservationController");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post(
    "/reservations",
    authMiddleware,
    asyncHandler(reservationController.createReservation)
);

router.get(
    "/user/reservations",
    authMiddleware,
    asyncHandler(reservationController.getUserReservations)
);

router.put(
    "/reservations/:id",
    authMiddleware,
    asyncHandler(reservationController.updateReservation)
);

router.delete(
    "/reservations/:id",
    authMiddleware,
    asyncHandler(reservationController.cancelReservation)
);

module.exports = router;