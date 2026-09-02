import { requireRole } from '@/server/auth';
import { ApiError, assertAllowedFields, jsonBody, noContent, ok, route } from '@/server/http';
import { mapDatabaseError } from '@/server/resource-utils';
import { ensureUuid, optionalString, requiredString } from '@/server/validators';

export const PATCH = route(async (request, { params }: { params: { id: string; sectionId: string } }) => {
  ensureUuid(params.id, 'report_id');
  ensureUuid(params.sectionId, 'section_id');
  const context = await requireRole(request, ['admin', 'teacher']);
  const body = await jsonBody(request);
  assertAllowedFields(body, ['section_name', 'content']);
  const payload: Record<string, unknown> = {};
  if (body.section_name !== undefined) payload.section_name = requiredString(body.section_name, 'section_name', 200);
  if (body.content !== undefined) payload.content = optionalString(body.content, 'content', 10000);
  if (!Object.keys(payload).length) throw new ApiError(400, 'VALIDATION_ERROR', 'No update fields were supplied.');
  const { data, error } = await context.supabase.from('report_sections').update(payload).eq('id', params.sectionId).eq('report_id', params.id).select().maybeSingle();
  mapDatabaseError(error);
  if (!data) throw new ApiError(404, 'NOT_FOUND', 'The report section was not found.');
  return ok(data);
});

export const DELETE = route(async (request, { params }: { params: { id: string; sectionId: string } }) => {
  ensureUuid(params.id, 'report_id');
  ensureUuid(params.sectionId, 'section_id');
  const context = await requireRole(request, ['admin', 'teacher']);
  const { data, error } = await context.supabase.from('report_sections').delete().eq('id', params.sectionId).eq('report_id', params.id).select('id').maybeSingle();
  mapDatabaseError(error);
  if (!data) throw new ApiError(404, 'NOT_FOUND', 'The report section was not found.');
  return noContent();
});
