-- Plainer, more human copy for the September projects, no poster images on
-- SautiCare, and at most five photos per project gallery.

update public.projects
   set title = 'SautiCare: Free Counselling for Students',
       summary = 'University can be a lot to carry. We want every student at Kyambogo to know that SautiCare is there, and that talking to a counsellor costs nothing.',
       body = $b$University can be a lot. Exams, money, relationships, family, questions about your health that you don't feel comfortable asking anyone. Many students carry these things quietly, often because they worry about being judged or about who might find out.

SautiCare was built for exactly that. It lets you talk to a trained counsellor, by chat or by phone, whenever you feel ready, and it doesn't cost anything. You don't have to give your real name, and there's nothing to install: it opens in your phone's browser. Alongside counselling, it has honest, easy-to-read health information and can point you to clinics nearby.

As a chapter, we're making sure students at Kyambogo know this support exists. It fits our focus this semester on SDG 3, Good Health and Well-being, and it matters to us because the people who need help most are often the ones least likely to ask for it.

If something has been weighing on you, you don't have to deal with it alone. You can reach a counsellor at app.sauticare.org.

SautiCare offers support and information, not medical treatment. In an emergency, please contact emergency services or someone you trust straight away.$b$,
       impact = '[]'::jsonb,
       gallery = '{}'
 where slug = 'sauticare-free-counselling';

update public.projects
   set summary = 'Our members joined the national symposium marking World Ozone Day at Kyambogo, and the chapter received a Certificate of Participation.',
       body = $b$On 16 September, Kyambogo's CTF Auditorium was full for the National Sustainability Symposium on Ozone Protection, Climate Action and Environmental Sustainability, held to mark the International Day for the Preservation of the Ozone Layer. This year's theme was "Safeguarding the Ozone Layer through Innovation, Partnerships and Sustainable Action."

The symposium was convened by the Green Horizons Environmental Research Initiative Uganda (GHERI-UG), together with NEMA and EEMA. It brought students, practitioners and officials together for talks and panel discussions on the ozone layer, climate change and how we look after our environment.

Our members were there, and the chapter received a Certificate of Participation, signed by Eng. Dilidha Musa, Executive Director of GHERI-UG, and by NEMA. We're proud of it. It rounds off a year of environmental work that started with the Green Conference and the Go Green clean-up back in April.$b$,
       impact = '[]'::jsonb,
       gallery = '{/images/projects/ozone-symposium-2026/1.jpg,/images/projects/ozone-symposium-2026/2.jpg,/images/projects/ozone-symposium-2026/3.jpg,/images/projects/ozone-symposium-2026/4.jpg,/images/projects/ozone-symposium-2026/5.jpg}'
 where slug = 'ozone-symposium-2026';

update public.projects
   set summary = 'Mr. Baguma, Secretary General of UNA-Uganda, visited Kyambogo to meet our members and talk about student leadership.',
       body = $b$On 11 September we welcomed the UNA-Uganda National Secretariat to Kyambogo for an open session we called "Meet the Minds Behind UNAU". Students from every faculty were invited to CLB 104 to meet the people who run the association nationally and ask them anything.

Mr. Baguma, the Secretary General of UNA-Uganda, spoke to members about student leadership and about how the association works, and our President, Kamugisha Bruce, moderated the conversation. Members came with plenty of questions about the UN, about UNAU, and about how to get more involved.

We finished with photos, members holding up the Global Goals they care most about. With a new cabinet coming in soon, it was a good moment for current and future leaders to hear straight from the Secretariat.$b$,
       impact = '[]'::jsonb,
       gallery = '{/images/projects/secretariat-visit-2026/1.jpg,/images/projects/secretariat-visit-2026/3.jpg,/images/projects/secretariat-visit-2026/4.jpg,/images/projects/secretariat-visit-2026/9.jpg,/images/projects/secretariat-visit-2026/7.jpg}'
 where slug = 'secretariat-visit-2026';

update public.projects
   set gallery = '{/images/projects/my-story-your-future/3.jpg,/images/projects/my-story-your-future/5.jpg,/images/projects/my-story-your-future/6.jpg,/images/projects/my-story-your-future/7.jpg,/images/projects/my-story-your-future/8.jpg}'
 where slug = 'my-story-your-future';
