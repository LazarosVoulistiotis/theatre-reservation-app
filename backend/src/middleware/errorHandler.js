function errorHandler(err, req, res, next) {
    console.error(err);

    if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            message: "Duplicate record detected."
        });
    }

    res.status(err.status || 500).json({
        message: err.message || "Internal server error"
    });
}

module.exports = errorHandler;