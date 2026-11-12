import{requireRole}from'@/server/auth';import{ApiError,jsonBody,ok,route}from'@/server/http';import{mapDatabaseError}from'@/server/resource-utils';import{ensureUuid}from'@/server/validators';
// Moves selected students from one class to another. RLS limits teachers to classes they teach.
export const POST=route(async r=>{
  const c=await requireRole(r,['admin','teacher']),b=await jsonBody(r);
  const from=ensureUuid(b.from_class_id,'from_class_id'),to=ensureUuid(b.to_class_id,'to_class_id');
  if(from===to)throw new ApiError(400,'VALIDATION_ERROR','Choose a different class to transfer to.');
  if(!Array.isArray(b.student_ids)||!b.student_ids.length)throw new ApiError(400,'VALIDATION_ERROR','Select at least one student.');
  const ids=b.student_ids.map((x:unknown)=>ensureUuid(x,'student_ids'));
  // Students already in the target class keep their place; the rest are moved.
  const{data:already}=await c.supabase.from('class_students').select('student_id').eq('class_id',to).in('student_id',ids);
  const inTarget=new Set((already??[]).map((x:any)=>x.student_id));
  const toMove=ids.filter((id:string)=>!inTarget.has(id));
  let moved=0;
  if(toMove.length){
    const{data,error}=await c.supabase.from('class_students').update({class_id:to,override_reason:null}).eq('class_id',from).in('student_id',toMove).select('id');
    mapDatabaseError(error);moved=(data??[]).length;
  }
  return ok({moved,already_in_target:inTarget.size,requested:ids.length});
});

export const dynamic='force-dynamic';
