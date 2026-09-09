import{requireAdmin}from'@/server/auth';import{many}from'@/server/resource-utils';import{ok,route}from'@/server/http';
export const GET=route(async request=>{const c=await requireAdmin(request);const r=await many(c.supabase.from('v_students_outside_class_bracket').select('*'));return ok(r.data)});
