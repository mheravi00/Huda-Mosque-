'use client';
// Huda — Attendance: registers list, register screen, absence tracker, send message
import React,{useEffect,useMemo,useState}from'react';
import{attendanceApi,messageTemplatesApi,studentsApi}from'../../lib/api/resources';
import{listAllAttendanceRows,saveRegister}from'../attendance-register';
import{useApiResource}from'../useApiResource';
import{listAll,sStatus,useClasses}from'./data';
import{Alert,Av,Badge,DAYS,Empty,Field,H,Ico,Listing,Loading,Modal,PageHead,classTeachers,clsName,name,toD,today,useUI}from'./ui';

const FLAG_WEEKS=3;
export function Attendance(){
  const {role,go,params,confirm,toast}=useUI();const admin=role==='admin';
  const classes=useClasses();const active=classes.data.filter(c=>c.active);
  const [cid,setCid]=useState(params?.classId||'');
  const [date,setDate]=useState(today());const [sent,setSent]=useState(null);const [msg,setMsg]=useState(null);const [err,setErr]=useState('');const [busy,setBusy]=useState(false);
  useEffect(()=>{if(!cid&&active[0])setCid(active[0].id)},[active.length]);
  useEffect(()=>{setSent(null);setErr('')},[cid,date]);
  const c=classes.data.find(x=>x.id===cid);
  const rows=useApiResource(()=>cid?listAllAttendanceRows(attendanceApi.list,{class_id:cid}):Promise.resolve({data:[]}),[cid]);
  const streaks=useApiResource(()=>cid?attendanceApi.absenceSummary({class_id:cid,min_streak:2}):Promise.resolve({data:[]}),[cid]);
  if(classes.loading)return <Loading/>;
  if(!c)return <Empty icon="layers" title="No classes" body={admin?'No active classes have been set up yet.':"You aren't assigned to any classes yet."}/>;
  const regs=Object.values(rows.data.reduce((m,r)=>{(m[r.attendance_date]=m[r.attendance_date]||{date:r.attendance_date,rows:[]}).rows.push(r);return m},{})).sort((a,b)=>b.date.localeCompare(a.date));
  const exists=regs.some(r=>r.date===date);
  const teachers=classTeachers(c).map(name).join(' and ')||'the class teachers';
  const dayName=date?DAYS[toD(date).getDay()]:'';
  const request=async()=>{setBusy(true);setErr('');try{const r=await attendanceApi.requestRegister(cid,date);const n=r.data?.notified??0;setSent(`Request sent. ${n} ${n===1?'teacher has':'teachers have'} been notified to fill in the register for ${H.fmtL(date)}.`)}catch(e){setErr(e.message)}finally{setBusy(false)}};
  const del=async r=>{if(!(await confirm({title:'Delete this register?',body:`The register for ${H.fmtL(r.date)} will be removed, along with every mark in it. This can't be undone.`,label:'Delete register',danger:true})))return;try{await attendanceApi.deleteRegister(cid,r.date);rows.setData(rs=>rs.filter(x=>x.attendance_date!==r.date));toast('Register deleted')}catch(e){setErr(e.message)}};
  return <div className="enter">
    <PageHead title="Attendance" desc="Choose a class and a date to take or review a register."/>
    <div className="card" style={{marginBottom:20}}>
      <div className="card-b" style={{display:'flex',flexWrap:'wrap',gap:16,alignItems:'flex-end'}}>
        <Field label="Class"><select className="sel" style={{minWidth:240}} value={cid} onChange={e=>setCid(e.target.value)}>{active.map(x=><option key={x.id} value={x.id}>{clsName(x)}</option>)}</select></Field>
        <Field label="Date"><input className="inp" type="date" value={date} max={today()} onChange={e=>setDate(e.target.value)} style={{minWidth:170}}/></Field>
        <div className="row wrap" style={{marginLeft:'auto'}}>
          {admin&&<button className="btn" onClick={request} disabled={!date||busy}><Ico n="send" s={15}/>{busy?'Sending…':'Request from teacher'}</button>}
          <button className="btn pri" disabled={!date} onClick={()=>go('register',{classId:cid,date})}>{exists?<><Ico n="eye" s={16}/>Open register</>:<><Ico n="plus" s={16}/>New register</>}</button>
        </div>
      </div>
      <div style={{padding:'0 20px 16px'}} className="sub">{[c.day_of_week&&`${c.day_of_week}s ${H.time(c.start_time)}–${H.time(c.end_time)}`,c.room_location,classTeachers(c).map(name).join(', ')].filter(Boolean).join(' · ')}{c.day_of_week&&dayName&&dayName!==c.day_of_week&&<span style={{color:'var(--warn-ink)'}}> · {c.name} doesn&apos;t usually meet on a {dayName}</span>}</div>
      {(sent||err)&&<div style={{padding:'0 20px 18px'}}>{sent&&<div className="alert good"><Ico n="check" s={17}/>{sent}</div>}<Alert>{err}</Alert></div>}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,400px),1fr))',gap:20,alignItems:'start'}}>
      <div className="card">
        <div className="card-h"><div><h3>Past registers</h3><p>{rows.loading?'Loading…':`${regs.length} taken`}</p></div></div>
        <Listing res={rows} count={regs.length} empty="No registers yet" emptyIcon="checksq" emptyBody="Registers for this class will appear here once they're saved.">
          {regs.map(r=>{const t={P:r.rows.filter(x=>x.status==='Present'||x.status==='Late').length,A:r.rows.filter(x=>x.status==='Absent').length,E:r.rows.filter(x=>x.status==='Excused').length};return <div key={r.date} className="list-row click" onClick={()=>go('register',{classId:cid,date:r.date})}>
            <div className="datebox"><span>{H.fmtDay(r.date).slice(0,3)}</span><b>{toD(r.date).getDate()}</b></div>
            <div className="grow"><div style={{fontWeight:500}}>{H.fmtL(r.date)}</div><div className="row wrap sub" style={{gap:12,marginTop:3}}><span><span className="dot" style={{background:'var(--good)',marginRight:5}}></span>{t.P} present</span><span><span className="dot" style={{background:'var(--bad)',marginRight:5}}></span>{t.A} absent</span>{t.E>0&&<span><span className="dot" style={{background:'var(--gold)',marginRight:5}}></span>{t.E} excused</span>}</div></div>
            {admin&&<button className="btn icon sm ghost" onClick={e=>{e.stopPropagation();del(r)}} aria-label={`Delete register for ${H.fmtL(r.date)}`}><Ico n="trash" s={15}/></button>}
            <Ico n="chevr" s={16} style={{color:'var(--muted)'}}/>
          </div>})}
        </Listing>
      </div>
      <div className="card">
        <div className="card-h"><div><h3>Absence tracker</h3><p>Students absent two or more weeks in a row</p></div></div>
        {streaks.loading?<Loading/>:streaks.error?<Alert>{streaks.error}</Alert>:streaks.data.length===0?<Empty icon="checksq" title="No absence streaks" body={`Everyone in ${c.name} has attended recently.`}/>:
        <div className="tscroll"><table className="tbl"><thead><tr><th>Student</th><th>Streak</th><th className="hide-sm">Last recorded</th><th></th></tr></thead>
        <tbody>{streaks.data.map(x=><tr key={x.student_id}>
          <td><div className="who"><Av p={x} size="sm"/><span className="nm" style={{fontSize:15.5}}>{x.first_name} {x.last_name}</span></div></td>
          <td><Badge tone={x.current_absent_streak>=FLAG_WEEKS?'bad':'warn'} plain>{x.current_absent_streak} weeks</Badge></td>
          <td className="hide-sm sm-t muted">{H.fmt(x.last_attendance_date)}</td>
          <td className="r"><button className="btn sm" onClick={()=>setMsg(x)}><Ico n="mail" s={14}/>Send message</button></td>
        </tr>)}</tbody></table></div>}
      </div>
    </div>
    {msg&&<SendMessage x={msg} c={c} onClose={()=>setMsg(null)}/>}
  </div>;
}

export const fill=(t,student,c,w)=>String(t||'').replaceAll('{{student_name}}',`${student.first_name} ${student.last_name}`).replaceAll('{{class_name}}',c?clsName(c):'their class').replaceAll('{{weeks_absent}}',String(w));
const chan=v=>({email:'Email',sms:'SMS',both:'Email + SMS'}[String(v).toLowerCase()]||v);
function SendMessage({x,c,onClose}){
  const {toast}=useUI();
  const tpl=useApiResource(()=>messageTemplatesApi.list({active:true}),[]);
  const gl=useApiResource(()=>studentsApi.guardians(x.student_id),[x.student_id]);
  const weeks=x.current_absent_streak;
  const ts=[...tpl.data].filter(t=>t.active!==false).sort((a,b)=>a.trigger_weeks-b.trigger_weeks);
  const auto=[...ts].reverse().find(t=>t.trigger_weeks<=weeks)||ts[0];
  const [tid,setTid]=useState(null);const cur=tid||auto?.id;const t=ts.find(v=>v.id===cur);
  const [busy,setBusy]=useState(false);const [err,setErr]=useState('');
  const gs=gl.data.map(g=>g.guardians).filter(Boolean);
  const send=async()=>{setBusy(true);setErr('');try{const r=await attendanceApi.notify({student_id:x.student_id,template_id:cur,class_id:c.id});const n=r.data?.sent??0;toast(`Sent to ${n} ${n===1?'guardian':'guardians'}`);onClose()}catch(e){setErr(e.message)}finally{setBusy(false)}};
  return <Modal size="lg" title={`Message ${x.first_name}'s family`} desc={`${x.first_name} ${x.last_name} has missed ${weeks} weeks of ${c.name} in a row.`} onClose={onClose}
    foot={<><span className="sub grow" style={{alignSelf:'center'}}>{gs.length?`To ${gs.map(name).join(' and ')}`:gl.loading?'':'No guardian linked'}{t?` · ${chan(t.channel)}`:''}</span><button className="btn" onClick={onClose}>Cancel</button><button className="btn pri" disabled={!t||busy} onClick={send}><Ico n="send" s={15}/>{busy?'Sending…':'Send'}</button></>}>
    <Alert style={{marginBottom:14}}>{err}</Alert>
    {tpl.loading?<Loading/>:ts.length===0?<Empty icon="mail" title="No active templates" body="Add a message template first (Message Templates in the sidebar)."/>:
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,240px),1fr))',gap:18}}>
      <div><div className="lab" style={{marginBottom:10}}>Template</div><div className="col" style={{gap:8}}>
        {ts.map(v=><label key={v.id} className="qtile" style={{cursor:'pointer',borderColor:cur===v.id?'var(--ink2)':undefined,background:cur===v.id?'#eef2ea':undefined}}>
          <input type="radio" name="tpl" checked={cur===v.id} onChange={()=>setTid(v.id)}/>
          <span className="grow"><b style={{fontWeight:500,display:'block'}}>{v.name}</b><span className="sub">After {v.trigger_weeks} weeks · {chan(v.channel)}</span></span>
          {auto&&v.id===auto.id&&<span className="badge gold plain">Suggested</span>}
        </label>)}
      </div></div>
      <div><div className="lab" style={{marginBottom:10}}>Preview</div>
        {t&&<div className="flat" style={{background:'#fff',padding:'16px 18px'}}>
          {t.subject&&<><div className="sub">Subject</div><div style={{fontWeight:500,marginBottom:12}}>{fill(t.subject,x,c,weeks)}</div></>}
          <div style={{whiteSpace:'pre-wrap',fontSize:13.5,lineHeight:1.6}}>{fill(t.body,x,c,weeks)}</div>
        </div>}
      </div>
    </div>}
  </Modal>;
}

export function Register(){
  const {params,go,confirm,toast,setGuard}=useUI();
  const classId=params?.classId;const date=params?.date||today();
  const classes=useClasses();const c=classes.data.find(x=>x.id===classId);
  const data=useApiResource(async()=>{
    const[k,a]=await Promise.all([listAll(studentsApi.list,{class_id:classId}),listAllAttendanceRows(attendanceApi.list,{class_id:classId,attendance_date:date})]);
    return{data:[{kids:k.data,marks:a.data}]};
  },[classId,date]);
  const loaded=data.data[0];
  const kids=useMemo(()=>loaded?loaded.kids.filter(s=>sStatus(s)==='Active'&&(!s.enrolment_date||s.enrolment_date<=date)||loaded.marks.some(m=>m.student_id===s.id)).sort((a,b)=>String(a.first_name).localeCompare(b.first_name)):[],[loaded,date]);
  const init=useMemo(()=>loaded?Object.fromEntries(loaded.marks.map(m=>[m.student_id,m.status])):{},[loaded]);
  const existing=!!loaded&&loaded.marks.length>0;
  const [m,setM]=useState({});useEffect(()=>setM(init),[init]);
  const [saving,setSaving]=useState(false);const [err,setErr]=useState('');
  const dirty=JSON.stringify(m)!==JSON.stringify(init);
  useEffect(()=>{setGuard(dirty?'You have unmarked or unsaved changes to this register.':null);return()=>setGuard(null)},[dirty]);
  if(!classId)return <Empty icon="checksq" title="Register not found" action={<button className="btn" onClick={()=>go('attendance')}>Back to attendance</button>}/>;
  if(classes.loading||data.loading)return <Loading/>;
  if(!c||data.error)return <Empty icon="checksq" title="Register not found" body={data.error||'This class may not be one of yours.'} action={<button className="btn" onClick={()=>go('attendance')}>Back to attendance</button>}/>;
  const t={P:0,A:0,E:0,N:0};kids.forEach(s=>{const v=m[s.id];if(!v)t.N++;else if(v==='Absent')t.A++;else if(v==='Excused')t.E++;else t.P++});
  const back=async()=>{if(dirty&&!(await confirm({title:'Leave without saving?',body:"Your marks for this register haven't been saved yet.",label:'Leave without saving',danger:true})))return;setGuard(null);go('attendance',{classId})};
  const save=async()=>{setSaving(true);setErr('');try{await saveRegister(attendanceApi,{classId,date,students:kids,statuses:m});setGuard(null);toast('Register saved');go('attendance',{classId})}catch(e){setErr(e.message)}finally{setSaving(false)}};
  const opts=[['Present','Present','p'],['Absent','Absent','a'],['Excused','Absent with excuse','e']];
  return <div className="enter" style={{maxWidth:880}}>
    <PageHead back={{label:'Back to registers',onClick:back}} eyebrow={existing?'Editing saved register':'New register'} title={`${c.name} · ${H.fmtDay(date)}`} desc={[H.fmtL(date),c.start_time&&`${H.time(c.start_time)}–${H.time(c.end_time)}`,c.room_location].filter(Boolean).join(' · ')}/>
    <Alert style={{marginBottom:14}}>{err}</Alert>
    <div className="row wrap" style={{marginBottom:14,gap:8}}>
      <Badge s="Present">{t.P} present</Badge><Badge s="Absent">{t.A} absent</Badge><Badge s="Excused">{t.E} excused</Badge><Badge tone={t.N?'warn':'mute'}>{t.N} not yet marked</Badge>
      <button className="btn sm" style={{marginLeft:'auto'}} disabled={!t.N} onClick={()=>setM(p=>{const n={...p};kids.forEach(s=>{if(!n[s.id])n[s.id]='Present'});return n})}><Ico n="check" s={14}/>Mark the rest present</button>
    </div>
    <div className="card">
      {kids.length===0?<Empty icon="user" title="No students in this class" body="Students are placed in a class automatically from their gender and age when added, or from the Class section of a student record."/>:kids.map(s=>{const v=m[s.id];return <div key={s.id} className={`reg-row${v?'':' unmarked'}`}>
        <Av p={s}/><div className="grow" style={{minWidth:140}}><div className="nm">{name(s)}</div><div className="sub">{v==='Late'?'Recorded as late':v?'':'Not yet marked'}</div></div>
        <div className="seg att" role="radiogroup" aria-label={`Attendance for ${s.first_name}`}>{opts.map(([val,l,k])=><button key={val} type="button" className={(v===val||(val==='Present'&&v==='Late'))?`on ${k}`:''} onClick={()=>setM({...m,[s.id]:val})} aria-checked={v===val} role="radio"><span className={val==='Excused'?'hide-sm':''}>{l}</span>{val==='Excused'&&<span className="show-sm">Excused</span>}</button>)}</div>
      </div>})}
    </div>
    <div className="footbar">
      <span className="dirty grow">{t.N?<><i style={{background:'var(--warn)'}}></i>{t.N} {t.N===1?'student':'students'} still to mark</>:<><i style={{background:'var(--good)'}}></i>Everyone is marked</>}</span>
      <button className="btn" onClick={back}>Cancel</button>
      <button className="btn pri" disabled={saving||t.N>0||kids.length===0||(!dirty&&existing)} onClick={save}><Ico n="check" s={16}/>{saving?'Saving…':'Save register'}</button>
    </div>
  </div>;
}
