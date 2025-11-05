# Game Saver - Web Application

A modern web application for managing game save files and downloads built with Next.js 16, Supabase, and TypeScript.

## Features

- **User Authentication** - Secure login/register with JWT tokens
- **Game Library** - Browse and download games with metadata
- **Save File Management** - Upload, manage, and share game saves
- **Admin Panel** - Manage games, download links, and users (admin only)
- **Dashboard** - Personal dashboard to view and manage your saves
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Supabase** - PostgreSQL database and authentication
- **TanStack Query** - Data fetching and state management
- **Tailwind CSS** - Utility-first CSS framework
- **bcrypt** - Password hashing
- **JWT** - Session management

## Getting Started

### Prerequisites

- Node.js 16+ installed
- Supabase account and project created
- Environment variables configured

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:

Create a `.env` file in the `web` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# IMPORTANT: Get this from Supabase Dashboard > Settings > API > service_role key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Secret for session management
JWT_SECRET=your-random-secret-key-here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
web/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── games/        # Games management
│   │   └── saves/        # Save files management
│   ├── admin/            # Admin panel page
│   ├── dashboard/        # User dashboard
│   ├── games/            # Games listing page
│   ├── login/            # Login page
│   ├── register/         # Register page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Homepage
│   └── providers.tsx     # React Query provider
├── components/            # Reusable React components
│   └── Navigation.tsx    # Navigation bar
├── lib/                   # Utility libraries
│   ├── auth/             # Authentication utilities
│   │   ├── hooks.ts      # React hooks for auth
│   │   └── session.ts    # Session management
│   ├── db/               # Database utilities
│   │   ├── games.ts      # Games CRUD operations
│   │   └── users.ts      # Users CRUD operations
│   └── supabase/         # Supabase client
│       └── client.ts     # Supabase configuration
├── types/                 # TypeScript type definitions
└── middleware.ts          # Next.js middleware for route protection
```

## Demo Accounts

The application comes with pre-configured demo accounts:

**Admin Account:**
- Email: `admin@gamesaver.com`
- Password: `password123`

**User Accounts:**
- Email: `user1@example.com` / Password: `password123`
- Email: `user2@example.com` / Password: `password123`

## Available Routes

### Public Routes
- `/` - Homepage
- `/login` - Login page
- `/register` - Registration page
- `/games` - Games library (public view)

### Protected Routes (Requires Authentication)
- `/dashboard` - User dashboard with save files
- `/games` - Games library (authenticated view)

### Admin Routes (Requires Admin Role)
- `/admin` - Admin panel for managing games

### API Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/games` - Get all games with download links
- `POST /api/games` - Create new game (admin only)
- `GET /api/saves/me` - Get current user's saves

## Features by Role

### Regular Users
- Browse game library
- View download links
- Upload and manage personal save files
- Share saves publicly (optional)
- Download other users' public saves

### Admins
- All user features
- Add/edit/delete games
- Manage download links
- View all users and saves

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin) | Yes |
| `JWT_SECRET` | Secret key for JWT token signing | Yes |

## Development

### Code Style
- TypeScript for type safety
- Client components use `'use client'` directive
- Server components by default
- API routes use Next.js Route Handlers

### State Management
- TanStack Query for server state
- React hooks for local state
- Custom hooks in `lib/auth/hooks.ts`

### Authentication Flow
1. User logs in via `/api/auth/login`
2. Server validates credentials and creates JWT token
3. Token stored in HTTP-only cookie
4. Middleware validates token on protected routes
5. React hooks manage auth state on client

## Troubleshooting

### Build Errors
If you encounter build errors, ensure:
- All environment variables are set correctly
- Supabase database schema is applied
- Node.js version is 16 or higher

### Authentication Issues
- Check that JWT_SECRET is set and consistent
- Verify Supabase credentials are correct
- Clear browser cookies and try again

### Database Connection
- Verify SUPABASE_SERVICE_ROLE_KEY is correct
- Check Supabase project is active
- Review Supabase logs for errors

## Next Steps

1. **Add Storage**: Implement file upload to Supabase Storage
2. **Email Verification**: Add email verification for new users
3. **Password Reset**: Implement forgot password flow
4. **User Profiles**: Add user profile editing
5. **Search & Filter**: Add search and filtering for games
6. **Pagination**: Implement pagination for large datasets

## License

This project is part of the Game Saver monorepo.
