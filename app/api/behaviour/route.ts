import{requireRole}from'@/server/auth';import{ok,route}from'@/server/http';import{mapDatabaseError}from'@/server/resource-utils';
export const GET=route(async r=>{const c=await requireRole(r,['admin','teacher']);let q:any=c.supabase.from('behaviour_logs').select('*,students(id,student_id,first_name,last_name,gender),classes(id,name,section)').order('incident_date',{ascending:false}).limit(500);const code=r.nextUrl.searchParams.get('code');if(code)q=q.eq('code',code);const{data,error}=await q;mapDatabaseError(error);return ok(data??[])});

export const dynamic='force-dynamic';
