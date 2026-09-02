import{collectionHandlers}from'@/server/resources';import{students}from'@/server/payloads';export const GET=collectionHandlers(students).GET;
export const dynamic='force-dynamic';
