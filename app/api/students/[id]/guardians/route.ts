import{collectionRelation}from'@/server/relations';const h=collectionRelation('student_guardians','student_id','guardian_id','guardian_id',false);export const GET=h.GET;
