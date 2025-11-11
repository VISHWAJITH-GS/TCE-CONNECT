/**
 * Authentication Controller
 * Handles user registration, login, logout, and token refresh
 */

import jwt from "jsonwebtoken";
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { env } from "../config/env.js";

/**
 * Register a new user
 * POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  try {
    console.log('📝 Registration request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { 
      email, 
      password, 
      full_name, 
      reg_number, 
      department, 
      year, 
      phone_number, 
      role 
    } = req.body;

    console.log('Extracted fields:', { email, password: '***', full_name, reg_number, department, year, phone_number, role });

    // ✅ Step 1: Input Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required"
      });
    }

    if (!role || !['student', 'event_manager'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'student' or 'event_manager'"
      });
    }

    if (year && (year < 1 || year > 5)) {
      return res.status(400).json({
        success: false,
        message: "Year must be between 1 and 5"
      });
    }

    // ✅ Step 2: Create user in Supabase Auth using admin API
    console.log('Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: full_name || null,
      },
    });

    console.log('Supabase Auth response:', { authData: authData ? 'User created' : 'null', error: authError });

    if (authError) {
      console.error('❌ Supabase Auth Error:', authError);
      // Handle specific Supabase auth errors
      if (authError.message.includes('already registered')) {
        return res.status(400).json({
          success: false,
          message: "Email already registered"
        });
      }
      return res.status(400).json({
        success: false,
        message: authError.message || "Failed to create user account",
        error: authError
      });
    }

    const userId = authData.user.id;
    console.log('✅ User created with ID:', userId);

    // ✅ Step 3: Insert profile row in profiles table
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: userId,
        email,
        full_name: full_name || null,
        reg_number: reg_number || null,
        department: department || null,
        year: year || null,
        phone_number: phone_number || null,
        role
      })
      .select()
      .single();

    if (profileError) {
      // ✅ Rollback: Delete the auth user if profile creation fails to avoid ghost accounts
      console.error('Profile creation failed, rolling back user:', profileError);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      
      return res.status(500).json({
        success: false,
        message: "Failed to create user profile",
        error: profileError.message
      });
    }

    // ✅ Step 4: Generate JWT token (same as login)
    const token = jwt.sign(
      {
        user_id: userId,
        email,
        role
      },
      env.jwtSecret,
      { expiresIn: "7d" }
    );

    // ✅ Step 5: Return success response
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: profileData
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message
    });
  }
};

// Keep old function name as alias for backward compatibility
export const register = registerUser;

/**
 * Login user
 * POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    // Sign in using Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log('❌ Auth failed:', error.message);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = data.user;
    console.log('✅ Auth successful, user ID:', user.id);

    // Fetch profile data from "profiles" table using admin client (bypass RLS)
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", user.id);

    console.log('Profile query result:', { 
      count: profiles?.length || 0,
      profiles: profiles,
      error: profileError ? profileError.message : null 
    });

    if (profileError) {
      console.error('❌ Database error:', profileError);
      return res.status(500).json({
        success: false,
        message: "Database error",
        details: profileError.message
      });
    }

    if (!profiles || profiles.length === 0) {
      console.error('❌ No profile found for user:', user.id);
      return res.status(400).json({
        success: false,
        message: "Profile not found. Please contact administrator.",
        details: "User authenticated but no profile exists in database"
      });
    }

    if (profiles.length > 1) {
      console.error('❌ Multiple profiles found for user:', user.id, '- Count:', profiles.length);
      return res.status(400).json({
        success: false,
        message: "Multiple profiles found. Please contact administrator.",
        details: `Found ${profiles.length} profiles for this user`
      });
    }

    const profile = profiles[0];

    console.log('✅ Profile found:', profile.email, '- Role:', profile.role);

    // Create JWT (used by Express middleware)
    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        role: profile.role
      },
      env.jwtSecret,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: profile
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Keep the old login function name as an alias for backward compatibility
export const login = loginUser;

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      await supabase.auth.admin.signOut(token);
    }

    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'Logout failed', 500);
  }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, {
      user: {
        id: req.user.id,
        email: req.user.email,
        profile,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse(res, 'Failed to fetch user data', 500);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      return errorResponse(res, 'Invalid or expired refresh token', 401);
    }

    return successResponse(res, {
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    }, 'Token refreshed successfully');
  } catch (error) {
    console.error('Refresh token error:', error);
    return errorResponse(res, 'Token refresh failed', 500);
  }
};
