-- HCC Study Buddy: initial schema
-- Run once in Supabase > SQL Editor (or `supabase db push`).
--
-- Privacy model: presence is campus-level only. No GPS or device location is
-- ever collected or stored.

-- ---------------------------------------------------------------------------
-- Student email rule (enforced in the database, not just the UI)
-- ---------------------------------------------------------------------------

create or replace function public.is_allowed_student_email(email text)
returns boolean
language sql
immutable
as $$
  -- Change this domain if HCC student emails use a different one.
  select lower(coalesce(email, '')) like '%@student.hccs.edu';
$$;

create or replace function public.enforce_student_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_allowed_student_email(new.email) then
    raise exception 'Only HCC student email addresses can register.'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_student_email on auth.users;
create trigger enforce_student_email
  before insert or update of email on auth.users
  for each row execute function public.enforce_student_email();

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.campuses (
  id smallint generated always as identity primary key,
  slug text not null unique,
  name text not null
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  major text check (char_length(major) <= 60),
  bio text check (char_length(bio) <= 280),
  subjects text[] not null default '{}' check (cardinality(subjects) <= 8),
  home_campus_id smallint references public.campuses (id),
  -- Privacy toggle: when false, the student never appears in directories or
  -- campus counts, and nobody new can find them.
  is_visible boolean not null default true,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.check_ins (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  campus_id smallint not null references public.campuses (id),
  subject text not null check (char_length(subject) between 1 and 40),
  goal text not null check (goal in ('homework', 'exam_prep', 'group_project', 'quiet_cowork', 'tutoring')),
  note text check (char_length(note) <= 140),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  ended_at timestamptz,
  check (expires_at > started_at and expires_at <= started_at + interval '4 hours')
);

create index check_ins_active_idx on public.check_ins (expires_at) where ended_at is null;
create index check_ins_user_idx on public.check_ins (user_id, started_at desc);

create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.messages (
  id bigint generated always as identity primary key,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (sender_id <> recipient_id)
);

create index messages_pair_idx on public.messages (least(sender_id, recipient_id), greatest(sender_id, recipient_id), created_at);
create index messages_recipient_idx on public.messages (recipient_id, created_at desc);

create table public.reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_id uuid not null references public.profiles (id) on delete cascade,
  message_id bigint references public.messages (id) on delete set null,
  reason text not null check (reason in ('harassment', 'spam', 'inappropriate', 'safety', 'other')),
  details text check (char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open', 'reviewed', 'actioned', 'dismissed')),
  admin_note text check (char_length(admin_note) <= 1000),
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_id)
);

create index reports_status_idx on public.reports (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- True when either user has blocked the other.
create or replace function public.is_blocked_between(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;

-- Create a profile row for every new (verified-domain) auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1)), 40)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.campuses enable row level security;
alter table public.profiles enable row level security;
alter table public.check_ins enable row level security;
alter table public.blocks enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;

-- Campuses: readable by everyone (landing page).
create policy "campuses are public" on public.campuses
  for select using (true);

-- Profiles: signed-in students see visible, unblocked profiles plus anyone
-- they already have a conversation with. Admins see all.
create policy "profiles readable" on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    -- so the "Blocked students" list can show names to unblock
    or exists (select 1 from public.blocks b where b.blocker_id = auth.uid() and b.blocked_id = profiles.id)
    or (
      not public.is_blocked_between(auth.uid(), id)
      and (
        is_visible
        or exists (
          select 1 from public.messages m
          where (m.sender_id = auth.uid() and m.recipient_id = profiles.id)
             or (m.recipient_id = auth.uid() and m.sender_id = profiles.id)
        )
      )
    )
  );

create policy "profiles self update" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Students may only edit these columns; is_admin is never client-writable.
revoke update on public.profiles from authenticated, anon;
grant update (display_name, major, bio, subjects, home_campus_id, is_visible)
  on public.profiles to authenticated;

-- Check-ins: own history, plus other visible students' active check-ins.
create policy "check_ins readable" on public.check_ins
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
    or (
      ended_at is null
      and expires_at > now()
      and not public.is_blocked_between(auth.uid(), user_id)
      and exists (select 1 from public.profiles p where p.id = user_id and p.is_visible)
    )
  );

create policy "check_ins own insert" on public.check_ins
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "check_ins own update" on public.check_ins
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

revoke insert, update on public.check_ins from authenticated, anon;
grant insert (user_id, campus_id, subject, goal, note, expires_at) on public.check_ins to authenticated;
grant update (ended_at) on public.check_ins to authenticated;

-- Blocks: only the blocker sees and manages their own blocks.
create policy "blocks own" on public.blocks
  for all to authenticated
  using (blocker_id = auth.uid())
  with check (blocker_id = auth.uid());

-- Messages: only the two participants; cannot send across a block.
create policy "messages participants read" on public.messages
  for select to authenticated
  using (sender_id = auth.uid() or recipient_id = auth.uid());

create policy "messages send" on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and not public.is_blocked_between(sender_id, recipient_id)
  );

create policy "messages mark read" on public.messages
  for update to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

revoke insert, update on public.messages from authenticated, anon;
grant insert (sender_id, recipient_id, body) on public.messages to authenticated;
grant update (read_at) on public.messages to authenticated;

-- Reports: students file and see their own; admins see and resolve all.
create policy "reports file" on public.reports
  for insert to authenticated
  with check (reporter_id = auth.uid() and status = 'open');

create policy "reports read" on public.reports
  for select to authenticated
  using (reporter_id = auth.uid() or public.is_admin());

create policy "reports admin update" on public.reports
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke insert, update on public.reports from authenticated, anon;
grant insert (reporter_id, reported_id, message_id, reason, details) on public.reports to authenticated;
grant update (status, admin_note, reviewed_by, reviewed_at) on public.reports to authenticated;

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

-- Start a check-in, ending any active one first (one active check-in each).
create or replace function public.start_check_in(
  p_campus_id smallint,
  p_subject text,
  p_goal text,
  p_minutes int,
  p_note text default null
)
returns public.check_ins
language plpgsql
security invoker
set search_path = public
as $$
declare
  result public.check_ins;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  if p_minutes not between 15 and 240 then
    raise exception 'Duration must be between 15 and 240 minutes';
  end if;

  update public.check_ins
     set ended_at = now()
   where user_id = auth.uid() and ended_at is null and expires_at > now();

  insert into public.check_ins (user_id, campus_id, subject, goal, note, expires_at)
  values (auth.uid(), p_campus_id, trim(p_subject), p_goal, nullif(trim(p_note), ''), now() + make_interval(mins => p_minutes))
  returning * into result;

  return result;
end;
$$;

-- Public, aggregate-only campus activity for the landing page. Counts only
-- visible students and never exposes who they are.
create or replace function public.campus_activity()
returns table (campus_id smallint, slug text, name text, active_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.slug, c.name, count(ci.id)
  from public.campuses c
  left join public.check_ins ci
    on ci.campus_id = c.id
   and ci.ended_at is null
   and ci.expires_at > now()
   and exists (select 1 from public.profiles p where p.id = ci.user_id and p.is_visible)
  group by c.id
  order by count(ci.id) desc, c.name;
$$;

-- Admin-only usage stats.
create or replace function public.admin_stats()
returns table (
  total_students bigint,
  new_students_7d bigint,
  active_now bigint,
  check_ins_7d bigint,
  messages_7d bigint,
  open_reports bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;
  return query
  select
    (select count(*) from public.profiles),
    (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    (select count(*) from public.check_ins where ended_at is null and expires_at > now()),
    (select count(*) from public.check_ins where started_at > now() - interval '7 days'),
    (select count(*) from public.messages where created_at > now() - interval '7 days'),
    (select count(*) from public.reports where status = 'open');
end;
$$;

revoke execute on function public.admin_stats() from anon;
grant execute on function public.campus_activity() to anon, authenticated;

-- Realtime for live message threads (RLS still applies).
alter publication supabase_realtime add table public.messages;

-- ---------------------------------------------------------------------------
-- Seed: HCC campuses (edit to match the official list)
-- ---------------------------------------------------------------------------

insert into public.campuses (slug, name) values
  ('central', 'Central'),
  ('alief-hayes', 'Alief Hayes'),
  ('brays-oaks', 'Brays Oaks'),
  ('coleman', 'Coleman'),
  ('eastside', 'Eastside'),
  ('felix-fraga', 'Felix Fraga'),
  ('katy', 'Katy'),
  ('missouri-city', 'Missouri City'),
  ('north-forest', 'North Forest'),
  ('northline', 'Northline'),
  ('pinemont', 'Pinemont'),
  ('spring-branch', 'Spring Branch'),
  ('stafford', 'Stafford'),
  ('west-loop', 'West Loop'),
  ('westgate', 'Westgate');
