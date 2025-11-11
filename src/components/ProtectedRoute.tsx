/**
 * Protected Route Component
 * Role-based route protection with proper redirects
 */

import { Navigate } from "react-router-dom";
import { getToken, getUserRole } from "@/lib/api";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: "student" | "event_manager"; // Optional: specific role required
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const token = localStorage.getItem("tce_token");
  const role = localStorage.getItem("tce_role");

  // ✅ Step 1: Check if user is authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Step 2: If a specific role is required, validate it
  if (requiredRole) {
    // If role doesn't match, redirect to home page
    if (role !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  // ✅ Step 3: User is authenticated and authorized
  return children;
}
