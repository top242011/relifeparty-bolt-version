# Relife Party Admin Dashboard

A comprehensive, production-ready admin dashboard for the Relife Party political organization, built with React, TypeScript, and Supabase.

## Features

### 🎯 Core Functionality
- **Personnel Management**: Complete CRUD operations with search, filtering, and detailed member profiles
- **Committees Management**: Organize party committees with descriptions and member assignments
- **Meetings Management**: Schedule meetings and track attendance with comprehensive reporting
- **Motions Management**: Track motions with voting status and link to meetings and proposers
- **Policies Management**: Manage party policies with rich text descriptions
- **News & Events**: Separate interfaces for news articles and event management

### 🔒 Security & Authentication
- Secure authentication using Supabase Auth with email/password
- Row Level Security (RLS) policies protecting all data
- Protected routes requiring authentication
- Input validation and sanitization

### 🎨 User Experience
- Modern, responsive design with Tailwind CSS
- Professional data tables with sorting, filtering, and pagination
- Modal-based forms with comprehensive validation
- Toast notifications for user feedback
- Loading states throughout the application
- Confirmation dialogs for destructive actions

### 🏗️ Technical Architecture
- React 18+ with TypeScript for type safety
- Supabase for database and authentication
- RESTful API architecture with proper error handling
- Clean, modular component structure
- Responsive design (mobile-first approach)

## Technology Stack

- **Frontend**: React 18+, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router v6
- **UI Components**: Custom components with Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Database Schema

The application uses a relational PostgreSQL database with the following tables:

- **personnel** - Party members with roles, bio, campus, faculty details
- **committees** - Party committees with descriptions
- **meetings** - Meeting records with topics and scope
- **meeting_attendance** - Attendance tracking for meetings
- **motions** - Motions proposed in meetings with voting status
- **policies** - Party policies and documents
- **news** - News articles with publish dates and images
- **events** - Upcoming events with dates and locations

All tables include proper foreign key constraints, indexes for performance, and Row Level Security (RLS) policies.

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase account
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd relife-party-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Supabase**
   - Create a new Supabase project
   - Run the migration files in the `supabase/migrations/` directory
   - Get your project URL and anon key from the Supabase dashboard

4. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Database Setup

The database migrations are located in `supabase/migrations/`. These should be run in your Supabase project to set up the complete schema with:

- All required tables with proper constraints
- Row Level Security (RLS) policies
- Indexes for optimal performance
- Foreign key relationships

### Authentication Setup

The application uses Supabase Auth with email/password authentication. To set up the first admin user:

1. Go to your Supabase dashboard
2. Navigate to Authentication → Users
3. Create a new user with email and password
4. The user will automatically have access to the admin dashboard

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── common/         # Reusable UI components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API service functions
├── types/              # TypeScript type definitions
└── lib/                # Utility functions and configuration
```

## Development Guidelines

### Code Quality
- TypeScript strict mode enabled
- Consistent error handling with user-friendly messages
- Clean, commented code with proper component structure
- Form validation with clear error messages

### Performance
- Optimized database queries with proper indexing
- Lazy loading and code splitting where appropriate
- Efficient state management and updates

### Security
- All API endpoints protected with authentication
- Input sanitization and validation on both frontend and backend
- Row Level Security (RLS) policies on all database tables

## Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Deployment Options

1. **Netlify** (Recommended)
   - Connect your GitHub repository
   - Set environment variables
   - Deploy with automatic builds

2. **Vercel**
   - Import project from GitHub
   - Configure environment variables
   - Deploy with zero configuration

3. **Static Hosting**
   - Upload the `dist/` folder to any static hosting service
   - Ensure environment variables are properly configured

### Environment Variables

Make sure to set the following environment variables in your deployment environment:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Usage

### Admin Access
1. Navigate to the application URL
2. Sign in with your admin credentials
3. Access all dashboard features from the sidebar navigation

### Key Features
- **Dashboard**: Overview of all data with quick stats
- **Personnel**: Add/edit party members, assign to committees
- **Committees**: Manage committee structure and descriptions
- **Meetings**: Schedule meetings and track attendance
- **Motions**: Record and track voting on party motions
- **Policies**: Document and manage party policies
- **News & Events**: Publish news and manage upcoming events

## Support and Maintenance

### Regular Maintenance
- Monitor database performance and optimize queries as needed
- Keep dependencies updated for security patches
- Review and update RLS policies as requirements change
- Backup database regularly

### Troubleshooting
- Check browser console for client-side errors
- Review Supabase logs for database/auth issues
- Verify environment variables are properly configured
- Ensure all migrations have been applied correctly

## Contributing

When contributing to this project:

1. Follow the existing code structure and patterns
2. Write TypeScript interfaces for all data types
3. Add proper error handling and user feedback
4. Test all CRUD operations thoroughly
5. Ensure responsive design across device sizes

## License

This project is licensed under the MIT License - see the LICENSE file for details.