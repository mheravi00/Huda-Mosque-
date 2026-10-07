import{createSupabaseAdminClient,requireAdmin}from'@/server/auth';import{ok,route}from'@/server/http';import{mapDatabaseError}from'@/server/resource-utils';import{ensureUuid}from'@/server/validators';export const GET=route(async(r,_:{params:{id:string}})=>{ensureUuid(_.params.id);await requireAdmin(r);const{data,error}=await createSupabaseAdminClient().from('class_teachers').select('class_id,classes(id,name,gender,min_age,max_age,active)').eq('teacher_id',_.params.id);mapDatabaseError(error);return ok(data??[])});

export const dynamic='force-dynamic';
