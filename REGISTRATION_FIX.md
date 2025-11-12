# Quick Fix for Registration View Issue

## Problem
The backend is trying to query columns that don't exist yet in the registrations table.

## Solution

### Option 1: Run the Migration (Recommended)
1. Go to your Supabase dashboard
2. Open the SQL Editor
3. Copy and paste the contents of `backend/database/migration_add_registration_fields.sql`
4. Run the SQL
5. Restart your backend server (press Ctrl+C in the terminal running the backend, then run `npm run dev`)

### Option 2: Just Restart Backend (Temporary Fix)
The updated code will automatically use the old schema with profile data as a fallback.

1. **Stop the backend server:**
   - Press `Ctrl+C` in the terminal where backend is running
   
2. **Or kill the process manually:**
   ```powershell
   # In PowerShell, find and kill the process
   Get-Process -Name node | Stop-Process -Force
   ```

3. **Start the backend again:**
   ```powershell
   cd backend
   npm run dev
   ```

## What was fixed?
- The registration controller now has a fallback mechanism
- If new columns don't exist, it will fetch data from the profiles table
- This allows viewing registrations even without running the migration
- When you do run the migration, future registrations will store their own data

## After Restart
Try viewing the registrations again - it should now work and show the data from user profiles.
