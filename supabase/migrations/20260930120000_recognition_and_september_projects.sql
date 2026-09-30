-- Awards/certificates a project earned, shown as "Recognition" on the project page.
-- Each item: { "title": "...", "issuer": "...", "image": "/images/..." }
alter table public.projects
  add column recognition jsonb not null default '[]'::jsonb
    check (jsonb_typeof(recognition) = 'array');

insert into public.projects
  (slug, title, summary, body, category, event_date, location, partners, sdgs, impact, cover_image, gallery, cta_label, cta_url, is_featured, is_published, recognition)
values
(
  'sauticare-free-counselling',
  'SautiCare: Free, Private Counselling for Students',
  'We are championing SautiCare at Kyambogo so every student can talk to a trained counsellor for free, privately, and without giving their real name.',
  $b$Many students carry things they never say out loud: stress, relationships, sexual and reproductive health questions, or something that happened to them. Fear of being judged, or of being seen at the clinic, keeps a lot of young people from asking for help.

**SautiCare** removes those barriers, and UNAU Kyambogo is championing it across campus as part of this semester's focus on **SDG 3: Good Health and Well-being**.

### What students get
- **Talk to a real counsellor:** chat or call a trained counsellor, or ask them to call you back when it's safe to talk
- **No real name needed:** use SautiCare without revealing who you are
- **Free:** there is nothing to pay
- **No download:** it works in any phone browser at app.sauticare.org
- **Learn:** clear, youth-friendly health information that busts common myths
- **Clinics:** find nearby health services
- **Safe Space:** a moderated community where young people share experiences and support each other

### What the chapter is doing
We are spreading the word through campus posters, our social media and chapter activities, so that every student at Kyambogo knows free, confidential support is one tap away.

SautiCare offers information and support, not medical diagnosis or treatment. In an emergency, always contact emergency services or someone you trust.$b$,
  'Health & well-being', null, 'Kyambogo University · online at app.sauticare.org',
  'SautiCare',
  '{3,5,17}',
  '[{"value":"Free","label":"Counselling for every student"},{"value":"No name","label":"Needed to talk to a counsellor"},{"value":"No app","label":"Works in any phone browser"}]'::jsonb,
  '/images/projects/sauticare-free-counselling/cover.jpg',
  '{/images/projects/sauticare-free-counselling/1.jpg,/images/projects/sauticare-free-counselling/2.jpg,/images/projects/sauticare-free-counselling/3.jpg,/images/projects/sauticare-free-counselling/4.jpg,/images/projects/sauticare-free-counselling/5.jpg,/images/projects/sauticare-free-counselling/6.jpg,/images/projects/sauticare-free-counselling/7.jpg}',
  'Talk to a counsellor', 'https://app.sauticare.org', true, true, '[]'::jsonb
),
(
  'ozone-symposium-2026',
  'National Sustainability Symposium on Ozone Protection 2026',
  'UNAU Kyambogo took part in the national symposium marking the International Day for the Preservation of the Ozone Layer, and received a Certificate of Participation.',
  $b$On Wednesday 16 September 2026, Kyambogo University's CTF Auditorium hosted the **National Sustainability Symposium on Ozone Protection, Climate Action and Environmental Sustainability 2026**. The symposium commemorated the International Day for the Preservation of the Ozone Layer under the theme **"Safeguarding the Ozone Layer through Innovation, Partnerships & Sustainable Action."**

The symposium was convened by the Green Horizons Environmental Research Initiative Uganda (GHERI-UG), with the National Environment Management Authority (NEMA) and the Environmental Engineering and Management Association (EEMA). UNAU Kyambogo members joined a packed auditorium of students, practitioners and officials for talks and panel discussions on protecting the ozone layer, climate action and environmental sustainability.

### Recognition
In recognition of the chapter's participation, UNAU Kyambogo received a **Certificate of Participation**, signed by Eng. Dilidha Musa, Executive Director of GHERI-UG, and by NEMA.

The symposium builds on the chapter's environmental work this year, from the Green Conference and Go Green clean-up to mapping trees on UNAU TreeMap.$b$,
  'Conferences & dialogue', '2026-09-16', 'CTF Auditorium 105, Kyambogo University',
  'GHERI-UG (Green Horizons Environmental Research Initiative Uganda), NEMA, EEMA',
  '{3,13,17}',
  '[{"value":"Certified","label":"Certificate of Participation"},{"value":"GHERI-UG · NEMA","label":"Issued by"},{"value":"16 Sept","label":"International Ozone Day symposium"}]'::jsonb,
  '/images/projects/ozone-symposium-2026/cover.jpg',
  '{/images/projects/ozone-symposium-2026/1.jpg,/images/projects/ozone-symposium-2026/2.jpg,/images/projects/ozone-symposium-2026/3.jpg,/images/projects/ozone-symposium-2026/4.jpg,/images/projects/ozone-symposium-2026/5.jpg,/images/projects/ozone-symposium-2026/6.jpg}',
  null, null, true, true,
  '[{"title":"Certificate of Participation","issuer":"GHERI-UG and NEMA, National Sustainability Symposium on Ozone Protection 2026","image":"/images/projects/ozone-symposium-2026/certificate.jpg"}]'::jsonb
),
(
  'secretariat-visit-2026',
  'Meet the Minds Behind UNAU: Secretariat Visit',
  'The UNA-Uganda National Secretariat came to Kyambogo to meet our members and share first-hand advice on leadership and how the association works.',
  $b$On Friday 11 September 2026, the chapter hosted **"Meet the Minds Behind UNAU"**, an open session with the **UNA-Uganda National Secretariat** in CLB 104, open to students from every faculty.

The session introduced our members to the people who run the association nationally and gave them the chance to ask their questions directly.

### What happened
- **Introductions:** chapter members and new faces from across the faculties met the Secretariat
- **Leadership advice, first-hand:** the Secretariat shared advice on student leadership and on how UNA-Uganda works
- **Open Q&A:** members brought their questions about the UN, the association and getting involved
- **The Global Goals on show:** members held up the Sustainable Development Goals they champion, from No Poverty and Quality Education to Gender Equality and Climate Action

The visit came as the chapter prepares for a new cabinet, and it gave current and future leaders a clearer picture of the association they are part of.$b$,
  'Chapter life', '2026-09-11', 'CLB 104, Kyambogo University',
  'UNA-Uganda National Secretariat',
  '{4,16,17}',
  '[{"value":"UNA-Uganda","label":"National Secretariat on campus"},{"value":"All","label":"Faculties invited"},{"value":"2 hrs","label":"Open session and Q&A"}]'::jsonb,
  '/images/projects/secretariat-visit-2026/cover.jpg',
  '{/images/projects/secretariat-visit-2026/1.jpg,/images/projects/secretariat-visit-2026/2.jpg,/images/projects/secretariat-visit-2026/3.jpg,/images/projects/secretariat-visit-2026/4.jpg,/images/projects/secretariat-visit-2026/5.jpg,/images/projects/secretariat-visit-2026/6.jpg,/images/projects/secretariat-visit-2026/7.jpg,/images/projects/secretariat-visit-2026/8.jpg,/images/projects/secretariat-visit-2026/9.jpg,/images/projects/secretariat-visit-2026/10.jpg}',
  null, null, false, true, '[]'::jsonb
)
on conflict (slug) do nothing;
