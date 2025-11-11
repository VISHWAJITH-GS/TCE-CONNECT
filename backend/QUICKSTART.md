# 🚀 Quick Start Guide - TCE-Connect Backend

## ✅ Setup Checklist

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Edit the `.env` file and add your Supabase credentials:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

Get these from: https://app.supabase.com/project/_/settings/api

### 3. Set Up Supabase Database
Run the SQL schema in your Supabase SQL editor (see main project `SUPABASE_SETUP.md`)

### 4. Start the Server
**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## 🧪 Test the API

### Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "TCE-Connect Backend is running",
  "timestamp": "2025-11-11T10:00:00.000Z",
  "environment": "development"
}
```

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@tce.edu",
    "password": "test123",
    "fullName": "Test User",
    "role": "student"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@tce.edu",
    "password": "test123"
  }'
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── env.js          # Environment variables
│   │   └── supabase.js     # Supabase client
│   │
│   ├── controllers/         # Business logic
│   │   ├── auth.controller.js
│   │   ├── event.controller.js
│   │   ├── registration.controller.js
│   │   └── profile.controller.js
│   │
│   ├── routes/             # API endpoints
│   │   ├── auth.routes.js
│   │   ├── event.routes.js
│   │   ├── registration.routes.js
│   │   └── profile.routes.js
│   │
│   ├── middleware/         # Authentication & validation
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── validate.js
│   │
│   ├── utils/              # Helper functions
│   │   ├── response.js
│   │   └── validators.js
│   │
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
│
├── package.json            # Dependencies
├── .env                    # Environment variables (configure this!)
└── README.md              # Full documentation
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (organizer only)
- `PUT /api/events/:id` - Update event (organizer only)
- `DELETE /api/events/:id` - Delete event (organizer only)

### Registrations
- `POST /api/registrations` - Register for event
- `GET /api/registrations/my-registrations` - Get user's registrations
- `DELETE /api/registrations/:id` - Cancel registration

### Profile
- `GET /api/profile/:id` - Get user profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/stats` - Get statistics

## 🛠️ Development Tips

### Hot Reload
The dev server uses `nodemon` for automatic restart on file changes.

### Logging
All HTTP requests are logged in development mode using Morgan.

### Error Handling
All errors return a consistent JSON format:
```json
{
  "success": false,
  "message": "Error message",
  "timestamp": "2025-11-11T10:00:00.000Z"
}
```

### Testing with Postman
Import the base URL: `http://localhost:5000/api`

For authenticated endpoints, add header:
```
Authorization: Bearer <your_access_token>
```

## 🔐 Security Features

✅ Helmet.js security headers  
✅ CORS protection  
✅ Rate limiting (100 req/15min)  
✅ Input validation  
✅ JWT authentication  
✅ Role-based access control  

## 📝 Common Issues

**Issue: "Missing required environment variables"**
- Solution: Check `.env` file has all Supabase credentials

**Issue: "Connection refused"**
- Solution: Ensure Supabase project is active and credentials are correct

**Issue: "Port already in use"**
- Solution: Change PORT in `.env` or kill process using port 5000

## 📚 Next Steps

1. ✅ Complete Supabase database setup
2. ✅ Test all API endpoints
3. ✅ Connect frontend to backend
4. ✅ Deploy to production

## 🆘 Need Help?

- Check `README.md` for full documentation
- Review Supabase docs: https://supabase.com/docs
- Check Express docs: https://expressjs.com

---

**Happy Coding! 🎓**
