const jwt = require("jsonwebtoken");
const createHttpError = require("../utils/httpError");

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(createHttpError(401, "Authentication token is required."));
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            userId: decoded.userId,
            email: decoded.email
        };

        next();
    } catch (error) {
        next(createHttpError(401, "Invalid or expired authentication token."));
    }
}

module.exports = authMiddleware;