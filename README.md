# Huda Mosque Madrasa Management System

This project is a Next.js + Tailwind CSS + Supabase starter for a Madrasa Management System MVP.

## Features

- Admin and teacher dashboard views
- Students, classes, attendance, homework, and reports modules
- Messaging, notifications, calendar, and settings pages
- Supabase-ready service layer
- Environment file template for Supabase, email, and SMS providers
- Database migration and seed structure ready for local and Supabase deployment

## Tech stack

- Next.js
- React
- JavaScript
- Tailwind CSS
- Supabase

## Installation

```bash
npm install
```

## Environment configuration

Create a `.env.local` file from the example:

```bash
cp .env.example .env.local
```

Fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
RESEND_API_KEY=
EMAIL_FROM=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

Never expose the secret key or Twilio token in the browser.

## Supabase setup

1. Create a Supabase project.
2. From the project dashboard, copy the URL and anon key.
3. Add your values to `.env.local`.
4. Configure Auth and enable email sign-in if needed.
5. Create storage buckets named:
   - `student-photos`
   - `homework-files`
   - `report-pdfs`
   - `documents`
6. Mark these buckets as private for student data.

## Database migrations

Run migrations from the project root:

```bash
npx supabase init
npx supabase db push
```

The migration SQL files are located in `supabase/migrations` and include the core schema for profiles, students, guardians, reports, attendance, communications, and audit logs.

## Seed data

Load demo data:

```bash
psql "$DATABASE_URL" < supabase/seed.sql
```

Or import the SQL through the Supabase SQL editor using `supabase/seed.sql`.

## Run locally

```bash
npm run dev
```

Then open http://localhost:3000.

## Create the first admin account

After creating the project and enabling Supabase Auth:

1. Sign up in the app with an admin email.
2. Insert a row into `profiles` with `role = 'admin'` and `auth_user_id = <user_id>`.
3. You can then create teacher accounts and demo data from the admin dashboard.

## Email and SMS

The project includes service abstractions in `src/services/`.

- Email uses Resend abstraction
- SMS uses Twilio abstraction
- If credentials are missing, the app falls back to a development mock mode that logs communication without sending externally.

## Deployment

Use any platform that supports Next.js, such as Vercel or a Node host.

Recommended deployment steps:

1. Push code to GitHub.
2. Import the repo into Vercel.
3. Add the `.env.local` values as project environment variables.
4. Configure the Supabase project URL and keys.
5. Run the database migrations and seed script.
6. Deploy.

## Notes

This is an MVP scaffold intended to be expanded into a production-grade madrasa system. The included architecture and database design are designed to support admin/teacher workflows, report approval, PDF generation, parent communication, and Supabase-backed security policies.

