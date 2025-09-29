/** @format */

const { body } = require("express-validator");

// Validate search field
const validateSearchField = body("field")
    .exists({ checkFalsy: true })
    .withMessage("Search field is required.")
    .isIn(['labId', 'email', 'contact'])
    .withMessage("Invalid search param");

// Validate search value
const validateSearchValue = body("value")
    .exists({ checkFalsy: true })
    .withMessage("Search value is required.")
    .isLength({ max: 50 })
    .withMessage("Search value must not exceed 50 characters.")
    .custom((value, { req }) => {
        const field = req.body.field;

        if (field === 'labId') {
            // For labId, it should be a string that contains only 6 digits
            if (!/^\d{6}$/.test(value)) {
                throw new Error('Lab ID must be a 6-digit number');
            }
            return true;
        }

        if (field === 'email') {
            // For email, use built-in isEmail validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                throw new Error('Please provide a valid email address');
            }
            return true;
        }

        if (field === 'contact') {
            // For contact, it should be a string of exactly 11 digits
            if (!/^\d{11}$/.test(value)) {
                throw new Error('Contact must contain exactly 11 numeric digits');
            }
            return true;
        }

        return true;
    });

const searchLabValidationRules = [
    validateSearchField,
    validateSearchValue
];

module.exports = {
    validateSearchField,
    validateSearchValue,
    searchLabValidationRules
};