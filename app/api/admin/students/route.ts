import{collectionHandlers}from'@/server/resources';import{students}from'@/server/payloads';const h=collectionHandlers(students,true);export const GET=h.GET;export const POST=h.POST;
