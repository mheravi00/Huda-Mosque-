import{requireRole}from'@/server/auth';import{assertAllowedFields,jsonBody,ok,route}from'@/server/http';import{mapDatabaseError}from'@/server/resource-utils';import{optionalString,requiredString}from'@/server/validators';
// Admins see all feedback; teachers see their own submissions (RLS enforces this).
export const GET=route(async r=>{const c=await requireRole(r,['admin','teacher']);const{data,error}=await c.supabase.from('feedback').select('*,profiles(first_name,last_name,role)').order('created_at',{ascending:false});mapDatabaseError(error);return ok(data??[])});
export const POST=route(async r=>{const c=await requireRole(r,['admin','teacher']),b=await jsonBody(r);assertAllowedFields(b,['name','phone','problem','details']);const{data,error}=await c.supabase.from('feedback').insert({name:requiredString(b.name,'name',120),phone:optionalString(b.phone,'phone',40),problem:requiredString(b.problem,'problem',300),details:optionalString(b.details,'details',4000),created_by:c.profile.id}).select().single();mapDatabaseError(error);return ok(data,201)});

export const dynamic='force-dynamic';
