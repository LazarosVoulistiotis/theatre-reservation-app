// Handles JWT token generation for authenticated users.
// The token contains only the minimum user identity data required by protected routes.

const jwt = require("jsonwebtoken");

function signToken(user) {
    return jwt.sign(
        {
            userId: user.user_id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );
}

module.exports = {
    signToken
};