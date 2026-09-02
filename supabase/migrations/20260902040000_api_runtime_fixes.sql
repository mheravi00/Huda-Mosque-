-- Repair runtime defects discovered by the Phase 1C live API regression.
alter table public.notifications
add column if not exists updated_at timestamptz not null default now();

alter policy messages_recipient_select on public.messages
using (
  exists (
    select 1 from public.message_recipients mr
    where mr.message_id = messages.id
      and mr.recipient_id = public.current_profile_id()
  )
);
