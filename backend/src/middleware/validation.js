const { body, validationResult } = require('express-validator');

// Validation Middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Register Validation Rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('role').isIn(['student', 'faculty', 'hod']),
];

// Login Validation Rules
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

// Student Registration Validation
const studentRegistrationValidation = [
  ...registerValidation,
  body('studentId').matches(/^[A-Z]+-\d{4}-\d{3}$/),
  body('rollNumber').notEmpty(),
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  studentRegistrationValidation,
};
