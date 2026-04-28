// Centralized Express error handler.
// It converts thrown errors into consistent JSON API responses.

function errorHandler(err, req, res, next) {
    console.error(err);

    // Handles MariaDB duplicate key errors, such as double-booked seats or duplicate emails.
    if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            message: "Duplicate record detected."
        });
    }

    // Uses the custom status code when available, otherwise defaults to 500.
    res.status(err.status || 500).json({
        message: err.message || "Internal server error"
    });
}

module.exports = errorHandler;