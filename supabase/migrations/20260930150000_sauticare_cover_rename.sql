-- New filename for the SautiCare logo cover so browsers stop showing the cached poster version.
update public.projects
   set cover_image = '/images/projects/sauticare-free-counselling/cover-logo.jpg'
 where slug = 'sauticare-free-counselling';
