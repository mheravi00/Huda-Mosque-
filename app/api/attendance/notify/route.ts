import{requireRole}from'@/server/auth';import{ApiError,jsonBody,ok,route}from'@/server/http';import{one}from'@/server/resource-utils';import{deliverCommunication}from'@/server/communications';import{ensureUuid}from'@/server/validators';

export const POST=route(async request=>{
  const c=await requireRole(request,['admin','teacher']);
  const body=await jsonBody(request);
  const studentId=ensureUuid(body.student_id,'student_id');
  const templateId=ensureUuid(body.template_id,'template_id');
  const classId=ensureUuid(body.class_id,'class_id');
  const student=await one(c.supabase.from('students').select('id,first_name,last_name').eq('id',studentId).maybeSingle());
  const template=await one(c.supabase.from('message_templates').select('*').eq('id',templateId).maybeSingle());
  const cls=await one(c.supabase.from('classes').select('name').eq('id',classId).maybeSingle());
  const{data:streakRow}=await c.supabase.from('v_attendance_absence_streaks').select('current_absent_streak').eq('class_id',classId).eq('student_id',studentId).maybeSingle();
  const weeksAbsent=streakRow?.current_absent_streak??0;
  const{data:links,error:linksError}=await c.supabase.from('student_guardians').select('guardian_id, guardians(id,first_name,last_name,email,phone,receive_attendance_messages)').eq('student_id',studentId);
  if(linksError)throw new ApiError(500,'DATABASE_ERROR','The request could not be completed.');
  const guardians=(links||[]).map((l:any)=>l.guardians).filter((g:any)=>g&&g.receive_attendance_messages);
  if(!guardians.length)throw new ApiError(409,'NO_RECIPIENTS','No guardians are opted in to receive attendance messages for this student.');
  const studentName=`${student.first_name} ${student.last_name}`;
  const render=(text:string|null)=>(text||'').replaceAll('{{student_name}}',studentName).replaceAll('{{class_name}}',cls.name).replaceAll('{{weeks_absent}}',String(weeksAbsent));
  const subject=render(template.subject);
  const messageBody=render(template.body);
  const sent=[];
  for(const guardian of guardians){
    if(['email','both'].includes(template.channel)&&guardian.email)sent.push(await deliverCommunication({type:'email',recipient:guardian.email,guardian_id:guardian.id,student_id:studentId,template_id:templateId,subject,body:messageBody}));
    if(['sms','both'].includes(template.channel)&&guardian.phone)sent.push(await deliverCommunication({type:'sms',recipient:guardian.phone,guardian_id:guardian.id,student_id:studentId,template_id:templateId,body:messageBody}));
  }
  return ok({sent:sent.length,logs:sent});
});

export const dynamic='force-dynamic';
