/**
 * Supabase Client Configuration
 * Initializes Supabase client for server-side usage
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

// Initialize Supabase client with service role key for admin operations
export const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRole,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Initialize Supabase client with anon key for regular operations
export const supabase = createClient(
  env.supabaseUrl,
  env.supabaseAnonKey
);

/**
 * Get authenticated user from JWT token
 * @param {string} token - JWT token from Authorization header
 * @returns {Promise<Object>} User object
 */
export async function getUserFromToken(token) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      throw error;
    }
    
    return user;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
