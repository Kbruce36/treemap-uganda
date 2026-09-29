-- Full photo gallery for the St Paul Primary School (Banda) outreach.
-- The school gave permission for these pictures to be published.
update public.projects
   set gallery = array[
         '/images/projects/my-story-your-future/3.jpg',
         '/images/projects/my-story-your-future/4.jpg',
         '/images/projects/my-story-your-future/1.jpg',
         '/images/projects/my-story-your-future/5.jpg',
         '/images/projects/my-story-your-future/6.jpg',
         '/images/projects/my-story-your-future/2.jpg',
         '/images/projects/my-story-your-future/7.jpg',
         '/images/projects/my-story-your-future/8.jpg',
         '/images/projects/my-story-your-future/9.jpg',
         '/images/projects/my-story-your-future/10.jpg'
       ]
 where slug = 'my-story-your-future';
