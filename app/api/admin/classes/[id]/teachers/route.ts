import{collectionRelation}from'@/server/relations';const h=collectionRelation('class_teachers','class_id','teacher_id','teacher_id');export const GET=h.GET;export const POST=h.POST;
