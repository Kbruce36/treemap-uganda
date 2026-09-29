-- Contact details the cabinet can change from /admin (they used to be hard-coded),
-- and email notifications for new executive applications.

alter table public.site_settings
  add column contact_phone text not null default '+256 709 667270'
    check (contact_phone ~ '^\+?[0-9 ()-]{9,20}$'),
  add column contact_email text not null default 'unaukyambogo@gmail.com'
    check (char_length(contact_email) <= 255 and contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  add column membership_fee text not null default 'UGX 10,000'
    check (char_length(trim(membership_fee)) between 1 and 40),
  add column instagram_handle text not null default 'unau_kyambogo'
    check (instagram_handle ~ '^[A-Za-z0-9._]{1,30}$'),
  add column x_handle text not null default 'UnauKYU'
    check (x_handle ~ '^[A-Za-z0-9_]{1,15}$'),
  -- Where new applications are emailed (by the notify-application Edge Function).
  add column notification_email text default 'unaukyambogo@gmail.com'
    check (notification_email is null or (char_length(notification_email) <= 255 and notification_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'));

-- Set by the notify-application function once the email has gone out, so each
-- application is announced once.
alter table public.executive_applications
  add column notified_at timestamptz;

-- Applicants must not be able to pre-set the notification flag.
drop policy "Anyone can apply while applications are open" on public.executive_applications;

create policy "Anyone can apply while applications are open"
  on public.executive_applications for insert
  to anon, authenticated
  with check (
    public.applications_are_open()
    and status = 'new'
    and admin_notes is null
    and notified_at is null
    and exists (
      select 1 from public.executive_positions p
      where p.id = position_id and p.is_open
    )
  );
