/**
 * Role-Based Access Control Middleware
 * Restricts access based on user role
 */

import { supabase } from '../config/supabase.js';
import { errorResponse } from '../utils/response.js';

/**
 * Require event manager role (organizer)
 */
export const requireOrganizer = (req, res, next) => {
  if (req.user.role !== "event_manager") {
    return res.status(403).json({
      success: false,
      message: "Only event managers can perform this action"
    });
  }
  next();
};

/**
 * Check if user has required role
 * @param {Array} allowedRoles - Array of allowed roles
 */
export const checkRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return errorResponse(res, 'Authentication required', 401);
      }

      // If role is already in req.user (JWT-based), check it directly
      if (req.user.role) {
        if (!allowedRoles.includes(req.user.role)) {
          return errorResponse(
            res,
            'Insufficient permissions. This action requires a different role.',
            403
          );
        }
        next();
        return;
      }

      // Otherwise fetch user profile to get role (Supabase-based)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user.id || req.user.user_id)
        .single();

      if (error || !profile) {
        return errorResponse(res, 'User profile not found', 404);
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(profile.role)) {
        return errorResponse(
          res,
          'Insufficient permissions. This action requires a different role.',
          403
        );
      }

      // Attach role to request for future use
      req.user.role = profile.role;

      next();
    } catch (error) {
      console.error('Role check error:', error);
      return errorResponse(res, 'Authorization failed', 403);
    }
  };
};

/**
 * Require student role
 */
export const requireStudent = checkRole(['student']);

/**
 * Require admin role (for future use)
 */
export const requireAdmin = checkRole(['admin']);

/**
 * Allow multiple roles
 */
export const requireAnyRole = (roles) => checkRole(roles);
