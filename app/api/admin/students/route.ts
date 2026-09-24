import{collectionHandlers}from'@/server/resources';import{students}from'@/server/payloads';import{studentWithClassSelect}from'@/server/families';const h=collectionHandlers({...students,select:studentWithClassSelect},true);export const GET=h.GET;export const POST=h.POST;

export const dynamic='force-dynamic';
