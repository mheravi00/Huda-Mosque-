'use client';
// Huda — Students list + details panel
import React,{useEffect,useState}from'react';
import{attendanceApi,reportsApi,studentsApi}from'../../lib/api/resources';
import{listAllAttendanceRows}from'../attendance-register';
import{useApiResource}from'../useApiResource';
import{useClasses,useStudents,sStatus}from'./data';
import{BehaviourTab}from'./behaviour';
import{Av,Badge,ClassPill,Chips,Diamond,Empty,H,Ico,Listing,Loading,PageHead,Pager,Panel,PanelHead,SearchBox,Seg,Tabs,clsName,genderLabel,name,studentClass,studentLink,useUI}from'./ui';

// Attendance totals for a list of attendance rows (newest first).
export function attStats(rows){
  const t={Present:0,Late:0,Absent:0,Excused:0};rows.forEach(r=>{if(t[r.status]!=null)t[r.status]++});
  const total=t.Present+t.Late+t.Absent+t.Excused;
  return{...t,total,attended:t.Present+t.Late,pct:total?Math.round((t.Present+t.Late)/total*100):null};
}
export const attTone=p=>p==null?'':p>=90?'good':p>=80?'warn':'bad';

// Distinct age brackets from the classes, for the age-group filter.
const ageGroups=classes=>{const seen=new Map();classes.forEach(c=>{if(c.min_age!=null)seen.set(`${c.min_age}-${c.max_age}`,[c.min_age,c.max_age])});return [...seen.entries()].sort((a,b)=>a[1][0]-b[1][0])};

export function Students(){
  const {role,go,params,search,toast}=useUI();const admin=role==='admin';
  const all=useStudents(role,{archived:admin});const classes=useClasses();
  const [q,setQ]=useState(search||'');useEffect(()=>{if(search)setQ(search)},[search]);
  const [st,setSt]=useState('All');const [cls,setCls]=useState('all');const [gender,setGender]=useState('all');const [group,setGroup]=useState('all');const [page,setPage]=useState(0);
  const [sel,setSel]=useState(params?.id||null);
  const [picked,setPicked]=useState(()=>new Set());
  useEffect(()=>setPage(0),[q,st,cls,gender,group]);
  const rows=all.data;
  const n=k=>rows.filter(s=>k==='All'||sStatus(s)===k).length;
  const ql=q.trim().toLowerCase();
  const grp=group==='all'?null:group.split('-').map(Number);
  const inGroup=s=>{if(!grp)return true;const a=H.age(s.date_of_birth);return a!=null&&a>=grp[0]&&a<=grp[1]};
  const list=rows.filter(s=>(st==='All'||sStatus(s)===st)&&(cls==='all'||studentClass(s)?.id===cls)&&(gender==='all'||String(s.gender).toLowerCase()===gender)&&inGroup(s)&&(!ql||`${s.first_name} ${s.last_name} ${s.student_id}`.toLowerCase().includes(ql)))
    .sort((a,b)=>String(a.last_name).localeCompare(b.last_name)||String(a.first_name).localeCompare(b.first_name));
  const pageRows=list.slice(page*25,page*25+25);
  const s=sel&&rows.find(x=>x.id===sel);
  const statuses=admin?['All','Active','Inactive','Archived']:['All','Active','Inactive'];
  const groups=ageGroups(classes.data);
  const toggle=(id,e)=>{e.stopPropagation();setPicked(p=>{const nx=new Set(p);nx.has(id)?nx.delete(id):nx.add(id);return nx})};
  const pagePicked=pageRows.length>0&&pageRows.every(r=>picked.has(r.id));
  const togglePage=()=>setPicked(p=>{const nx=new Set(p);if(pagePicked)pageRows.forEach(r=>nx.delete(r.id));else pageRows.forEach(r=>nx.add(r.id));return nx});
  // For a bulk transfer, send the picked students; if they share one class, preselect it as the source.
  const bulkTransfer=()=>{const ids=[...picked];const srcIds=new Set(ids.map(id=>studentClass(rows.find(r=>r.id===id))?.id).filter(Boolean));go('transfer',{classId:srcIds.size===1?[...srcIds][0]:undefined,ids})};

  return <div className="enter">
    <PageHead title="Students" desc={admin?'Everyone enrolled at the madrasa. Select a student to see their attendance, guardians and reports.':'Students in your classes. Select a student to see their attendance and reports.'}>
      {admin&&<button className="btn pri" onClick={()=>go('student-add')}><Ico n="plus" s={16}/>Add student</button>}
    </PageHead>
    <div className={`split${s?' has':''}`}>
      <div>
        {picked.size>0&&<div className="bulkbar">
          <b style={{fontWeight:600}}>{picked.size} selected</b>
          <button className="btn gold sm" onClick={bulkTransfer}><Ico n="swap" s={15}/>Transfer</button>
          <button className="btn ghost sm" style={{color:'#faf8e9',marginLeft:'auto'}} onClick={()=>setPicked(new Set())}>Clear</button>
        </div>}
        <div className="card">
        <div className="toolbar">
          <SearchBox value={q} onChange={setQ} placeholder="Search by name or ID"/>
          <Seg value={gender} options={[['all','All'],['male','Boys'],['female','Girls']]} onChange={setGender}/>
          {groups.length>0?(<select className="sel" style={{width:'auto',height:38,borderRadius:99,minWidth:130}} value={group} onChange={e=>setGroup(e.target.value)} aria-label="Filter by age group">
            <option value="all">All ages</option>
            {groups.map(([k])=><option key={k} value={k}>Ages {k}</option>)}
          </select>):null}
          <select className="sel" style={{width:'auto',height:38,borderRadius:99,minWidth:150}} value={cls} onChange={e=>setCls(e.target.value)} aria-label="Filter by class">
            <option value="all">All classes</option>
            {classes.data.map(c=><option key={c.id} value={c.id}>{clsName(c)}</option>)}
          </select>
          <span className="count">{list.length} {list.length===1?'student':'students'}</span>
        </div>
        <div className="toolbar" style={{paddingTop:10,paddingBottom:10}}>
          <Chips value={st} onChange={setSt} options={statuses.map(k=>[k,k,n(k)])}/>
        </div>
        <Listing res={all} count={list.length} empty="No students found" emptyBody={q?`Nothing matches “${q}”. Try a different name or ID.`:'No students match these filters.'}>
          <div className="tscroll"><table className="tbl click">
            <thead><tr><th className="cb"><input type="checkbox" checked={pagePicked} onChange={togglePage} aria-label="Select all on this page"/></th><th>Student</th><th>Class</th><th className="hide-sm">Age</th><th>Status</th><th className="hide-md">Enrolled</th></tr></thead>
            <tbody>{pageRows.map(x=><tr key={x.id} className={sel===x.id?'sel':''} onClick={()=>setSel(x.id)} tabIndex={0} onKeyDown={e=>{if(e.key==='Enter')setSel(x.id)}}>
              <td className="cb" onClick={e=>e.stopPropagation()}><input type="checkbox" checked={picked.has(x.id)} onChange={e=>toggle(x.id,e)} aria-label={`Select ${name(x)}`}/></td>
              <td><div className="who"><Av p={x} sel={sel===x.id}/><div style={{minWidth:0}}><div className="nm">{x.first_name} {x.last_name}</div><div className="sub">{x.student_id}</div></div></div></td>
              <td><ClassPill c={studentClass(x)}/>{studentLink(x)?.override_reason&&<span className="badge warn plain hide-md" style={{marginLeft:6,height:20,fontSize:11}}>Override</span>}</td>
              <td className="hide-sm">{H.age(x.date_of_birth)??'—'}</td>
              <td><Badge s={sStatus(x)}/></td>
              <td className="hide-md muted">{H.fmt(x.enrolment_date)}</td>
            </tr>)}</tbody>
          </table></div>
          <Pager page={page} setPage={setPage} total={list.length}/>
        </Listing>
        </div>
      </div>
      {s&&<Panel key={s.id} onClose={()=>setSel(null)}><StudentPanel s={s} onClose={()=>setSel(null)} onChanged={patch=>all.setData(rs=>rs.map(r=>r.id===s.id?{...r,...patch}:r))}/></Panel>}
    </div>
  </div>;
}

function StudentPanel({s,onClose,onChanged}){
  const {role,go,confirm,toast}=useUI();const admin=role==='admin';
  const [tab,setTab]=useState('overview');
  const c=studentClass(s);const link=studentLink(s);
  const att=useApiResource(()=>listAllAttendanceRows(attendanceApi.list,{student_id:s.id,sort:'date',direction:'desc'}),[s.id]);
  const reps=useApiResource(()=>reportsApi.list({student_id:s.id,limit:50,sort:'created_at',direction:'desc'}),[s.id]);
  const gl=useApiResource(()=>studentsApi.guardians(s.id),[s.id]);
  const a=attStats(att.data);const tone=attTone(a.pct);
  const hist=[...att.data].sort((x,y)=>String(y.attendance_date).localeCompare(x.attendance_date));
  const gs=gl.data.map(x=>x.guardians).filter(Boolean);
  const status=sStatus(s);
  const remove=async()=>{
    const ok=await confirm({title:`Remove ${s.first_name} from enrolment?`,body:`${name(s)} will be archived. Their attendance and reports are kept, and you can restore them later from the Archived filter.`,label:'Remove from enrolment',danger:true});
    if(!ok)return;
    try{await studentsApi.admin.remove(s.id);onChanged({status:'archived'});toast(`${s.first_name} has been archived`)}catch(e){toast(e.message)}
  };
  const restore=async()=>{try{await studentsApi.admin.update(s.id,{status:'active'});onChanged({status:'active'});toast(`${s.first_name} restored to active`)}catch(e){toast(e.message)}};
  return <>
    <PanelHead onClose={onClose} avatar={<Av p={s} sel size="lg"/>} title={name(s)}
      sub={<>{clsName(c)} · <span className="mono">{s.student_id}</span></>}
      extra={<div className="row" style={{gap:6,marginTop:8}}><Badge s={status}/>{link?.override_reason&&<Badge s="Override"/>}</div>}/>
    <Tabs value={tab} onChange={setTab} tabs={[['overview','Overview'],['attendance','Attendance'],['behaviour','Behaviour'],['reports','Reports',reps.loading?null:reps.data.length]]}/>
    <div className="p-b">
      {tab==='overview'&&<>
        <div className="mini">
          <div className="mstat"><div className="lab">Attendance</div><div className="v" style={{color:tone?`var(--${tone})`:'var(--muted)'}}>{att.loading?'…':a.pct==null?'—':a.pct+'%'}</div><div className="sub">{a.total?`${a.attended} of ${a.total} sessions`:'No sessions yet'}</div></div>
          <div className="mstat"><div className="lab">Last report</div>{reps.data[0]?<><div className="serif" style={{fontSize:17,margin:'6px 0 6px',lineHeight:1.2}}>{reps.data[0].report_period}</div><Badge s={reps.data[0].status}/></>:<div className="sub" style={{marginTop:8}}>{reps.loading?'…':'None yet'}</div>}</div>
        </div>
        <div className="p-sec"><span className="lab">Parents & guardians</span>
          {gl.loading?<div className="sub">Loading…</div>:<div className="col" style={{gap:8}}>{gs.length===0&&<div className="sub">No guardian linked.</div>}{gs.map((g,i)=><div key={g.id} className="linkrow">
            <Av p={g} size="sm"/><div className="grow"><div style={{fontWeight:500}}>{name(g)}</div><div className="sub">{i===0?'Primary contact':''}{i===0&&g.relationship?' · ':''}{g.relationship}</div></div>
            {g.email&&<a className="btn icon sm" href={`mailto:${g.email}`} title={g.email} aria-label={`Email ${g.first_name}`}><Ico n="mail" s={15}/></a>}
            {g.phone&&<a className="btn icon sm" href={`tel:${String(g.phone).replace(/\s/g,'')}`} title={g.phone} aria-label={`Call ${g.first_name}`}><Ico n="phone" s={15}/></a>}
          </div>)}</div>}
        </div>
        <div className="p-sec"><span className="lab">Details</span>
          <dl className="kv">
            <dt>Age</dt><dd>{H.age(s.date_of_birth)??'—'}</dd>
            <dt>Date of birth</dt><dd>{H.fmt(s.date_of_birth)}</dd>
            <dt>Gender</dt><dd>{genderLabel(s.gender)}</dd>
            <dt>Enrolled</dt><dd>{H.fmt(s.enrolment_date)}</dd>
            <dt>Address</dt><dd>{s.address||'—'}</dd>
            {link?.override_reason&&<><dt>Placement</dt><dd className="sm-t">{link.override_reason}</dd></>}
          </dl>
        </div>
        <div className="p-sec"><span className="lab">Quick actions</span>
          <div className="qa">
            <button className="btn sm" onClick={()=>setTab('reports')}><Ico n="file" s={15}/>Reports</button>
            <button className="btn sm" onClick={()=>setTab('attendance')}><Ico n="checksq" s={15}/>Attendance</button>
            {admin&&<button className="btn sm" onClick={()=>go('student-edit',{id:s.id})}><Ico n="pencil" s={15}/>Edit details</button>}
            {gs.find(g=>g.email)&&<a className="btn sm" href={`mailto:${gs.find(g=>g.email).email}?subject=${encodeURIComponent(`About ${name(s)}`)}`}><Ico n="mail" s={15}/>Message parent</a>}
          </div>
        </div>
        {admin&&<><Diamond/>
          {status==='Archived'?<button className="btn block" onClick={restore}><Ico n="refresh" s={15}/>Restore to active</button>
          :<button className="btn danger block" onClick={remove}><Ico n="archive" s={15}/>Remove from enrolment</button>}
        </>}
      </>}
      {tab==='attendance'&&(att.loading?<Loading/>:<>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
          {[['Present','good'],['Late','warn'],['Absent','bad'],['Excused','gold']].map(([k,t])=><div key={k} className="mstat" style={{padding:'10px 12px'}}><div className="lab" style={{fontSize:11}}>{k}</div><div className="v" style={{fontSize:26,color:`var(--${t==='gold'?'gold-ink':t})`}}>{a[k]}</div></div>)}
        </div>
        <div style={{margin:'18px 0 6px'}} className="row"><span className="grow sm-t muted">Attended {a.attended} of {a.total} sessions</span><b className="serif" style={{fontSize:20,fontWeight:500}}>{a.pct==null?'—':a.pct+'%'}</b></div>
        <div className="bar"><i style={{width:`${a.pct||0}%`,background:`var(--${tone||'good'})`}}></i></div>
        <div className="p-sec"><span className="lab">History</span>
          {hist.length===0?<div className="sub">No registers recorded yet.</div>:<div className="card" style={{boxShadow:'none'}}>{hist.map(h=><div key={h.id} className="list-row" style={{padding:'10px 14px'}}>
            <div className="grow"><div style={{fontWeight:500}}>{H.fmtL(h.attendance_date)}</div>{h.class_id===c?.id&&<div className="sub">{clsName(c)}</div>}</div><Badge s={h.status}/>
          </div>)}</div>}
        </div>
      </>)}
      {tab==='behaviour'&&<BehaviourTab student={s}/>}
      {tab==='reports'&&(reps.loading?<Loading/>:reps.data.length===0?<Empty icon="file" title="No reports yet" body={`Reports written for ${s.first_name} will appear here.`}/>:
        <div className="card" style={{boxShadow:'none'}}>{reps.data.map(r=><div key={r.id} className="list-row click" style={{padding:'12px 14px'}} onClick={()=>go('reports',{id:r.id})}>
          <div className="grow"><div className="serif" style={{fontSize:16.5}}>{r.report_period}</div><div className="sub">Created {H.fmt(r.created_at)}{r.teacher?` · ${name(r.teacher)}`:''}</div></div><Badge s={r.status}/><Ico n="chevr" s={15} style={{color:'var(--muted)'}}/>
        </div>)}</div>)}
    </div>
  </>;
}
