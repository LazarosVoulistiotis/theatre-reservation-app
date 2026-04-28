// Contains public catalogue data logic.
// This service retrieves theatres, shows, showtimes, and seat availability from MariaDB.

const pool = require("../db/pool");
const createHttpError = require("../utils/httpError");

// Returns all theatres ordered alphabetically.
async function getTheatres() {
    const [rows] = await pool.query(
        `
        SELECT theatre_id, name, location, description, created_at
        FROM theatres
        ORDER BY name ASC
        `
    );

    return rows;
}

// Returns shows with optional filters for title, theatre, location, theatre name, and date.
async function getShows(filters) {
    const { title, theatreId, location, theatreName, date } = filters;

    const conditions = [];
    const params = [];

    // Dynamic filtering keeps the endpoint flexible without creating multiple endpoints.
    if (title) {
        conditions.push("sh.title LIKE ?");
        params.push(`%${title}%`);
    }

    if (theatreId) {
        conditions.push("sh.theatre_id = ?");
        params.push(theatreId);
    }

    if (location) {
        conditions.push("t.location LIKE ?");
        params.push(`%${location}%`);
    }

    if (theatreName) {
        conditions.push("t.name LIKE ?");
        params.push(`%${theatreName}%`);
    }

    if (date) {
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
        JOIN theatres t ON sh.theatre_id = t.theatre_id
        LEFT JOIN showtimes st ON sh.show_id = st.show_id
        ${whereClause}
        ORDER BY sh.title ASC
        `,
        params
    );

    return rows;
}

// Returns only future showtimes for a selected show.
async function getShowtimes(showId) {
    if (!showId) {
        throw createHttpError(400, "showId query parameter is required.");
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
        JOIN halls h ON st.hall_id = h.hall_id
        JOIN shows sh ON st.show_id = sh.show_id
        JOIN theatres t ON sh.theatre_id = t.theatre_id
        WHERE st.show_id = ?
          AND TIMESTAMP(st.show_date, st.show_time) > NOW()
        ORDER BY st.show_date ASC, st.show_time ASC
        `,
        [showId]
    );

    return rows;
}

// Returns all seats for a showtime, including category, calculated price, and availability.
async function getSeats(showtimeId) {
    if (!showtimeId) {
        throw createHttpError(400, "showtimeId query parameter is required.");
    }

    const [showtimes] = await pool.query(
        `
            SELECT showtime_id
            FROM showtimes
            WHERE showtime_id = ?
        `,
        [showtimeId]
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
                    WHEN r.reservation_id IS NULL THEN TRUE
                    ELSE FALSE
                    END AS is_available
            FROM showtimes st
                     JOIN seats s ON st.hall_id = s.hall_id
                     JOIN seat_categories sc ON s.category_id = sc.category_id
                     LEFT JOIN reservation_seats rs
                               ON rs.showtime_id = st.showtime_id
                                   AND rs.seat_id = s.seat_id
                     LEFT JOIN reservations r
                               ON r.reservation_id = rs.reservation_id
                                   AND r.status = 'confirmed'
            WHERE st.showtime_id = ?
            ORDER BY s.row_label ASC, s.seat_number ASC
        `,
        [showtimeId]
    );

    // Converts database values into clean API-friendly types.
    return rows.map((seat) => ({
        ...seat,
        price: Number(seat.price),
        is_available: Boolean(seat.is_available)
    }));
}

module.exports = {
    getTheatres,
    getShows,
    getShowtimes,
    getSeats
};