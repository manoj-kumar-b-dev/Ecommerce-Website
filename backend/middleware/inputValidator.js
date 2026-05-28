import { body, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return next(new Error(errors.array().map(err => `${err.path}: ${err.msg}`).join(' | ')));
  }
  next();
};

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Full identity field must not be empty').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Provide a syntactically correct email reference address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must contain at least 6 characters'),
  validateRequest
];

export const productCreateValidator = [
  body('name').trim().notEmpty().withMessage('Product title is an application creation dependency constraint'),
  body('price').isFloat({ gte: 0 }).withMessage('Price field must match real absolute numerical boundaries'),
  body('stock').isInt({ gte: 0 }).withMessage('Inventory allocation block cannot drop below 0 items'),
  body('images').isArray({ min: 1 }).withMessage('At least one binary image array repository ref is dependency criteria'),
  validateRequest
];