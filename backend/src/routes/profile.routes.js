/**
 * Profile Routes
 * Handles user profile operations
 */

import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  getProfileStats,
  getProfileOverview
} from "../controllers/profile.controller.js";

const router = Router();

/**
 * @route   GET /api/profile
 * @desc    Get logged-in user profile
 * @access  Private
 */
router.get("/", authMiddleware, getProfile);

/**
 * @route   PUT /api/profile/update
 * @desc    Update user profile
 * @access  Private
 */
router.put("/update", authMiddleware, updateProfile);

/**
 * @route   GET /api/profile/stats
 * @desc    Get user dashboard statistics
 * @access  Private
 */
router.get("/stats", authMiddleware, getProfileStats);

/**
 * @route   GET /api/profile/overview
 * @desc    Get complete profile data for profile page
 * @access  Private
 */
router.get("/overview", authMiddleware, getProfileOverview);

export default router;
