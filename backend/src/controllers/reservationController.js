// Handles HTTP requests for reservation operations.
// Controllers remain thin: validation/business rules live inside the service layer.

const reservationService = require("../services/reservationService");

/*
  Supports different auth middleware naming styles.

  In our project the JWT middleware usually sets req.user.userId.
  The fallbacks keep the controller stable if the middleware shape changes.
*/
function getAuthenticatedUserId(req) {
    return req.user?.userId || req.user?.user_id || req.user?.id;
}

async function createReservation(req, res) {
    const userId = getAuthenticatedUserId(req);

    const result = await reservationService.createReservation(userId, req.body);

    res.status(201).json({
        message: "Reservation created successfully.",
        ...result,
    });
}

async function getUserReservations(req, res) {
    const userId = getAuthenticatedUserId(req);

    const result = await reservationService.getUserReservations(userId);

    res.status(200).json(result);
}

async function updateReservation(req, res) {
    const userId = getAuthenticatedUserId(req);
    const { reservationId } = req.params;

    const result = await reservationService.updateReservation(
        userId,
        reservationId,
        req.body
    );

    res.status(200).json({
        message: "Reservation updated successfully.",
        ...result,
    });
}

async function cancelReservation(req, res) {
    const userId = getAuthenticatedUserId(req);
    const { reservationId } = req.params;

    const result = await reservationService.cancelReservation(
        userId,
        reservationId
    );

    res.status(200).json(result);
}

module.exports = {
    createReservation,
    getUserReservations,
    updateReservation,
    cancelReservation,

    // Compatibility aliases.
    getReservationsByUser: getUserReservations,
    deleteReservation: cancelReservation,
};