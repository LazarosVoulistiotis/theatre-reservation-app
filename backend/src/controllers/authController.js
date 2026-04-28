// Handles authentication HTTP requests.
// Business logic such as validation, password hashing, and JWT generation is delegated to authService.

const authService = require("../services/authService");

// Registers a new user and returns the created user without exposing the password hash.
async function register(req, res) {
    const user = await authService.registerUser(req.body);

    res.status(201).json({
        message: "User registered successfully.",
        user
    });
}

// Authenticates a user and returns a JWT token for protected API requests.
async function login(req, res) {
    const result = await authService.loginUser(req.body);

    res.json({
        message: "Login successful.",
        token: result.token,
        user: result.user
    });
}

module.exports = {
    register,
    login
};