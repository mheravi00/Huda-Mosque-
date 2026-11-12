import{collectionHandlers}from'@/server/resources';import{guardians}from'@/server/payloads';const h=collectionHandlers({...guardians,select:'*,student_guardians(students(id,student_id,first_name,last_name,gender,status))'},true);export const GET=h.GET;export const POST=h.POST;

export const dynamic='force-dynamic';
