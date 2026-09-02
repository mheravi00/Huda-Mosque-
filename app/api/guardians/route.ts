import{collectionHandlers}from'@/server/resources';import{guardians}from'@/server/payloads';export const GET=collectionHandlers(guardians).GET;
export const dynamic='force-dynamic';
