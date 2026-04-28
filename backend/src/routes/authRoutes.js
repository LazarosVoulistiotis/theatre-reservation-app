// Defines public authentication routes for user registration and login.
// The actual authentication logic is handled by authController and authService.

const express = require("express");
const authController = require("../controllers/authController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// Creates a new user account.
router.post("/register", asyncHandler(authController.register));

// Authenticates an existing user and returns a JWT token.
router.post("/login", asyncHandler(authController.login));

module.exports = router;