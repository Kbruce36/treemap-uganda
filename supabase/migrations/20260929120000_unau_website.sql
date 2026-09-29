-- =====================================================================
-- UNAU Kyambogo Chapter website
-- Roles, site settings, executive applications, projects, team,
-- site media storage, tree moderation and tree sanity checks.
--
-- Granting the first admin (run once in the SQL editor after the
-- person has signed up on the site):
--
--   insert into public.user_roles (user_id, role)
--   select id, 'admin' from auth.users where email = '<their email>';
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Roles
-- ---------------------------------------------------------------------
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin');
$$;

-- Nobody outside the database should be able to probe other users' roles.
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

create policy "Users can see their own roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());
-- No insert/update/delete policies: roles are only granted from the SQL editor.


-- ---------------------------------------------------------------------
-- 2. Site settings (a single row)
-- ---------------------------------------------------------------------
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  applications_open boolean not null default false,
  applications_deadline timestamptz,
  applications_title text not null default 'Cabinet 2026/27',
  applications_message text not null default
    'Our term has come to an end. Every seat on the executive is open, and we are looking for the students who will take this chapter forward.',
  sdg_focus smallint not null default 3 check (sdg_focus between 1 and 17),
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (1);

alter table public.site_settings enable row level security;

create policy "Anyone can read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "Admins can update site settings"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create trigger set_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.handle_updated_at();

create or replace function public.applications_are_open()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select applications_open
            and (applications_deadline is null or applications_deadline > now())
       from public.site_settings where id = 1),
    false
  );
$$;

grant execute on function public.applications_are_open() to anon, authenticated;


-- ---------------------------------------------------------------------
-- 3. Executive positions
-- ---------------------------------------------------------------------
create table public.executive_positions (
  id uuid primary key default gen_random_uuid(),
  title text not null unique check (char_length(trim(title)) between 2 and 120),
  description text,
  sort_order integer not null default 0,
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.executive_positions enable row level security;

create policy "Anyone can read positions"
  on public.executive_positions for select
  to anon, authenticated
  using (true);

create policy "Admins manage positions"
  on public.executive_positions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.executive_positions (title, description, sort_order) values
  ('President', 'Leads the chapter, chairs the executive and represents UNAU Kyambogo to the university, the national secretariat and partners.', 1),
  ('Vice President', 'Deputises for the President and drives the chapter''s programmes and partnerships.', 2),
  ('Secretary General', 'Keeps the chapter''s records, correspondence, minutes and activity reports.', 3),
  ('Speaker', 'Presides over general meetings and keeps debate fair and orderly.', 4),
  ('Programs Coordinator', 'Plans and runs X-Spaces, conferences, outreaches and the semester calendar.', 5),
  ('Publicity Secretary', 'Runs our social media, design and communications so every activity is seen.', 6),
  ('Members Coordinator', 'Recruits, onboards and looks after members and membership records.', 7),
  ('Faculty Representative', 'Represents UNAU in your faculty or school. One representative for every faculty and school.', 8);


-- ---------------------------------------------------------------------
-- 4. Executive applications
-- ---------------------------------------------------------------------
create table public.executive_applications (
  id uuid primary key default gen_random_uuid(),
  position_id uuid not null references public.executive_positions(id) on delete restrict,
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  email text not null check (char_length(email) <= 255 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text not null check (phone ~ '^\+?[0-9 ()-]{9,20}$'),
  course text not null check (char_length(trim(course)) between 2 and 150),
  year_of_study smallint not null check (year_of_study between 1 and 6),
  faculty text check (faculty is null or char_length(faculty) <= 150),
  motivation text check (motivation is null or char_length(motivation) <= 2000),
  consent boolean not null check (consent),
  status text not null default 'new'
    check (status in ('new', 'shortlisted', 'interviewed', 'accepted', 'rejected')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_executive_applications_position on public.executive_applications(position_id);
create index idx_executive_applications_created_at on public.executive_applications(created_at desc);

alter table public.executive_applications enable row level security;

-- The public can only insert, only while the window is open, only for an
-- open position, and cannot pre-set review fields. They can never read back.
create policy "Anyone can apply while applications are open"
  on public.executive_applications for insert
  to anon, authenticated
  with check (
    public.applications_are_open()
    and status = 'new'
    and admin_notes is null
    and exists (
      select 1 from public.executive_positions p
      where p.id = position_id and p.is_open
    )
  );

create policy "Admins can read applications"
  on public.executive_applications for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update applications"
  on public.executive_applications for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete applications"
  on public.executive_applications for delete
  to authenticated
  using (public.is_admin());

create trigger set_executive_applications_updated_at
  before update on public.executive_applications
  for each row execute function public.handle_updated_at();


-- ---------------------------------------------------------------------
-- 5. Projects
-- ---------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(trim(title)) between 2 and 200),
  summary text not null default '',
  body text not null default '',
  category text not null default 'Community outreach',
  event_date date,
  location text,
  partners text,
  sdgs smallint[] not null default '{}',
  impact jsonb not null default '[]'::jsonb check (jsonb_typeof(impact) = 'array'),
  cover_image text,
  gallery text[] not null default '{}',
  cta_label text,
  cta_url text,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_projects_event_date on public.projects(event_date desc nulls first);

alter table public.projects enable row level security;

create policy "Anyone can read published projects"
  on public.projects for select
  to anon, authenticated
  using (is_published or public.is_admin());

create policy "Admins manage projects"
  on public.projects for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

insert into public.projects
  (slug, title, summary, body, category, event_date, location, partners, sdgs, impact, cover_image, gallery, cta_label, cta_url, is_featured, is_published)
values
(
  'unau-treemap',
  'UNAU TreeMap',
  'Our live, map-based tracker for every tree planted by members and the wider community.',
  $b$Every tree we plant should be counted, found again and looked after. **UNAU TreeMap** is the chapter's own platform for doing exactly that.

Anyone can sign up, drop a pin where they planted, add the species and photos, and watch the community total grow in real time. Our AI assistant, GreenBot, then suggests care advice based on the species and the local weather.

### How it works
- **Pin it:** open the map, tap where you planted and add the details
- **Prove it:** attach up to three photos of the seedling
- **Grow it:** get survival and watering advice, and climb the leaderboard

Every outreach and clean-up we run now ends with trees on this map.$b$,
  'Environment', null, 'Kyambogo University and beyond', null,
  '{13,15}', '[]'::jsonb,
  '/images/projects/unau-treemap/cover.jpg', '{/images/projects/unau-treemap/1.jpg}',
  'Open the Tree Map', '/map', true, true
),
(
  'kyues-ebtdi-marathon-2026',
  'KYUES–EBTDI Marathon 2026',
  '"Running for the roots of tomorrow": over 200 runners linked a 5 km and 10 km run to planting a tree on every birthday.',
  $b$On 18 April 2026, East End Playground filled with runners in colour-coded kits, one colour for each birth month. The KYUES–EBTDI Marathon was a joint initiative of the Kyambogo University Engineering Society (KYUES) and the Every Birthday Tree Day Initiative (EBTDI). It combined fitness with a simple climate habit: plant a tree to celebrate your birthday.

UNAU Kyambogo came on board as a student partner. We handled SDG alignment and the event's thematic framing around **Climate Action (SDG 13)** and **Partnerships for the Goals (SDG 17)**.

### The day
- Registration and kit collection from 7:00 am, then a 20-minute aerobics warm-up
- A **5 km** run inside the university and a **10 km** run through Naalya and surrounding areas
- A cool-down, tug-of-war and a football match to close

More than 200 people took part: students from many faculties, partner organisations, representatives from the Buganda Kingdom and our members.$b$,
  'Environment', '2026-04-18', 'East End Playground, Kyambogo University',
  'KYUES, Every Birthday Tree Day Initiative (EBTDI), Roofings Group Uganda, Eco Podcast, Sandhbolt Ltd',
  '{3,13,15,17}',
  '[{"value":"200+","label":"Participants"},{"value":"5 & 10 km","label":"Race categories"},{"value":"13+","label":"Partner bodies"}]'::jsonb,
  '/images/projects/kyues-ebtdi-marathon-2026/cover.jpg',
  '{/images/projects/kyues-ebtdi-marathon-2026/1.jpg,/images/projects/kyues-ebtdi-marathon-2026/2.jpg,/images/projects/kyues-ebtdi-marathon-2026/3.jpg,/images/projects/kyues-ebtdi-marathon-2026/4.jpg}',
  null, null, true, true
),
(
  'go-green-clean-up',
  'Go Green Community Clean-Up',
  'Over 100 students cleaned Banda market, its streets and the Kyambogo campus, then planted a "Go Green" tree at the Central Library.',
  $b$The day after the Green Conference, we took the commitments made in the room out onto the streets. On 11 April 2026, over 100 students from five associations cleaned Banda community and the Kyambogo campus as part of the Go Green Initiative.

### Where we worked
- Banda streets, Banda Market and the surrounding residential areas
- On campus: the Mandela area, the surroundings of Nanziri Hall and Teacher's Way

Along the way, participants talked with residents and market vendors about proper waste disposal, and the community welcomed the effort.

The activity closed with a symbolic pomegranate tree named **"Go Green"**, planted in front of the Central Library, then remarks at Peace Park and a group photo at the Senate Building.$b$,
  'Community outreach', '2026-04-11', 'Banda community & Kyambogo University',
  'Nkobazambogo Students'' Cultural Association, KUEMA, CEESA, EEMA',
  '{6,11,13,15}',
  '[{"value":"100+","label":"Participants"},{"value":"5","label":"Student associations"},{"value":"1","label":"\"Go Green\" tree planted"}]'::jsonb,
  '/images/projects/go-green-clean-up/cover.jpg',
  '{/images/projects/go-green-clean-up/1.jpg,/images/projects/go-green-clean-up/2.jpg,/images/projects/go-green-clean-up/3.jpg,/images/projects/go-green-clean-up/4.jpg,/images/projects/go-green-clean-up/5.jpg}',
  null, null, true, true
),
(
  'green-conference-2026',
  'Green Conference 2026',
  'Students, government and industry met at Kyambogo to discuss protecting the environment through sustainable practices.',
  $b$On 10 April 2026, we co-organised the Green Conference with CEESA, KUEMA and EEMA under the theme **"Protecting the Environment through Sustainable Practices."**

Students from across faculties sat with representatives of the Ministry of Water and Environment, NEMA, environmental organisations and industry practitioners.

### On the programme
- Keynotes on environmental protection, climate change and waste management in Uganda
- **Panel 1: Community action and conservation.** Behaviour change, culture, local knowledge and student-led initiatives
- **Panel 2: Renewable energy and green technology.** Affordability, implementation hurdles, and the investment and policy support needed
- Thematic talks on climate adaptation, green infrastructure and the role of education

### Issues on the table
Poor waste management, deforestation, limited access to clean and affordable energy, and weak enforcement of environmental policy.

The conversation did not end in the room. The next day, participants carried it into the Go Green clean-up.$b$,
  'Conferences & dialogue', '2026-04-10', 'Central Teaching Facility (CTF), Kyambogo University',
  'CEESA, KUEMA, EEMA',
  '{7,11,13,15,17}',
  '[{"value":"4","label":"Organising associations"},{"value":"2","label":"Panel discussions"},{"value":"NEMA · MWE","label":"Government voices in the room"}]'::jsonb,
  '/images/projects/green-conference-2026/cover.jpg',
  '{/images/projects/green-conference-2026/1.jpg,/images/projects/green-conference-2026/2.jpg,/images/projects/green-conference-2026/3.jpg,/images/projects/green-conference-2026/4.jpg,/images/projects/green-conference-2026/5.jpg}',
  null, null, false, true
),
(
  'k5-k6-village-outreach',
  'K5 & K6 Village Community Outreach',
  'A clean-up, donation drive, hygiene talk and tree planting with our neighbours in K5 and K6 villages.',
  $b$On 30 March 2026, the chapter joined two partner associations for a day of service with the communities of K5 and K6 villages, right next to campus.

### What we did
- **Clean-up:** collected and properly disposed of waste around the village
- **Donations:** clothes and shoes, bags, bed sheets, soap, sanitary pads and food for vulnerable households
- **Hygiene and sanitation talk:** conversations on everyday practices that prevent disease
- **Tree planting:** trees planted in the community for long-term environmental benefit

Five members of the executive represented UNAU Kyambogo on the day. Our next steps are follow-up visits to measure the long-term impact and wider partnerships to reach more households.$b$,
  'Community outreach', '2026-03-30', 'K5 & K6 villages, Kyambogo',
  'Kyambogo University Adult and Community Education Students Association, Community Development and Social Justice Students Association',
  '{1,3,6,13,15}',
  '[{"value":"3","label":"Partner associations"},{"value":"4","label":"Activities in one day"},{"value":"6+","label":"Kinds of essentials donated"}]'::jsonb,
  '/images/projects/k5-k6-village-outreach/cover.jpg',
  '{/images/projects/k5-k6-village-outreach/1.jpg,/images/projects/k5-k6-village-outreach/2.jpg,/images/projects/k5-k6-village-outreach/3.jpg,/images/projects/k5-k6-village-outreach/4.jpg,/images/projects/k5-k6-village-outreach/5.jpg}',
  null, null, false, true
),
(
  'my-story-your-future',
  'My Story – Your Future',
  'Mentorship for Primary Seven girls at St Paul Primary School, Banda, on education, safety and menstrual health.',
  $b$On 5 March 2026, 17 UNAU volunteers and our partners from Women in Engineering visited St Paul Primary School in Banda to spend an afternoon with 24 Primary Seven girls.

The theme, **"My Story – Your Future,"** set the tone. Volunteers shared their own journeys through school, the obstacles they faced and the careers education opened up, so the girls could see role models who look like them.

### The session
- Icebreakers where every girl shared her name and dream career
- Volunteer introductions covering academic paths and interests
- A keynote, storytelling and open discussion
- Awareness sessions on personal rights, seeking help against abuse or exploitation, and managing menstruation so no girl misses school

The girls left encouraged to believe in their potential and stay committed to their education.$b$,
  'Schools & mentorship', '2026-03-05', 'St Paul Primary School, Banda',
  'Women in Engineering',
  '{3,4,5}',
  '[{"value":"24","label":"P.7 girls mentored"},{"value":"17","label":"UNAU volunteers"},{"value":"2","label":"Teachers engaged"}]'::jsonb,
  '/images/projects/my-story-your-future/cover.jpg',
  '{/images/projects/my-story-your-future/1.jpg,/images/projects/my-story-your-future/2.jpg}',
  null, null, true, true
),
(
  'x-space-climate-justice',
  'X-Space: We Didn''t Start the Fire, But We''re Burning Anyway',
  'A zero-budget digital forum on climate justice and youth leadership that drew 111 live listeners.',
  $b$Young people in East Africa care about climate change, but formal climate policy is full of jargon, gatekeeping and expensive forums. That is the "action gap" this X-Space set out to close.

On 24 May 2026, with GAYO Eco Club Kyambogo, we hosted a live forum on **climate justice and youth leadership in Uganda**, using a "Listen, Analyse, Act" format: experts framed the problems and youth participants proposed grassroots solutions.

### Results
- **111 live listeners**, almost four times the 28 people who pre-registered
- **4 speakers** across climate justice, youth activism and environmental advocacy
- Participants from **8+ institutions**, including Kyambogo and Makerere universities
- Over **70 minutes** of sustained discussion, all on a zero budget

Interactive polls posted 48 hours before the session drove much of the organic reach. We are now reusing that model across our X-Space series.$b$,
  'X-Spaces', '2026-05-24', 'Online · X Spaces',
  'GAYO Eco Club – Kyambogo Chapter',
  '{13,16}',
  '[{"value":"111","label":"Live listeners"},{"value":"4","label":"Speakers"},{"value":"8+","label":"Institutions represented"}]'::jsonb,
  '/images/projects/x-space-climate-justice/cover.jpg', '{}',
  null, null, false, true
),
(
  'x-space-beyond-voting',
  'X-Space: Beyond Voting',
  '"Are African youth truly included in state decision-making?" 157 listeners joined an hour-long live debate.',
  $b$Young people are the majority of Africa's population but a small minority in the rooms where decisions are made. On 6 February 2026, we asked why.

### The questions
- Apart from voting, how can young people take part in government decisions?
- What stops African youth from being involved?
- When young people protest, are they participating in democracy or being pushed aside?
- What would real youth inclusion look like in everyday governance?

Leticia Nakalwoya moderated a conversation with speakers Kizito Abdulrashid, Aijuka Martha and Wasswa Saka Muhsin. Ms Winena Joan Jo, former chapter president, attended as a special guest.

The session ran for just over an hour with **157 listeners**, and tied directly to **SDG 16 (Peace, Justice and Strong Institutions)** and **SDG 4 (Quality Education)** through civic knowledge.$b$,
  'X-Spaces', '2026-02-06', 'Online · X Spaces', null,
  '{4,16}',
  '[{"value":"157","label":"Live listeners"},{"value":"64 min","label":"Live discussion"},{"value":"3","label":"Speakers"}]'::jsonb,
  null, '{}',
  null, null, false, true
),
(
  'faculty-orientation-special-needs',
  'Faculty Orientation: Special Needs & Rehabilitation',
  'Introducing UNAU Kyambogo and the Sustainable Development Goals to prospective members in the Faculty of Special Needs.',
  $b$On 27 February 2026, chapter leaders and our patron, Mr Emmanuel Isiagi, met about 33 prospective members in the Faculty of Special Needs and Rehabilitation.

### The programme
- **Why UNA-Uganda exists:** how it differs from, and relates to, the United Nations
- **The SDGs:** how the 17 goals connect to each other and to our home communities, with an invitation to pick a favourite and champion it
- **Membership benefits:** networking, mentorship and professional development
- **Expectations:** community engagement, attendance and volunteering
- **How to join**, followed by an open Q&A

Faculty orientations are how the chapter grows, and every faculty and school now has a seat on the executive.$b$,
  'Chapter life', '2026-02-27', 'Faculty of Special Needs & Rehabilitation, Kyambogo University', null,
  '{4,10,17}',
  '[{"value":"~33","label":"Prospective members"},{"value":"5","label":"Leaders and patron"}]'::jsonb,
  null, '{}',
  null, null, false, true
);


-- ---------------------------------------------------------------------
-- 6. Team (executive committee shown on the About page)
-- Phone numbers deliberately not stored here: this table is public.
-- ---------------------------------------------------------------------
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  role text not null check (char_length(trim(role)) between 2 and 150),
  bio text,
  photo_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.team_members enable row level security;

create policy "Anyone can read active team members"
  on public.team_members for select
  to anon, authenticated
  using (is_active or public.is_admin());

create policy "Admins manage team members"
  on public.team_members for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create trigger set_team_members_updated_at
  before update on public.team_members
  for each row execute function public.handle_updated_at();

insert into public.team_members (full_name, role, photo_url, sort_order) values
  ('Kamugisha Bruce', 'President', null, 1),
  ('Mondera Zakiyah', 'Vice President', '/images/team/mondera-zakiyah.jpg', 2),
  ('Kyarisiima Irene', 'Deputy General', null, 3),
  ('Ashaba Rizer', 'Speaker', '/images/team/ashaba-rizer.jpg', 4),
  ('Odonga Jeffers Isaac', 'Programs Coordinator', null, 5),
  ('Namutembi Peace', 'Publicity', null, 6),
  ('Uwimana Phiona', 'Members Coordinator', '/images/team/uwimana-phiona.jpg', 7),
  ('Musinguzi Jude', 'Representative, School of Built Environment', null, 8),
  ('Ocira Marvin Okot', 'Faculty Representative, Social Sciences', null, 9),
  ('Cheptoek Abigail Solimo', 'Faculty Representative, Science', null, 10),
  ('Kintu Mugabo Isaac', 'Representative, School of Art and Industrial Design', null, 11),
  ('Akello Patience', 'Representative, Special Needs and Rehabilitation', '/images/team/akello-patience.jpg', 12),
  ('Nabulime Joan', 'Representative, School of Computing and Information Science', null, 13),
  ('Kizito Abdulrashid', 'Faculty Representative, Engineering', null, 14),
  ('Aboot Olive Benite', 'Faculty Representative, Vocational Studies', null, 15),
  ('Samantha Kkungu', 'Mentor', null, 16),
  ('Winena Joann Jo', 'Mentor', null, 17);


-- ---------------------------------------------------------------------
-- 7. Site media storage (admin uploads for projects and team photos)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Anyone can view site media"
  on storage.objects for select
  using (bucket_id = 'site-media');

create policy "Admins can upload site media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-media' and public.is_admin());

create policy "Admins can update site media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-media' and public.is_admin());

create policy "Admins can delete site media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-media' and public.is_admin());


-- ---------------------------------------------------------------------
-- 8. Tree images: uploads only into your own folder, images only, 5 MB
-- ---------------------------------------------------------------------
update storage.buckets
   set file_size_limit = 5242880,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
 where id = 'tree-images';

drop policy if exists "Authenticated users can upload tree images" on storage.objects;

create policy "Authenticated users can upload tree images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'tree-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admins can delete any tree image"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'tree-images' and public.is_admin());


-- ---------------------------------------------------------------------
-- 9. Tree moderation and sanity checks
-- ---------------------------------------------------------------------
create policy "Admins can update any tree"
  on public.trees for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete any tree"
  on public.trees for delete
  to authenticated
  using (public.is_admin());

create policy "Admins can view all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

-- NOT VALID: enforce on new rows without failing on anything already stored.
alter table public.trees
  add constraint trees_tree_count_reasonable check (tree_count <= 10000) not valid,
  add constraint trees_latitude_range check (latitude between -90 and 90) not valid,
  add constraint trees_longitude_range check (longitude between -180 and 180) not valid,
  add constraint trees_species_length check (species is null or char_length(species) <= 120) not valid,
  add constraint trees_notes_length check (notes is null or char_length(notes) <= 1000) not valid;
