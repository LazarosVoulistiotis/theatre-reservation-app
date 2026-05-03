// Contains reservation business logic.
// This service handles selected seats, database transactions, ownership checks,
// total price calculation and double-booking prevention.

const pool = require("../db/pool");
const createHttpError = require("../utils/httpError");

/*
  Normalizes selected seat IDs before reservation processing.

  This protects the backend from:
  - empty seat selections,
  - non-numeric values,
  - duplicate seats in the same request.
*/
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

/*
  Validates numeric IDs used by reservation operations.
*/
function normalizePositiveInteger(value, errorMessage) {
    const normalized = Number(value);

    if (!Number.isInteger(normalized) || normalized <= 0) {
        throw createHttpError(400, errorMessage);
    }

    return normalized;
}

/*
  Locks and validates the selected showtime.

  FOR UPDATE is used because seat availability is checked and reservation rows
  are inserted or updated inside the same transaction. This helps prevent
  double booking under concurrent requests.
*/
async function getFutureShowtimeForUpdate(connection, showtimeId) {
    const normalizedShowtimeId = normalizePositiveInteger(
        showtimeId,
        "A valid showtime ID is required."
    );

    const [showtimes] = await connection.query(
        `
            SELECT
                st.showtime_id,
                st.show_id,
                st.hall_id,
                st.base_price,
                st.show_date,
                st.show_time,
                TIMESTAMP(st.show_date, st.show_time) AS show_datetime
            FROM showtimes st
            WHERE st.showtime_id = ?
            FOR UPDATE
        `,
        [normalizedShowtimeId]
    );

    if (showtimes.length === 0) {
        throw createHttpError(404, "Showtime not found.");
    }

    const showtime = showtimes[0];

    if (new Date(showtime.show_datetime) <= new Date()) {
        throw createHttpError(
            400,
            "Cannot create or update a reservation for a past showtime."
        );
    }

    return showtime;
}

/*
  Ensures that all selected seats belong to the same hall as the selected showtime.

  The price is calculated using the showtime base price and the seat category
  multiplier. This keeps pricing controlled by the backend, not by the frontend.
*/
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
        throw createHttpError(
            400,
            "One or more selected seats do not belong to the selected showtime hall."
        );
    }

    return seats.map((seat) => ({
        ...seat,
        price: Number(seat.price),
    }));
}

/*
  Checks whether any selected seat has already been confirmed for the same showtime.

  When editing a reservation, ignoredReservationId is used so the current
  reservation does not conflict with its own existing seats.
*/
async function ensureSeatsAvailable(
    connection,
    showtimeId,
    seatIds,
    ignoredReservationId = null
) {
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

/*
  Calculates the final reservation price from backend-calculated seat prices.
*/
function calculateTotalPrice(seats) {
    return seats.reduce((total, seat) => total + Number(seat.price), 0);
}

/*
  Creates a confirmed reservation for the authenticated user.

  Expected payload:
  {
      showtimeId: number,
      seatIds: number[]
  }
*/
async function createReservation(userId, payload) {
    const normalizedUserId = normalizePositiveInteger(
        userId,
        "Invalid or expired authentication token."
    );

    const showtimeId = payload?.showtimeId || payload?.showtime_id;
    const seatIds = payload?.seatIds || payload?.seat_ids;

    const normalizedSeatIds = normalizeSeatIds(seatIds);

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const showtime = await getFutureShowtimeForUpdate(connection, showtimeId);

        const seats = await validateSeatsForShowtime(
            connection,
            showtime,
            normalizedSeatIds
        );

        await ensureSeatsAvailable(
            connection,
            showtime.showtime_id,
            normalizedSeatIds
        );

        const totalPrice = calculateTotalPrice(seats);

        const [reservationResult] = await connection.query(
            `
                INSERT INTO reservations
                    (user_id, showtime_id, status, total_price, created_at, updated_at)
                VALUES
                    (?, ?, 'confirmed', ?, NOW(), NOW())
            `,
            [normalizedUserId, showtime.showtime_id, totalPrice]
        );

        const reservationId = reservationResult.insertId;

        /*
          Stores the selected seats for the reservation.

          The total price is stored in the reservations table.
          reservation_seats links each reservation with its selected seats.
        */
        const reservationSeatRows = seats.map((seat) => [
            reservationId,
            showtime.showtime_id,
            seat.seat_id,
        ]);

        await connection.query(
            `
                INSERT INTO reservation_seats
                    (reservation_id, showtime_id, seat_id)
                VALUES ?
            `,
            [reservationSeatRows]
        );

        await connection.commit();

        return {
            reservation: {
                reservation_id: reservationId,
                showtime_id: showtime.showtime_id,
                status: "confirmed",
                total_price: Number(totalPrice.toFixed(2)),
                seats,
            },
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

/*
  Returns the authenticated user's reservation history.

  The response includes show, theatre, date/time, total price, status and seats.
  This supports the Profile / My Reservations frontend screen.
*/
async function getUserReservations(userId) {
    const normalizedUserId = normalizePositiveInteger(
        userId,
        "Invalid or expired authentication token."
    );

    const [reservations] = await pool.query(
        `
            SELECT
                r.reservation_id,
                r.user_id,
                r.showtime_id,
                r.status,
                r.total_price,
                r.created_at,
                r.updated_at,
                sh.show_id,
                sh.title,
                sh.description,
                sh.duration_minutes,
                sh.age_rating,
                th.name AS theatre_name,
                th.location,
                h.name AS hall_name,
                st.show_date,
                st.show_time,
                TIMESTAMP(st.show_date, st.show_time) AS show_datetime,
                CASE
                    WHEN TIMESTAMP(st.show_date, st.show_time) > NOW()
                    THEN 1
                    ELSE 0
                END AS is_future
            FROM reservations r
            JOIN showtimes st ON r.showtime_id = st.showtime_id
            JOIN shows sh ON st.show_id = sh.show_id
            JOIN halls h ON st.hall_id = h.hall_id
            JOIN theatres th ON h.theatre_id = th.theatre_id
            WHERE r.user_id = ?
            ORDER BY st.show_date DESC, st.show_time DESC
        `,
        [normalizedUserId]
    );

    if (reservations.length === 0) {
        return {
            reservations: [],
        };
    }

    const reservationIds = reservations.map(
        (reservation) => reservation.reservation_id
    );

    const [reservationSeats] = await pool.query(
        `
            SELECT
                rs.reservation_id,
                rs.showtime_id,
                s.seat_id,
                s.row_label,
                s.seat_number,
                sc.name AS category
            FROM reservation_seats rs
            JOIN seats s ON rs.seat_id = s.seat_id
            JOIN seat_categories sc ON s.category_id = sc.category_id
            WHERE rs.reservation_id IN (?)
            ORDER BY s.row_label ASC, s.seat_number ASC
        `,
        [reservationIds]
    );

    const seatsByReservationId = reservationSeats.reduce((acc, seat) => {
        if (!acc[seat.reservation_id]) {
            acc[seat.reservation_id] = [];
        }

        acc[seat.reservation_id].push(seat);

        return acc;
    }, {});

    return {
        reservations: reservations.map((reservation) => ({
            ...reservation,
            total_price: Number(reservation.total_price),
            is_future: reservation.is_future === 1,
            seats: seatsByReservationId[reservation.reservation_id] || [],
        })),
    };
}

/*
  Updates a future reservation owned by the authenticated user.

  Expected payload:
  {
      showtimeId: number,
      seatIds: number[]
  }

  showtimeId may be the same as the existing one. This allows the same endpoint
  to support both changing seats and changing the selected showtime.
*/
async function updateReservation(userId, reservationId, payload) {
    const normalizedUserId = normalizePositiveInteger(
        userId,
        "Invalid or expired authentication token."
    );

    const normalizedReservationId = normalizePositiveInteger(
        reservationId,
        "A valid reservation ID is required."
    );

    const requestedShowtimeId = payload?.showtimeId || payload?.showtime_id;
    const seatIds = payload?.seatIds || payload?.seat_ids;

    const normalizedSeatIds = normalizeSeatIds(seatIds);

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [reservations] = await connection.query(
            `
                SELECT
                    r.reservation_id,
                    r.user_id,
                    r.showtime_id,
                    r.status,
                    st.show_date,
                    st.show_time,
                    TIMESTAMP(st.show_date, st.show_time) AS show_datetime
                FROM reservations r
                JOIN showtimes st ON r.showtime_id = st.showtime_id
                WHERE r.reservation_id = ?
                FOR UPDATE
            `,
            [normalizedReservationId]
        );

        if (reservations.length === 0) {
            throw createHttpError(404, "Reservation not found.");
        }

        const reservation = reservations[0];

        if (Number(reservation.user_id) !== normalizedUserId) {
            throw createHttpError(
                403,
                "You can only manage your own reservations."
            );
        }

        if (reservation.status !== "confirmed") {
            throw createHttpError(
                400,
                "Only confirmed reservations can be updated."
            );
        }

        if (new Date(reservation.show_datetime) <= new Date()) {
            throw createHttpError(
                400,
                "Past reservations cannot be updated."
            );
        }

        const finalShowtimeId = requestedShowtimeId || reservation.showtime_id;

        const showtime = await getFutureShowtimeForUpdate(
            connection,
            finalShowtimeId
        );

        const seats = await validateSeatsForShowtime(
            connection,
            showtime,
            normalizedSeatIds
        );

        await ensureSeatsAvailable(
            connection,
            showtime.showtime_id,
            normalizedSeatIds,
            normalizedReservationId
        );

        const totalPrice = calculateTotalPrice(seats);

        await connection.query(
            `
                DELETE FROM reservation_seats
                WHERE reservation_id = ?
            `,
            [normalizedReservationId]
        );

        const reservationSeatRows = seats.map((seat) => [
            normalizedReservationId,
            showtime.showtime_id,
            seat.seat_id,
        ]);

        await connection.query(
            `
                INSERT INTO reservation_seats
                    (reservation_id, showtime_id, seat_id)
                VALUES ?
            `,
            [reservationSeatRows]
        );

        await connection.query(
            `
                UPDATE reservations
                SET showtime_id = ?,
                    total_price = ?,
                    updated_at = NOW()
                WHERE reservation_id = ?
            `,
            [showtime.showtime_id, totalPrice, normalizedReservationId]
        );

        await connection.commit();

        return {
            reservation: {
                reservation_id: normalizedReservationId,
                showtime_id: showtime.showtime_id,
                status: "confirmed",
                total_price: Number(totalPrice.toFixed(2)),
                seats,
            },
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

/*
  Cancels a future reservation owned by the authenticated user.

  The reservation is not physically deleted. It is marked as cancelled so the
  project keeps history/audit data while freeing the seats for future bookings.
*/
async function cancelReservation(userId, reservationId) {
    const normalizedUserId = normalizePositiveInteger(
        userId,
        "Invalid or expired authentication token."
    );

    const normalizedReservationId = normalizePositiveInteger(
        reservationId,
        "A valid reservation ID is required."
    );

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [reservations] = await connection.query(
            `
                SELECT
                    r.reservation_id,
                    r.user_id,
                    r.status,
                    st.show_date,
                    st.show_time,
                    TIMESTAMP(st.show_date, st.show_time) AS show_datetime
                FROM reservations r
                JOIN showtimes st ON r.showtime_id = st.showtime_id
                WHERE r.reservation_id = ?
                FOR UPDATE
            `,
            [normalizedReservationId]
        );

        if (reservations.length === 0) {
            throw createHttpError(404, "Reservation not found.");
        }

        const reservation = reservations[0];

        if (Number(reservation.user_id) !== normalizedUserId) {
            throw createHttpError(
                403,
                "You can only manage your own reservations."
            );
        }

        if (reservation.status !== "confirmed") {
            throw createHttpError(
                400,
                "Only confirmed reservations can be cancelled."
            );
        }

        if (new Date(reservation.show_datetime) <= new Date()) {
            throw createHttpError(
                400,
                "Past reservations cannot be cancelled."
            );
        }

        await connection.query(
            `
                UPDATE reservations
                SET status = 'cancelled',
                    updated_at = NOW()
                WHERE reservation_id = ?
            `,
            [normalizedReservationId]
        );

        await connection.commit();

        return {
            message: "Reservation cancelled successfully.",
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
    cancelReservation,

    // Compatibility aliases for staged development.
    getReservationsByUser: getUserReservations,
    editReservation: updateReservation,
    modifyReservation: updateReservation,
    deleteReservation: cancelReservation,
};