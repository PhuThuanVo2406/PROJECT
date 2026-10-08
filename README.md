# HCC Study Buddy

A campus-level study partner finder for Houston Community College students. Students sign up with their
HCC student email, check in to a campus with a subject and goal, find others studying the same thing,
and message them. Only the campus is ever shared, never GPS or exact location.

Built with Next.js (App Router) and Supabase (Auth + Postgres with row level security), deployed on Vercel.

## Features

- **Student-only signup**: only `@student.hccs.edu` addresses can register, with an email verification link.
  The rule is enforced in the database (a trigger on `auth.users`), not just the signup form.
- **Campus check-in** with subject, goal, duration and an optional note. Check-ins expire on their own.
- **Studying now** directory with campus, subject and goal filters.
- **Suggested study buddies**: rule-based matching on subject, goal, campus and shared courses (`lib/matching.ts`).
- **Messaging** with live updates, plus **block** and **report**.
- **Privacy toggle**: hidden students never appear in the directory, matches or campus counts.
- **Admin dashboard**: usage stats (students, check-ins, messages) and the report queue.
- **Public landing page** with live, aggregate-only campus activity counts.

All usage is stored in Supabase: `profiles`, `check_ins`, `messages`, `blocks`, `reports` and `campuses`.
See `supabase/migrations/` for the schema and every access rule.

## Setup

### 1. Create the database schema

In the Supabase dashboard, open **SQL Editor**, paste the contents of
`supabase/migrations/20261008000000_initial_schema.sql`, and run it once.
(Or, with the Supabase CLI linked to your project: `supabase db push`.)

If HCC student emails use a different domain, change it in `is_allowed_student_email` in that file
before running it, and set `NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN` to match. Then run
`supabase/migrations/20261008010000_official_campus_list.sql` the same way to load HCC's official campus list.

### 2. Configure Supabase Auth

In **Authentication**:

1. **Sign In / Providers > Email**: keep Email enabled and **Confirm email** turned on.
2. **URL Configuration**: set **Site URL** to your Vercel URL (for example `https://hcc-study-buddy.vercel.app`),
   and add these **Redirect URLs**:
   - `https://<your-vercel-domain>/auth/confirm`
   - `http://localhost:3000/auth/confirm`
3. **Emails > Templates > Confirm signup** (recommended): change the link so verification works even when a
   student opens the email on a different device than the one they signed up on:
   ```html
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Verify your HCC email</a>
   ```
4. **Before real students sign up**: Supabase's built-in email sender is rate limited to a few emails per hour.
   Set up custom SMTP under **Authentication > Emails > SMTP Settings** (Resend, SendGrid, Postmark, etc.).

### 3. Deploy on Vercel

1. In Vercel, **Add New > Project** and import this repository (framework: Next.js, no other settings needed).
2. Under **Environment Variables**, add the values from Supabase **Project Settings > API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the anon / publishable key, never the service role key)
   - `NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN` = `student.hccs.edu`
3. Deploy, then put the deployed URL into Supabase's Site URL and Redirect URLs (step 2).

### 4. Make yourself an admin

Sign up through the site with your student email, verify it, then run in the SQL Editor:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'your.name@student.hccs.edu');
```

The **Admin** link then appears in the navigation.

## Local development

```bash
cp .env.example .env.local   # then fill in your Supabase URL and anon key
npm install
npm run dev                  # http://localhost:3000
```

Other checks: `npm run typecheck`, `npm test` (matching logic), `npm run build`.

## How privacy and safety are enforced

Every rule lives in Postgres row level security, so it holds even if someone calls the API directly:

- Students can read only visible, unblocked students' **active** check-ins, and only their own history.
- Students can edit only their own profile, and never the `is_admin` column.
- Messages are readable only by the two participants, and cannot be sent across a block in either direction.
- Reports are visible to the reporter and admins; only admins can change their status.
- Logged-out visitors see only aggregate campus counts (`campus_activity()`), never who is checked in.

## Project layout

```
app/                    pages and server actions (dashboard, study-now, messages, profile, admin)
app/auth/confirm        email verification landing route
components/             Nav, StudentCard, Countdown, LiveRefresh
lib/supabase/           browser, server and proxy Supabase clients
lib/matching.ts         study buddy scoring
proxy.ts                refreshes the session and protects signed-in pages
supabase/migrations/    database schema, RLS policies, RPCs, campus seed
```
