/**
 * Club Routes
 * Handles club-related endpoints
 */

import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getAllClubs,
  getMyClubs,
  joinClub,
  leaveClub,
  getClubById
} from "../controllers/club.controller.js";

const router = Router();

/**
 * @route   GET /api/clubs
 * @desc    Get all clubs
 * @access  Public
 */
router.get("/", getAllClubs);

/**
 * @route   GET /api/clubs/mine
 * @desc    Get clubs for current user
 * @access  Private
 */
router.get("/mine", authMiddleware, getMyClubs);

/**
 * @route   GET /api/clubs/:club_id
 * @desc    Get club details by ID
 * @access  Public
 */
router.get("/:club_id", getClubById);

/**
 * @route   POST /api/clubs/:club_id/join
 * @desc    Join a club
 * @access  Private
 */
router.post("/:club_id/join", authMiddleware, joinClub);

/**
 * @route   DELETE /api/clubs/:club_id/leave
 * @desc    Leave a club
 * @access  Private
 */
router.delete("/:club_id/leave", authMiddleware, leaveClub);

export default router;
