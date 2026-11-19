'use client';
// Huda — class "Topics & Learning" tab: what a class is studying this/next term.
import React,{useState}from'react';
import{curriculumApi}from'../../lib/api/resources';
import{useApiResource}from'../useApiResource';
import{Alert,Badge,Empty,Field,H,Ico,Loading,Menu,Modal,Seg,Sw,clsName,secName,useUI}from'./ui';

const TERMS=['Autumn (Semester 1)','Spring (Semester 2)','Summer (Semester 3)'];
const bullets=t=>String(t||'').split(/\r?\n/).map(x=>x.replace(/^[-*•]\s*/,'').trim()).filter(Boolean);

export function SyllabusTab({c}){
  const {role,toast,confirm}=useUI();
  const res=useApiResource(()=>curriculumApi.list(c.id),[c.id]);
  const [form,setForm]=useState(null);
  const canEdit=role==='admin'||role==='teacher';
  const items=res.data;
  const current=items.find(x=>x.currently_studying)||items[0];
  const del=async x=>{if(!(await confirm({title:'Delete this topic?',body:'This topic entry will be removed from the class.',label:'Delete topic',danger:true})))return;try{await curriculumApi.remove(x.id);res.setData(rs=>rs.filter(y=>y.id!==x.id));toast('Topic deleted')}catch(e){toast(e.message)}};
  return <>
    <div className="p-sec" style={{marginTop:0}}>
      <div className="row" style={{gap:12,marginBottom:14}}>
        <span style={{width:40,height:40,borderRadius:12,background:'var(--good-bg)',color:'var(--good)',display:'grid',placeItems:'center',flexShrink:0}}><Ico n="book" s={20}/></span>
        <div><div className="serif" style={{fontSize:19,fontWeight:600}}>Class Topic &amp; Current Learning</div><div className="sub">What this class is studying or reading this term.</div></div>
      </div>

      {res.loading?<Loading/>:!current?<Empty icon="book" title="No topic set yet" body={canEdit?'Add what this class is studying this term.':'Nothing has been set for this class yet.'}/>:<>
        <div className="flat" style={{padding:'16px 18px',marginBottom:14}}>
          <div className="g3" style={{gap:12}}>
            <div><div className="lab" style={{marginBottom:4}}>Class</div><div style={{fontWeight:500}}>{secName(c)}</div></div>
            <div><div className="lab" style={{marginBottom:4}}>Academic year</div><div style={{fontWeight:500}}>{current.academic_year||c.academic_year||'—'}</div></div>
            <div><div className="lab" style={{marginBottom:4}}>Term</div><div style={{fontWeight:500}}>{current.term||'—'}</div></div>
          </div>
        </div>
        <CurrentCard x={current}/>
      </>}

      {canEdit&&<button className="btn pri block" style={{marginTop:14}} onClick={()=>setForm(current||{})}><Ico n="plus" s={16}/>{current?'Add / Edit Topic':'Add topic'}</button>}
    </div>

    {items.length>1&&<div className="p-sec"><span className="lab">Other terms</span>
      <div className="col" style={{gap:8}}>{items.filter(x=>x.id!==current?.id).map(x=><div key={x.id} className="linkrow">
        <div className="grow"><div style={{fontWeight:500}}>{x.topic}</div><div className="sub">{[x.term,x.academic_year].filter(Boolean).join(' · ')||'—'}</div></div>
        {x.currently_studying&&<Badge tone="good" plain>Current</Badge>}
        {canEdit&&<Menu button={tg=><button className="btn icon sm ghost" onClick={tg} aria-label="Topic options"><Ico n="dots" s={16}/></button>}>
          <button className="mi" onClick={()=>setForm(x)}><Ico n="pencil" s={15}/>Edit</button>
          <button className="mi bad" onClick={()=>del(x)}><Ico n="trash" s={15}/>Delete</button>
        </Menu>}
      </div>)}</div>
    </div>}

    {form&&<SyllabusForm c={c} entry={form.id?form:null} onClose={()=>setForm(null)} onSaved={()=>res.refresh().catch(()=>{})}/>}
  </>;
}

function CurrentCard({x}){
  const pts=bullets(x.learning_points);
  return <div className="card" style={{boxShadow:'none',padding:'18px 20px'}}>
    <div className="row" style={{gap:12,alignItems:'flex-start'}}>
      <span style={{width:52,height:52,borderRadius:14,background:'var(--good-bg)',display:'grid',placeItems:'center',flexShrink:0}}><Ico n="book" s={24} style={{color:'var(--good)'}}/></span>
      <div className="grow" style={{minWidth:0}}>
        <div className="row" style={{gap:10,flexWrap:'wrap'}}><h3 className="serif grow" style={{margin:0,fontSize:22,fontWeight:600}}>{x.topic}</h3>{x.currently_studying&&<Badge tone="good">Currently studying</Badge>}</div>
        <div className="row" style={{gap:7,marginTop:8,color:'var(--good)'}}><Ico n="check" s={15} w={2.2}/><span className="sub" style={{color:'var(--ink2)',fontWeight:500}}>Topic for this term</span></div>
      </div>
    </div>
    {pts.length>0&&<div style={{marginTop:14,paddingTop:14,borderTop:'1px solid var(--line2)'}}>
      <div className="row" style={{gap:7,marginBottom:8}}><Ico n="layers" s={16} style={{color:'var(--muted)'}}/><b style={{fontWeight:600}}>What we are learning:</b></div>
      <ul style={{margin:0,paddingLeft:22,lineHeight:1.7}}>{pts.map((p,i)=><li key={i}>{p}</li>)}</ul>
    </div>}
    {x.current_reading&&<div className="row" style={{gap:9,marginTop:14,paddingTop:14,borderTop:'1px solid var(--line2)',flexWrap:'wrap'}}><Ico n="book" s={17} style={{color:'var(--good)'}}/><b style={{fontWeight:600,color:'var(--good)'}}>Current reading:</b><span className="idtag">{x.current_reading}</span></div>}
    {(x.teacher_name||x.start_date||x.end_date)&&<div className="sub" style={{marginTop:12}}>{[x.teacher_name&&`Teacher: ${x.teacher_name}`,(x.start_date||x.end_date)&&`${H.fmt(x.start_date)} – ${H.fmt(x.end_date)}`].filter(Boolean).join(' · ')}</div>}
    {x.notes&&<div className="sub" style={{marginTop:8,whiteSpace:'pre-wrap'}}>{x.notes}</div>}
  </div>;
}

function SyllabusForm({c,entry,onClose,onSaved}){
  const {toast}=useUI();const edit=!!entry;
  const [f,setF]=useState({academic_year:entry?.academic_year||c.academic_year||'',term:entry?.term||TERMS[0],topic:entry?.topic||'',currently_studying:entry?entry.currently_studying:true,learning_points:entry?.learning_points||'',current_reading:entry?.current_reading||'',teacher_name:entry?.teacher_name||'',start_date:entry?.start_date||'',end_date:entry?.end_date||'',notes:entry?.notes||''});
  const [t,setT]=useState(false);const [busy,setBusy]=useState(false);const [err,setErr]=useState('');
  const save=async()=>{setT(true);if(!f.topic.trim())return;setBusy(true);setErr('');
    try{const body={...f,topic:f.topic.trim(),start_date:f.start_date||null,end_date:f.end_date||null};const r=edit?await curriculumApi.update(entry.id,body):await curriculumApi.create(c.id,body);onSaved(r.data);onClose();toast(edit?'Topic saved':'Topic added')}catch(e){setErr(e.message)}finally{setBusy(false)}};
  return <Modal size="lg" title={edit?'Edit topic':'Add topic'} desc={clsName(c)} onClose={onClose}
    foot={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn pri" disabled={busy} onClick={save}>{busy?'Saving…':'Save topic'}</button></>}>
    <Alert style={{marginBottom:14}}>{err}</Alert>
    <div className="col" style={{gap:16}}>
      <div className="g2">
        <Field label="Academic year"><input className="inp" value={f.academic_year} onChange={e=>setF({...f,academic_year:e.target.value})} placeholder="2026/2027"/></Field>
        <Field label="Term"><select className="sel" value={f.term} onChange={e=>setF({...f,term:e.target.value})}>{[...new Set([...TERMS,f.term].filter(Boolean))].map(x=><option key={x}>{x}</option>)}</select></Field>
      </div>
      <Field label="Topic" req error={t&&!f.topic.trim()?'Enter a topic':''}><input className={`inp${t&&!f.topic.trim()?' bad':''}`} value={f.topic} onChange={e=>setF({...f,topic:e.target.value})} placeholder="e.g. Quran & Tajweed"/></Field>
      <Field label="What we are learning" hint="One point per line — shown as a bullet list"><textarea className="ta" style={{minHeight:110}} value={f.learning_points} onChange={e=>setF({...f,learning_points:e.target.value})} placeholder={'Basic Tajweed rules\nCorrect pronunciation of Arabic letters\nQuran reading practice'}/></Field>
      <div className="g2">
        <Field label="Current reading"><input className="inp" value={f.current_reading} onChange={e=>setF({...f,current_reading:e.target.value})} placeholder="e.g. Quran"/></Field>
        <Field label="Teacher"><input className="inp" value={f.teacher_name} onChange={e=>setF({...f,teacher_name:e.target.value})} placeholder="Teacher's name"/></Field>
      </div>
      <div className="g2">
        <Field label="Starts"><input className="inp" type="date" value={f.start_date} onChange={e=>setF({...f,start_date:e.target.value})}/></Field>
        <Field label="Ends"><input className="inp" type="date" value={f.end_date} onChange={e=>setF({...f,end_date:e.target.value})}/></Field>
      </div>
      <Field label="Notes" opt><textarea className="ta" value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/></Field>
      <div className="row"><span className="grow"><b style={{fontWeight:500}}>Currently studying</b><div className="hint">Mark this as the class&apos;s current topic.</div></span><Sw on={f.currently_studying} onChange={v=>setF({...f,currently_studying:v})}/></div>
    </div>
  </Modal>;
}
