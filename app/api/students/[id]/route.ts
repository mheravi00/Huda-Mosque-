import{itemHandlers}from'@/server/resources';import{students}from'@/server/payloads';export const GET=itemHandlers(students).GET;

export const dynamic='force-dynamic';
