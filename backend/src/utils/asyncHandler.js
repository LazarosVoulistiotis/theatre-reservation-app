// Wraps asynchronous route/controller functions and forwards errors to Express error handling.
// This avoids repeating try/catch blocks in every controller.

function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = asyncHandler;