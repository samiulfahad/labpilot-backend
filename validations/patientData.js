const { body } = require('express-validator');

// Validation for each field with max length and exact length for contact

// Name: required, max length 100, letters only
const validateName = body('patientData.name')
  .exists({ checkFalsy: true }).withMessage('Name is required.') // Check for existence and non-empty
  .isString()
  .trim()
  .isLength({ max: 70 })
  .withMessage('Name must be a valid string with a maximum length of 100 characters.')
  .matches(/^[A-Za-z\s]+$/).withMessage('Name must contain letters only (no numbers or special characters).');

// Age: required, must be a valid integer, non-negative
const validateAge = body('patientData.age')
  .exists({ checkFalsy: true }).withMessage('Age is required.') // Check for existence and non-empty
  .isInt({ min: 0, max:200 })
  .toInt()
  .withMessage('Age must be a valid integer greater than or equal to 0.');

// Contact: required, exactly 11 numeric digits
const validateContact = body('patientData.contact')
  .exists({ checkFalsy: true }).withMessage('Contact is required.') // Check for existence and non-empty
  .isNumeric()
  .trim()
  .isLength({ min: 11, max: 11 })
  .withMessage('Contact must contain exactly 11 numeric digits.');

// Gender: required, must be either 'male' or 'female'
const validateGender = body('patientData.gender')
  .exists({ checkFalsy: true }).withMessage('Gender is required.') // Check for existence and non-empty
  .isIn(['male', 'female'])
  .withMessage('Gender must be either male or female.');

// DoctorName: required, max length 100
const validateDoctorName = body('patientData.doctorName')
  .exists({ checkFalsy: true }).withMessage('Doctor name is required.') // Check for existence and non-empty
  .isString()
  .trim()
  .isLength({ max: 100 })
  .withMessage('Doctor name must be a valid string with a maximum length of 100 characters.');

// Combine all validations into a reusable array
const patientValidationRules = [
  validateName,
  validateAge,
  validateContact,
  validateGender,
  validateDoctorName,
];

module.exports = {
  validateName,
  validateAge,
  validateContact,
  validateGender,
  validateDoctorName,
  patientValidationRules,  // Export the combined rules
};
