# TCE-Connect Backend

Backend API server for **TCE-Connect** - A centralized event management platform for Thiagarajar College of Engineering.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Features](#features)

---

## 🎯 Overview

TCE-Connect Backend is a RESTful API server built with Node.js and Express that provides:

- **User Authentication** - Register, login, logout with JWT tokens
- **Event Management** - CRUD operations for campus events
- **Registration System** - Students can register/cancel for events
- **Profile Management** - User profiles with stats and preferences
- **Role-Based Access** - Different permissions for students and organizers

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── supabase.js          # Supabase client initialization
│   │   └── env.js               # Environment configuration
│   │
│   ├── controllers/
│   │   ├── auth.controller.js        # Authentication logic
│   │   ├── event.controller.js       # Event CRUD operations
│   │   ├── registration.controller.js # Event registration logic
│   │   └── profile.controller.js     # User profile operations
│   │
│   ├── routes/
│   │   ├── auth.routes.js        # /api/auth endpoints
│   │   ├── event.routes.js       # /api/events endpoints
│   │   ├── registration.routes.js # /api/registrations endpoints
│   │   └── profile.routes.js     # /api/profile endpoints
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT authentication
│   │   ├── roleMiddleware.js     # Role-based access control
│   │   └── validate.js           # Input validation handler
│   │
│   ├── utils/
│   │   ├── response.js           # Standard API responses
│   │   └── validators.js         # Input validation rules
│   │
│   ├── app.js                    # Express app configuration
│   └── server.js                 # Server entry point
│
├── package.json
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   CORS_ORIGIN=http://localhost:8080
   ```

4. **Set up Supabase database**
   
   Run the SQL schema in your Supabase SQL editor (see `SUPABASE_SETUP.md` in parent directory)

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The server will start on `http://localhost:5000`

6. **Start the production server**
   ```bash
   npm start
   ```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints Overview

#### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /me` - Get current user
- `POST /refresh` - Refresh access token

#### Events (`/api/events`)
- `GET /` - Get all events (with filters)
- `GET /:id` - Get single event
- `GET /my-events` - Get organizer's events (auth required)
- `POST /` - Create event (organizer only)
- `PUT /:id` - Update event (organizer only)
- `DELETE /:id` - Delete event (organizer only)

#### Registrations (`/api/registrations`)
- `POST /` - Register for event (auth required)
- `GET /my-registrations` - Get user's registrations (auth required)
- `GET /check/:event_id` - Check registration status (auth required)
- `GET /event/:event_id` - Get event registrations (organizer only)
- `DELETE /:id` - Cancel registration (auth required)

#### Profile (`/api/profile`)
- `GET /:id` - Get user profile
- `GET /stats` - Get profile statistics (auth required)
- `PUT /` - Update profile (auth required)
- `PUT /password` - Change password (auth required)
- `DELETE /` - Delete account (auth required)

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Example Requests

**Register User**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@tce.edu",
  "password": "password123",
  "fullName": "John Doe",
  "role": "student",
  "department": "CSE",
  "year": 3,
  "phone": "9876543210"
}
```

**Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@tce.edu",
  "password": "password123"
}
```

**Create Event (Organizer)**
```bash
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "AI Workshop",
  "description": "Learn about AI and Machine Learning",
  "date": "2025-12-01",
  "time": "10:00",
  "venue": "Main Auditorium",
  "category": "Technical",
  "max_participants": 100,
  "requirements": ["Laptop", "Basic programming knowledge"],
  "highlights": ["Hands-on sessions", "Certificate provided"]
}
```

**Register for Event**
```bash
POST /api/registrations
Authorization: Bearer <token>
Content-Type: application/json

{
  "event_id": "event-uuid-here"
}
```

### Response Format

**Success Response**
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "timestamp": "2025-11-11T10:00:00.000Z"
}
```

**Error Response**
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... },
  "timestamp": "2025-11-11T10:00:00.000Z"
}
```

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | JWT secret key | No |
| `JWT_EXPIRES_IN` | JWT expiration time | No |
| `CORS_ORIGIN` | Allowed CORS origin | No |

---

## ✨ Features

### Authentication & Authorization
- JWT-based authentication via Supabase Auth
- Role-based access control (Student, Organizer)
- Secure password handling
- Token refresh mechanism

### Event Management
- Create, read, update, delete events
- Filter events by category, date, organizer
- Search events by title/description
- Event capacity management
- Image upload support

### Registration System
- Register for events with capacity check
- Cancel registrations
- View registration history
- Organizers can view event registrations
- Prevent duplicate registrations

### Profile Management
- Update user profile information
- Change password
- View registration statistics
- Delete account

### Security Features
- Helmet.js for security headers
- CORS protection
- Rate limiting (100 requests per 15 minutes)
- Input validation with express-validator
- SQL injection prevention via Supabase client

### Developer Experience
- Clear folder structure
- Comprehensive error handling
- Consistent API response format
- Request logging with Morgan
- Validation middleware
- Hot reload with nodemon

---

## 🔧 Development

### Running in Development Mode
```bash
npm run dev
```

### Running in Production Mode
```bash
npm start
```

### Health Check
```bash
curl http://localhost:5000/health
```

---

## 📝 License

MIT License - see LICENSE file for details

---

## 👥 Contributors

TCE Connect Team - Thiagarajar College of Engineering

---

## 📞 Support

For issues and questions, please open an issue on the repository or contact the development team.

---

**Made with ❤️ for TCE Community**
