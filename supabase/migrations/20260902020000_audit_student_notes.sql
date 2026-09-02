-- Ensure teacher-created student notes participate in the immutable audit trail.
-- The catalog guard makes this safe for live databases that may already have it.
do $$
begin
  if not exists (
    select 1
    from pg_trigger t
    where t.tgrelid = 'public.student_notes'::regclass
      and t.tgname = 'student_notes_audit'
      and not t.tgisinternal
  ) then
    create trigger student_notes_audit
    after insert or update or delete on public.student_notes
    for each row execute function public.create_audit_entry();
  end if;
end
$$;
