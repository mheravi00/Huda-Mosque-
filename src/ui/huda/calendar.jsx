'use client';
// Huda — editable madrasa calendar: month grid with add/edit/delete events.
import React,{useState}from'react';
import{calendarApi}from'../../lib/api/resources';
import{useApiResource}from'../useApiResource';
import{listAll}from'./data';
import{Alert,Badge,Field,Ico,Loading,Modal,PageHead,Seg,useUI}from'./ui';

const MONL=['January','February','March','April','May','June','July','August','September','October','November','December'];
const WD=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const TYPES=[['class','Class','event-class'],['event','Event','event-event'],['deadline','Deadline','event-deadline'],['holiday','Holiday','event-holiday']];
const typeClass=t=>(TYPES.find(x=>x[0]===t)||TYPES[1])[2];
const pad=n=>String(n).padStart(2,'0');
const localDate=iso=>{const d=new Date(iso);return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`};
const timeOf=iso=>{const d=new Date(iso);return `${pad(d.getHours())}:${pad(d.getMinutes())}`};

export function Calendar(){
  const {role}=useUI();const admin=role==='admin';
  const res=useApiResource(()=>listAll(calendarApi.list),[]);
  const now=new Date();
  const [ym,setYm]=useState({y:now.getFullYear(),m:now.getMonth()});
  const [sel,setSel]=useState(null);const [create,setCreate]=useState(null);
  const first=new Date(ym.y,ym.m,1);
  const startOffset=(first.getDay()+6)%7; // Monday-first
  const daysIn=new Date(ym.y,ym.m+1,0).getDate();
  const cells=[];for(let i=0;i<startOffset;i++)cells.push(null);for(let d=1;d<=daysIn;d++)cells.push(d);while(cells.length%7)cells.push(null);
  const byDate={};res.data.forEach(e=>{const k=localDate(e.start_time);(byDate[k]=byDate[k]||[]).push(e)});
  const key=d=>`${ym.y}-${pad(ym.m+1)}-${pad(d)}`;
  const todayKey=localDate(now.toISOString());
  const shift=n=>setYm(({y,m})=>{const d=new Date(y,m+n,1);return{y:d.getFullYear(),m:d.getMonth()}});
  const onSaved=()=>res.refresh().catch(()=>{});
  return <div className="enter">
    <PageHead title="Calendar" desc="Class sessions, deadlines, holidays and events across the madrasa.">
      {admin&&<button className="btn pri" onClick={()=>setCreate({start:key(now.getDate()>daysIn?1:now.getDate())})}><Ico n="plus" s={16}/>Add event</button>}
    </PageHead>
    <div className="card">
      <div className="toolbar" style={{justifyContent:'space-between'}}>
        <div className="row" style={{gap:8}}><button className="btn icon sm" onClick={()=>shift(-1)} aria-label="Previous month"><Ico n="chevl" s={16}/></button><button className="btn icon sm" onClick={()=>shift(1)} aria-label="Next month"><Ico n="chevr" s={16}/></button><button className="btn sm ghost" onClick={()=>setYm({y:now.getFullYear(),m:now.getMonth()})}>Today</button></div>
        <strong className="serif" style={{fontSize:20,fontWeight:600}}>{MONL[ym.m]} {ym.y}</strong>
        <div className="row" style={{gap:10,flexWrap:'wrap'}}>{TYPES.map(([t,l,cls])=><span key={t} className="row sub" style={{gap:5}}><span className={`cal-dot ${cls}`}></span>{l}</span>)}</div>
      </div>
      {res.loading?<Loading/>:<div className="cal-grid">
        {WD.map(d=><div key={d} className="cal-wd">{d}</div>)}
        {cells.map((d,i)=>{const k=d&&key(d);const evs=d?(byDate[k]||[]):[];return <div key={i} className={`cal-cell${d?'':' empty'}${k===todayKey?' today':''}`} onClick={()=>{if(admin&&d)setCreate({start:k})}}>
          {d&&<><span className="cal-num">{d}</span>{evs.slice(0,3).map(e=><button key={e.id} className={`cal-ev ${typeClass(e.event_type)}`} onClick={ev=>{ev.stopPropagation();setSel(e)}} title={e.title}>{e.title}</button>)}{evs.length>3&&<span className="cal-more">+{evs.length-3} more</span>}</>}
        </div>})}
      </div>}
    </div>
    {sel&&<EventModal e={sel} admin={admin} onClose={()=>setSel(null)} onSaved={onSaved}/>}
    {create&&<EventModal create admin={admin} initialDate={create.start} onClose={()=>setCreate(null)} onSaved={onSaved}/>}
  </div>;
}

function EventModal({e,create,admin,initialDate,onClose,onSaved}){
  const {toast,confirm}=useUI();
  const [edit,setEdit]=useState(!!create);
  const [f,setF]=useState(()=>({title:e?.title||'',event_type:e?.event_type||'event',date:e?localDate(e.start_time):(initialDate||''),start:e?.start_time?timeOf(e.start_time):'',end:e?.end_time?timeOf(e.end_time):'',location:e?.location||'',description:e?.description||''}));
  const [t,setT]=useState(false);const [busy,setBusy]=useState(false);const [err,setErr]=useState('');
  const toIso=(date,time)=>date?new Date(`${date}T${time||'00:00'}`).toISOString():null;
  const save=async()=>{setT(true);if(!f.title.trim()||!f.date)return;setBusy(true);setErr('');
    try{const body={title:f.title.trim(),event_type:f.event_type,start_time:toIso(f.date,f.start),end_time:f.end?toIso(f.date,f.end):null,location:f.location.trim()||null,description:f.description.trim()||null};
      if(create)await calendarApi.admin.create(body);else await calendarApi.admin.update(e.id,body);
      toast(create?'Event added':'Event saved');onSaved();onClose();
    }catch(x){setErr(x.message)}finally{setBusy(false)}};
  const del=async()=>{if(!(await confirm({title:'Delete this event?',body:`“${e.title}” will be removed from the calendar.`,label:'Delete event',danger:true})))return;try{await calendarApi.admin.remove(e.id);toast('Event deleted');onSaved();onClose()}catch(x){setErr(x.message)}};
  if(!edit&&e)return <Modal title={e.title} onClose={onClose} foot={admin?<><button className="btn danger" onClick={del}>Delete</button><button className="btn pri" onClick={()=>setEdit(true)}><Ico n="pencil" s={15}/>Edit</button></>:<button className="btn" onClick={onClose}>Close</button>}>
    <div className="col" style={{gap:12}}>
      <Badge>{(TYPES.find(x=>x[0]===e.event_type)||TYPES[1])[1]}</Badge>
      <div className="row" style={{gap:8}}><Ico n="cal" s={16} style={{color:'var(--muted)'}}/><span>{new Date(e.start_time).toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}{e.start_time&&timeOf(e.start_time)!=='00:00'?` · ${timeOf(e.start_time)}${e.end_time?`–${timeOf(e.end_time)}`:''}`:''}</span></div>
      {e.location&&<div className="row" style={{gap:8}}><Ico n="home" s={16} style={{color:'var(--muted)'}}/><span>{e.location}</span></div>}
      {e.description&&<p style={{margin:0,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{e.description}</p>}
    </div>
  </Modal>;
  return <Modal title={create?'Add event':'Edit event'} onClose={onClose} foot={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn pri" disabled={busy} onClick={save}>{busy?'Saving…':'Save event'}</button></>}>
    <Alert style={{marginBottom:14}}>{err}</Alert>
    <div className="col" style={{gap:16}}>
      <Field label="Title" req error={t&&!f.title.trim()?'Enter a title':''}><input className={`inp${t&&!f.title.trim()?' bad':''}`} value={f.title} onChange={ev=>setF({...f,title:ev.target.value})}/></Field>
      <Field label="Type"><Seg value={f.event_type} options={TYPES.map(([v,l])=>[v,l])} onChange={v=>setF({...f,event_type:v})}/></Field>
      <div className="g2"><Field label="Date" req error={t&&!f.date?'Pick a date':''}><input className={`inp${t&&!f.date?' bad':''}`} type="date" value={f.date} onChange={ev=>setF({...f,date:ev.target.value})}/></Field><div className="g2" style={{gap:10}}><Field label="Start"><input className="inp" type="time" value={f.start} onChange={ev=>setF({...f,start:ev.target.value})}/></Field><Field label="End"><input className="inp" type="time" value={f.end} onChange={ev=>setF({...f,end:ev.target.value})}/></Field></div></div>
      <Field label="Location" opt><input className="inp" value={f.location} onChange={ev=>setF({...f,location:ev.target.value})}/></Field>
      <Field label="Description" opt><textarea className="ta" value={f.description} onChange={ev=>setF({...f,description:ev.target.value})}/></Field>
    </div>
  </Modal>;
}
