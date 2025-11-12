# TCE-Connect

## About TCE-Connect

**TCE-Connect** is a centralized web platform designed exclusively for **Thiagarajar College of Engineering (TCE)** to streamline event communication and student engagement. It serves as a digital bridge between students and clubs, bringing all departmental and club activities under one interactive interface.

### Key Features

- **🎯 For Students:**
  - Browse and explore all campus events through Home, Events, and Clubs sections
  - Easy event registration with one-click functionality
  - View detailed event information including date, time, venue, and requirements
  - Save and bookmark favorite events
  - Track registered events in personal dashboard
  - Share events with peers

- **🎪 For Event Organizers:**
  - Dedicated organizer dashboard for event management
  - Create, update, and manage events
  - Track event registrations and participant analytics
  - Monitor event success rates

- **🏛️ For Clubs:**
  - Direct links to TCE Club Portal for detailed club information
  - Display club activities and upcoming events
  - Easy access to club resources

### User Roles

1. **Students**: Register for events, explore clubs, and stay updated on campus activities
2. **Event Organizers**: Create and manage events, track registrations, and engage with participants

### Tech Stack

Built with modern web technologies for a responsive and intuitive user experience:

**Frontend:**
- **React** - UI component library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **shadcn/ui** - Accessible component library

**Backend:**
- **Supabase** - PostgreSQL database with real-time capabilities
- **Supabase Auth** - Authentication and user management
- **Row Level Security** - Database-level access control


## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd tce-connect/frontend

# Step 3: Install dependencies
npm install

# Step 4: Set up environment variables
cp .env.example .env
# Edit .env and add your Supabase credentials

# Step 5: Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Supabase Backend Setup

TCE-Connect uses Supabase for backend services. Follow these guides:

1. **Quick Start**: See [`SUPABASE_QUICK_START.md`](../SUPABASE_QUICK_START.md) for a checklist
2. **Detailed Setup**: See [`SUPABASE_SETUP.md`](../SUPABASE_SETUP.md) for complete instructions
3. **Integration Guide**: See [`SUPABASE_INTEGRATION.md`](./SUPABASE_INTEGRATION.md) for API usage

**Important**: You must set up Supabase and create the database schema before the application can work with real data.

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Navbar.tsx    # Navigation bar
│   │   ├── Footer.tsx    # Footer component
│   │   ├── EventCard.tsx # Event display card
│   │   └── ClubCard.tsx  # Club display card
│   ├── pages/            # Application pages
│   │   ├── Home.tsx      # Landing page
│   │   ├── Events.tsx    # Events listing
│   │   ├── EventDetails.tsx # Individual event page
│   │   ├── Community.tsx # Clubs page
│   │   ├── Login.tsx     # Authentication
│   │   ├── StudentDashboard.tsx
│   │   ├── OrganizerDashboard.tsx
│   │   ├── Profile.tsx
│   │   └── Settings.tsx
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── App.tsx           # Main application component
├── public/               # Static assets
└── package.json          # Dependencies
```

## Features in Detail

### Event Management
- **Event Discovery**: Browse 22+ campus events across Technical, Cultural, and Sports categories
- **Advanced Filtering**: Filter events by category (All, Technical, Cultural, Sports)
- **Search Functionality**: Quickly find events by title or description
- **Event Details**: Comprehensive information for each event including highlights, requirements, and registration status
- **Registration System**: Simple registration process with capacity tracking

### Club Integration
- **12+ Active Clubs**: Direct access to TCE's vibrant club ecosystem
- **Club Portal Links**: Each club card links to the official TCE Club Portal
- **Club Categories**: Technical, Cultural, and Sports clubs organized for easy discovery

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Role-Based Access**: Separate interfaces for students and event organizers
- **Intuitive Navigation**: Easy-to-use navbar with quick access to all sections
- **Modern UI**: Clean, professional design with smooth animations

## Available Scripts

```sh
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```
