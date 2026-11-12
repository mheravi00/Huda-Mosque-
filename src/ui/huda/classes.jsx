'use client';
// Huda — Classes, Subjects, Bracket review
import React,{useState}from'react';
import{attendanceApi,classesApi,studentsApi,subjectsApi,teachersApi}from'../../lib/api/resources';
import{listAllAttendanceRows}from'../attendance-register';
import{useApiResource}from'../useApiResource';
import{listAll,sStatus,useClasses}from'./data';
import{Alert,Av,Badge,ClassPill,DAYS,Empty,Field,H,Ico,Listing,Loading,PageHead,Panel,PanelHead,Sw,Tabs,bracketText,classCount,classFor,classTeachers,classWhen,clsName,name,today,useUI}from'./ui';

export function Classes(){
  const {role,toast,params}=useUI();const admin=role==='admin';
  const res=useClasses();
  const [sel,setSel]=useState(params?.id||null);const c=sel&&res.data.find(x=>x.id===sel);
  const setActive=async(x,v)=>{try{await classesApi.admin.update(x.id,{active:v});res.setData(rs=>rs.map(r=>r.id===x.id?{...r,active:v}:r));toast(`${x.name} ${v?'activated':'deactivated'}`)}catch(e){toast(e.message)}};
  const list=[...res.data].sort((a,b)=>String(a.gender).localeCompare(b.gender)||(a.min_age??0)-(b.min_age??0)||String(a.name).localeCompare(b.name));
  return <div className="enter">
    <PageHead title={admin?'Classes':'My Classes'} desc={admin?'Classes are fixed by gender and age bracket. Students are placed automatically from their date of birth.':'The classes you teach. Contact the office if something here looks wrong.'}/>
    <div className={`split${c?' has':''}`}>
      <div className="card">
        <Listing res={res} count={list.length} empty="No classes" emptyIcon="layers" emptyBody={admin?'Classes will appear here once they are set up.':"You haven't been assigned to any classes yet."}>
        <div className="tscroll"><table className="tbl click">
          <thead><tr><th>Class</th><th className="hide-sm">Age bracket</th><th className="hide-md">When</th><th>Students</th>{admin&&<th className="r">Active</th>}</tr></thead>
          <tbody>{list.map(x=><tr key={x.id} className={sel===x.id?'sel':''} onClick={()=>setSel(x.id)} style={!x.active?{opacity:.6}:null} tabIndex={0} onKeyDown={e=>{if(e.key==='Enter')setSel(x.id)}}>
            <td><div className="nm">{x.name}</div><div className="sub">{String(x.gender).toLowerCase()==='male'?'Boys':'Girls'}{x.min_age!=null?` ${x.min_age}–${x.max_age}`:''}{classTeachers(x).length?` · ${classTeachers(x).map(name).join(', ')}`:''}</div></td>
            <td className="hide-sm sm-t">{x.min_age!=null?`${x.min_age}–${x.max_age}`:'—'}{x.dob_from&&<div className="sub">born {H.fmt(x.dob_from)} – {H.fmt(x.dob_to)}</div>}</td>
            <td className="hide-md sm-t">{x.day_of_week?`${x.day_of_week}s`:'—'}<div className="sub">{[x.start_time&&`${H.time(x.start_time)}–${H.time(x.end_time)}`,x.room_location].filter(Boolean).join(' · ')}</div></td>
            <td><span className="serif" style={{fontSize:20}}>{classCount(x)}</span></td>
            {admin&&<td className="r"><Sw on={!!x.active} label={`${x.name} active`} onChange={v=>setActive(x,v)}/></td>}
          </tr>)}</tbody>
        </table></div>
        </Listing>
      </div>
      {c&&<Panel key={c.id} onClose={()=>setSel(null)}><ClassPanel c={c} onClose={()=>setSel(null)} onSaved={row=>res.setData(rs=>rs.map(r=>r.id===c.id?{...r,...row}:r))} reload={()=>res.refresh().catch(()=>{})}/></Panel>}
    </div>
  </div>;
}

function ClassPanel({c,onClose,onSaved,reload}){
  const {role,go,toast}=useUI();const admin=role==='admin';
  const [tab,setTab]=useState('details');
  const init={name:c.name||'',academic_year:c.academic_year||'',term:c.term||'',room_location:c.room_location||'',day_of_week:c.day_of_week||'',start_time:H.time(c.start_time),end_time:H.time(c.end_time),dob_from:c.dob_from||'',dob_to:c.dob_to||''};
  const [f,setF]=useState(init);const [err,setErr]=useState('');const [busy,setBusy]=useState(false);
  const dirty=JSON.stringify(f)!==JSON.stringify(init);const s=k=>e=>setF({...f,[k]:e.target.value});
  const att=useApiResource(()=>listAllAttendanceRows(attendanceApi.list,{class_id:c.id}),[c.id]);
  const kids=useApiResource(()=>listAll(studentsApi.list,{class_id:c.id}),[c.id]);
  const staff=useApiResource(()=>admin?listAll(teachersApi.admin.list):Promise.resolve({data:[]}),[admin]);
  const regs=Object.values(att.data.reduce((m,r)=>{(m[r.attendance_date]=m[r.attendance_date]||{date:r.attendance_date,rows:[]}).rows.push(r);return m},{})).sort((a,b)=>b.date.localeCompare(a.date));
  const ks=kids.data.filter(k=>sStatus(k)!=='Archived').sort((a,b)=>String(a.last_name).localeCompare(b.last_name));
  const tIds=(c.class_teachers||[]).map(t=>t.teacher_id);const [pick,setPick]=useState('');
  const avail=staff.data.filter(u=>u.profiles?.active&&!tIds.includes(u.id));
  const save=async()=>{setBusy(true);setErr('');try{const patch={};Object.keys(f).forEach(k=>{if(f[k]!==init[k])patch[k]=f[k]||null});const r=await classesApi.admin.update(c.id,patch);onSaved(r.data);toast('Class saved')}catch(e){setErr(e.message)}finally{setBusy(false)}};
  const teacherAct=async(fn,msg)=>{setErr('');try{await fn();toast(msg);reload()}catch(e){setErr(e.message)}};
  return <>
    <PanelHead onClose={onClose} avatar={<span className="av lg g" style={{fontSize:15}}>{String(c.gender).toLowerCase()==='male'?'B':'G'}{c.min_age??''}</span>} title={c.name} sub={[`${String(c.gender).toLowerCase()==='male'?'Boys':'Girls'}${c.min_age!=null?` ${c.min_age}–${c.max_age}`:''}`,classWhen(c)].filter(Boolean).join(' · ')}/>
    <Tabs value={tab} onChange={setTab} tabs={[['details','Details'],['registers','Registers',att.loading?null:regs.length],['students','Students',kids.loading?null:ks.length],...(admin?[['teachers','Teachers',tIds.length]]:[])]}/>
    <div className="p-b">
      <Alert style={{marginBottom:14}}>{err}</Alert>
      {tab==='details'&&(admin?<>
        <div className="g2">
          <Field label="Class name" span><input className="inp" value={f.name} onChange={s('name')}/></Field>
          <Field label="Academic year"><input className="inp" value={f.academic_year} onChange={s('academic_year')}/></Field>
          <Field label="Term"><select className="sel" value={f.term} onChange={s('term')}><option value="">—</option>{[...new Set(['Autumn','Spring','Summer',f.term].filter(Boolean))].map(t=><option key={t}>{t}</option>)}</select></Field>
          <Field label="Room"><input className="inp" value={f.room_location} onChange={s('room_location')}/></Field>
          <Field label="Day"><select className="sel" value={f.day_of_week} onChange={s('day_of_week')}><option value="">—</option>{DAYS.map(d=><option key={d}>{d}</option>)}</select></Field>
          <Field label="Starts"><input className="inp" type="time" value={f.start_time} onChange={s('start_time')}/></Field>
          <Field label="Ends"><input className="inp" type="time" value={f.end_time} onChange={s('end_time')}/></Field>
          <Field label="Born from"><input className="inp" type="date" value={f.dob_from} onChange={s('dob_from')}/></Field>
          <Field label="Born to"><input className="inp" type="date" value={f.dob_to} onChange={s('dob_to')}/></Field>
        </div>
        <div className="alert info" style={{marginTop:16}}><Ico n="info" s={16}/><span>Update the “born from” and “born to” dates once a year when classes move up, then check <b>Bracket Review</b>.</span></div>
        <div className="row" style={{marginTop:14,justifyContent:'flex-end'}}>{dirty&&<button className="btn sm ghost" onClick={()=>setF(init)}>Undo</button>}<button className="btn sm pri" disabled={!dirty||busy||!f.name.trim()} onClick={save}>{busy?'Saving…':'Save changes'}</button></div>
      </>:<dl className="kv">
        <dt>Bracket</dt><dd>{bracketText(c)}</dd><dt>Academic year</dt><dd>{[c.academic_year,c.term].filter(Boolean).join(' · ')||'—'}</dd><dt>When</dt><dd>{classWhen(c)||'—'}</dd><dt>Room</dt><dd>{c.room_location||'—'}</dd>
        <dt>Teachers</dt><dd>{classTeachers(c).map(name).join(', ')||'—'}</dd>
      </dl>)}
      {tab==='registers'&&<>
        <button className="btn pri block" style={{marginBottom:12}} onClick={()=>go('register',{classId:c.id,date:today()})}><Ico n="plus" s={16}/>New register</button>
        {att.loading?<Loading/>:<div className="card" style={{boxShadow:'none'}}>{regs.length===0&&<Empty icon="checksq" title="No registers yet"/>}{regs.map(r=>{const p=r.rows.filter(x=>x.status==='Present'||x.status==='Late').length;return <div key={r.date} className="list-row click" style={{padding:'11px 14px'}} onClick={()=>go('register',{classId:c.id,date:r.date})}>
          <div className="grow"><div style={{fontWeight:500}}>{H.fmtL(r.date)}</div><div className="sub">{p} of {r.rows.length} present</div></div><Ico n="chevr" s={15} style={{color:'var(--muted)'}}/></div>})}</div>}
      </>}
      {tab==='students'&&(kids.loading?<Loading/>:<div className="card" style={{boxShadow:'none'}}>{ks.length===0&&<Empty icon="user" title="No students"/>}{ks.map(s=><div key={s.id} className="list-row click" style={{padding:'10px 14px'}} onClick={()=>go('students',{id:s.id})}>
        <Av p={s} size="sm"/><div className="grow"><span className="nm" style={{fontSize:15.5}}>{name(s)}</span> <span className="sub">{s.student_id}</span></div><span className="sub">Age {H.age(s.date_of_birth)??'—'}</span>{s.class_students?.[0]?.override_reason&&<Badge s="Override"/>}{sStatus(s)!=='Active'&&<Badge s={sStatus(s)}/>}
      </div>)}</div>)}
      {tab==='teachers'&&<>
        <div className="col" style={{gap:8}}>{tIds.length===0&&<div className="alert warn"><Ico n="alert" s={16}/>No teacher assigned to this class.</div>}{(c.class_teachers||[]).map(t=>{const p=t.teachers?.profiles;const row=staff.data.find(u=>u.id===t.teacher_id);return <div key={t.teacher_id} className="linkrow"><Av p={p} tone="ink" size="sm"/><div className="grow"><div style={{fontWeight:500}}>{p?name(p):'Teacher'}</div><div className="sub">{row?.qualification||''}</div></div><button className="btn sm ghost" onClick={()=>teacherAct(()=>classesApi.removeTeacher(c.id,t.teacher_id),'Teacher removed')}>Remove</button></div>})}</div>
        <div className="row" style={{marginTop:10}}><select className="sel grow" value={pick} onChange={e=>setPick(e.target.value)} aria-label="Assign teacher" disabled={staff.loading}><option value="">{staff.loading?'Loading teachers…':'Assign a teacher…'}</option>{avail.map(u=><option key={u.id} value={u.id}>{name(u.profiles)}</option>)}</select><button className="btn" disabled={!pick} onClick={()=>{const id=pick;setPick('');teacherAct(()=>classesApi.assignTeacher(c.id,id),'Teacher assigned')}}>Assign</button></div>
      </>}
    </div>
  </>;
}

/* ---------- Subjects ---------- */
export function Subjects(){
  const {toast}=useUI();
  const res=useApiResource(()=>listAll(subjectsApi.admin.list),[]);
  const [sel,setSel]=useState(null);
  const cur=sel==='new'?{id:'new',name:'',description:'',active:true}:sel&&res.data.find(x=>x.id===sel);
  const setActive=async(x,v)=>{try{const r=await subjectsApi.admin.update(x.id,{active:v});res.setData(rs=>rs.map(y=>y.id===x.id?r.data:y))}catch(e){toast(e.message)}};
  return <div className="enter">
    <PageHead title="Subjects" desc="Used to tag reports and homework."><button className="btn pri" onClick={()=>setSel('new')}><Ico n="plus" s={16}/>Add subject</button></PageHead>
    <div className={`split${cur?' has':''}`}>
      <div className="card"><Listing res={res} count={res.data.length} empty="No subjects yet" emptyIcon="book" emptyBody="Add the subjects taught at the madrasa.">
        <table className="tbl click"><thead><tr><th>Subject</th><th className="hide-sm">Description</th><th className="r">Active</th></tr></thead>
        <tbody>{res.data.map(x=><tr key={x.id} className={sel===x.id?'sel':''} onClick={()=>setSel(x.id)}><td><div className="nm">{x.name}</div></td><td className="hide-sm muted sm-t">{x.description}</td><td className="r"><Sw on={!!x.active} label={`${x.name} active`} onChange={v=>setActive(x,v)}/></td></tr>)}</tbody></table>
      </Listing></div>
      {cur&&<Panel key={cur.id} onClose={()=>setSel(null)}><SubjectForm s={cur} onClose={()=>setSel(null)} onSave={async v=>{const r=cur.id==='new'?await subjectsApi.admin.create(v):await subjectsApi.admin.update(cur.id,v);res.setData(rs=>cur.id==='new'?[...rs,r.data]:rs.map(y=>y.id===cur.id?r.data:y));toast(cur.id==='new'?'Subject added':'Subject saved');setSel(null)}}/></Panel>}
    </div>
  </div>;
}
function SubjectForm({s,onClose,onSave}){
  const [f,setF]=useState({name:s.name||'',description:s.description||'',active:s.active!==false});const [t,setT]=useState(false);const [err,setErr]=useState('');const [busy,setBusy]=useState(false);
  const submit=async()=>{setT(true);if(!f.name.trim())return;setBusy(true);setErr('');try{await onSave({...f,name:f.name.trim()})}catch(e){setErr(e.message)}finally{setBusy(false)}};
  return <>
    <PanelHead onClose={onClose} avatar={<span className="av lg g"><Ico n="book" s={22}/></span>} title={s.id==='new'?'New subject':s.name}/>
    <div className="p-b" style={{borderTop:'1px solid var(--line2)'}}><div className="col" style={{gap:16}}>
      <Alert>{err}</Alert>
      <Field label="Subject name" req error={t&&!f.name.trim()?'Enter a name':''}><input className={`inp${t&&!f.name.trim()?' bad':''}`} value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></Field>
      <Field label="Description" opt><textarea className="ta" value={f.description} onChange={e=>setF({...f,description:e.target.value})}/></Field>
      <div className="row"><span className="grow"><b style={{fontWeight:500}}>Active</b><div className="hint">Inactive subjects can&apos;t be picked for new reports or homework.</div></span><Sw on={f.active} onChange={v=>setF({...f,active:v})}/></div>
    </div>
    <div className="row" style={{marginTop:20,justifyContent:'flex-end'}}><button className="btn" onClick={onClose}>Cancel</button><button className="btn pri" disabled={busy} onClick={submit}>{busy?'Saving…':'Save subject'}</button></div></div>
  </>;
}

/* ---------- Bracket review ---------- */
export function Bracket(){
  const {go}=useUI();
  const res=useApiResource(()=>studentsApi.bracketReview(),[]);const classes=useClasses();
  const cls=r=>({name:r.class_name,gender:r.class_gender,min_age:r.min_age,max_age:r.max_age});
  return <div className="enter">
    <PageHead title="Bracket Review" desc="Students whose age or gender no longer matches their class. Run this at the start of each term."/>
    <div className="alert info" style={{marginBottom:16}}><Ico n="info" s={17}/><span>This page only flags students. To move someone, open their record and use the <b>Class</b> section.</span></div>
    <div className="card"><Listing res={res} count={res.data.length} empty="No students out of bracket" emptyIcon="scale" emptyBody="Every student is in the class that matches their age and gender.">
      <div className="tscroll"><table className="tbl click"><thead><tr><th>Student</th><th>Current age</th><th>Assigned class</th><th className="hide-sm">Bracket for their age</th><th></th></tr></thead>
      <tbody>{res.data.map(s=>{const r=s.date_of_birth?classFor(classes.data,s.student_gender||s.gender,s.date_of_birth):null;return <tr key={s.class_student_id||s.student_id} onClick={()=>go('student-edit',{id:s.student_id})}>
        <td><div className="who"><Av p={{first_name:s.first_name,last_name:s.last_name,gender:s.student_gender}}/><div><div className="nm">{s.first_name} {s.last_name}</div><div className="sub">{s.override_reason?`Override: ${s.override_reason}`:'No override recorded'}</div></div></div></td>
        <td><span className="serif" style={{fontSize:20}}>{s.current_age??'—'}</span></td>
        <td><ClassPill c={cls(s)}/><div className="sub" style={{marginTop:4}}>{s.min_age!=null?`${s.min_age}–${s.max_age}`:''}</div></td>
        <td className="hide-sm">{r?<ClassPill c={r}/>:<span className="sub">{s.date_of_birth?'No matching class':'—'}</span>}</td>
        <td className="r"><button className="btn sm">Open record<Ico n="chevr" s={14}/></button></td>
      </tr>})}</tbody></table></div>
    </Listing></div>
  </div>;
}
