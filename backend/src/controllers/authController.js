const authService = require("../services/authService");

async function register(req, res) {
    const user = await authService.registerUser(req.body);

    res.status(201).json({
        message: "User registered successfully.",
        user
    });
}

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