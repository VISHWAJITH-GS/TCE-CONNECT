# TCE Connect - Database Setup Guide

## 📋 Required Database Tables

Your TCE Connect application requires the following tables in Supabase:

### 1. **profiles** (User Information)
- Already exists from authentication setup
- Stores user details like name, email, department, year, etc.

### 2. **events** (Event Information)
- Already exists
- Stores event details created by event managers

### 3. **registrations** (Event Registrations)
- **Status**: ⚠️ May need to be created
- **Location**: `backend/database/registrations_schema.sql`
- Links users to events they've registered for

### 4. **clubs** (Club Information)
- **Status**: 🆕 Needs to be created
- **Location**: `backend/database/clubs_schema.sql`
- Stores information about all clubs in TCE

### 5. **club_members** (Club Memberships)
- **Status**: 🆕 Needs to be created
- **Location**: `backend/database/clubs_schema.sql`
- Links users to clubs they've joined

---

## 🚀 Setup Instructions

### Step 1: Access Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **xrohqbucnotnfxcjnbkf**
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Create Registrations Table (if not exists)

Copy and paste the entire content of `backend/database/registrations_schema.sql` into the SQL editor and click **RUN**.

**What this creates:**
- `registrations` table with foreign keys to `events` and `profiles`
- Indexes for better performance
- RLS policies to ensure users can only see their own registrations

### Step 3: Create Clubs Tables

Copy and paste the entire content of `backend/database/clubs_schema.sql` into the SQL editor and click **RUN**.

**What this creates:**
- `clubs` table with club information
- `club_members` table for memberships
- Sample data with 10 clubs (AI Consortium, App Development Club, etc.)
- Indexes and RLS policies

### Step 4: Verify Tables Were Created

Run this query to check all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'events', 'registrations', 'clubs', 'club_members')
ORDER BY table_name;
```

You should see all 5 tables listed.

---

## 🧪 Testing the APIs

### Test Clubs API

1. **Get all clubs:**
   ```bash
   curl http://localhost:5000/api/clubs
   ```

2. **Get my clubs (requires login):**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/clubs/mine
   ```

3. **Join a club:**
   ```bash
   curl -X POST -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/clubs/CLUB_ID/join
   ```

### Test Registrations API

1. **Get my registrations:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/registrations/mine
   ```

---

## 📱 Frontend Testing

Once the tables are created:

1. **Login** to your account
2. **Navigate to Profile** (`/profile`)
3. You should see:
   - ✅ Your profile details
   - ✅ "My Registered Events" section (empty if no registrations)
   - ✅ "My Clubs" section (empty if no memberships)

### To Add Test Data:

**Join a club via SQL:**
```sql
-- First, get your user_id
SELECT user_id, email FROM profiles WHERE email = 'your@email.com';

-- Then, get a club_id
SELECT club_id, club_name FROM clubs LIMIT 1;

-- Join the club
INSERT INTO club_members (club_id, user_id, role)
VALUES ('CLUB_ID_HERE', 'YOUR_USER_ID_HERE', 'member');
```

**Register for an event via SQL:**
```sql
-- Get an event_id
SELECT event_id, event_name FROM events LIMIT 1;

-- Register for the event
INSERT INTO registrations (event_id, user_id)
VALUES ('EVENT_ID_HERE', 'YOUR_USER_ID_HERE');
```

After adding this data, refresh the Profile page and you'll see your clubs and events!

---

## 🐛 Troubleshooting

### Error: "relation 'registrations' does not exist"
- **Solution**: Run the SQL script in `backend/database/registrations_schema.sql`

### Error: "relation 'clubs' does not exist"
- **Solution**: Run the SQL script in `backend/database/clubs_schema.sql`

### Error: 400 Bad Request on `/api/registrations/mine`
- **Possible causes**:
  1. The `registrations` table doesn't exist
  2. Foreign key relationships are broken
  3. RLS policies are preventing access
- **Solution**: Check backend console logs for detailed error message

### Profile page shows empty sections
- **This is normal!** If you haven't:
  - Registered for any events → "My Registered Events" will be empty
  - Joined any clubs → "My Clubs" will be empty
- Use the buttons to "Browse Events" or "Explore Clubs"

---

## 📊 Database Schema Overview

```
profiles (users)
    ↓
    ├──→ registrations ──→ events
    └──→ club_members ──→ clubs
```

- Each user (profile) can have multiple registrations
- Each user can be a member of multiple clubs
- Events and clubs can have multiple members

---

## ✅ Checklist

- [ ] Run `registrations_schema.sql` in Supabase
- [ ] Run `clubs_schema.sql` in Supabase
- [ ] Verify tables exist with the verification query
- [ ] Backend server is running (`npm run dev` in backend folder)
- [ ] Frontend is running (`npm run dev` in root folder)
- [ ] Test GET /api/clubs endpoint
- [ ] Test GET /api/registrations/mine endpoint (with auth)
- [ ] Login and visit `/profile` page
- [ ] Join a club via SQL or API
- [ ] Register for an event
- [ ] Verify data appears on Profile page

---

## 🎉 Success Indicators

When everything is working correctly, you should:
1. See no 400 errors in browser console
2. See no errors in backend terminal
3. Profile page loads with your information
4. Can join clubs and they appear immediately
5. Can register for events and they appear in profile

Happy coding! 🚀
