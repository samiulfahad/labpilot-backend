/** @format */

const { body } = require("express-validator");

// Validate referrerId 
const validateReferrerId = body("invoiceData.referrerId")
  .exists({ checkFalsy: true })
  .withMessage("Referrer ID is required.") // Check for existence and non-empty
  .isString()
  .withMessage("Referrer ID must be a string.")
  .isLength({ max: 50 })
  .withMessage("Referrer ID must not exceed 50 characters.");



// Total: required, must be a valid number
const validateTotal = body("invoiceData.total")
  .exists({ checkFalsy: true })
  .withMessage("Total is required.") // Check for existence and non-empty
  .isFloat({ min: 0 })
  .withMessage("Total must be a valid number greater than or equal to 0.");

// Discount: optional, must be a valid number
const validateDiscount = body("invoiceData.discount")
  .optional()
  .isFloat({ min: 0 })
  .withMessage("Discount must be a valid number greater than or equal to 0.");

  // Discount Type
const validateDiscountType = body('invoiceData.discountType')
.optional()
.isIn(['fixed', 'percentage'])
.withMessage('Discount Type is not correct.');

const validatePaid = body("invoiceData.paid")
  .exists()
  .withMessage("Paid status is required.") // Check for existence and non-empty
  .isInt({ min: 0 })
  .withMessage("Paid must be an integer value."); // Check if it's an integer (0 or higher)

const validateTestList = body("invoiceData.testList")
  .exists({ checkFalsy: true })
  .withMessage("Test List is required.") // Check for existence and non-empty
  .isArray({ min: 1, max: 50 })
  .withMessage("Test List must be an array with at least one item and a maximum of 50 items.")
  .custom((value) => {
    if (value.length === 0) {
      throw new Error("Test List must contain at least one item.");
    }
    if (value.length > 50) {
      throw new Error("Test List can contain a maximum of 50 items.");
    }
    return true;
  });

// Combine all validations into a reusable array
const invoiceValidationRules = [validateReferrerId, validateTotal, validateDiscount, validateDiscountType, validatePaid, validateTestList];

module.exports = {
  validateReferrerId,
  validateTotal,
  validateDiscount,
  validateDiscountType,
  validatePaid,
  validateTestList,
  invoiceValidationRules, // Export the combined rules
};
