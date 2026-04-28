const bcrypt = require("bcrypt");
const pool = require("../db/pool");
const createHttpError = require("../utils/httpError");
const { signToken } = require("../utils/jwt");

function validateRegisterInput(name, email, password) {
    if (!name || !email || !password) {
        throw createHttpError(400, "Name, email and password are required.");
    }

    if (!email.includes("@")) {
        throw createHttpError(400, "A valid email address is required.");
    }

    if (password.length < 6) {
        throw createHttpError(400, "Password must be at least 6 characters long.");
    }
}

function validateLoginInput(email, password) {
    if (!email || !password) {
        throw createHttpError(400, "Email and password are required.");
    }
}

async function registerUser({ name, email, password }) {
    validateRegisterInput(name, email, password);

    const normalizedEmail = email.trim().toLowerCase();

    const [existingUsers] = await pool.query(
        "SELECT user_id FROM users WHERE email = ?",
        [normalizedEmail]
    );

    if (existingUsers.length > 0) {
        throw createHttpError(409, "Email is already registered.");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
        `
    INSERT INTO users (name, email, password_hash)
    VALUES (?, ?, ?)
    `,
        [name.trim(), normalizedEmail, passwordHash]
    );

    return {
        user_id: result.insertId,
        name: name.trim(),
        email: normalizedEmail
    };
}

async function loginUser({ email, password }) {
    validateLoginInput(email, password);

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await pool.query(
        `
    SELECT user_id, name, email, password_hash
    FROM users
    WHERE email = ?
    `,
        [normalizedEmail]
    );

    if (users.length === 0) {
        throw createHttpError(401, "Invalid email or password.");
    }

    const user = users[0];

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
        throw createHttpError(401, "Invalid email or password.");
    }

    const token = signToken(user);

    return {
        token,
        user: {
            user_id: user.user_id,
            name: user.name,
            email: user.email
        }
    };
}

module.exports = {
    registerUser,
    loginUser
};