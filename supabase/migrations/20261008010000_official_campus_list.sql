-- Replace the starter campus list with HCC's official campuses, grouped by
-- college. Existing campus ids are kept (matched by slug) so check-ins and
-- profiles that point at them stay valid.

alter table public.campuses
  add column if not exists college text not null default '',
  add column if not exists sort_order smallint not null default 0;

insert into public.campuses (slug, name, college, sort_order) values
  ('central',            'Central Campus',                         'HCC Central', 10),
  ('south',              'South Campus',                           'HCC Central', 11),
  ('coleman',            'Coleman Campus (Texas Medical Center)',  'HCC Coleman College for Health Sciences', 20),
  ('coleman-midtown',    'Coleman College at Midtown',             'HCC Coleman College for Health Sciences', 21),
  ('online',             'Online',                                 'HCC Global Online', 30),
  ('acres-homes',        'Acres Homes Campus',                     'HCC Northeast', 40),
  ('automotive-tech',    'Automotive Technology Training Center',  'HCC Northeast', 41),
  ('northeast',          'Northeast Campus',                       'HCC Northeast', 42),
  ('north-forest',       'North Forest Campus',                    'HCC Northeast', 43),
  ('northline',          'Northline Campus',                       'HCC Northeast', 44),
  ('alief-bissonnet',    'Alief Bissonnet Campus',                 'HCC Northwest', 50),
  ('alief-hayes',        'Alief Hayes Campus',                     'HCC Northwest', 51),
  ('katy',               'Katy Campus',                            'HCC Northwest', 52),
  ('spring-branch',      'Spring Branch Campus',                   'HCC Northwest', 53),
  ('west-houston',       'West Houston Institute',                 'HCC Northwest', 54),
  ('eastside',           'Eastside Campus',                        'HCC Southeast', 60),
  ('felix-fraga',        'Felix Fraga Academic Campus',            'HCC Southeast', 61),
  ('brays-oaks',         'Brays Oaks Campus',                      'HCC Southwest', 70),
  ('missouri-city',      'Missouri City Campus',                   'HCC Southwest', 71),
  ('stafford',           'Stafford Campus',                        'HCC Southwest', 72),
  ('west-loop',          'West Loop Campus',                       'HCC Southwest', 73)
on conflict (slug) do update
  set name = excluded.name, college = excluded.college, sort_order = excluded.sort_order;

-- Campuses that are not on HCC's list, removed only if nothing uses them.
delete from public.campuses c
where c.slug in ('pinemont', 'westgate')
  and not exists (select 1 from public.check_ins ci where ci.campus_id = c.id)
  and not exists (select 1 from public.profiles p where p.home_campus_id = c.id);
