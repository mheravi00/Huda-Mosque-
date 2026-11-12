'use client';
// Huda — Student notes, Message templates, Notifications, Settings, Files
import React,{useEffect,useRef,useState}from'react';
import{messageTemplatesApi,notesApi,notificationsApi,settingsApi,storageApi,studentsApi}from'../../lib/api/resources';
import{useApiResource}from'../useApiResource';
import{listAll,sStatus,useStudents}from'./data';
import{fill}from'./attendance';
import{linkToRoute}from'./shell';
import{Alert,Av,Badge,Empty,Field,H,Ico,Listing,Loading,Menu,Modal,PageHead,Panel,PanelHead,SearchBox,Seg,Sw,clsName,name,studentClass,useUI}from'./ui';

/* ---------- Student Notes (teacher) ---------- */
export function Notes(){
  const {role,toast,confirm}=useUI();
  const students=useStudents(role);
  const [checking,setChecking]=useState(true);const [canPost,setCanPost]=useState(true);
  useEffect(()=>{let on=true;notesApi.access().then(r=>{if(on){setCanPost(r.data?.can_post!==false);setChecking(false)}}).catch(()=>{if(on){setCanPost(false);setChecking(false)}});return()=>{on=false}},[]);
  const kids=students.data.filter(s=>sStatus(s)==='Active').sort((a,b)=>String(a.first_name).localeCompare(b.first_name));
  const [q,setQ]=useState('');const [sid,setSid]=useState(null);
  useEffect(()=>{if(!sid&&kids[0])setSid(kids[0].id)},[kids.length]);
  const notes=useApiResource(()=>sid?notesApi.list(sid):Promise.resolve({data:[]}),[sid]);
  if(checking||students.loading)return <div className="card" style={{marginTop:40}}><Loading label="Checking note access…"/></div>;
  const s=kids.find(k=>k.id===sid);
  const shown=kids.filter(k=>!q||name(k).toLowerCase().includes(q.toLowerCase()));
  return <div className="enter">
    <PageHead title="Student Notes" desc="Private notes about your students. Choose who can see each one — admin-only notes are hidden from other teachers."/>
    <div className="twocol">
      <div className="card">
        <div className="toolbar"><SearchBox value={q} onChange={setQ} placeholder="Find a student"/></div>
        <div style={{maxHeight:520,overflow:'auto'}}>{shown.map(k=><div key={k.id} className="list-row click" style={{padding:'10px 16px',background:k.id===sid?'var(--gold-soft)':undefined}} onClick={()=>setSid(k.id)}>
          <Av p={k} size="sm" sel={k.id===sid}/><div className="grow"><div className="nm" style={{fontSize:15.5}}>{name(k)}</div><div className="sub">{studentClass(k)?.name||'No class'}</div></div>
        </div>)}{shown.length===0&&<div className="state" style={{padding:'30px'}}><p>No students match.</p></div>}</div>
      </div>
      {s&&<div className="col" style={{gap:16,minWidth:0}}>
        {canPost&&<NewNote s={s} onSaved={()=>notes.refresh().catch(()=>{})}/>}
        {notes.loading?<div className="card"><Loading/></div>:notes.data.length===0?<div className="card"><Empty icon="note" title={`No notes about ${s.first_name} yet`} body="Notes you write will appear here, newest first."/></div>:
          [...notes.data].sort((a,b)=>String(b.created_at).localeCompare(a.created_at)).map(n=><NoteCard key={n.id} n={n} onChange={()=>notes.refresh().catch(()=>{})} confirm={confirm} toast={toast}/>)}
      </div>}
    </div>
  </div>;
}
function NewNote({s,onSaved}){
  const {toast}=useUI();const [body,setBody]=useState('');const [vis,setVis]=useState('Teacher + Admin');const [busy,setBusy]=useState(false);const [err,setErr]=useState('');
  const save=async()=>{setBusy(true);setErr('');try{await notesApi.create(s.id,{note:body.trim(),visibility:vis});setBody('');toast('Note saved');onSaved()}catch(e){setErr(e.message)}finally{setBusy(false)}};
  return <div className="card"><div className="card-b">
    <div className="row" style={{marginBottom:14}}><Av p={s} sel/><div className="grow"><div className="nm" style={{fontSize:20}}>New note about {s.first_name}</div><div className="sub">{clsName(studentClass(s))}</div></div></div>
    <Alert style={{marginBottom:12}}>{err}</Alert>
    <textarea className="ta" value={body} onChange={e=>setBody(e.target.value)} placeholder={`What should the office know about ${s.first_name}?`}/>
    <div className="row wrap" style={{marginTop:12}}>
      <span className="sm-t muted">Visible to</span><Seg value={vis} options={['Teacher + Admin','Admin only']} onChange={setVis}/>
      <button className="btn pri" style={{marginLeft:'auto'}} disabled={!body.trim()||busy} onClick={save}>{busy?'Saving…':'Save note'}</button>
    </div>
  </div></div>;
}
function NoteCard({n,onChange,confirm,toast}){
  const [ed,setEd]=useState(null);const [err,setErr]=useState('');
  const save=async()=>{try{await notesApi.update(n.id,{note:ed.note,visibility:ed.visibility});setEd(null);toast('Note updated');onChange()}catch(e){setErr(e.message)}};
  const del=async()=>{if(!(await confirm({title:'Delete this note?',body:'The note will be permanently removed.',label:'Delete note',danger:true})))return;try{await notesApi.remove(n.id);toast('Note deleted');onChange()}catch(e){setErr(e.message)}};
  return <div className="card"><div className="card-b">
    <div className="row" style={{marginBottom:8}}><Badge s={n.visibility}/><span className="sub grow">{H.fmtL(n.created_at)}</span>
      <Menu button={tg=><button className="btn icon sm ghost" onClick={tg} aria-label="Note options"><Ico n="dots" s={16}/></button>}>
        <button className="mi" onClick={()=>setEd({note:n.note,visibility:n.visibility})}><Ico n="pencil" s={15}/>Edit note</button>
        <button className="mi bad" onClick={del}><Ico n="trash" s={15}/>Delete note</button>
      </Menu>
    </div>
    <Alert style={{marginBottom:8}}>{err}</Alert>
    {ed?<div className="col" style={{gap:10}}><textarea className="ta" value={ed.note} onChange={e=>setEd({...ed,note:e.target.value})}/><div className="row wrap"><Seg value={ed.visibility} options={['Teacher + Admin','Admin only']} onChange={v=>setEd({...ed,visibility:v})}/><span className="grow"></span><button className="btn sm" onClick={()=>setEd(null)}>Cancel</button><button className="btn sm pri" disabled={!ed.note.trim()} onClick={save}>Save</button></div></div>
    :<div style={{fontSize:14.5,lineHeight:1.6}}>{n.note}</div>}
  </div></div>;
}

/* ---------- Message Templates (admin) ---------- */
const chanOpts=[['email','Email'],['sms','SMS'],['both','Email + SMS']];
const chanLabel=v=>({email:'Email',sms:'SMS',both:'Email + SMS'}[String(v).toLowerCase()]||v);
export function Templates(){
  const {toast}=useUI();
  const res=useApiResource(()=>listAll(messageTemplatesApi.admin.list),[]);
  const [sel,setSel]=useState(null);
  const cur=sel==='new'?{id:'new',name:'',trigger_weeks:2,channel:'email',active:true,subject:'',body:''}:sel&&res.data.find(t=>t.id===sel);
  const list=[...res.data].sort((a,b)=>a.trigger_weeks-b.trigger_weeks);
  const setActive=async(t,v)=>{try{const r=await messageTemplatesApi.admin.update(t.id,{active:v});res.setData(rs=>rs.map(x=>x.id===t.id?r.data:x))}catch(e){toast(e.message)}};
  return <div className="enter">
    <PageHead title="Message Templates" desc="Pre-written messages to parents, used by the absence tracker. Staff pick one and press Send — they never type these by hand."><button className="btn pri" onClick={()=>setSel('new')}><Ico n="plus" s={16}/>New template</button></PageHead>
    <div className={`split${cur?' has':''}`}>
      <div className="card"><Listing res={res} count={list.length} empty="No templates" emptyIcon="mail" emptyBody="Add a message for a given number of weeks absent.">
        <div className="tscroll"><table className="tbl click"><thead><tr><th>Template</th><th>Trigger</th><th className="hide-sm">Channel</th><th className="r">Active</th></tr></thead>
        <tbody>{list.map(t=><tr key={t.id} className={sel===t.id?'sel':''} onClick={()=>setSel(t.id)}>
          <td><div style={{fontWeight:500}}>{t.name}</div><div className="sub ellipsis" style={{maxWidth:340}}>{String(t.subject||t.body||'').replace(/\{\{(\w+)\}\}/g,(_,k)=>k==='student_name'?'[student]':k==='class_name'?'[class]':'[weeks]')}</div></td>
          <td className="sm-t">After {t.trigger_weeks} {t.trigger_weeks===1?'week':'weeks'}</td><td className="hide-sm"><span className="pill">{chanLabel(t.channel)}</span></td>
          <td className="r"><Sw on={t.active!==false} label={`${t.name} active`} onChange={v=>setActive(t,v)}/></td>
        </tr>)}</tbody></table></div>
      </Listing></div>
      {cur&&<Panel key={cur.id} onClose={()=>setSel(null)}><TemplateForm t={cur} onClose={()=>setSel(null)} onSave={async v=>{const r=cur.id==='new'?await messageTemplatesApi.admin.create(v):await messageTemplatesApi.admin.update(cur.id,v);res.setData(rs=>cur.id==='new'?[...rs,r.data]:rs.map(x=>x.id===cur.id?r.data:x));toast('Template saved');setSel(null)}}/></Panel>}
    </div>
  </div>;
}
function TemplateForm({t,onClose,onSave}){
  const [f,setF]=useState({name:t.name||'',trigger_weeks:t.trigger_weeks??2,channel:String(t.channel||'email').toLowerCase(),active:t.active!==false,subject:t.subject||'',body:t.body||''});const [tr,setTr]=useState(false);const [busy,setBusy]=useState(false);const [err,setErr]=useState('');
  const ref=useRef();
  const ins=tok=>{const el=ref.current;const a=el?el.selectionStart:f.body.length,b=el?el.selectionEnd:f.body.length;const nb=f.body.slice(0,a)+tok+f.body.slice(b);setF({...f,body:nb});requestAnimationFrame(()=>{if(el){el.focus();el.selectionStart=el.selectionEnd=a+tok.length}})};
  const sample={first_name:'Yusuf',last_name:'Hassan'};
  const submit=async()=>{setTr(true);if(!f.name.trim()||!f.body.trim())return;setBusy(true);setErr('');try{await onSave({...f,name:f.name.trim(),trigger_weeks:+f.trigger_weeks})}catch(e){setErr(e.message)}finally{setBusy(false)}};
  return <>
    <PanelHead onClose={onClose} avatar={<span className="av lg g"><Ico n="mail" s={22}/></span>} title={t.id==='new'?'New template':t.name}/>
    <div className="p-b" style={{borderTop:'1px solid var(--line2)'}}><div className="col" style={{gap:16}}>
      <Alert>{err}</Alert>
      <Field label="Template name" req error={tr&&!f.name.trim()?'Give it a name':''}><input className={`inp${tr&&!f.name.trim()?' bad':''}`} value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></Field>
      <div className="g2"><Field label="Send after" hint="Weeks absent in a row"><input className="inp" type="number" min="1" value={f.trigger_weeks} onChange={e=>setF({...f,trigger_weeks:e.target.value})}/></Field><Field label="Active"><div style={{paddingTop:8}}><Sw on={f.active} onChange={v=>setF({...f,active:v})}/></div></Field></div>
      <Field label="Channel"><Seg value={f.channel} options={chanOpts} onChange={v=>setF({...f,channel:v})}/></Field>
      <Field label="Email subject"><input className="inp" value={f.subject} onChange={e=>setF({...f,subject:e.target.value})}/></Field>
      <Field label="Message" req error={tr&&!f.body.trim()?'Write the message':''}><textarea ref={ref} className={`ta${tr&&!f.body.trim()?' bad':''}`} style={{minHeight:180}} value={f.body} onChange={e=>setF({...f,body:e.target.value})}/></Field>
      <div><div className="sub" style={{marginBottom:6}}>Insert a placeholder:</div><div className="row wrap" style={{gap:6}}>{['{{student_name}}','{{class_name}}','{{weeks_absent}}'].map(k=><button key={k} className="chip mono" style={{height:28,fontSize:11.5}} onClick={()=>ins(k)}>{k}</button>)}</div></div>
      <div className="flat" style={{background:'#fff'}}><div className="lab" style={{marginBottom:8}}>Preview · Yusuf Hassan, 3 weeks</div>{f.subject&&<div style={{fontWeight:500,marginBottom:8}}>{fill(f.subject,sample,{name:'Year 4 An-Noor',min_age:null},3)}</div>}<div style={{whiteSpace:'pre-wrap',fontSize:13.5,lineHeight:1.6}}>{fill(f.body,sample,{name:'Year 4 An-Noor',min_age:null},3)}</div></div>
    </div>
    <div className="row" style={{marginTop:20,justifyContent:'flex-end'}}><button className="btn" onClick={onClose}>Cancel</button><button className="btn pri" disabled={busy} onClick={submit}>{busy?'Saving…':'Save template'}</button></div></div>
  </>;
}

/* ---------- Notifications ---------- */
export function Notifications(){
  const {go,refreshCounts}=useUI();const [tab,setTab]=useState('all');
  const res=useApiResource(()=>notificationsApi.list({limit:50}),[]);
  const un=res.data.filter(n=>!n.read_at);const list=tab==='all'?res.data:un;
  const open=async n=>{if(!n.read_at){await notificationsApi.update(n.id,{read:true}).catch(()=>{});res.setData(rs=>rs.map(x=>x.id===n.id?{...x,read_at:new Date().toISOString()}:x));refreshCounts()}const t=linkToRoute(n.link);if(t)go(t[0],t[1])};
  const markAll=async()=>{try{await notificationsApi.readAll();res.setData(rs=>rs.map(x=>({...x,read_at:x.read_at||new Date().toISOString()})));refreshCounts()}catch(e){}};
  return <div className="enter" style={{maxWidth:900}}>
    <PageHead title="Notifications" desc="Updates about reports, registers and requests. Select one to go straight to it.">
      <button className="btn" disabled={!un.length} onClick={markAll}><Ico n="check" s={15}/>Mark all as read</button>
    </PageHead>
    <div className="card">
      <div className="tabs" style={{padding:'0 20px'}}>{[['all','All',res.data.length],['unread','Unread',un.length]].map(([v,l,n])=><button key={v} className={`tab${tab===v?' on':''}`} onClick={()=>setTab(v)}>{l}<span className="n">{n}</span></button>)}</div>
      <Listing res={res} count={list.length} empty={tab==='unread'?"You're all caught up":'No notifications'} emptyIcon="bell" emptyBody={tab==='unread'?'There are no unread notifications.':'Updates will appear here.'}>
        {list.map(n=><div key={n.id} className="list-row click" style={{alignItems:'flex-start',padding:'16px 20px',background:n.read_at?undefined:'#f8f2df'}} onClick={()=>open(n)}>
          <span style={{width:38,height:38,borderRadius:'50%',display:'grid',placeItems:'center',flexShrink:0,background:n.read_at?'#eceee4':'var(--gold-soft)',color:n.read_at?'var(--muted)':'var(--gold-ink)'}}><Ico n="bell" s={17}/></span>
          <div className="grow"><div className="row" style={{gap:8}}><b style={{fontWeight:n.read_at?500:600}}>{n.title}</b>{!n.read_at&&<span className="dot" style={{background:'var(--gold)'}}></span>}</div><div style={{color:'var(--ink2)',marginTop:2}}>{n.message}</div></div>
          <span className="sub hide-sm" style={{whiteSpace:'nowrap'}}>{H.when(n.created_at)}</span>
        </div>)}
      </Listing>
    </div>
  </div>;
}

/* ---------- Settings ---------- */
export function Settings(){
  const {toast}=useUI();
  const res=useApiResource(()=>settingsApi.list(),[]);
  const [v,setV]=useState({});const [saving,setSaving]=useState('');
  useEffect(()=>{setV(Object.fromEntries(res.data.map(x=>[x.key,typeof x.value==='string'?x.value:JSON.stringify(x.value??'')])))},[res.data]);
  const save=async item=>{setSaving(item.key);try{await settingsApi.update(item.key,v[item.key]);res.setData(rs=>rs.map(x=>x.key===item.key?{...x,value:v[item.key]}:x));toast('Setting saved')}catch(e){toast(e.message)}finally{setSaving('')}};
  const label=k=>k.replace(/[_.]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  return <div className="enter" style={{maxWidth:1000}}>
    <PageHead title="Settings" desc="Madrasa details used across the portal. Each setting saves on its own."/>
    <div className="formcard">
      <section className="fsec">
        <div className="fsec-h"><div className="fsec-n">01</div><h3>Application settings</h3><p>Only safe settings are shown here. Secrets are never editable from the portal.</p></div>
        <Listing res={res} count={res.data.length} empty="No application settings" emptyIcon="gear" emptyBody="Settings appear here once they are configured.">
          <div className="col" style={{gap:16}}>{res.data.map(item=><div key={item.key} className="row" style={{alignItems:'flex-end',gap:10}}>
            <div style={{flex:'1 1 auto',minWidth:0}}><Field label={<>{label(item.key)} <span className="mono" style={{fontWeight:400,color:'var(--muted)',fontSize:11}}>{item.key}</span></>}><input className="inp" value={v[item.key]??''} onChange={e=>setV({...v,[item.key]:e.target.value})}/></Field></div>
            <button className="btn" style={{flexShrink:0}} disabled={saving===item.key||v[item.key]===(typeof item.value==='string'?item.value:JSON.stringify(item.value??''))} onClick={()=>save(item)}>{saving===item.key?'Saving…':'Save'}</button>
          </div>)}</div>
        </Listing>
      </section>
    </div>
  </div>;
}

/* ---------- Files (admin) ---------- */
const FOLDERS=[['all','All files','folder',null],['documents','Documents','file','documents'],['student-photos','Student photos','image','student-photos'],['homework-files','Homework files','pencil','homework-files'],['report-pdfs','Report PDFs','award','report-pdfs']];
export function Files(){
  const {toast,confirm}=useUI();
  const res=useApiResource(()=>storageApi.list(),[]);
  const [fd,setFd]=useState('all');const [q,setQ]=useState('');const [over,setOver]=useState(false);const [lnk,setLnk]=useState(null);const [busy,setBusy]=useState(false);const [err,setErr]=useState('');const inp=useRef();
  const folder=FOLDERS.find(x=>x[0]===fd);
  const list=res.data.filter(f=>(fd==='all'||f.bucket===fd)&&(!q||f.name.toLowerCase().includes(q.toLowerCase())));
  const add=async files=>{
    const arr=[...files];if(!arr.length)return;setBusy(true);setErr('');
    const bucket=fd==='all'?null:fd;
    try{
      for(const file of arr){
        const b=bucket||(file.type.startsWith('image')?'student-photos':'documents');
        const form=new FormData();form.set('file',file);form.set('bucket',b);form.set('path',`library/${Date.now()}-${file.name.replace(/[^\w.\- ]/g,'_')}`);
        await storageApi.upload(form);
      }
      toast(`${arr.length} ${arr.length===1?'file':'files'} uploaded`);await res.refresh();
    }catch(e){setErr(e.message)}finally{setBusy(false)}
  };
  const del=async f=>{if(!(await confirm({title:'Delete this file?',body:`“${f.name}” will be permanently deleted. Any links you've shared will stop working.`,label:'Delete file',danger:true})))return;try{await storageApi.remove({bucket:f.bucket,path:f.path});res.setData(rs=>rs.filter(x=>x.path!==f.path||x.bucket!==f.bucket));toast('File deleted')}catch(e){setErr(e.message)}};
  const kind=n=>/\.(jpe?g|png|gif|webp)$/i.test(n)?['image','#f2ddd7','var(--rose-ink)']:/\.pdf$/i.test(n)?['file','var(--gold-soft)','var(--gold-ink)']:['file','#e2eae1','var(--ink2)'];
  const count=k=>k==='all'?res.data.length:res.data.filter(f=>f.bucket===k).length;
  return <div className="enter">
    <PageHead title="Files" desc="Documents, photos and PDFs stored privately for the madrasa. Share a file with a secure link that expires.">
      <input ref={inp} type="file" multiple hidden onChange={e=>{add(e.target.files);e.target.value=''}}/>
      <button className="btn pri" disabled={busy} onClick={()=>inp.current.click()}><Ico n="upload" s={16}/>{busy?'Uploading…':'Upload files'}</button>
    </PageHead>
    <Alert style={{marginBottom:16}}>{err}</Alert>
    <div className="twocol narrow">
      <div className="card" style={{padding:8}}>
        {FOLDERS.map(([k,l,i])=><button key={k} className="mi" style={{padding:'10px 12px',background:fd===k?'var(--gold-soft)':undefined,fontWeight:fd===k?500:400}} onClick={()=>setFd(k)}><Ico n={i} s={17} style={{color:fd===k?'var(--gold-ink)':'var(--muted)'}}/><span className="grow">{l}</span><span className="sub mono">{count(k)}</span></button>)}
      </div>
      <div className="col" style={{gap:16,minWidth:0}}>
        <div onDragOver={e=>{e.preventDefault();setOver(true)}} onDragLeave={()=>setOver(false)} onDrop={e=>{e.preventDefault();setOver(false);add(e.dataTransfer.files)}} onClick={()=>inp.current.click()}
          style={{border:`1.5px dashed ${over?'var(--ink2)':'var(--line)'}`,background:over?'#eef2ea':'var(--card)',borderRadius:18,padding:'22px 20px',display:'flex',alignItems:'center',gap:14,cursor:'pointer',transition:'all .15s'}}>
          <span style={{width:44,height:44,borderRadius:14,background:'var(--gold-soft)',color:'var(--gold-ink)',display:'grid',placeItems:'center',flexShrink:0}}><Ico n="upload" s={20}/></span>
          <div><div style={{fontWeight:500}}>Drop files here, or click to choose</div><div className="sub">They&apos;ll be saved to {fd==='all'?'Documents (or Student photos for images)':folder[1]}. Up to 10 MB each.</div></div>
        </div>
        <div className="card">
          <div className="toolbar"><span className="serif" style={{fontSize:20}}>{folder[1]}</span><span className="grow"></span><SearchBox value={q} onChange={setQ} placeholder="Search files"/></div>
          <Listing res={res} count={list.length} empty="No files here yet" emptyIcon="folder" emptyBody="Upload a file to get started.">
            {list.map(f=>{const [ic,bg,fg]=kind(f.name);return <div key={f.bucket+f.path} className="list-row">
              <span style={{width:38,height:38,borderRadius:10,background:bg,color:fg,display:'grid',placeItems:'center',flexShrink:0}}><Ico n={ic} s={18}/></span>
              <div className="grow"><div style={{fontWeight:500}} className="ellipsis">{f.name}</div><div className="sub">{[H.size(f.size),H.fmt(String(f.created_at||'').slice(0,10)),fd==='all'&&FOLDERS.find(x=>x[0]===f.bucket)?.[1]].filter(Boolean).join(' · ')}</div></div>
              <Menu button={tg=><button className="btn icon sm ghost" onClick={tg} aria-label="File options"><Ico n="dots" s={16}/></button>}>
                <button className="mi" onClick={()=>setLnk(f)}><Ico n="link" s={15}/>Get secure link</button>
                <div className="msep"></div>
                <button className="mi bad" onClick={()=>del(f)}><Ico n="trash" s={15}/>Delete</button>
              </Menu>
            </div>})}
          </Listing>
        </div>
      </div>
    </div>
    {lnk&&<LinkModal f={lnk} onClose={()=>setLnk(null)}/>}
  </div>;
}
function LinkModal({f,onClose}){
  const {toast}=useUI();const [exp,setExp]=useState('1 hour');const [url,setUrl]=useState('');const [busy,setBusy]=useState(false);const [err,setErr]=useState('');
  const secs={'15 minutes':900,'1 hour':3600,'24 hours':86400};
  const make=async()=>{setBusy(true);setErr('');try{const r=await storageApi.signedUrl({bucket:f.bucket,path:f.path,expires_in:secs[exp]});setUrl(r.data.signed_url||r.data.signedUrl||'')}catch(e){setErr(e.message)}finally{setBusy(false)}};
  useEffect(()=>{make()},[exp]);
  return <Modal title="Secure link" desc={f.name} onClose={onClose} foot={<><button className="btn" onClick={onClose}>Done</button><button className="btn pri" disabled={!url} onClick={()=>{navigator.clipboard&&navigator.clipboard.writeText(url).catch(()=>{});toast('Link copied')}}><Ico n="copy" s={15}/>Copy link</button></>}>
    <div className="col" style={{gap:16}}>
      <Field label="Link expires after"><Seg value={exp} options={['15 minutes','1 hour','24 hours']} onChange={setExp}/></Field>
      <Alert>{err}</Alert>
      <div className="flat mono" style={{fontSize:12.5,wordBreak:'break-all',background:'#fff'}}>{busy?'Generating…':url||'—'}</div>
      <div className="hint row"><Ico n="shield" s={15}/>Anyone with this link can download the file until it expires.</div>
    </div>
  </Modal>;
}
