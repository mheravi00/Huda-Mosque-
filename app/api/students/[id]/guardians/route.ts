import{collectionRelation}from'@/server/relations';const h=collectionRelation('student_guardians','student_id','guardian_id','guardian_id',false,[],'*,guardians(id,first_name,last_name,relationship,phone,email)');export const GET=h.GET;

export const dynamic='force-dynamic';
