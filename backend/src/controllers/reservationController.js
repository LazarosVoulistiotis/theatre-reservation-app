// Handles protected reservation HTTP requests.
// The authenticated user's identity is read from req.user, which is set by authMiddleware.

const reservationService = require("../services/reservationService");

// Creates a reservation for the authenticated user.
async function createReservation(req, res) {
    const reservation = await reservationService.createReservation(
        req.user.userId,
        req.body
    );

    res.status(201).json({
        message: "Reservation created successfully.",
        reservation
    });
}

// Returns only the reservations that belong to the authenticated user.
async function getUserReservations(req, res) {
    const reservations = await reservationService.getUserReservations(req.user.userId);

    res.json({
        reservations
    });
}

// Updates a future reservation owned by the authenticated user.
async function updateReservation(req, res) {
    const reservation = await reservationService.updateReservation(
        req.user.userId,
        req.params.id,
        req.body
    );

    res.json({
        message: "Reservation updated successfully.",
        reservation
    });
}

// Cancels a future reservation owned by the authenticated user.
async function cancelReservation(req, res) {
    const reservation = await reservationService.cancelReservation(
        req.user.userId,
        req.params.id
    );

    res.json({
        message: "Reservation cancelled successfully.",
        reservation
    });
}

module.exports = {
    createReservation,
    getUserReservations,
    updateReservation,
    cancelReservation
};