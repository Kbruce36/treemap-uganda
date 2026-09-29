-- Application emails aren't wanted: applications are read in /admin only.
-- Undo the email parts of 20260929150000 (the contact-detail settings stay).

drop policy "Anyone can apply while applications are open" on public.executive_applications;

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

alter table public.executive_applications drop column notified_at;
alter table public.site_settings drop column notification_email;
