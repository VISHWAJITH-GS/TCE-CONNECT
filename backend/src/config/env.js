/**
 * Environment Configuration
 * Central place to read and validate environment variables
 */

import dotenv from "dotenv";
dotenv.config();

export const env = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Supabase Configuration
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'tce-connect-jwt-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // CORS Configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please create a .env file with the required variables.');
  process.exit(1);
}
