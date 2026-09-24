import{collectionHandlers}from'@/server/resources';import{students}from'@/server/payloads';import{studentWithClassSelect}from'@/server/families';export const GET=collectionHandlers({...students,select:studentWithClassSelect}).GET;
export const dynamic='force-dynamic';
