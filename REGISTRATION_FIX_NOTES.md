# Registration Fix - Account Creation Issue

## Problem
When creating a new user account, the registration was failing with error 400 because:
1. Supabase Auth automatically creates a profile entry when a user is created
2. The registration controller was treating an existing profile as a duplicate
3. It was deleting the newly created auth user, causing registration to fail

## Root Cause
```
Supabase creates user in Auth ✅
  ↓
Supabase auto-creates profile record ✅
  ↓
Registration controller checks for existing profile ✅
  ↓
Finds profile (because it was auto-created) ❌
  ↓
Treats it as duplicate and deletes the auth user ❌
  ↓
Registration fails ❌
```

## Solution
Updated the registration controller (`auth.controller.js`) to:

1. **Check if profile exists** after creating auth user
2. **If profile exists** (auto-created): UPDATE it with user details (full_name, reg_number, dept, year, phone, role)
3. **If profile doesn't exist**: INSERT new profile with user details (original behavior)

This way, whether the profile is auto-created or not, it gets populated with the complete user information.

## Changes Made

### File: `backend/src/controllers/auth.controller.js`

**Step 4 Logic** - Changed from:
```javascript
// OLD: Treat existing profile as error
if (existingUserProfile) {
  delete auth user ❌
  return error ❌
}
```

To:
```javascript
// NEW: Update or insert profile
if (existingUserProfile) {
  UPDATE profile with user details ✅
} else {
  INSERT new profile with user details ✅
}
```

## Testing
To verify the fix works:
1. Restart the backend server
2. Try creating a new account with:
   - Email: `testuser@student.tce.edu`
   - Password: `testpass123`
   - Full Name: `Test User`
   - Reg Number: `240393123456`
   - Department: `CSE`
   - Year: `2`
   - Phone: `9876543210`
   - Role: `student`

Expected result: User account created successfully ✅

## Additional Fix
- Fixed field name mapping: `phone_number` (API input) → `phone_number` (database field)
  - Was using `phone` which is incorrect
  - Now correctly maps to `phone_number` field in profiles table
