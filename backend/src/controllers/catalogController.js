const catalogService = require("../services/catalogService");

async function getTheatres(req, res) {
    const theatres = await catalogService.getTheatres();

    res.json({
        theatres
    });
}

async function getShows(req, res) {
    const shows = await catalogService.getShows(req.query);

    res.json({
        shows
    });
}

async function getShowtimes(req, res) {
    const showtimes = await catalogService.getShowtimes(req.query.showId);

    res.json({
        showtimes
    });
}

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