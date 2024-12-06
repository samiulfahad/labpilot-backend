/** @format */

const { body } = require("express-validator");

// Validate referrerId
const validateReferrerId = body("invoiceData.referrerId")
  .exists({ checkFalsy: true })
  .withMessage("Referrer ID is required.")
  .isString()
  .withMessage("Referrer ID must be a string.")
  .isLength({ max: 50 })
  .withMessage("Referrer ID must not exceed 50 characters.");

// Total: required, must be a valid number, max value 50000000
const validateTotal = body("invoiceData.total")
  .exists({ checkFalsy: true })
  .withMessage("Total is required.")
  .isFloat({ min: 0, max: 50000000 })
  .withMessage("Total must be a valid number between 0 and 50000000.");

// Discount: required, must be a string or number in '450 Taka' or '20%' format
const validateDiscount = body("invoiceData.discount")
  .not()
  .isEmpty()
  .withMessage("Discount is required.")
  .custom((value, { req }) => {
    const total = req.body.invoiceData.total;

    if (typeof value === "number") {
      // If discount is a number, ensure it doesn't exceed total
      if (value < 0) {
        throw new Error("Numeric discount cannot be negative.");
      }
      if (value > total) {
        throw new Error("Numeric discount cannot exceed the total amount.");
      }
    } else if (typeof value === "string") {
      // Check if discount is in '450 Taka' or '20%' format
      const takaRegex = /^(\d+)\sTaka$/;
      const percentRegex = /^(\d+)%$/;

      if (takaRegex.test(value)) {
        // Validate '450 Taka' format
        const match = value.match(takaRegex);
        const takaValue = parseFloat(match[1]);

        if (takaValue > total) {
          throw new Error("Taka discount cannot exceed the total amount.");
        }
      } else if (percentRegex.test(value)) {
        // Validate '20%' format
        const match = value.match(percentRegex);
        const percentValue = parseFloat(match[1]);

        if (percentValue > 100) {
          throw new Error("Percentage discount cannot exceed 100%.");
        }
      } else {
        throw new Error("Discount must be in the format '450 Taka' or '20%'.");
      }
    } else {
      // Invalid type
      throw new Error("Discount must be a valid number or string in the format '450 Taka' or '20%'.");
    }

    return true;
  });

// LabAdjustment: must be greater than or equal to 0 and less than or equal to netAmount
const validateLabAdjustment = body("invoiceData.labAdjustment")
  .not()
  .isEmpty()
  .withMessage("Lab Adjustment is required.")
  .isFloat({ min: 0 })
  .withMessage("Lab Adjustment must be a valid number greater than or equal to 0.")
  .custom((value, { req }) => {
    const total = req.body.invoiceData.total;
    if (value > total) {
      throw new Error("Lab Adjustment cannot exceed the net amount.");
    }
    return true;
  });

// NetAmount: required, must be a valid number, max value 50000000, cannot exceed total
const validateNetAmount = body("invoiceData.netAmount")
  .not()
  .isEmpty()
  .withMessage("Net amount is required.")
  .isFloat({ min: 0, max: 50000000 }) // min: 0 ensures no negative values
  .withMessage("Net amount must be a valid number between 0 and 50000000.")
  .custom((value, { req }) => {
    const total = req.body.invoiceData.total;
    if (value > total || value < 0) {
      throw new Error("Net amount cannot exceed the total or negative.");
    }
    return true;
  });

// Paid: required, must be an integer, cannot exceed netAmount
const validatePaid = body("invoiceData.paid")
  .exists()
  .withMessage("Paid status is required.")
  .isInt({ min: 0 })
  .withMessage("Paid must be an integer value.")
  .custom((value, { req }) => {
    const netAmount = req.body.invoiceData.netAmount;
    if (value > netAmount) {
      throw new Error("Paid amount cannot exceed the net amount.");
    }
    return true;
  });

// Commission: required, must be greater than or equal to 0, cannot exceed netAmount
const validateCommission = body("invoiceData.commission")
  .not()
  .isEmpty()
  .withMessage("Commission is required.")
  .isFloat({ min: 0 })
  .withMessage("Commission must be a valid number greater than or equal to 0.")
  .custom((value, { req }) => {
    const total = req.body.invoiceData.total;
    if (value > total) {
      throw new Error("Commission cannot exceed the total.");
    }
    return true;
  });

// TestList: required, must be an array with 1-500 items
const validateTestList = body("invoiceData.testList")
  .exists({ checkFalsy: true })
  .withMessage("Test List is required.")
  .isArray({ min: 1, max: 500 })
  .withMessage("Test List must be an array with 1 to 500 items.");

// Combine all validations into a reusable array
const invoiceValidationRules = [
  validateReferrerId,
  validateTotal,
  validateDiscount,
  validateLabAdjustment,
  validateNetAmount,
  validatePaid,
  validateCommission,
  validateTestList,
];

module.exports = {
  validateReferrerId,
  validateTotal,
  validateNetAmount,
  validateDiscount,
  validatePaid,
  validateTestList,
  validateCommission,
  validateLabAdjustment,
  invoiceValidationRules, // Export the combined rules
};
