// Creates an Error object with an HTTP status code.
// This allows services to throw meaningful API errors.

function createHttpError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

module.exports = createHttpError;