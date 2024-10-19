// handleValidationErrors.js
const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // throw new Error("Could not get all invoices @statusCode 400");
        return res.status(400).json({ errors: errors.array() });
    }
    next(); // Proceed to the next middleware or route handler if there are no errors
};

module.exports = handleValidationErrors;