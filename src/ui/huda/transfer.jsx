'use client';
// Huda — Transfer students between classes (source bar → target bar → confirm).
import React,{useState}from'react';
import{classesApi,studentsApi}from'../../lib/api/resources';
import{useApiResource}from'../useApiResource';
import{listAll,sStatus,useClasses}from'./data';
import{Alert,Av,Empty,H,Ico,Loading,PageHead,clsName,name,secName,useUI}from'./ui';

export function Transfer(){
  const {params,go,toast}=useUI();
  const classes=useClasses();
  const [from,setFrom]=useState(params?.classId||'');
  const [to,setTo]=useState('');
  const [picked,setPicked]=useState(()=>new Set(params?.ids||[]));
  const [busy,setBusy]=useState(false);const [err,setErr]=useState('');
  const kids=useApiResource(()=>from?listAll(studentsApi.list,{class_id:from}):Promise.resolve({data:[]}),[from]);
  const fromClass=classes.data.find(c=>c.id===from);
  const toClass=classes.data.find(c=>c.id===to);
  const list=kids.data.filter(s=>sStatus(s)!=='Archived').sort((a,b)=>String(a.last_name).localeCompare(b.last_name));
  const toggle=id=>setPicked(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n});
  const allPicked=list.length>0&&list.every(s=>picked.has(s.id));
  const toggleAll=()=>setPicked(allPicked?new Set():new Set(list.map(s=>s.id)));
  const confirm=async()=>{
    setBusy(true);setErr('');
    try{
      const r=await classesApi.transfer({from_class_id:from,to_class_id:to,student_ids:[...picked]});
      const m=r.data?.moved??0;
      toast(`${m} ${m===1?'student':'students'} moved to ${secName(toClass)}`);
      go('classes',{id:to});
    }catch(e){setErr(e.message)}finally{setBusy(false)}
  };
  return <div className="enter" style={{maxWidth:1080}}>
    <PageHead back={{label:'Back to classes',onClick:()=>go('classes',from?{id:from}:undefined)}} title="Transfer students" desc="Pick students on the left, choose the class to move them to on the right, then confirm."/>
    <Alert style={{marginBottom:16}}>{err}</Alert>
    <div className="xfer">
      {/* Current class */}
      <section className="xfer-card">
        <header className="xfer-h"><Ico n="people" s={22}/>Current Class</header>
        <div className="xfer-pick">
          <select className="sel" value={from} onChange={e=>{setFrom(e.target.value);setPicked(new Set())}} aria-label="Current class">
            <option value="">Select Class</option>
            {classes.data.map(c=><option key={c.id} value={c.id}>{clsName(c)}</option>)}
          </select>
        </div>
        {from&&!kids.loading&&list.length>0&&<div className="xfer-tools">
          <label className="check" style={{margin:0}}><input type="checkbox" checked={allPicked} onChange={toggleAll}/><span className="sm-t">Select all</span></label>
          <span className="count" style={{marginLeft:'auto'}}>{picked.size} selected</span>
        </div>}
        <div className="xfer-list">
          {!from?<div className="xfer-empty">Choose a class to see its students.</div>
           :kids.loading?<Loading/>
           :list.length===0?<div className="xfer-empty">No students in this class.</div>
           :list.map(s=><label key={s.id} className={`xfer-item${picked.has(s.id)?' pick':''}`}>
             <input type="checkbox" checked={picked.has(s.id)} onChange={()=>toggle(s.id)}/>
             <Av p={s} size="sm"/><div className="grow" style={{minWidth:0}}><div className="nm">{name(s)}</div><div className="sub">{s.student_id} · Age {H.age(s.date_of_birth)??'—'}</div></div>
           </label>)}
        </div>
      </section>
      {/* Arrow */}
      <div className="xfer-mid"><span className="xfer-arrow"><Ico n="arrowr" s={34} w={2.4}/></span></div>
      {/* New class */}
      <section className="xfer-card">
        <header className="xfer-h"><Ico n="people" s={22}/>New Class</header>
        <div className="xfer-pick">
          <select className="sel" value={to} onChange={e=>setTo(e.target.value)} aria-label="New class">
            <option value="">Select New Class</option>
            {classes.data.filter(c=>c.id!==from).map(c=><option key={c.id} value={c.id}>{clsName(c)}</option>)}
          </select>
        </div>
        <div className="xfer-list">
          {!toClass?<div className="xfer-empty">Choose the class to move students into.</div>
           :picked.size===0?<div className="xfer-empty">Selected students will appear here.</div>
           :list.filter(s=>picked.has(s.id)).map(s=><div key={s.id} className="xfer-item" style={{cursor:'default'}}>
             <span style={{width:16,height:16,borderRadius:'50%',background:'var(--good)',display:'grid',placeItems:'center',flexShrink:0}}><Ico n="check" s={11} w={2.4} style={{color:'#fff'}}/></span>
             <Av p={s} size="sm"/><div className="grow" style={{minWidth:0}}><div className="nm">{name(s)}</div><div className="sub">{s.student_id}</div></div>
           </div>)}
        </div>
      </section>
    </div>
    <div className="footbar">
      <span className="dirty grow">{picked.size>0&&toClass?`Move ${picked.size} ${picked.size===1?'student':'students'} to ${secName(toClass)}`:'Pick students and a new class'}</span>
      <button className="btn" onClick={()=>go('classes',from?{id:from}:undefined)}>Cancel</button>
      <button className="btn pri" disabled={busy||!from||!to||picked.size===0} onClick={confirm}><Ico n="arrowr" s={15}/>{busy?'Moving…':'Confirm transfer'}</button>
    </div>
  </div>;
}
