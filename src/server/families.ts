import type{NextRequest}from'next/server';import{requireAdmin}from'./auth';import{ApiError,assertAllowedFields,jsonBody,ok,route}from'./http';import{guardians,students}from'./payloads';import{many,mapDatabaseError,mutate,one}from'./resource-utils';import{ensureUuid}from'./validators';
export type BracketClass={id:string;name:string;gender:string;min_age:number;max_age:number;active?:boolean};
// Whole years between date_of_birth (YYYY-MM-DD) and today, evaluated as calendar dates so timezones cannot shift a birthday.
export function ageOn(dob:string,today=new Date()){const[y,m,d]=dob.split('-').map(Number),ty=today.getUTCFullYear(),tm=today.getUTCMonth()+1,td=today.getUTCDate();return ty-y-(tm<m||(tm===m&&td<d)?1:0)}
export function matchClass(classes:BracketClass[],gender:string,age:number){return classes.find(c=>c.active!==false&&c.gender===gender&&age>=c.min_age&&age<=c.max_age)||null}
const childFields=['first_name','last_name','date_of_birth','gender'] as const;
// Creates a guardian (or reuses guardian_id) plus any number of children in one request: each child becomes a student
// (student_id is assigned by the students_set_student_id trigger), is linked to the guardian, and is placed in the
// class whose gender/age bracket matches. Anything created is removed again if a later step fails.
export const createFamily=route(async(request:NextRequest)=>{
 const c=await requireAdmin(request),body=await jsonBody(request);assertAllowedFields(body,['guardian_id','guardian','children']);
 if(body.guardian_id!==undefined&&body.guardian!==undefined)throw new ApiError(400,'VALIDATION_ERROR','Supply either guardian_id or guardian, not both.');
 const rawChildren=body.children===undefined?[]:body.children;if(!Array.isArray(rawChildren)||rawChildren.length>20)throw new ApiError(400,'VALIDATION_ERROR','children must be a list of at most 20 children.');
 const children=rawChildren.map((child,i)=>{if(!child||typeof child!=='object'||Array.isArray(child))throw new ApiError(400,'VALIDATION_ERROR',`Child ${i+1} is invalid.`);const b=child as Record<string,unknown>;assertAllowedFields(b,childFields);
  // Drop unset keys: a multi-row insert sends a missing key as null, which would bypass column defaults such as enrolment_date.
  return Object.fromEntries(Object.entries(students.create(b,c.profile.id)).filter(entry=>entry[1]!==undefined))});
 let guardianRow:any,createdGuardianId:string|null=null;
 if(body.guardian_id!==undefined){guardianRow=await one(c.supabase.from('guardians').select('*').eq('id',ensureUuid(body.guardian_id,'guardian_id')).maybeSingle())}
 else{if(!body.guardian||typeof body.guardian!=='object'||Array.isArray(body.guardian))throw new ApiError(400,'VALIDATION_ERROR','guardian is required.');const g=body.guardian as Record<string,unknown>;assertAllowedFields(g,guardians.writeFields);guardianRow=await mutate(c.supabase.from('guardians').insert(guardians.create(g,c.profile.id)).select().single());createdGuardianId=guardianRow.id}
 if(!children.length)return ok({guardian:guardianRow,children:[]},201);
 const classes=(await many(c.supabase.from('classes').select('id,name,gender,min_age,max_age,active'))).data as BracketClass[];
 let createdStudents:any[]=[];
 try{
  createdStudents=await mutate(c.supabase.from('students').insert(children).select());
  const{error:linkError}=await c.supabase.from('student_guardians').insert(createdStudents.map(s=>({student_id:s.id,guardian_id:guardianRow.id})));mapDatabaseError(linkError);
  const placed=createdStudents.map(s=>({student:s,class:matchClass(classes,s.gender,ageOn(s.date_of_birth))}));
  const assignments=placed.filter(p=>p.class).map(p=>({student_id:p.student.id,class_id:p.class!.id}));
  if(assignments.length){const{error}=await c.supabase.from('class_students').insert(assignments);mapDatabaseError(error)}
  return ok({guardian:guardianRow,children:placed.map(p=>({...p.student,class:p.class?{id:p.class.id,name:p.class.name}:null}))},201);
 }catch(error){
  if(createdStudents.length)await c.supabase.from('students').delete().in('id',createdStudents.map(s=>s.id));
  if(createdGuardianId)await c.supabase.from('guardians').delete().eq('id',createdGuardianId);
  throw error;
 }
});
export const guardianChildren=route(async(request:NextRequest,_:{params:{id:string}})=>{ensureUuid(_.params.id);const c=await requireAdmin(request);const{data,error}=await c.supabase.from('student_guardians').select('students(id,student_id,first_name,last_name,date_of_birth,gender,status,class_students(classes(id,name)))').eq('guardian_id',_.params.id);mapDatabaseError(error);return ok((data??[]).map((r:any)=>r.students).filter(Boolean).map((s:any)=>{const{class_students,...rest}=s;return{...rest,classes:(class_students??[]).map((x:any)=>x.classes).filter(Boolean)}}))});
// Keeps a student's class in step with their date of birth and gender. A placement the admin made with an override
// reason is left alone, as is a student whose new age matches no class (the bracket review flags those instead).
export async function syncStudentClass(supabase:any,student:{id:string;gender:string;date_of_birth:string}){
 const current=(await many(supabase.from('class_students').select('class_id,override_reason').eq('student_id',student.id))).data;
 if(current.some((r:any)=>r.override_reason))return;
 const classes=(await many(supabase.from('classes').select('id,name,gender,min_age,max_age,active'))).data as BracketClass[];
 const target=matchClass(classes,student.gender,ageOn(student.date_of_birth));
 if(!target||(current.length===1&&current[0].class_id===target.id))return;
 const{error:removeError}=await supabase.from('class_students').delete().eq('student_id',student.id).neq('class_id',target.id);mapDatabaseError(removeError);
 if(!current.some((r:any)=>r.class_id===target.id)){const{error}=await supabase.from('class_students').insert({student_id:student.id,class_id:target.id});mapDatabaseError(error)}
}
export const studentWithClassSelect='*,class_students(classes(id,name))';
export const patchStudent=route(async(request:NextRequest,_:{params:{id:string}})=>{
 ensureUuid(_.params.id);const c=await requireAdmin(request),body=await jsonBody(request);assertAllowedFields(body,students.writeFields);
 const payload=students.patch(body);if(!Object.keys(payload).length)throw new ApiError(400,'VALIDATION_ERROR','No update fields were supplied.');
 const data=await mutate(c.supabase.from('students').update(payload).eq('id',_.params.id).select().maybeSingle());if(!data)throw new ApiError(404,'NOT_FOUND','The requested record was not found.');
 if(body.date_of_birth!==undefined||body.gender!==undefined)await syncStudentClass(c.supabase,data);
 return ok(await one(c.supabase.from('students').select(studentWithClassSelect).eq('id',data.id).maybeSingle()));
});
