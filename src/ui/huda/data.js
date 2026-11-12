'use client';
// Shared data loaders for the Huda pages.
import{classesApi,studentsApi}from'../../lib/api/resources';
import{useApiResource}from'../useApiResource';

// Fetches every page of a paginated list endpoint (the API caps pages at 100 rows).
export async function listAll(list,params={}){
  const data=[];
  for(let page=1;page<50;page++){
    const result=await list({...params,page,limit:100});
    data.push(...(result.data||[]));
    if(page>=(result.meta?.pagination?.total_pages??1))break;
  }
  return{data};
}

export const useClasses=()=>useApiResource(()=>listAll(classesApi.list),[]);
// Admins see archived students too; teachers only see students in their classes (enforced by RLS).
// The list endpoint hides archived students unless asked for them explicitly.
export const useStudents=(role,{archived=false}={})=>useApiResource(async()=>{
  if(role!=='admin')return listAll(studentsApi.list);
  const[live,old]=await Promise.all([listAll(studentsApi.admin.list),archived?listAll(studentsApi.admin.list,{status:'archived'}):Promise.resolve({data:[]})]);
  return{data:[...live.data,...old.data]};
},[role,archived]);

// Splits a student's status into the label used across the UI.
export const sStatus=s=>({active:'Active',inactive:'Inactive',archived:'Archived'}[String(s?.status||'').toLowerCase()]||'Active');
