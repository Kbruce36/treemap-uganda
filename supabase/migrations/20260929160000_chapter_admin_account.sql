-- Make the chapter's shared account (unaukyambogo@gmail.com) the website admin,
-- so each new cabinet can sign in with the same credentials and manage the site.
-- Does nothing if that account hasn't signed up yet.

-- Sign-up email confirmation is switched off for now, so confirm this account
-- in case it signed up while confirmation was still on.
update auth.users
   set email_confirmed_at = coalesce(email_confirmed_at, now())
 where lower(email) = 'unaukyambogo@gmail.com';

-- Accounts created before the profile trigger existed may lack a profile row.
insert into public.profiles (id, full_name, email)
select id, coalesce(raw_user_meta_data->>'full_name', 'UNAU Kyambogo'), email
  from auth.users
 where lower(email) = 'unaukyambogo@gmail.com'
on conflict (id) do nothing;

insert into public.user_roles (user_id, role)
select id, 'admin'
  from auth.users
 where lower(email) = 'unaukyambogo@gmail.com'
on conflict (user_id, role) do nothing;
