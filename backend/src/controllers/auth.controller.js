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

    // ✅ Step 2: Check if user already exists in profiles table first
    console.log('Checking if email already exists in profiles...');
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email')
      .eq('email', email)
      .maybeSingle();

    console.log('Email check result:', { 
      exists: !!existingProfile, 
      profile: existingProfile,
      error: checkError 
    });

    if (existingProfile) {
      console.log('❌ Email already registered in profiles:', email);
      return res.status(400).json({
        success: false,
        message: "Email already registered. Please login or use a different email."
      });
    }

    console.log('✅ Email not found in profiles, proceeding...');

    // ✅ Step 2.5: Check if user exists in Supabase Auth
    console.log('Checking if email already exists in Supabase Auth...');
    const { data: authUsers, error: authCheckError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authUsers && authUsers.users) {
      const existingAuthUser = authUsers.users.find(u => u.email === email);
      if (existingAuthUser) {
        console.log('❌ Email already exists in Supabase Auth:', email);
        console.log('Orphaned auth user found, user_id:', existingAuthUser.id);
        
        // Check if this is an orphaned user (auth exists but no profile)
        const { data: orphanProfile } = await supabaseAdmin
          .from('profiles')
          .select('user_id')
          .eq('user_id', existingAuthUser.id)
          .maybeSingle();
        
        if (!orphanProfile) {
          console.log('🧹 Cleaning up orphaned auth user:', existingAuthUser.id);
          // Delete the orphaned auth user so we can recreate it properly
          await supabaseAdmin.auth.admin.deleteUser(existingAuthUser.id);
          console.log('✅ Orphaned auth user deleted, will proceed with registration');
        } else {
          return res.status(400).json({
            success: false,
            message: "Email already registered. Please login or use a different email."
          });
        }
      }
    }

    // ✅ Step 3: Create user in Supabase Auth using admin API
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
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        return res.status(400).json({
          success: false,
          message: "Email already registered. Please login or use a different email."
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

    // ✅ Step 4: Check if profile already exists with this user_id (auto-created by Supabase)
    console.log('Checking if profile already exists for user_id:', userId);
    const { data: existingUserProfile, error: userProfileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('Profile check result:', { 
      exists: !!existingUserProfile, 
      profile: existingUserProfile,
      error: userProfileCheckError 
    });

    let profileData;
    let profileError;

    if (existingUserProfile) {
      // Profile already exists (auto-created by Supabase), so update it with additional info
      console.log('✅ Profile already exists (auto-created by Supabase), updating with user details...');
      
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: full_name || null,
          reg_number: reg_number || null,
          department: department || null,
          year: year || null,
          phone_number: phone_number || null,
          role
        })
        .eq('user_id', userId)
        .select()
        .single();

      profileData = updatedProfile;
      profileError = updateError;
      
      if (updateError) {
        console.error('❌ Profile update failed:', updateError);
        // Delete the auth user if profile update fails
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return res.status(500).json({
          success: false,
          message: "Failed to update user profile",
          error: updateError.message
        });
      }
      
      console.log('✅ Profile updated successfully');
    } else {
      // No existing profile, create one
      console.log('✅ No existing profile found, creating profile...');
      
      const { data: newProfile, error: insertError } = await supabaseAdmin
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

      profileData = newProfile;
      profileError = insertError;
      
      if (profileError) {
        console.error('❌ Profile creation failed, rolling back user:', profileError);
        // Delete the auth user if profile creation fails to avoid ghost accounts
        await supabaseAdmin.auth.admin.deleteUser(userId);
        
        // Check if it's a duplicate key error
        if (profileError.code === '23505') {
          return res.status(400).json({
            success: false,
            message: "Email already registered. Please login or use a different email."
          });
        }
        
        return res.status(500).json({
          success: false,
          message: "Failed to create user profile",
          error: profileError.message
        });
      }
      
      console.log('✅ Profile created successfully');
    }

    // ✅ Step 6: Generate JWT token (same as login)
    const token = jwt.sign(
      {
        user_id: userId,
        email,
        role
      },
      env.jwtSecret,
      { expiresIn: "7d" }
    );

    // ✅ Step 7: Return success response
    console.log('✅ Registration complete for:', email);
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
