# TCE-Connect Supabase Integration

## 📁 Created Files

### Configuration
- ✅ `frontend/.env.example` - Environment variables template
- ✅ `frontend/src/lib/supabase.ts` - Supabase client and TypeScript types
- ✅ `frontend/.gitignore` - Updated to exclude .env files

### Authentication
- ✅ `frontend/src/lib/auth.ts` - Authentication functions (signUp, signIn, signOut, getCurrentUser)
- ✅ `frontend/src/hooks/useAuth.tsx` - React authentication hook and context

### API Functions
- ✅ `frontend/src/lib/events.ts` - Event CRUD operations and registration
- ✅ `frontend/src/lib/clubs.ts` - Club data fetching

### Documentation
- ✅ `SUPABASE_SETUP.md` - Complete setup guide with SQL scripts

---

## 🚀 Quick Start

### 1. Install Package
```bash
cd frontend
npm install @supabase/supabase-js
```

### 2. Setup Supabase
Follow the complete guide in **SUPABASE_SETUP.md**:
- Create Supabase project
- Get API keys
- Create `.env` file with credentials
- Run SQL scripts to create database schema
- Seed initial data

### 3. Environment Setup
```bash
# Copy example and add your keys
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 📚 Available Functions

### Authentication (`src/lib/auth.ts`)

```typescript
// Sign up new user
await signUp(email, password, fullName, role, { department, year, phone });

// Sign in
await signIn(email, password);

// Sign out
await signOut();

// Get current user
const user = await getCurrentUser();

// Update profile
await updateProfile(userId, { fullName, department, year, phone });

// Update password
await updatePassword(newPassword);
```

### Events (`src/lib/events.ts`)

```typescript
// Get all events (with optional filters)
const { events } = await getEvents({ category: 'Technical', search: 'hack' });

// Get single event
const { event } = await getEvent(eventId);

// Create event (organizer only)
await createEvent({ title, description, date, ... });

// Update event
await updateEvent(eventId, { title, ... });

// Delete event
await deleteEvent(eventId);

// Register for event
await registerForEvent(eventId, userId);

// Cancel registration
await cancelRegistration(eventId, userId);

// Get user's registrations
const { registrations } = await getUserRegistrations(userId);

// Get organizer's events
const { events } = await getOrganizerEvents(organizerId);

// Get event registrations (for organizers)
const { registrations } = await getEventRegistrations(eventId);
```

### Clubs (`src/lib/clubs.ts`)

```typescript
// Get all clubs
const { clubs } = await getClubs();

// Get clubs by category
const { clubs } = await getClubs('Technical');

// Get single club
const { club } = await getClub(clubId);
```

### Authentication Hook (`src/hooks/useAuth.tsx`)

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, session, loading, signOut } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (!user) return <LoginPrompt />;
  
  return (
    <div>
      <p>Welcome {user.fullName}!</p>
      <p>Role: {user.role}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

---

## 🔄 Next Steps: Update Components

### 1. Wrap App with AuthProvider

Update `main.tsx`:
```typescript
import { AuthProvider } from './hooks/useAuth';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
```

### 2. Update Login Component

Replace localStorage auth with Supabase:
```typescript
import { signIn } from '@/lib/auth';

const handleLogin = async () => {
  const { user, error } = await signIn(email, password);
  if (error) {
    toast.error('Login failed');
  } else {
    navigate(user.role === 'student' ? '/student-dashboard' : '/organizer-dashboard');
  }
};
```

### 3. Update Navbar

Use the auth hook:
```typescript
import { useAuth } from '@/hooks/useAuth';

function Navbar() {
  const { user, signOut } = useAuth();
  
  // Replace localStorage checks with user object
}
```

### 4. Update Events Page

Fetch from database:
```typescript
import { getEvents } from '@/lib/events';

useEffect(() => {
  async function loadEvents() {
    const { events } = await getEvents({ category: selectedCategory });
    setEvents(events || []);
  }
  loadEvents();
}, [selectedCategory]);
```

### 5. Update EventDetails

Add real registration:
```typescript
import { registerForEvent, cancelRegistration } from '@/lib/events';
import { useAuth } from '@/hooks/useAuth';

const { user } = useAuth();

const handleRegister = async () => {
  if (!user) {
    navigate('/login');
    return;
  }
  
  const { error } = await registerForEvent(eventId, user.id);
  if (!error) {
    toast.success('Registered successfully!');
  }
};
```

### 6. Update Community Page

Fetch clubs from database:
```typescript
import { getClubs } from '@/lib/clubs';

useEffect(() => {
  async function loadClubs() {
    const { clubs } = await getClubs();
    setClubs(clubs || []);
  }
  loadClubs();
}, []);
```

---

## 🗄️ Database Schema

### Tables Created

1. **users** - User profiles (extends Supabase auth)
   - id, email, full_name, role, department, year, phone, avatar_url

2. **events** - All events
   - id, title, description, date, time, venue, category, organizer, max_participants, etc.

3. **registrations** - User event registrations
   - id, event_id, user_id, status, registered_at

4. **clubs** - TCE clubs
   - id, name, description, icon, portal_url, category

### Row Level Security (RLS)

All tables have RLS enabled with proper policies:
- ✅ Students can only view active events
- ✅ Organizers can manage their own events
- ✅ Users can only update their own profiles
- ✅ Registration capacity automatically tracked

---

## 🎯 Features Enabled

✅ **Real Authentication** - Supabase Auth with email/password
✅ **Role-Based Access** - Student vs Organizer permissions
✅ **Event Management** - Full CRUD for organizers
✅ **Event Registration** - Students can register with capacity tracking
✅ **Real-time Updates** - Supabase realtime subscriptions available
✅ **Secure Data** - Row Level Security protecting all data
✅ **Type Safety** - Full TypeScript support
✅ **Scalable** - PostgreSQL database with proper indexing

---

## 🔒 Security Features

- **Row Level Security** - Database-level access control
- **Authentication** - Secure JWT-based auth
- **Environment Variables** - API keys in .env (not committed)
- **Password Hashing** - Handled by Supabase Auth
- **HTTPS** - All API calls encrypted
- **CORS** - Properly configured by Supabase

---

## 📊 Migration from Mock Data

Current state uses localStorage and hardcoded arrays. After Supabase setup:

| Component | Current | After Supabase |
|-----------|---------|----------------|
| Login | localStorage | Supabase Auth |
| Events | Hardcoded array | Database query |
| Registrations | localStorage | Database with capacity tracking |
| User Profile | localStorage | Database with real-time sync |
| Clubs | Hardcoded array | Database query |

---

## 🚨 Important Notes

1. **Run `npm install @supabase/supabase-js`** before using any Supabase features
2. **Follow SUPABASE_SETUP.md** for complete database setup
3. **Never commit .env file** - Contains sensitive credentials
4. **Test locally first** - Before deploying to production
5. **Check RLS policies** - Ensure proper access control

---

## 📖 Documentation Links

- [Complete Setup Guide](../SUPABASE_SETUP.md) - Full step-by-step setup
- [Supabase Docs](https://supabase.com/docs) - Official documentation
- [Supabase Auth](https://supabase.com/docs/guides/auth) - Authentication guide
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security) - RLS guide

---

**Ready to integrate?** Start with `SUPABASE_SETUP.md` and follow the step-by-step guide! 🚀
