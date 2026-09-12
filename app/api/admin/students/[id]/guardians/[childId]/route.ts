import{deleteRelation}from'@/server/relations';export const DELETE=deleteRelation('student_guardians','student_id','guardian_id');

export const dynamic='force-dynamic';
