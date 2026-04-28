// Handles public catalogue HTTP requests.
// It delegates data retrieval and filtering logic to catalogService.

const catalogService = require("../services/catalogService");

// Returns the list of available theatres.
async function getTheatres(req, res) {
    const theatres = await catalogService.getTheatres();

    res.json({
        theatres
    });
}

// Returns shows, using optional query filters such as title, theatreId, location, or date.
async function getShows(req, res) {
    const shows = await catalogService.getShows(req.query);

    res.json({
        shows
    });
}

// Returns future showtimes for a selected show.
async function getShowtimes(req, res) {
    const showtimes = await catalogService.getShowtimes(req.query.showId);

    res.json({
        showtimes
    });
}

// Returns seats for a selected showtime, including price, category, and availability.
async function getSeats(req, res) {
    const seats = await catalogService.getSeats(req.query.showtimeId);

    res.json({
        seats
    });
}

module.exports = {
    getTheatres,
    getShows,
    getShowtimes,
    getSeats
};