/**
 * Registration Routes
 * Handles event registration operations
 */

import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireOrganizer } from "../middleware/roleMiddleware.js";
import {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations
} from "../controllers/registration.controller.js";

const router = Router();

/**
 * @route   POST /api/registrations/:event_id
 * @desc    Register for an event
 * @access  Private (Students only)
 */
router.post("/:event_id", authMiddleware, registerForEvent);

/**
 * @route   GET /api/registrations/mine
 * @desc    Get all registrations for current user
 * @access  Private
 */
router.get("/mine", authMiddleware, getMyRegistrations);

/**
 * @route   GET /api/registrations/event/:event_id
 * @desc    Get all registrations for a specific event (organizers only)
 * @access  Private (Organizers only - own events)
 */
router.get("/event/:event_id", authMiddleware, requireOrganizer, getEventRegistrations);

export default router;

