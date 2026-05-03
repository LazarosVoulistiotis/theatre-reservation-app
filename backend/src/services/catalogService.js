// Contains public catalogue data logic.
// This service retrieves theatres, shows, showtimes, and seat availability from MariaDB.

const pool = require("../db/pool");
const createHttpError = require("../utils/httpError");

/*
  Returns all theatres ordered alphabetically.

  This endpoint supports the catalogue requirement by exposing available
  theatres from the database.
*/
async function getTheatres() {
    const [rows] = await pool.query(
        `
            SELECT
                theatre_id,
                name,
                location,
                description,
                created_at
            FROM theatres
            ORDER BY name ASC
        `
    );

    return rows;
}

/*
  Returns shows with optional search filters.

  Supported filters:
  - title: show title search
  - theatreId: exact theatre ID
  - location: theatre location search
  - theatreName: theatre name search
  - date: showtime date filter in YYYY-MM-DD format

  The date filter joins showtimes so the frontend can search for performances
  available on a specific date.
*/
async function getShows(filters = {}) {
    const {
        title,
        theatreId,
        location,
        theatreName,
        date,
    } = filters;

    const conditions = [];
    const params = [];

    if (title) {
        conditions.push("sh.title LIKE ?");
        params.push(`%${title}%`);
    }

    if (theatreId) {
        const normalizedTheatreId = Number(theatreId);

        if (!Number.isInteger(normalizedTheatreId) || normalizedTheatreId <= 0) {
            throw createHttpError(400, "A valid theatreId must be provided.");
        }

        conditions.push("sh.theatre_id = ?");
        params.push(normalizedTheatreId);
    }

    if (location) {
        conditions.push("t.location LIKE ?");
        params.push(`%${location}%`);
    }

    if (theatreName) {
        conditions.push("t.name LIKE ?");
        params.push(`%${theatreName}%`);
    }

    /*
      Date filtering expects YYYY-MM-DD.

      This keeps the backend aligned with the frontend date input and avoids
      accepting ambiguous date formats.
    */
    if (date) {
        const isValidDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(date);

        if (!isValidDateFormat) {
            throw createHttpError(400, "Date must use YYYY-MM-DD format.");
        }

        conditions.push("st.show_date = ?");
        params.push(date);
    }

    const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await pool.query(
        `
            SELECT DISTINCT
                sh.show_id,
                sh.title,
                sh.description,
                sh.duration_minutes,
                sh.age_rating,
                t.theatre_id,
                t.name AS theatre_name,
                t.location AS theatre_location
            FROM shows sh
                     JOIN theatres t
                          ON sh.theatre_id = t.theatre_id
                     LEFT JOIN showtimes st
                               ON sh.show_id = st.show_id
                ${whereClause}
            ORDER BY sh.title ASC
        `,
        params
    );

    return rows;
}

/*
  Returns only future showtimes for a selected show.

  This prevents users from selecting past performances and supports the
  frontend show details and seat selection flow.
*/
async function getShowtimes(showId) {
    const normalizedShowId = Number(showId);

    if (!Number.isInteger(normalizedShowId) || normalizedShowId <= 0) {
        throw createHttpError(400, "A valid showId query parameter is required.");
    }

    const [rows] = await pool.query(
        `
            SELECT
                st.showtime_id,
                st.show_id,
                st.hall_id,
                st.show_date,
                st.show_time,
                st.base_price,
                h.name AS hall_name,
                h.capacity,
                sh.title AS show_title,
                t.name AS theatre_name,
                t.location AS theatre_location
            FROM showtimes st
                     JOIN halls h
                          ON st.hall_id = h.hall_id
                     JOIN shows sh
                          ON st.show_id = sh.show_id
                     JOIN theatres t
                          ON sh.theatre_id = t.theatre_id
            WHERE st.show_id = ?
              AND TIMESTAMP(st.show_date, st.show_time) > NOW()
            ORDER BY st.show_date ASC, st.show_time ASC
        `,
        [normalizedShowId]
    );

    return rows;
}

/*
  Returns all seats for a selected showtime.

  Each seat includes:
  - seat row and number,
  - category,
  - calculated price,
  - availability status.

  Availability is calculated with EXISTS instead of a LEFT JOIN. This avoids
  duplicate seat rows and remains correct even if older cancelled reservations
  exist for the same seat.
*/
async function getSeats(showtimeId) {
    const normalizedShowtimeId = Number(showtimeId);

    if (!Number.isInteger(normalizedShowtimeId) || normalizedShowtimeId <= 0) {
        throw createHttpError(400, "A valid showtimeId query parameter is required.");
    }

    const [showtimes] = await pool.query(
        `
            SELECT showtime_id
            FROM showtimes
            WHERE showtime_id = ?
        `,
        [normalizedShowtimeId]
    );

    if (showtimes.length === 0) {
        throw createHttpError(404, "Showtime not found.");
    }

    const [rows] = await pool.query(
        `
            SELECT
                s.seat_id,
                s.row_label,
                s.seat_number,
                sc.name AS category,
                ROUND(st.base_price * sc.price_multiplier, 2) AS price,
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM reservation_seats rs
                                 JOIN reservations r
                                      ON r.reservation_id = rs.reservation_id
                        WHERE rs.showtime_id = st.showtime_id
                          AND rs.seat_id = s.seat_id
                          AND r.status = 'confirmed'
                    )
                        THEN FALSE
                    ELSE TRUE
                    END AS is_available
            FROM showtimes st
                     JOIN seats s
                          ON st.hall_id = s.hall_id
                     JOIN seat_categories sc
                          ON s.category_id = sc.category_id
            WHERE st.showtime_id = ?
            ORDER BY s.row_label ASC, s.seat_number ASC
        `,
        [normalizedShowtimeId]
    );

    return rows.map((seat) => ({
        ...seat,
        price: Number(seat.price),
        is_available:
            seat.is_available === true ||
            seat.is_available === 1 ||
            seat.is_available === "1",
    }));
}

module.exports = {
    getTheatres,
    getShows,
    getShowtimes,
    getSeats,
};