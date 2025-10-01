const { body, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  validate
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const templateValidation = [
  body('name').trim().notEmpty().withMessage('Template name is required'),
  body('description').optional().trim(),
  body('status').optional().isIn(['draft', 'active', 'archived']).withMessage('Invalid status'),
  validate
];

const placementValidation = [
  body('*.fieldType').isIn(['signature', 'initial', 'date', 'text']).withMessage('Invalid field type'),
  body('*.pageNumber').isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
  body('*.xPosition').isFloat({ min: 0 }).withMessage('X position must be a non-negative number'),
  body('*.yPosition').isFloat({ min: 0 }).withMessage('Y position must be a non-negative number'),
  body('*.width').isFloat({ min: 1 }).withMessage('Width must be a positive number'),
  body('*.height').isFloat({ min: 1 }).withMessage('Height must be a positive number'),
  body('*.isRequired').optional().isBoolean(),
  validate
];

const documentValidation = [
  body('title').trim().notEmpty().withMessage('Document title is required'),
  body('templateId').optional().isInt().withMessage('Invalid template ID'),
  body('message').optional().trim(),
  body('expirationDate').optional().isISO8601().withMessage('Invalid expiration date'),
  validate
];

const recipientValidation = [
  body('*.name').trim().notEmpty().withMessage('Recipient name is required'),
  body('*.email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('*.role').optional().trim(),
  body('*.signing_order').optional().isInt({ min: 1 }).withMessage('Signing order must be a positive integer'),
  validate
];

const signatureValidation = [
  body('signatures').isArray({ min: 1 }).withMessage('At least one signature is required'),
  body('signatures.*.placementId').isInt().withMessage('Invalid placement ID'),
  body('signatures.*.signatureData').optional().trim(),
  body('signatures.*.value').optional().trim(),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  templateValidation,
  placementValidation,
  documentValidation,
  recipientValidation,
  signatureValidation
};
