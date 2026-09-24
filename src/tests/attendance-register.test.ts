import test from 'node:test';
import assert from 'node:assert/strict';
import { saveRegister, listAllAttendanceRows } from '../ui/attendance-register';

test('new dated registers preserve earlier absences; corrections only update the selected date', async () => {
 const rows:any[]=[{id:'old',class_id:'class',student_id:'student',attendance_date:'2026-09-17',status:'Absent'}];
 const api={list:async()=>({data:rows}),create:async(body:any)=>{rows.push({id:'new',...body})},update:async(id:string,body:any)=>Object.assign(rows.find(r=>r.id===id),body)};
 const session={classId:'class',date:'2026-09-24',students:[{id:'student'}],statuses:{student:'Present'}};
 await saveRegister(api,session);
 assert.equal(rows.length,2);assert.equal(rows[0].status,'Absent');
 await saveRegister(api,{...session,statuses:{student:'Excused'}});
 assert.equal(rows.length,2);assert.equal(rows[0].status,'Absent');assert.equal(rows[1].status,'Excused');
});
test('incomplete registers cannot save', async()=>{
 await assert.rejects(()=>saveRegister({} as any,{classId:'class',date:'2026-09-24',students:[{id:'student'}],statuses:{}}),/Mark every student/);
});
test('rosters and history load all pages',async()=>{
 const result=await listAllAttendanceRows(async({page}:any)=>({data:[page],meta:{pagination:{total_pages:3}}}),{});
 assert.deepEqual(result.data,[1,2,3]);
});
test('retry after partial failure updates saved entries without duplicating them',async()=>{
 const rows:any[]=[];let fail=true;
 const api={list:async()=>({data:rows}),create:async(body:any)=>{if(body.student_id==='b'&&fail){fail=false;throw new Error('Offline')}rows.push({id:body.student_id,...body})},update:async()=>{}};
 const session={classId:'class',date:'2026-09-24',students:[{id:'a'},{id:'b'}],statuses:{a:'Present',b:'Absent'}};
 await assert.rejects(()=>saveRegister(api,session),/not fully saved/);
 await saveRegister(api,session);assert.equal(rows.length,2);
});
