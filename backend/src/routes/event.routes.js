/**
 * Event Routes
 * Handles event CRUD operations
 */

import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireOrganizer } from "../middleware/roleMiddleware.js";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} from "../controllers/event.controller.js";

const router = Router();

/**
 * @route   GET /api/events
 * @desc    Get all events with optional filters
 * @access  Public
 */
router.get("/", getAllEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Get single event by ID
 * @access  Public
 */
router.get("/:id", getEventById);

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (Organizers only)
 */
router.post("/", authMiddleware, requireOrganizer, createEvent);

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Private (Organizers only - own events)
 */
router.put("/:id", authMiddleware, requireOrganizer, updateEvent);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Private (Organizers only - own events)
 */
router.delete("/:id", authMiddleware, requireOrganizer, deleteEvent);

export default router;
