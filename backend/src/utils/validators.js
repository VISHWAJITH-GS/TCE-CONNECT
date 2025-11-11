/**
 * Input Validation Utilities
 * Provides validation rules for request data
 */

import { body, param, query, validationResult } from 'express-validator';

/**
 * Auth Validation Rules
 */
export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('reg_number')
    .optional()
    .trim(),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['student', 'event_manager'])
    .withMessage('Role must be either student or event_manager'),
  body('department')
    .optional()
    .trim(),
  body('year')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Year must be between 1 and 5'),
  body('phone_number')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Event Validation Rules
 */
export const createEventValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Event description is required')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      const eventDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDate < today) {
        throw new Error('Event date cannot be in the past');
      }
      return true;
    }),
  body('time')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  body('venue')
    .trim()
    .notEmpty()
    .withMessage('Venue is required'),
  body('category')
    .isIn(['Technical', 'Cultural', 'Sports', 'Other'])
    .withMessage('Invalid event category'),
  body('max_participants')
    .isInt({ min: 1 })
    .withMessage('Maximum participants must be at least 1'),
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array'),
  body('highlights')
    .optional()
    .isArray()
    .withMessage('Highlights must be an array'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid image URL'),
];

export const updateEventValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid event ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('max_participants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum participants must be at least 1'),
];

/**
 * Registration Validation Rules
 */
export const registerForEventValidation = [
  body('event_id')
    .isUUID()
    .withMessage('Invalid event ID'),
];

/**
 * Profile Validation Rules
 */
export const updateProfileValidation = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('department')
    .optional()
    .trim(),
  body('year')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Year must be between 1 and 5'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
];

export const changePasswordValidation = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .custom((value, { req }) => {
      if (value === req.body.current_password) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
];

/**
 * Query Validation Rules
 */
export const getEventsValidation = [
  query('category')
    .optional()
    .isIn(['All', 'Technical', 'Cultural', 'Sports', 'Other'])
    .withMessage('Invalid category'),
  query('search')
    .optional()
    .trim(),
  query('upcoming')
    .optional()
    .isBoolean()
    .withMessage('Upcoming must be a boolean'),
];

/**
 * ID Parameter Validation
 */
export const idParamValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
];

/**
 * Validation Result Handler Middleware
 * Checks validation results and returns errors if any
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
      })),
      timestamp: new Date().toISOString(),
    });
  }
  next();
};
