import{collectionHandlers}from'@/server/resources';import{subjects}from'@/server/payloads';export const POST=collectionHandlers(subjects,true).POST;

export const dynamic='force-dynamic';
