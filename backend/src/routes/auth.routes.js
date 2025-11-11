/**
 * Authentication Routes
 * Handles user authentication endpoints
 */

import { Router } from "express";
import { loginUser, registerUser, logout, getCurrentUser, refreshToken } from "../controllers/auth.controller.js";
import { authMiddleware } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import {
  registerValidation,
  loginValidation,
} from '../utils/validators.js';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", loginUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authMiddleware, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', authMiddleware, getCurrentUser);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', refreshToken);

export default router;
