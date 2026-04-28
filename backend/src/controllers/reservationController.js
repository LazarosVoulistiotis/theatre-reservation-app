const reservationService = require("../services/reservationService");

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

async function getUserReservations(req, res) {
    const reservations = await reservationService.getUserReservations(req.user.userId);

    res.json({
        reservations
    });
}

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