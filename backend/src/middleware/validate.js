/**
 * Validation Middleware
 * Re-exports validation utilities for easier imports
 */

import { handleValidationErrors } from '../utils/validators.js';

/**
 * Middleware to handle validation errors
 * Should be used after validation rules
 */
export default handleValidationErrors;
