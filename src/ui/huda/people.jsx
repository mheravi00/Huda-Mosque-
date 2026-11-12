'use client';
// Huda — Guardians, Staff accounts, Teacher requests
import React,{useEffect,useState}from'react';
import{classesApi,guardiansApi,teacherRequestsApi,teachersApi}from'../../lib/api/resources';
import{useApiResource}from'../useApiResource';
import{listAll,useClasses}from'./data';
import{RELS}from'./student-forms';
import{Alert,Av,Badge,Chips,Diamond,Empty,Field,H,Ico,Listing,Loading,PageHead,Pager,Panel,PanelHead,SearchBox,Seg,Sw,classWhen,clsName,name,today,useUI}from'./ui';

/* ---------- Guardians ---------- */
const kidsOf=g=>(g.student_guardians||[]).map(x=>x.students).filter(Boolean);
export function Guardians(){
  const {go,search}=useUI();
  const res=useApiResource(()=>listAll(guardiansApi.admin.list,{sort:'name'}),[]);
  const [q,setQ]=useState(search||'');useEffect(()=>{if(search)setQ(search)},[search]);
  const [page,setPage]=useState(0);const [sel,setSel]=useState(null);
  const ql=q.trim().toLowerCase();
  const list=res.data.filter(g=>!ql||`${g.first_name} ${g.last_name} ${g.email||''} ${g.phone||''}`.toLowerCase().includes(ql)).sort((a,b)=>String(a.last_name).localeCompare(b.last_name));
  const g=sel&&res.data.find(x=>x.id===sel);
  return <div className="enter">
    <PageHead title="Guardians" desc="Parents and guardians linked to enrolled students. They receive reports and attendance messages.">
      <button className="btn pri" onClick={()=>go('guardian-add')}><Ico n="plus" s={16}/>Add guardian</button>
    </PageHead>
    <div className={`split${g?' has':''}`}>
      <div className="card">
        <div className="toolbar"><SearchBox value={q} onChange={v=>{setQ(v);setPage(0)}} placeholder="Search by name, email or phone"/><span className="count">{list.length} guardians</span></div>
        <Listing res={res} count={list.length} empty="No guardians found" emptyBody={q?'Try a different name, email or phone number.':'Guardians are added together with their children.'}>
          <div className="tscroll"><table className="tbl click">
            <thead><tr><th>Guardian</th><th className="hide-sm">Relationship</th><th className="hide-md">Phone</th><th>Children</th></tr></thead>
            <tbody>{list.slice(page*25,page*25+25).map(x=>{const k=kidsOf(x);return <tr key={x.id} className={sel===x.id?'sel':''} onClick={()=>setSel(x.id)} tabIndex={0} onKeyDown={e=>{if(e.key==='Enter')setSel(x.id)}}>
              <td><div className="who"><Av p={x} sel={sel===x.id}/><div style={{minWidth:0}}><div className="nm">{x.first_name} {x.last_name}</div><div className="sub ellipsis">{x.email||'No email'}</div></div></div></td>
              <td className="hide-sm">{x.relationship||'—'}</td><td className="hide-md mono sm-t">{x.phone||'—'}</td>
              <td><div className="row" style={{gap:4}}>{k.slice(0,3).map(s=><Av key={s.id} p={s} size="sm"/>)}<span className="sub" style={{marginLeft:4}}>{k.length}</span></div></td>
            </tr>})}</tbody>
          </table></div>
          <Pager page={page} setPage={setPage} total={list.length}/>
        </Listing>
      </div>
      {g&&<Panel key={g.id} onClose={()=>setSel(null)}><GuardianPanel g={g} onClose={()=>setSel(null)} onSaved={row=>res.setData(rs=>rs.map(r=>r.id===g.id?{...r,...row}:r))}/></Panel>}
    </div>
  </div>;
}
function GuardianPanel({g,onClose,onSaved}){
  const {go,toast}=useUI();
  const kids=useApiResource(()=>guardiansApi.children(g.id),[g.id]);
  const init={first_name:g.first_name||'',last_name:g.last_name||'',relationship:g.relationship||'',phone:g.phone||'',email:g.email||''};
  const [f,setF]=useState(init);const [busy,setBusy]=useState(false);const [err,setErr]=useState('');
  const dirty=JSON.stringify(f)!==JSON.stringify(init);const bad=!f.first_name.trim()||!f.last_name.trim();
  const save=async()=>{setBusy(true);setErr('');try{const r=await guardiansApi.admin.update(g.id,{...f,first_name:f.first_name.trim(),last_name:f.last_name.trim(),email:f.email.trim()||null});onSaved(r.data);toast('Guardian details saved')}catch(e){setErr(e.message)}finally{setBusy(false)}};
  const n=kids.data.length;
  return <>
    <PanelHead onClose={onClose} avatar={<Av p={g} sel size="lg"/>} title={name(g)} sub={`${g.relationship||'Guardian'} · ${kids.loading?'…':`${n} ${n===1?'child':'children'}`}`}/>
    <div className="p-b" style={{borderTop:'1px solid var(--line2)'}}>
      <div className="p-sec"><span className="lab">Contact details</span>
        <Alert style={{marginBottom:12}}>{err}</Alert>
        <div className="g2">
          <Field label="First name" req error={!f.first_name.trim()?'Required':''}><input className="inp" value={f.first_name} onChange={e=>setF({...f,first_name:e.target.value})}/></Field>
          <Field label="Last name" req error={!f.last_name.trim()?'Required':''}><input className="inp" value={f.last_name} onChange={e=>setF({...f,last_name:e.target.value})}/></Field>
          <Field label="Relationship" span><select className="sel" value={f.relationship} onChange={e=>setF({...f,relationship:e.target.value})}><option value="">Select…</option>{[...new Set([...RELS,f.relationship].filter(Boolean))].map(r=><option key={r}>{r}</option>)}</select></Field>
          <Field label="Phone" span><input className="inp" type="tel" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/></Field>
          <Field label="Email" span><input className="inp" type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></Field>
        </div>
        <div className="row" style={{marginTop:14,justifyContent:'flex-end'}}>
          {dirty&&<button className="btn sm ghost" onClick={()=>setF(init)}>Undo</button>}
          <button className="btn sm pri" disabled={!dirty||bad||busy} onClick={save}>{busy?'Saving…':'Save changes'}</button>
        </div>
      </div>
      <Diamond/>
      <div className="p-sec"><div className="row" style={{marginBottom:10}}><span className="lab grow">Children</span><button className="btn sm" onClick={()=>go('student-add',{guardianId:g.id})}><Ico n="plus" s={14}/>Add child</button></div>
        {kids.loading?<div className="sub">Loading…</div>:<div className="col" style={{gap:8}}>{n===0&&<div className="sub">No children linked yet.</div>}{kids.data.map(s=>{const c=(s.classes||[])[0];return <button key={s.id} className="qtile" onClick={()=>go('students',{id:s.id})}>
          <span className="idtag">{s.student_id}</span><span className="grow"><span className="nm" style={{display:'block'}}>{name(s)}</span><span className="sub">Age {H.age(s.date_of_birth)??'—'} · {String(s.gender).toLowerCase()==='male'?'Boy':'Girl'} · {c?c.name:'No class'}</span></span><Ico n="chevr" s={15} style={{color:'var(--muted)'}}/>
        </button>})}</div>}
      </div>
    </div>
  </>;
}

/* ---------- Staff ---------- */
const prof=u=>u?.profiles||{};
const staffClasses=u=>(u?.class_teachers||[]).map(x=>x.classes).filter(Boolean);
export const uname=(a,b)=>`${(a||'').trim().toLowerCase().replace(/[^a-z]/g,'')}.${(b||'').trim().toLowerCase().replace(/[^a-z]/g,'')}`;
export function Staff(){
  const {search}=useUI();
  const res=useApiResource(()=>listAll(teachersApi.admin.list),[]);
  const [q,setQ]=useState(search||'');useEffect(()=>{if(search)setQ(search)},[search]);
  const [fl,setFl]=useState('all');const [sel,setSel]=useState(null);
  const by=k=>res.data.filter(u=>k==='all'||(k==='inactive'?!prof(u).active:prof(u).active));
  const ql=q.trim().toLowerCase();
  const list=by(fl).filter(u=>!ql||`${prof(u).first_name} ${prof(u).last_name} ${prof(u).username||''} ${u.qualification||''}`.toLowerCase().includes(ql)).sort((a,b)=>String(prof(a).last_name).localeCompare(prof(b).last_name));
  const u=sel&&sel!=='new'&&res.data.find(x=>x.id===sel);
  return <div className="enter">
    <PageHead title="Teachers" desc="Staff accounts for teachers and the office. Usernames are created automatically as firstname.lastname.">
      <button className="btn pri" onClick={()=>setSel('new')}><Ico n="plus" s={16}/>Add staff account</button>
    </PageHead>
    <div className={`split${sel&&(sel==='new'||u)?' has':''}`}>
      <div className="card">
        <div className="toolbar"><SearchBox value={q} onChange={setQ} placeholder="Search staff"/><Chips value={fl} onChange={setFl} options={[['all','All',by('all').length],['active','Active',by('active').length],['inactive','Inactive',by('inactive').length]]}/></div>
        <Listing res={res} count={list.length} empty="No staff found" emptyBody="Try a different search or filter.">
          <div className="tscroll"><table className="tbl click">
            <thead><tr><th>Staff member</th><th className="hide-sm">Username</th><th>Role</th><th className="hide-md">Qualification</th><th>Status</th></tr></thead>
            <tbody>{list.map(x=>{const p=prof(x);return <tr key={x.id} className={sel===x.id?'sel':''} onClick={()=>setSel(x.id)} tabIndex={0} onKeyDown={e=>{if(e.key==='Enter')setSel(x.id)}}>
              <td><div className="who"><Av p={p} tone={sel===x.id?'g':'ink'}/><div style={{minWidth:0}}><div className="nm">{name(p)}</div><div className="sub ellipsis">{staffClasses(x).map(c=>c.name).join(', ')||'No classes'}</div></div></div></td>
              <td className="hide-sm mono sm-t">{p.username||'—'}</td><td><Badge s={p.role==='admin'?'Admin':'Teacher'} plain/></td>
              <td className="hide-md sm-t muted" style={{maxWidth:220}}><div className="ellipsis">{x.qualification||'—'}</div></td>
              <td><Badge s={p.active?'Active':'Inactive'}/></td>
            </tr>})}</tbody>
          </table></div>
        </Listing>
      </div>
      {sel==='new'&&<Panel key="new" onClose={()=>setSel(null)}><NewStaff onClose={()=>setSel(null)} onDone={async row=>{await res.refresh().catch(()=>{});setSel(row&&row.profile_id?row.id:null)}}/></Panel>}
      {u&&<Panel key={u.id} onClose={()=>setSel(null)}><StaffPanel u={u} onClose={()=>setSel(null)} onChanged={()=>res.refresh().catch(()=>{})}/></Panel>}
    </div>
  </div>;
}
function NewStaff({onDone,onClose}){
  const {toast}=useUI();
  const [f,setF]=useState({email:'',pw:'',first:'',last:'',role:'teacher',phone:'',qualification:'',hired:today()});const [t,setT]=useState(false);const [busy,setBusy]=useState(false);const [err,setErr]=useState('');
  const e={email:!/^\S+@\S+\.\S+$/.test(f.email),pw:f.pw.length<12,first:!f.first.trim(),last:!f.last.trim()};
  const s=k=>v=>setF({...f,[k]:v&&v.target?v.target.value:v});
  const create=async()=>{
    setT(true);if(Object.values(e).some(Boolean))return;setBusy(true);setErr('');
    try{
      const body={email:f.email.trim(),password:f.pw,first_name:f.first.trim(),last_name:f.last.trim(),role:f.role};
      if(f.phone.trim())body.phone=f.phone.trim();if(f.qualification.trim())body.qualification=f.qualification.trim();if(f.hired)body.hire_date=f.hired;
      const r=await teachersApi.admin.create(body);toast(`Account created for ${f.first.trim()}`);onDone(r.data);
    }catch(x){setErr(x.message)}finally{setBusy(false)}
  };
  return <>
    <PanelHead onClose={onClose} avatar={<span className="av lg g"><Ico n="userplus" s={24}/></span>} title="New staff account" sub="They'll sign in with the temporary password and choose their own."/>
    <div className="p-b" style={{borderTop:'1px solid var(--line2)'}}>
      <Alert style={{marginBottom:14}}>{err}</Alert>
      <div className="g2">
        <Field label="First name" req error={t&&e.first?'Required':''}><input className={`inp${t&&e.first?' bad':''}`} value={f.first} onChange={s('first')}/></Field>
        <Field label="Last name" req error={t&&e.last?'Required':''}><input className={`inp${t&&e.last?' bad':''}`} value={f.last} onChange={s('last')}/></Field>
        <Field label="Username" span hint="Generated automatically"><div className="inwrap lock"><Ico n="lock" s={15}/><input className="inp mono" readOnly value={f.first||f.last?uname(f.first,f.last):'firstname.lastname'} tabIndex={-1}/></div></Field>
        <Field label="Email" req span error={t&&e.email?'Enter a valid email':''}><input className={`inp${t&&e.email?' bad':''}`} type="email" value={f.email} onChange={s('email')}/></Field>
        <Field label="Temporary password" req span error={t&&e.pw?'At least 12 characters':''} hint="At least 12 characters"><input className={`inp${t&&e.pw?' bad':''}`} value={f.pw} onChange={s('pw')} autoComplete="new-password"/></Field>
        <Field label="Role" span><Seg value={f.role} options={[['teacher','Teacher'],['admin','Admin']]} onChange={s('role')}/></Field>
        <Field label="Phone" opt><input className="inp" value={f.phone} onChange={s('phone')}/></Field>
        <Field label="Hire date"><input className="inp" type="date" value={f.hired} onChange={s('hired')}/></Field>
        <Field label="Qualification" opt span><input className="inp" value={f.qualification} onChange={s('qualification')} placeholder="e.g. Ijazah in Hifz"/></Field>
      </div>
      {f.role==='admin'&&<div className="hint" style={{marginTop:12}}>Admin accounts don&apos;t appear in this list — they manage the portal rather than teach classes.</div>}
      <div className="row" style={{marginTop:20,justifyContent:'flex-end'}}><button className="btn" onClick={onClose}>Cancel</button><button className="btn pri" onClick={create} disabled={busy}>{busy?'Creating…':'Create account'}</button></div>
    </div>
  </>;
}
function StaffPanel({u,onClose,onChanged}){
  const {toast,confirm}=useUI();const p=prof(u);
  const classes=useClasses();
  const init={first_name:p.first_name||'',last_name:p.last_name||'',role:p.role||'teacher',phone:p.phone||'',qualification:u.qualification||'',hire_date:u.hire_date||''};
  const [f,setF]=useState(init);const [pick,setPick]=useState('');const [err,setErr]=useState('');const [busy,setBusy]=useState(false);
  const dirty=JSON.stringify(f)!==JSON.stringify(init);const s=k=>v=>setF({...f,[k]:v&&v.target?v.target.value:v});
  const mine=staffClasses(u);const others=classes.data.filter(c=>!mine.some(m=>m.id===c.id));
  const act=async(fn,msg)=>{setErr('');try{await fn();toast(msg);onChanged()}catch(e){setErr(e.message)}};
  const save=async()=>{setBusy(true);const patch={};Object.keys(f).forEach(k=>{if(f[k]!==init[k])patch[k]=f[k]===''&&k!=='first_name'&&k!=='last_name'?null:f[k]});await act(()=>teachersApi.admin.update(u.id,patch),'Staff details saved');setBusy(false)};
  const toggle=async v=>{if(!v&&!(await confirm({title:`Deactivate ${p.first_name}'s account?`,body:"They won't be able to sign in until the account is turned back on. Their registers and reports are kept.",label:'Deactivate',danger:true})))return;act(()=>teachersApi.admin.update(u.id,{active:v}),v?'Account reactivated':'Account deactivated')};
  return <>
    <PanelHead onClose={onClose} avatar={<Av p={p} sel size="lg"/>} title={name(p)} sub={<span className="mono">{p.username}</span>}
      extra={<div className="row" style={{gap:8,marginTop:8}}><Badge s={p.role==='admin'?'Admin':'Teacher'} plain/><span className="row sm-t" style={{gap:8,marginLeft:'auto'}}>{p.active?'Active':'Inactive'}<Sw on={!!p.active} label="Account active" onChange={toggle}/></span></div>}/>
    <div className="p-b" style={{borderTop:'1px solid var(--line2)'}}>
      <Alert style={{marginBottom:14}}>{err}</Alert>
      <div className="p-sec"><span className="lab">Account</span>
        <div className="g2">
          <Field label="Email" span hint="Locked — staff change this from their own account"><div className="inwrap lock"><Ico n="lock" s={15}/><input className="inp" readOnly value={p.email||''} tabIndex={-1}/></div></Field>
          <Field label="Password" span><div className="inwrap lock"><Ico n="lock" s={15}/><input className="inp" readOnly value="••••••••••••" tabIndex={-1}/></div></Field>
          <Field label="First name"><input className="inp" value={f.first_name} onChange={s('first_name')}/></Field>
          <Field label="Last name"><input className="inp" value={f.last_name} onChange={s('last_name')}/></Field>
          <Field label="Role" span><Seg value={f.role} options={[['teacher','Teacher'],['admin','Admin']]} onChange={s('role')}/></Field>
          <Field label="Phone"><input className="inp" value={f.phone} onChange={s('phone')}/></Field>
          <Field label="Hire date"><input className="inp" type="date" value={f.hire_date} onChange={s('hire_date')}/></Field>
          <Field label="Qualification" span><input className="inp" value={f.qualification} onChange={s('qualification')}/></Field>
        </div>
        <div className="row" style={{marginTop:14,justifyContent:'flex-end'}}>{dirty&&<button className="btn sm ghost" onClick={()=>setF(init)}>Undo</button>}<button className="btn sm pri" disabled={!dirty||busy||!f.first_name.trim()||!f.last_name.trim()} onClick={save}>{busy?'Saving…':'Save changes'}</button></div>
      </div>
      {p.role!=='admin'&&<><Diamond/><div className="p-sec"><span className="lab">Assigned classes</span>
        <div className="col" style={{gap:8}}>{mine.length===0&&<div className="sub">Not assigned to any classes.</div>}{mine.map(c=><div key={c.id} className="linkrow"><div className="grow"><div className="nm">{clsName(c)}</div><div className="sub">{[classWhen(c),c.room_location].filter(Boolean).join(' · ')||'—'}</div></div><button className="btn sm ghost" onClick={()=>act(()=>classesApi.removeTeacher(c.id,u.id),`Removed from ${c.name}`)}>Remove</button></div>)}</div>
        <div className="row" style={{marginTop:10}}><select className="sel grow" value={pick} onChange={e=>setPick(e.target.value)} aria-label="Assign class"><option value="">Assign class…</option>{others.map(c=><option key={c.id} value={c.id}>{clsName(c)}</option>)}</select><button className="btn" disabled={!pick} onClick={()=>{const id=pick;setPick('');act(()=>classesApi.assignTeacher(id,u.id),'Class assigned')}}>Assign</button></div>
      </div></>}
    </div>
  </>;
}

/* ---------- Teacher requests ---------- */
export function Requests(){
  const {toast,confirm,refreshCounts}=useUI();
  const res=useApiResource(()=>teacherRequestsApi.list(),[]);const classes=useClasses();
  const [picks,setPicks]=useState({});const [busy,setBusy]=useState('');const [err,setErr]=useState('');
  const toggle=(rid,cid)=>setPicks(p=>{const s=new Set(p[rid]||[]);s.has(cid)?s.delete(cid):s.add(cid);return {...p,[rid]:[...s]}});
  const done=id=>{res.setData(rs=>rs.filter(x=>x.id!==id));refreshCounts()};
  const approve=async r=>{const cs=picks[r.id]||[];setBusy(r.id);setErr('');try{await teacherRequestsApi.approve(r.id,cs);done(r.id);toast(`${prof(r).first_name} approved${cs.length?` and assigned ${cs.length} ${cs.length===1?'class':'classes'}`:''}`)}catch(e){setErr(e.message)}finally{setBusy('')}};
  const reject=async r=>{const p=prof(r);if(!(await confirm({title:`Reject ${p.first_name}'s request?`,body:`${name(p)} won't get an account. They can send a new request later if needed.`,label:'Reject request',danger:true})))return;setBusy(r.id);setErr('');try{await teacherRequestsApi.reject(r.id);done(r.id);toast('Request rejected')}catch(e){setErr(e.message)}finally{setBusy('')}};
  return <div className="enter" style={{maxWidth:980}}>
    <PageHead title="Teacher Requests" desc="People who've asked for a teacher account. Approving creates their account; you can assign classes at the same time."/>
    <Alert style={{marginBottom:16}}>{err}</Alert>
    {res.loading?<div className="card"><Loading/></div>:res.data.length===0?<div className="card"><Empty icon="userplus" title="No pending requests" body="New teacher sign-ups will appear here for approval."/></div>:
    <div className="col" style={{gap:16}}>{res.data.map(r=>{const p=prof(r);const cs=picks[r.id]||[];const msg=r.application_note||p.application_note;return <article key={r.id} className="card">
      <div className="card-b" style={{padding:'22px 24px'}}>
        <div className="row wrap" style={{gap:14,marginBottom:16}}>
          <Av p={p} size="lg" tone="g"/>
          <div className="grow"><div className="row" style={{gap:10}}><h3 style={{margin:0,font:'600 22px/1.2 var(--display)'}}>{name(p)}</h3><Badge s="Pending"/></div><div className="sub" style={{marginTop:2}}>Requested {H.fmt(String(p.created_at||r.created_at||'').slice(0,10))}{p.username&&<> · username <span className="mono">{p.username}</span></>}</div></div>
        </div>
        <dl className="kv" style={{gridTemplateColumns:'130px minmax(0,1fr)'}}>
          <dt>Email</dt><dd>{p.email?<a href={`mailto:${p.email}`}>{p.email}</a>:'—'}</dd>
          <dt>Phone</dt><dd className="mono sm-t">{p.phone||'—'}</dd>
          <dt>Qualifications</dt><dd>{r.qualification||'—'}</dd>
        </dl>
        {msg&&<blockquote style={{margin:'16px 0 0',padding:'12px 16px',borderRadius:14,background:'#f6f3e2',fontFamily:'var(--display)',fontSize:16.5,lineHeight:1.5,fontStyle:'italic'}}>“{msg}”</blockquote>}
        <div style={{marginTop:18}}><div className="lab" style={{marginBottom:10}}>Assign classes</div>
          {classes.data.filter(c=>c.active).length===0?<div className="hint">No classes exist yet. You can assign classes later from the teacher&apos;s record.</div>:
          <div className="row wrap" style={{gap:8}}>{classes.data.filter(c=>c.active).map(c=><label key={c.id} className={`cpill${cs.includes(c.id)?' on':''}`}><input type="checkbox" checked={cs.includes(c.id)} onChange={()=>toggle(r.id,c.id)}/>{clsName(c)}</label>)}</div>}
        </div>
      </div>
      <div className="row wrap" style={{padding:'14px 24px',borderTop:'1px solid var(--line2)',justifyContent:'flex-end'}}>
        <button className="btn danger" disabled={busy===r.id} onClick={()=>reject(r)}>Reject</button>
        <button className="btn pri" disabled={busy===r.id} onClick={()=>approve(r)}><Ico n="check" s={16}/>{cs.length?`Approve and assign ${cs.length} ${cs.length===1?'class':'classes'}`:'Approve'}</button>
      </div>
    </article>})}</div>}
  </div>;
}
