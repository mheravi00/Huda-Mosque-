-- Support for the redesigned portal.

-- Admins leave a note for the teacher when they send a report back.
alter table public.student_reports add column if not exists review_note text;

-- Assessments are now created for a whole class; per-student scores live in
-- assessment_results. The legacy per-row student_id becomes optional.
alter table public.assessments alter column student_id drop not null;
