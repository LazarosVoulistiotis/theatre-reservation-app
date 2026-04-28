// Middleware that protects private API routes using JWT authentication.
// It validates the Bearer token and attaches the authenticated user to the request.

const jwt = require("jsonwebtoken");
const createHttpError = require("../utils/httpError");

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    // Protected routes require an Authorization header in the format: Bearer <token>.
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(createHttpError(401, "Authentication token is required."));
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verifies the token using the secret key stored in environment variables.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Makes the authenticated user's identity available to the next handlers.
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