// Contains reservation business logic.
// This service handles selected seats, transactions, ownership checks, and double-booking prevention.

const pool = require("../db/pool");
const createHttpError = require("../utils/httpError");

// Validates and normalizes selected seat IDs before reservation processing.
function normalizeSeatIds(seatIds) {
    if (!Array.isArray(seatIds) || seatIds.length === 0) {
        throw createHttpError(400, "At least one seat must be selected.");
    }

    const normalized = seatIds.map(Number);

    const hasInvalidSeatId = normalized.some(
        (seatId) => !Number.isInteger(seatId) || seatId <= 0
    );

    if (hasInvalidSeatId) {
        throw createHttpError(400, "Seat IDs must be positive integers.");
    }

    const uniqueSeatIds = [...new Set(normalized)];

    if (uniqueSeatIds.length !== normalized.length) {
        throw createHttpError(400, "Duplicate seat IDs are not allowed.");
    }

    return uniqueSeatIds;
}

// Locks and validates the selected showtime during a transaction.
async function getFutureShowtimeForUpdate(connection, showtimeId) {
    const [showtimes] = await connection.query(
        `
            SELECT
                st.showtime_id,
                st.hall_id,
                st.base_price,
                st.show_date,
                st.show_time,
                TIMESTAMP(st.show_date, st.show_time) AS show_datetime
            FROM showtimes st
            WHERE st.showtime_id = ?
                FOR UPDATE
        `,
        [showtimeId]
    );

    if (showtimes.length === 0) {
        throw createHttpError(404, "Showtime not found.");
    }

    const showtime = showtimes[0];

    if (new Date(showtime.show_datetime) <= new Date()) {
        throw createHttpError(400, "Cannot create or update a reservation for a past showtime.");
    }

    return showtime;
}

// Ensures that all selected seats belong to the hall of the selected showtime.
async function validateSeatsForShowtime(connection, showtime, seatIds) {
    const [seats] = await connection.query(
        `
        SELECT
          s.seat_id,
          s.hall_id,
          s.row_label,
          s.seat_number,
          sc.name AS category,
          ROUND(? * sc.price_multiplier, 2) AS price
        FROM seats s
        JOIN seat_categories sc ON s.category_id = sc.category_id
        WHERE s.seat_id IN (?)
          AND s.hall_id = ?
        FOR UPDATE
        `,
        [showtime.base_price, seatIds, showtime.hall_id]
    );

    if (seats.length !== seatIds.length) {
        throw createHttpError(400, "One or more selected seats do not belong to the selected showtime hall.");
    }

    return seats.map((seat) => ({
        ...seat,
        price: Number(seat.price)
    }));
}

// Checks whether any selected seat is already reserved for the same showtime.
async function ensureSeatsAvailable(connection, showtimeId, seatIds, ignoredReservationId = null) {
    const params = [showtimeId, seatIds];

    let ignoredReservationClause = "";

    // During updates, the current reservation is ignored so the user can keep existing seats.
    if (ignoredReservationId) {
        ignoredReservationClause = "AND r.reservation_id <> ?";
        params.push(ignoredReservationId);
    }

    const [bookedSeats] = await connection.query(
        `
        SELECT rs.seat_id
        FROM reservation_seats rs
        JOIN reservations r ON rs.reservation_id = r.reservation_id
        WHERE rs.showtime_id = ?
          AND rs.seat_id IN (?)
          AND r.status = 'confirmed'
          ${ignoredReservationClause}
        FOR UPDATE
        `,
        params
    );

    if (bookedSeats.length > 0) {
        throw createHttpError(409, "Selected seat is no longer available.");
    }
}

// Calculates the total price from the selected seat prices.
function calculateTotalPrice(seats) {
    return seats.reduce((total, seat) => total + Number(seat.price), 0);
}