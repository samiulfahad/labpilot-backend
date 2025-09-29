/** @format */

const { body } = require("express-validator");

// Validate labName
const validateLabName = body("labName")
    .exists({ checkFalsy: true })
    .withMessage("Lab name is required.")
    .isString()
    .trim()
    .withMessage("Lab name must be a string.")
    .isLength({ max: 150 })
    .withMessage("Lab name must not exceed 150 characters.");

// Validate labId - 6 digit number
const validateLabId = body("labId")
    .exists({ checkFalsy: true })
    .withMessage("Lab ID is required.")
    .isInt({ min: 100000, max: 999999 })
    .withMessage("Lab ID must be a 6-digit number.");

// Validate address
const validateAddress = body("address")
    .exists({ checkFalsy: true })
    .withMessage("Lab address is required.")
    .isString()
    .trim()
    .withMessage("Lab address must be a string.")
    .isLength({ max: 200 })
    .withMessage("Lab address must not exceed 200 characters.");

// Contact: required, exactly 11 numeric digits
const validateContact1 = body('contact1')
    .exists({ checkFalsy: true }).withMessage('Contact Number is required.')
    .isNumeric().withMessage('Contact must contain only numeric digits.')
    .trim()
    .isLength({ min: 11, max: 11 })
    .withMessage('Contact must contain exactly 11 numeric digits.');

// Contact: optional, but if provided must be exactly 11 numeric digits
const validateContact2 = body('contact2')
    .optional({ checkFalsy: true })
    .isNumeric().withMessage('Contact must contain only numeric digits.')
    .trim()
    .isLength({ min: 11, max: 11 })
    .withMessage('Contact must contain exactly 11 numeric digits.');

// Email: required, must be valid email format
const validateEmail = body('email')
    .exists({ checkFalsy: true }).withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail();

// Active Status: required, must be boolean
const validateActiveStatus = body('activeStatus')
    .exists().withMessage('Active status is required.')
    .isBoolean().withMessage('Active status must be either true or false.');


// Zone: required, must be a string
const validateZone = body('zone')
    .exists({ checkFalsy: true }).withMessage('Zone is required.')
    .isString().withMessage('Zone must be a string.')
    .trim()
    .isLength({ max: 100 }).withMessage('Zone must not exceed 100 characters.');

// Sub Zone: required, must be a string
const validateSubZone = body('subZone')
    .exists({ checkFalsy: true }).withMessage('Sub zone is required.')
    .isString().withMessage('Sub zone must be a string.')
    .trim()
    .isLength({ max: 100 }).withMessage('Sub zone must not exceed 100 characters.');

const labAccountValidationRules = [
    validateLabName,
    validateLabId,
    validateAddress,
    validateContact1,
    validateContact2,
    validateEmail,
    validateZone,
    validateSubZone,
    validateActiveStatus
];


module.exports = {
    validateLabName,
    validateLabId,
    validateAddress,
    validateContact1,
    validateContact2,
    validateEmail,
    validateZone,
    validateSubZone,
    validateActiveStatus,
    labAccountValidationRules
};