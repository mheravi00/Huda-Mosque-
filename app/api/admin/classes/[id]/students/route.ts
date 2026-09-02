import{collectionRelation}from'@/server/relations';const h=collectionRelation('class_students','class_id','student_id','student_id');export const GET=h.GET;export const POST=h.POST;
