const pool = require("../db/pool");
const createHttpError = require("../utils/httpError");

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

async function ensureSeatsAvailable(connection, showtimeId, seatIds, ignoredReservationId = null) {
    const params = [showtimeId, seatIds];

    let ignoredReservationClause = "";

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

function calculateTotalPrice(seats) {
    return seats.reduce((total, seat) => total + Number(seat.price), 0);
}

async function createReservation(userId, { showtimeId, seatIds }) {
    const selectedSeatIds = normalizeSeatIds(seatIds);

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const showtime = await getFutureShowtimeForUpdate(connection, showtimeId);
        const seats = await validateSeatsForShowtime(connection, showtime, selectedSeatIds);

        await ensureSeatsAvailable(connection, showtime.showtime_id, selectedSeatIds);

        const totalPrice = calculateTotalPrice(seats);

        const [reservationResult] = await connection.query(
            `
      INSERT INTO reservations (user_id, showtime_id, total_price)
      VALUES (?, ?, ?)
      `,
            [userId, showtime.showtime_id, totalPrice]
        );

        const reservationId = reservationResult.insertId;

        const reservationSeatsValues = selectedSeatIds.map((seatId) => [
            reservationId,
            showtime.showtime_id,
            seatId
        ]);

        await connection.query(
            `
      INSERT INTO reservation_seats (reservation_id, showtime_id, seat_id)
      VALUES ?
      `,
            [reservationSeatsValues]
        );

        await connection.commit();

        return {
            reservation_id: reservationId,
            showtime_id: showtime.showtime_id,
            seat_ids: selectedSeatIds,
            total_price: Number(totalPrice.toFixed(2)),
            status: "confirmed"
        };
    } catch (error) {
        await connection.rollback();

        if (error.code === "ER_DUP_ENTRY") {
            throw createHttpError(409, "Selected seat is no longer available.");
        }

        throw error;
    } finally {
        connection.release();
    }
}

async function getUserReservations(userId) {
    const [rows] = await pool.query(
        `
    SELECT
      r.reservation_id,
      r.status,
      r.total_price,
      r.created_at,
      r.updated_at,
      st.showtime_id,
      st.show_date,
      st.show_time,
      TIMESTAMP(st.show_date, st.show_time) AS show_datetime,
      sh.show_id,
      sh.title AS show_title,
      t.name AS theatre_name,
      t.location AS theatre_location,
      h.name AS hall_name,
      GROUP_CONCAT(seat.seat_id ORDER BY seat.row_label, seat.seat_number) AS seat_ids,
      GROUP_CONCAT(CONCAT(seat.row_label, seat.seat_number) ORDER BY seat.row_label, seat.seat_number SEPARATOR ', ') AS seats
    FROM reservations r
    JOIN showtimes st ON r.showtime_id = st.showtime_id
    JOIN shows sh ON st.show_id = sh.show_id
    JOIN theatres t ON sh.theatre_id = t.theatre_id
    JOIN halls h ON st.hall_id = h.hall_id
    LEFT JOIN reservation_seats rs ON r.reservation_id = rs.reservation_id
    LEFT JOIN seats seat ON rs.seat_id = seat.seat_id
    WHERE r.user_id = ?
    GROUP BY r.reservation_id
    ORDER BY st.show_date DESC, st.show_time DESC
    `,
        [userId]
    );

    return rows.map((reservation) => ({
        ...reservation,
        total_price: Number(reservation.total_price),
        seat_ids: reservation.seat_ids
            ? reservation.seat_ids.split(",").map(Number)
            : [],
        seats: reservation.seats || "",
        is_future: new Date(reservation.show_datetime) > new Date()
    }));
}

async function getOwnedFutureReservationForUpdate(connection, reservationId, userId) {
    const [reservations] = await connection.query(
        `
    SELECT
      r.reservation_id,
      r.user_id,
      r.showtime_id,
      r.status,
      TIMESTAMP(st.show_date, st.show_time) AS show_datetime
    FROM reservations r
    JOIN showtimes st ON r.showtime_id = st.showtime_id
    WHERE r.reservation_id = ?
      AND r.user_id = ?
    FOR UPDATE
    `,
        [reservationId, userId]
    );

    if (reservations.length === 0) {
        throw createHttpError(404, "Reservation not found.");
    }

    const reservation = reservations[0];

    if (reservation.status !== "confirmed") {
        throw createHttpError(400, "Only confirmed reservations can be modified.");
    }

    if (new Date(reservation.show_datetime) <= new Date()) {
        throw createHttpError(400, "Past reservations cannot be modified.");
    }

    return reservation;
}

async function updateReservation(userId, reservationId, { showtimeId, seatIds }) {
    const selectedSeatIds = normalizeSeatIds(seatIds);

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const existingReservation = await getOwnedFutureReservationForUpdate(
            connection,
            reservationId,
            userId
        );

        const targetShowtimeId = showtimeId || existingReservation.showtime_id;

        const showtime = await getFutureShowtimeForUpdate(connection, targetShowtimeId);
        const seats = await validateSeatsForShowtime(connection, showtime, selectedSeatIds);

        await ensureSeatsAvailable(
            connection,
            showtime.showtime_id,
            selectedSeatIds,
            Number(reservationId)
        );

        const totalPrice = calculateTotalPrice(seats);

        await connection.query(
            `
      DELETE FROM reservation_seats
      WHERE reservation_id = ?
      `,
            [reservationId]
        );

        await connection.query(
            `
      UPDATE reservations
      SET showtime_id = ?, total_price = ?, status = 'confirmed'
      WHERE reservation_id = ?
      `,
            [showtime.showtime_id, totalPrice, reservationId]
        );

        const reservationSeatsValues = selectedSeatIds.map((seatId) => [
            reservationId,
            showtime.showtime_id,
            seatId
        ]);

        await connection.query(
            `
      INSERT INTO reservation_seats (reservation_id, showtime_id, seat_id)
      VALUES ?
      `,
            [reservationSeatsValues]
        );

        await connection.commit();

        return {
            reservation_id: Number(reservationId),
            showtime_id: showtime.showtime_id,
            seat_ids: selectedSeatIds,
            total_price: Number(totalPrice.toFixed(2)),
            status: "confirmed"
        };
    } catch (error) {
        await connection.rollback();

        if (error.code === "ER_DUP_ENTRY") {
            throw createHttpError(409, "Selected seat is no longer available.");
        }

        throw error;
    } finally {
        connection.release();
    }
}

async function cancelReservation(userId, reservationId) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await getOwnedFutureReservationForUpdate(connection, reservationId, userId);

        await connection.query(
            `
      DELETE FROM reservation_seats
      WHERE reservation_id = ?
      `,
            [reservationId]
        );

        await connection.query(
            `
      UPDATE reservations
      SET status = 'cancelled'
      WHERE reservation_id = ?
      `,
            [reservationId]
        );

        await connection.commit();

        return {
            reservation_id: Number(reservationId),
            status: "cancelled"
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    createReservation,
    getUserReservations,
    updateReservation,
    cancelReservation
};