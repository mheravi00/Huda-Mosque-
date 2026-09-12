import{collectionRelation}from'@/server/relations';const h=collectionRelation('class_students','student_id','class_id','class_id',true,['override_reason']);export const GET=h.GET;export const POST=h.POST;

export const dynamic='force-dynamic';
