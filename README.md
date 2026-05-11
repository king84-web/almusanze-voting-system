# ALM Voting System

A complete voting system built with Next.js App Router, TypeScript, Tailwind CSS, Drizzle ORM, Neon PostgreSQL, NextAuth v5, and Cloudinary.

## Features

- User authentication with NextAuth
- Admin dashboard for managing elections
- Candidate management with image uploads
- Voting system with real-time results
- PDF report generation
- Audit logs

## Local Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL (local installation)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up local PostgreSQL database:
   - Install PostgreSQL on your system
   - Create a database named `alm_voting`
   - Create a user with password (default: user/password)

4. The application will automatically use the local database if no `DATABASE_URL` environment variable is set. The fallback is `postgresql://user:password@localhost:5432/alm_voting`.

5. For authentication, set `NEXTAUTH_SECRET` in `.env.local` or it will use a fallback.

6. For image uploads, Cloudinary is used, but fallbacks to placeholder images if not configured.

### Running the Application

1. Push the database schema:
   ```bash
   npm run db:push
   ```

2. Seed the database with initial data:
   ```bash
   npm run db:seed
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Management

- View database in Drizzle Studio: `npm run db:studio`
- Generate migrations: `npm run db:generate`
- Push schema changes: `npm run db:push`

## Project Structure

- `frontend/` - Next.js app directory (pages, API routes, components)
- `lib/` - Utility libraries (auth, DB, validations)
- `components/` - Reusable UI components

## Deployment

The application can be deployed to Vercel or any platform supporting Next.js. Ensure environment variables are set for production.
# Force redeploy
