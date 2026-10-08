-- Study spot on check-ins, study styles on profiles, and busy-times data.
-- Spots are only readable by signed-in students (check_ins RLS); no GPS.

alter table public.check_ins
  add column if not exists spot text
    check (spot in ('library', 'tutoring_center', 'student_lounge', 'cafeteria', 'classroom', 'computer_lab', 'outdoors', 'other')),
  add column if not exists spot_detail text check (char_length(spot_detail) <= 60);

grant insert (spot, spot_detail) on public.check_ins to authenticated;

alter table public.profiles
  add column if not exists study_styles text[] not null default '{}'
    check (cardinality(study_styles) <= 6);

grant update (study_styles) on public.profiles to authenticated;

-- Same as start_check_in plus the optional spot. A new name avoids an
-- ambiguous overload with the original function.
create or replace function public.check_in_now(
  p_campus_id smallint,
  p_subject text,
  p_goal text,
  p_minutes int,
  p_note text default null,
  p_spot text default null,
  p_spot_detail text default null
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

  insert into public.check_ins (user_id, campus_id, subject, goal, note, spot, spot_detail, expires_at)
  values (
    auth.uid(), p_campus_id, trim(p_subject), p_goal, nullif(trim(p_note), ''),
    nullif(p_spot, ''), nullif(trim(p_spot_detail), ''),
    now() + make_interval(mins => p_minutes)
  )
  returning * into result;

  return result;
end;
$$;

-- Busy times: how many check-ins were active in each weekday/hour slot
-- (Houston time) over the last p_days days. Aggregate counts only.
create or replace function public.busy_times(p_campus_id smallint default null, p_days int default 28)
returns table (dow int, hour int, check_ins bigint)
language sql
stable
security definer
set search_path = public
as $$
  select extract(dow from slot)::int, extract(hour from slot)::int, count(*)
  from (
    select generate_series(
             date_trunc('hour', ci.started_at at time zone 'America/Chicago'),
             (least(coalesce(ci.ended_at, ci.expires_at), ci.expires_at) at time zone 'America/Chicago') - interval '1 second',
             interval '1 hour'
           ) as slot
    from public.check_ins ci
    join public.profiles p on p.id = ci.user_id and p.is_visible
    where ci.started_at > now() - make_interval(days => least(greatest(p_days, 1), 365))
      and (p_campus_id is null or ci.campus_id = p_campus_id)
  ) s
  group by 1, 2;
$$;

revoke execute on function public.busy_times(smallint, int) from public, anon;
grant execute on function public.busy_times(smallint, int) to authenticated;
