/** @format */

const { body } = require("express-validator");

// Validate referrerId
const validateName = body("invoiceData.referrerId")
  .exists({ checkFalsy: true })
  .withMessage("Lab name is required.")
  .isString()
  .withMessage("Lab name must be a string.")
  .isLength({ max: 150 })
  .withMessage("Lab name must not exceed 150 characters.");


// Validate referrerId
const validateAddress = body("invoiceData.referrerId")
  .exists({ checkFalsy: true })
  .withMessage("Lab address is required.")
  .isString()
  .withMessage("Lab address must be a string.")
  .isLength({ max: 200 })
  .withMessage("Lab address must not exceed 200 characters.");


// Contact: required, exactly 11 numeric digits
const validateContact1 = body('patientData.contact')
  .exists({ checkFalsy: true }).withMessage('Contact is required.') // Check for existence and non-empty
  .isNumeric()
  .trim()
  .isLength({ min: 11, max: 11 })
  .withMessage('Contact must contain exactly 11 numeric digits.');


// Contact: required, exactly 11 numeric digits
const validateContact2 = body('patientData.contact')
  .exists({ checkFalsy: true }).withMessage('Contact is required.') // Check for existence and non-empty
  .isNumeric()
  .trim()
  .isLength({ min: 11, max: 11 })
  .withMessage('Contact must contain exactly 11 numeric digits.');


const invoiceValidationRules = [
];

module.exports = {
  invoiceValidationRules, // Export the combined rules
};
