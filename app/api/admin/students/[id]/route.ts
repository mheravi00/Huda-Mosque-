import{itemHandlers}from'@/server/resources';import{students}from'@/server/payloads';import{patchStudent}from'@/server/families';const h=itemHandlers(students,true);export const GET=h.GET;export const PATCH=patchStudent;export const DELETE=h.DELETE;

export const dynamic='force-dynamic';
