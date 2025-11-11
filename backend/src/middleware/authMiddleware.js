/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */

import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { getUserFromToken } from '../config/supabase.js';
import { errorResponse } from '../utils/response.js';

/**
 * Authenticate user from Bearer token (JWT-based)
 */
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

/**
 * Authenticate user from Bearer token (Supabase-based)
 * Keep this for backward compatibility
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token and get user
    const user = await getUserFromToken(token);

    if (!user) {
      return errorResponse(res, 'Invalid or expired token', 401);
    }

    // Attach user to request object
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return errorResponse(res, 'Authentication failed', 401);
  }
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work differently for authenticated users
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const user = await getUserFromToken(token);

      if (user) {
        req.user = user;
        req.token = token;
      }
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};
