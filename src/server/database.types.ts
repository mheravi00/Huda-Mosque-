export type AppRole='admin'|'teacher';export type AttendanceStatus='Present'|'Absent'|'Late'|'Excused';export type HomeworkStatus='Not completed'|'Completed'|'Late';export type ReportStatus='Draft'|'Submitted'|'Under Review'|'Changes Requested'|'Approved'|'Sent';
export type Database={public:{Tables:{[table:string]:{Row:Record<string,unknown>;Insert:Record<string,unknown>;Update:Record<string,unknown>}}}};
// Replace the generic table map with `supabase gen types typescript` output when CLI
// database access is available. API payloads remain explicitly validated separately.
