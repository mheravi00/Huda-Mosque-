'use client';
// Huda — Feedback: staff send problems/requests to the admin; admins see the inbox.
import React,{useState}from'react';
import{feedbackApi}from'../../lib/api/resources';
import{useApiResource}from'../useApiResource';
import{Alert,Av,Badge,Empty,Field,H,Ico,Listing,Menu,PageHead,name,useUI}from'./ui';

export function Feedback(){
  const {role,me,toast,confirm}=useUI();const admin=role==='admin';
  const res=useApiResource(()=>feedbackApi.list(),[]);
  const [f,setF]=useState({name:name(me),phone:'',problem:'',details:''});
  const [t,setT]=useState(false);const [busy,setBusy]=useState(false);const [err,setErr]=useState('');const [sent,setSent]=useState(false);
  const e={name:!f.name.trim(),problem:!f.problem.trim()};
  const send=async()=>{setT(true);if(e.name||e.problem)return;setBusy(true);setErr('');
    try{await feedbackApi.create({name:f.name.trim(),phone:f.phone.trim()||undefined,problem:f.problem.trim(),details:f.details.trim()||undefined});setSent(true);setF({name:name(me),phone:'',problem:'',details:''});setT(false);toast('Thank you — your feedback was sent');res.refresh().catch(()=>{})}catch(x){setErr(x.message)}finally{setBusy(false)}};
  const setStatus=async(x,status)=>{try{const r=await feedbackApi.update(x.id,{status});res.setData(rs=>rs.map(y=>y.id===x.id?r.data:y))}catch(e2){toast(e2.message)}};
  const del=async x=>{if(!(await confirm({title:'Delete this feedback?',body:'It will be permanently removed.',label:'Delete',danger:true})))return;try{await feedbackApi.remove(x.id);res.setData(rs=>rs.filter(y=>y.id!==x.id))}catch(e2){toast(e2.message)}};
  const open=res.data.filter(x=>x.status!=='resolved');
  return <div className="enter" style={{maxWidth:admin?1100:720}}>
    <PageHead title="Feedback" desc={admin?'Problems and change requests sent in by staff.':'Found a problem or want something changed? Send it here and it comes straight to the admin.'}/>
    <div className={admin?'twocol':''} style={admin?{gridTemplateColumns:'minmax(0,440px) minmax(0,1fr)'}:undefined}>
      <div className="formcard" style={{padding:'6px 24px',height:'fit-content'}}>
        <section className="fsec" style={{gridTemplateColumns:'1fr'}}>
          <div className="fsec-h"><h3>Send feedback</h3><p>Add your phone number so the admin can message you for more detail if needed.</p></div>
          {sent&&<div className="alert good" style={{marginBottom:14}}><Ico n="check" s={17}/>Sent — jazakAllahu khayran. You can send another below.</div>}
          <Alert style={{marginBottom:14}}>{err}</Alert>
          <div className="col" style={{gap:16}}>
            <Field label="Name" req error={t&&e.name?'Enter your name':''}><input className={`inp${t&&e.name?' bad':''}`} value={f.name} onChange={ev=>setF({...f,name:ev.target.value})}/></Field>
            <Field label="Phone" hint="So the admin can reach you for details"><input className="inp" type="tel" value={f.phone} onChange={ev=>setF({...f,phone:ev.target.value})} placeholder="07700 900 000"/></Field>
            <Field label="Problem" req error={t&&e.problem?'Describe the problem':''}><input className={`inp${t&&e.problem?' bad':''}`} value={f.problem} onChange={ev=>setF({...f,problem:ev.target.value})} placeholder="e.g. Register won't save for my class"/></Field>
            <Field label="Further details / notes" opt><textarea className="ta" style={{minHeight:120}} value={f.details} onChange={ev=>setF({...f,details:ev.target.value})} placeholder="Anything that helps explain it"/></Field>
            <button className="btn pri block" style={{height:44}} disabled={busy} onClick={send}><Ico n="send" s={16}/>{busy?'Sending…':'Send to admin'}</button>
          </div>
        </section>
      </div>
      {admin&&<div className="card" style={{height:'fit-content'}}>
        <div className="card-h"><div><h3>Received feedback</h3><p>{open.length} open · {res.data.length} total</p></div></div>
        <Listing res={res} count={res.data.length} empty="No feedback yet" emptyIcon="mail" emptyBody="Staff submissions will appear here.">
          {res.data.map(x=><div key={x.id} className="list-row" style={{alignItems:'flex-start'}}>
            <Av p={x.profiles||{first_name:x.name}} size="sm"/>
            <div className="grow" style={{minWidth:0}}>
              <div className="row" style={{gap:8,flexWrap:'wrap'}}><b style={{fontWeight:600}}>{x.problem}</b>{x.status==='resolved'?<Badge tone="good" plain>Resolved</Badge>:<Badge tone="warn" plain>Open</Badge>}</div>
              {x.details&&<div className="sub" style={{marginTop:3,whiteSpace:'pre-wrap'}}>{x.details}</div>}
              <div className="sub" style={{marginTop:4}}>{x.name}{x.phone?<> · <a href={`tel:${String(x.phone).replace(/\s/g,'')}`} className="mono">{x.phone}</a></>:''} · {H.fmt(String(x.created_at).slice(0,10))}</div>
            </div>
            <Menu button={tg=><button className="btn icon sm ghost" onClick={tg} aria-label="Feedback options"><Ico n="dots" s={16}/></button>}>
              {x.status==='resolved'?<button className="mi" onClick={()=>setStatus(x,'open')}><Ico n="refresh" s={15}/>Mark open</button>:<button className="mi" onClick={()=>setStatus(x,'resolved')}><Ico n="check" s={15}/>Mark resolved</button>}
              <button className="mi bad" onClick={()=>del(x)}><Ico n="trash" s={15}/>Delete</button>
            </Menu>
          </div>)}
        </Listing>
      </div>}
    </div>
  </div>;
}
