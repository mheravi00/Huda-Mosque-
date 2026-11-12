'use client';
// Huda — Student reports (list, details panel, PDF preview) + Report requests
import React,{useEffect,useState}from'react';
import{attendanceApi,reportRequestsApi,reportsApi,studentsApi}from'../../lib/api/resources';
import{listAllAttendanceRows}from'../attendance-register';
import{useApiResource}from'../useApiResource';
import{listAll,useClasses,useStudents}from'./data';
import{attStats}from'./students';
import{Alert,Av,Badge,Chips,ClassPill,Empty,Field,H,Ico,Listing,Loading,Menu,Modal,PageHead,Panel,PanelHead,SearchBox,Seg,clsName,name,studentClass,toD,today,useUI}from'./ui';

const STEPS=['Draft','Submitted','Under Review','Approved','Sent'];
const stepIdx=s=>s==='Changes Requested'?2:STEPS.indexOf(s);
const sName=r=>r.student?name(r.student):'Student';
const sClass=r=>r.student?studentClass(r.student):null;

export function Reports(){
  const {role,params,search}=useUI();const admin=role==='admin';
  const res=useApiResource(()=>listAll(reportsApi.list,{sort:'created_at',direction:'desc'}),[]);
  const [q,setQ]=useState(search||'');useEffect(()=>{if(search)setQ(search)},[search]);
  const [st,setSt]=useState('All');const [sel,setSel]=useState(params?.id||null);const [creating,setCreating]=useState(!!params?.new);
  const ST=['All','Draft','Submitted','Under Review','Changes Requested','Approved','Sent'];
  const ql=q.trim().toLowerCase();
  const list=res.data.filter(r=>(st==='All'||r.status===st)&&(!ql||`${sName(r)} ${r.student?.student_id||''} ${r.report_period}`.toLowerCase().includes(ql))).sort((a,b)=>String(b.created_at).localeCompare(a.created_at));
  const r=sel&&res.data.find(x=>x.id===sel);
  const patch=row=>res.setData(rs=>rs.map(x=>x.id===row.id?{...x,...row}:x));
  return <div className="enter">
    <PageHead title={admin?'Student Reports':'Reports'} desc={admin?'Teachers draft and submit reports. The office reviews, approves and sends them to parents.':'Write reports for your students and submit them to the office for review.'}>
      {!admin&&<button className="btn pri" onClick={()=>setCreating(true)}><Ico n="plus" s={16}/>New report</button>}
    </PageHead>
    <div className={`split${r?' has':''}`}>
      <div className="card">
        <div className="toolbar"><SearchBox value={q} onChange={setQ} placeholder="Search by student or period"/><span className="count">{list.length} reports</span></div>
        <div className="toolbar" style={{paddingTop:10,paddingBottom:10}}><Chips value={st} onChange={setSt} options={ST.map(k=>[k,k,res.data.filter(x=>k==='All'||x.status===k).length])}/></div>
        <Listing res={res} count={list.length} empty="No reports found" emptyIcon="file" emptyBody={st!=='All'?`No reports are ${st.toLowerCase()} right now.`:admin?'Reports appear here once teachers create them.':'Start a new report for one of your students.'}>
          <div className="tscroll"><table className="tbl click"><thead><tr><th>Student</th><th className="hide-sm">Period</th><th>Status</th><th className="hide-md">{admin?'Teacher':'Created'}</th></tr></thead>
          <tbody>{list.map(x=><tr key={x.id} className={sel===x.id?'sel':''} onClick={()=>setSel(x.id)} tabIndex={0} onKeyDown={e=>{if(e.key==='Enter')setSel(x.id)}}>
            <td><div className="who"><Av p={x.student} sel={sel===x.id}/><div style={{minWidth:0}}><div className="nm">{sName(x)}</div><div className="sub"><span className="mono">{x.student?.student_id||''}</span><span className="show-inline-sm"> · {x.report_period}</span></div></div></div></td>
            <td className="hide-sm sm-t">{x.report_period}</td><td><Badge s={x.status}/></td>
            <td className="hide-md sm-t muted">{admin?(x.teacher?name(x.teacher):'—'):H.fmt(x.created_at)}</td>
          </tr>)}</tbody></table></div>
        </Listing>
      </div>
      {r&&<Panel key={r.id} onClose={()=>setSel(null)}><ReportPanel r={r} onClose={()=>setSel(null)} patch={patch}/></Panel>}
    </div>
    {creating&&<NewReport onClose={()=>setCreating(false)} onMade={row=>{res.setData(rs=>[row,...rs]);setCreating(false);setSel(row.id)}}/>}
  </div>;
}

function NewReport({onClose,onMade}){
  const {role}=useUI();
  const students=useStudents(role);const classes=useClasses();
  const kids=students.data.filter(s=>String(s.status).toLowerCase()==='active').sort((a,b)=>String(a.first_name).localeCompare(b.first_name));
  const [sid,setSid]=useState('');const [period,setPeriod]=useState('');const [t,setT]=useState(false);const [busy,setBusy]=useState(false);const [err,setErr]=useState('');
  const create=async()=>{setT(true);if(!sid||!period.trim())return;setBusy(true);setErr('');
    try{const r=await reportsApi.create({student_id:sid,report_period:period.trim()});const stu=kids.find(k=>k.id===sid);onMade({...r.data,student:stu})}catch(e){setErr(e.message)}finally{setBusy(false)}};
  const sugg=['Autumn term 2026',`${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][new Date().getMonth()]} 2026`];
  return <Modal title="New report" desc="Pick the student and the period this report covers. It starts as a draft only you can see." onClose={onClose}
    foot={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn pri" disabled={busy} onClick={create}>{busy?'Creating…':'Create draft'}</button></>}>
    <Alert style={{marginBottom:14}}>{err}</Alert>
    <div className="col" style={{gap:16}}>
      <Field label="Student" req error={t&&!sid?'Choose a student':''}><select className={`sel${t&&!sid?' bad':''}`} value={sid} onChange={e=>setSid(e.target.value)} disabled={students.loading}><option value="">{students.loading?'Loading…':'Choose a student…'}</option>{kids.map(s=><option key={s.id} value={s.id}>{name(s)}{studentClass(s)?` — ${studentClass(s).name}`:''}</option>)}</select></Field>
      <Field label="Report period" req error={t&&!period.trim()?'Enter the period':''}><input className={`inp${t&&!period.trim()?' bad':''}`} value={period} onChange={e=>setPeriod(e.target.value)} placeholder="e.g. November 2026"/></Field>
      <div className="row wrap" style={{gap:6,marginTop:-6}}>{sugg.map(x=><button key={x} className="chip" style={{height:28,fontSize:12}} onClick={()=>setPeriod(x)}>{x}</button>)}</div>
    </div>
  </Modal>;
}

function Tracker({status}){const i=stepIdx(status);const cr=status==='Changes Requested';return <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',margin:'4px 0 0'}}>
  {STEPS.map((s,k)=>{const done=k<i||(k===i&&status==='Sent');const cur=k===i;const col=cur&&cr?'var(--warn)':done||cur?'var(--ink)':'var(--line)';return <div key={s} style={{position:'relative',textAlign:'center'}}>
    {k>0&&<span style={{position:'absolute',top:10,right:'50%',width:'100%',height:2,background:k<=i?'var(--ink)':'var(--line)'}}></span>}
    <span style={{position:'relative',display:'inline-grid',placeItems:'center',width:22,height:22,borderRadius:'50%',background:done?'var(--ink)':cur?(cr?'var(--warn-bg)':'var(--gold-soft)'):'var(--card)',border:`2px solid ${col}`,color:done?'#faf8e9':col}}>{done?<Ico n="check" s={12} w={2.4}/>:<span style={{width:6,height:6,borderRadius:'50%',background:cur?col:'transparent'}}></span>}</span>
    <div style={{fontSize:11,marginTop:6,lineHeight:1.2,color:cur?'var(--ink)':'var(--muted)',fontWeight:cur?600:400}}>{cur&&cr?'Changes':s}</div>
  </div>})}
</div>;}

const SUMMARY=[['progress','Progress'],['strengths','Strengths'],['areas_for_improvement','Areas for improvement'],['behaviour','Behaviour'],['targets','Targets']];
function ReportPanel({r,onClose,patch}){
  const {role,toast,confirm}=useUI();const admin=role==='admin';
  const s=r.student;const c=sClass(r);
  const sections=useApiResource(()=>reportsApi.sections(r.id),[r.id]);
  const att=useApiResource(()=>s?listAllAttendanceRows(attendanceApi.list,{student_id:s.id,sort:'date',direction:'desc'}):Promise.resolve({data:[]}),[s?.id]);
  const a=attStats(att.data);
  const editable=!admin&&['Draft','Changes Requested'].includes(r.status);
  const [pdf,setPdf]=useState(false);const [rc,setRc]=useState(false);const [editSum,setEditSum]=useState(false);const [sum,setSum]=useState(null);
  const [editSec,setEditSec]=useState(null);const [nt,setNt]=useState({title:'',body:''});const [err,setErr]=useState('');const [busy,setBusy]=useState(false);
  const transition=async(status,msg,extra)=>{setErr('');try{const res=await reportsApi.update(r.id,{status,...extra});patch(res.data);toast(msg)}catch(e){setErr(e.message)}};
  const submit=async()=>{if(!sections.data.some(x=>x.content?.trim())){toast('Add some teacher comments before submitting');return}transition('Submitted','Submitted for review')};
  const saveSummary=async()=>{setBusy(true);setErr('');try{const res=await reportsApi.update(r.id,sum);patch(res.data);setEditSum(false);toast('Summary saved')}catch(e){setErr(e.message)}finally{setBusy(false)}};
  const addSection=async()=>{if(!nt.title.trim())return;setBusy(true);setErr('');try{await reportsApi.createSection(r.id,{section_name:nt.title.trim(),content:nt.body});setNt({title:'',body:''});await sections.refresh();toast('Section added')}catch(e){setErr(e.message)}finally{setBusy(false)}};
  const saveSection=async x=>{setBusy(true);setErr('');try{const res=await reportsApi.updateSection(r.id,x.id,{section_name:editSec.title.trim(),content:editSec.body});sections.setData(rows=>rows.map(z=>z.id===x.id?res.data:z));setEditSec(null);toast('Section saved')}catch(e){setErr(e.message)}finally{setBusy(false)}};
  const delSection=async x=>{if(!(await confirm({title:`Delete “${x.section_name}”?`,body:'This section will be removed from the report.',label:'Delete section',danger:true})))return;try{await reportsApi.removeSection(r.id,x.id);sections.setData(rows=>rows.filter(z=>z.id!==x.id));toast('Section deleted')}catch(e){setErr(e.message)}};
  return <>
    <PanelHead onClose={onClose} avatar={<Av p={s} sel size="lg"/>} title={sName(r)} sub={`${r.report_period} · ${c?c.name:'No class'}`}/>
    <div className="p-b" style={{borderTop:'1px solid var(--line2)'}}>
      <div className="row" style={{marginBottom:16}}><Badge s={r.status}/><span className="sub">Created {H.fmt(r.created_at)}{r.teacher?` by ${name(r.teacher)}`:''}</span></div>
      <Tracker status={r.status}/>
      {r.status==='Changes Requested'&&<div className="alert warn" style={{marginTop:16}}><Ico n="alert" s={17}/><div><b>{admin?'Sent back to the teacher.':'Please revise and resubmit.'}</b>{r.review_note&&<div style={{marginTop:4}}>“{r.review_note}”</div>}</div></div>}
      <Alert style={{marginTop:16}}>{err}</Alert>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginTop:20}}>
        <div className="mstat" style={{padding:'10px 12px'}}><div className="lab" style={{fontSize:11}}>Attendance</div><div className="v" style={{fontSize:24}}>{att.loading?'…':a.pct==null?'—':`${a.pct}%`}</div></div>
        <div className="mstat" style={{padding:'10px 12px'}}><div className="lab" style={{fontSize:11}}>Grade</div><div className="v" style={{fontSize:24}}>{r.grade||'—'}</div></div>
        <div className="mstat" style={{padding:'10px 12px'}}><div className="lab" style={{fontSize:11}}>Score</div><div className="v" style={{fontSize:24}}>{r.score||'—'}</div></div>
      </div>

      <div className="p-sec"><div className="row" style={{marginBottom:10}}><span className="lab grow">Summary</span>{editable&&!editSum&&<button className="btn sm ghost" onClick={()=>{setSum({grade:r.grade||'',score:r.score||'',...Object.fromEntries(SUMMARY.map(([k])=>[k,r[k]||'']))});setEditSum(true)}}><Ico n="pencil" s={14}/>Edit</button>}</div>
        {editSum?<div className="col" style={{gap:12}}>
          <div className="g2"><Field label="Grade"><select className="sel" value={sum.grade} onChange={e=>setSum({...sum,grade:e.target.value})}>{['','A','B','C','D'].map(g=><option key={g} value={g}>{g||'—'}</option>)}</select></Field><Field label="Score"><input className="inp" value={sum.score} onChange={e=>setSum({...sum,score:e.target.value})} placeholder="e.g. 82%"/></Field></div>
          {SUMMARY.map(([k,l])=><Field key={k} label={l}><textarea className="ta" style={{minHeight:64}} value={sum[k]} onChange={e=>setSum({...sum,[k]:e.target.value})}/></Field>)}
          <div className="row" style={{justifyContent:'flex-end'}}><button className="btn sm" onClick={()=>setEditSum(false)}>Cancel</button><button className="btn sm pri" disabled={busy} onClick={saveSummary}>Save summary</button></div>
        </div>:<dl className="kv" style={{gridTemplateColumns:'130px minmax(0,1fr)'}}>{SUMMARY.map(([k,l])=><React.Fragment key={k}><dt>{l}</dt><dd style={{lineHeight:1.5}}>{r[k]||<span className="muted">—</span>}</dd></React.Fragment>)}</dl>}
      </div>

      <div className="p-sec"><span className="lab">Report sections</span>
        {sections.loading?<Loading/>:<div className="col" style={{gap:10}}>{sections.data.map(x=>editSec&&editSec.id===x.id?<div key={x.id} className="flat col" style={{gap:10,background:'#fff'}}>
          <input className="inp" value={editSec.title} onChange={e=>setEditSec({...editSec,title:e.target.value})} aria-label="Section title"/>
          <textarea className="ta" value={editSec.body} onChange={e=>setEditSec({...editSec,body:e.target.value})} aria-label="Section content"/>
          <div className="row" style={{justifyContent:'flex-end'}}><button className="btn sm" onClick={()=>setEditSec(null)}>Cancel</button><button className="btn sm pri" disabled={!editSec.title.trim()||busy} onClick={()=>saveSection(x)}>Save</button></div>
        </div>:<div key={x.id} className="flat" style={{background:'#fff'}}>
          <div className="row" style={{alignItems:'flex-start'}}><h4 className="serif grow" style={{margin:'0 0 6px',fontWeight:600,fontSize:19}}>{x.section_name}</h4>
            {editable&&<Menu button={tg=><button className="btn icon sm ghost" onClick={tg} aria-label="Section options"><Ico n="dots" s={16}/></button>}>
              <button className="mi" onClick={()=>setEditSec({id:x.id,title:x.section_name,body:x.content||''})}><Ico n="pencil" s={15}/>Edit section</button>
              <button className="mi bad" onClick={()=>delSection(x)}><Ico n="trash" s={15}/>Delete section</button>
            </Menu>}
          </div>
          <div style={{fontSize:14,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{x.content||<span className="muted">Nothing written yet.</span>}</div>
        </div>)}{sections.data.length===0&&!editable&&<div className="sub">No sections written yet.</div>}</div>}
        {editable&&<div className="flat col" style={{gap:10,marginTop:12,borderStyle:'dashed'}}>
          <div className="lab">Add a section</div>
          <input className="inp" value={nt.title} onChange={e=>setNt({...nt,title:e.target.value})} placeholder="Section title, e.g. Qur'an & Tajweed"/>
          <textarea className="ta" style={{minHeight:80}} value={nt.body} onChange={e=>setNt({...nt,body:e.target.value})} placeholder="What would you like parents to know?"/>
          <button className="btn sm" style={{alignSelf:'flex-end'}} disabled={!nt.title.trim()||busy} onClick={addSection}><Ico n="plus" s={14}/>Add</button>
        </div>}
      </div>

      <div className="row wrap" style={{marginTop:24,paddingTop:16,borderTop:'1px solid var(--line2)',gap:8}}>
        <button className="btn" onClick={()=>setPdf(true)}><Ico n="download" s={15}/>PDF</button>
        <span className="grow"></span>
        {editable&&<button className="btn pri" onClick={submit}><Ico n="send" s={15}/>Submit for review</button>}
        {admin&&r.status==='Submitted'&&<button className="btn pri" onClick={()=>transition('Under Review','Review started')}>Start review</button>}
        {admin&&r.status==='Under Review'&&<><button className="btn" onClick={()=>setRc(true)}>Request changes</button><button className="btn pri" onClick={()=>transition('Approved','Report approved')}><Ico n="check" s={15}/>Approve</button></>}
        {admin&&r.status==='Approved'&&<button className="btn pri" onClick={()=>transition('Sent',`Marked as sent to ${s?s.first_name:'the'} family`)}><Ico n="send" s={15}/>Mark as sent</button>}
      </div>
    </div>
    {pdf&&<ReportPDF r={r} sections={sections.data} att={a} onClose={()=>setPdf(false)}/>}
    {rc&&<RequestChanges onClose={()=>setRc(false)} onSend={note=>{setRc(false);transition('Changes Requested',`Sent back to ${r.teacher?r.teacher.first_name:'the teacher'}`,{review_note:note})}}/>}
  </>;
}

function RequestChanges({onClose,onSend}){
  const [n,setN]=useState('');
  return <Modal title="Request changes" desc="Tell the teacher what needs fixing. They'll see this note on the report." onClose={onClose} foot={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn pri" disabled={!n.trim()} onClick={()=>onSend(n.trim())}>Send back to teacher</button></>}>
    <Field label="Note for the teacher" req><textarea className="ta" value={n} onChange={e=>setN(e.target.value)} autoFocus placeholder="e.g. Please add a target for Surah Al-Mulk revision."/></Field>
  </Modal>;
}

function ReportPDF({r,sections,att,onClose}){
  const {toast}=useUI();const s=r.student;const c=s?studentClass(s):null;const [busy,setBusy]=useState(false);const [err,setErr]=useState('');
  const generate=async()=>{setBusy(true);setErr('');try{const{data}=await reportsApi.pdf(r.id);const url=data.signed_url||data.signedUrl;if(url){window.open(url,'_blank','noopener,noreferrer');toast('PDF generated')}onClose()}catch(e){setErr(e.message)}finally{setBusy(false)}};
  return <Modal size="lg" title="Report preview" desc="This is how the PDF will look." onClose={onClose} foot={<><button className="btn" onClick={onClose}>Close</button><button className="btn pri" disabled={busy} onClick={generate}><Ico n="download" s={15}/>{busy?'Generating…':'Download PDF'}</button></>}>
    <Alert style={{marginBottom:14}}>{err}</Alert>
    <div style={{background:'#ecebdf',padding:18,borderRadius:16}}>
      <div style={{background:'#fff',borderRadius:6,padding:'36px 40px',boxShadow:'0 2px 10px rgba(0,0,0,.08)',fontSize:13,color:'#1f2a20'}}>
        <div className="row" style={{alignItems:'flex-start',borderBottom:'2px solid var(--ink)',paddingBottom:16}}>
          <div className="mark" style={{background:'var(--ink)',width:44,height:44,fontSize:26}}>H</div>
          <div className="grow"><div className="serif" style={{fontSize:22,lineHeight:1.1}}>Huda Tarbiyah Madrasa</div><div className="sub">Student progress report</div></div>
          <div style={{textAlign:'right'}}><div className="lab">Student report</div><div className="serif" style={{fontSize:16}}>{r.report_period}</div></div>
        </div>
        <div className="g3" style={{margin:'18px 0',gap:12}}>
          <div><div className="lab">Student</div><div className="serif" style={{fontSize:18}}>{sName(r)}</div><div className="sub mono">{s?.student_id}</div></div>
          <div><div className="lab">Class</div><div>{clsName(c)}</div></div>
          <div><div className="lab">Teacher</div><div>{r.teacher?name(r.teacher):'—'}</div></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',border:'1px solid var(--line)',borderRadius:8,marginBottom:18}}>
          {[['Attendance',att.pct!=null?att.pct+'%':'—',`${att.attended} of ${att.total} sessions`],['Grade',r.grade||'—',''],['Score',r.score||'—','']].map(([k,v,sub],i)=><div key={k} style={{padding:'10px 14px',borderLeft:i?'1px solid var(--line)':0}}><div className="lab">{k}</div><div className="serif" style={{fontSize:24}}>{v}</div>{sub&&<div className="sub">{sub}</div>}</div>)}
        </div>
        {SUMMARY.filter(([k])=>r[k]).map(([k,l])=><div key={k} style={{display:'grid',gridTemplateColumns:'150px 1fr',gap:12,padding:'7px 0',borderBottom:'1px solid var(--line2)'}}><b style={{fontWeight:600}}>{l}</b><span>{r[k]}</span></div>)}
        {sections.map(x=><div key={x.id} style={{marginTop:16}}><div className="serif" style={{fontSize:17,marginBottom:4}}>{x.section_name}</div><div style={{lineHeight:1.6,whiteSpace:'pre-wrap'}}>{x.content}</div></div>)}
        <div className="diamond" style={{margin:'26px 0 14px'}}><i></i></div>
        <div className="row" style={{justifyContent:'space-between',fontSize:12}}><span className="muted">Huda Tarbiyah Madrasa</span><span className="muted">Issued {H.fmt(today())}</span></div>
      </div>
    </div>
  </Modal>;
}

/* ---------- Report requests ---------- */
export function ReportRequests(){
  const {role,go,toast}=useUI();const admin=role==='admin';
  const res=useApiResource(()=>listAll(reportRequestsApi.list),[]);const classes=useClasses();
  const [sel,setSel]=useState(null);
  const cls=id=>classes.data.find(c=>c.id===id);
  const cur=sel==='new'?{id:'new',report_type:'Monthly',report_period:'',deadline:'',class_id:classes.data[0]?.id||'',status:'Open'}:sel&&res.data.find(x=>x.id===sel);
  const left=d=>{if(!d)return'';const n=H.days(today(),d);return n<0?'Passed':n===0?'Due today':`${n} days left`};
  const list=[...res.data].sort((a,b)=>String(b.deadline||'').localeCompare(a.deadline||''));
  if(!admin){const open=list.filter(q=>q.status==='Open'||q.status==='Assigned');const past=list.filter(q=>!open.includes(q));return <div className="enter" style={{maxWidth:900}}>
    <PageHead title="Report Requests" desc="Reporting deadlines set by the office for your classes."/>
    <Listing res={res} count={list.length} empty="No deadlines right now" emptyIcon="clock" emptyBody="When the office asks for reports, they'll appear here.">
      {open.length>0&&<div className="col" style={{gap:12}}>{open.map(q=>{const c=cls(q.class_id);const n=q.deadline?H.days(today(),q.deadline):null;return <div key={q.id} className="card"><div className="card-b row wrap" style={{gap:16}}>
        <div className="datebox" style={n!=null&&n<=7?{background:'var(--warn-bg)',borderColor:'#ead6b0'}:null}><span>{H.fmtDay(q.deadline).slice(0,3)}</span><b>{q.deadline?toD(q.deadline).getDate():'—'}</b></div>
        <div className="grow"><div className="nm">{q.report_type} reports · {q.report_period}</div><div className="sub">{clsName(c)} · due {H.fmtL(q.deadline)} · {left(q.deadline)}</div></div>
        <Badge s={q.status}/><button className="btn pri sm" onClick={()=>go('reports',{new:1})}>Write reports</button>
      </div></div>})}</div>}
      {past.length>0&&<><div className="lab" style={{margin:'26px 0 10px'}}>Earlier</div><div className="card">{past.map(q=><div key={q.id} className="list-row"><div className="grow"><div style={{fontWeight:500}}>{q.report_type} · {q.report_period}</div><div className="sub">{clsName(cls(q.class_id))} · was due {H.fmt(q.deadline)}</div></div><Badge s={q.status}/></div>)}</div></>}
    </Listing>
  </div>;}
  return <div className="enter">
    <PageHead title="Report Requests" desc="Set reporting cycles for each class. Teachers see these as deadlines on their dashboard."><button className="btn pri" onClick={()=>setSel('new')} disabled={!classes.data.length}><Ico n="plus" s={16}/>New request</button></PageHead>
    <div className={`split${cur?' has':''}`}>
      <div className="card"><Listing res={res} count={list.length} empty="No report requests" emptyIcon="clock" emptyBody="Create a reporting cycle for a class.">
        <div className="tscroll"><table className="tbl click"><thead><tr><th>Period</th><th className="hide-sm">Type</th><th>Class</th><th>Deadline</th><th>Status</th></tr></thead>
        <tbody>{list.map(q=><tr key={q.id} className={sel===q.id?'sel':''} onClick={()=>setSel(q.id)}>
          <td><div style={{fontWeight:500}}>{q.report_period}</div></td><td className="hide-sm"><span className="pill">{q.report_type}</span></td><td><ClassPill c={cls(q.class_id)}/></td>
          <td className="sm-t">{H.fmt(q.deadline)}<div className="sub">{left(q.deadline)}</div></td><td><Badge s={q.status}/></td>
        </tr>)}</tbody></table></div>
      </Listing></div>
      {cur&&<Panel key={cur.id} onClose={()=>setSel(null)}><RRForm q={cur} classes={classes.data} onClose={()=>setSel(null)} onSave={async v=>{const r=cur.id==='new'?await reportRequestsApi.create(v):await reportRequestsApi.update(cur.id,v);res.setData(rs=>cur.id==='new'?[r.data,...rs]:rs.map(x=>x.id===cur.id?r.data:x));toast(cur.id==='new'?'Report request created':'Report request saved');setSel(null)}}/></Panel>}
    </div>
  </div>;
}
function RRForm({q,classes,onClose,onSave}){
  const [f,setF]=useState({report_type:q.report_type,report_period:q.report_period||'',deadline:q.deadline||'',class_id:q.class_id||'',status:q.status||'Open'});const [t,setT]=useState(false);const [busy,setBusy]=useState(false);const [err,setErr]=useState('');
  const isNew=q.id==='new';
  const submit=async()=>{setT(true);if(!f.report_period.trim()||!f.deadline)return;setBusy(true);setErr('');
    try{const body=isNew?{class_id:f.class_id||null,report_period:f.report_period.trim(),report_type:f.report_type,deadline:f.deadline}:{...f,report_period:f.report_period.trim()};await onSave(body)}catch(e){setErr(e.message)}finally{setBusy(false)}};
  return <>
    <PanelHead onClose={onClose} avatar={<span className="av lg g"><Ico n="clock" s={22}/></span>} title={isNew?'New report request':q.report_period} sub={isNew?'Teachers of the class are notified':clsName(classes.find(c=>c.id===q.class_id))}/>
    <div className="p-b" style={{borderTop:'1px solid var(--line2)'}}><div className="col" style={{gap:16}}>
      <Alert>{err}</Alert>
      <Field label="Type"><Seg value={f.report_type} options={['Weekly','Monthly']} onChange={v=>setF({...f,report_type:v})}/></Field>
      <Field label="Period" req error={t&&!f.report_period.trim()?'Enter a period':''}><input className={`inp${t&&!f.report_period.trim()?' bad':''}`} value={f.report_period} onChange={e=>setF({...f,report_period:e.target.value})} placeholder={f.report_type==='Weekly'?'e.g. Week of 16 Nov':'e.g. December 2026'}/></Field>
      <div className="g2"><Field label="Deadline" req error={t&&!f.deadline?'Choose a date':''}><input className={`inp${t&&!f.deadline?' bad':''}`} type="date" value={f.deadline} onChange={e=>setF({...f,deadline:e.target.value})}/></Field>
      {!isNew&&<Field label="Status"><select className="sel" value={f.status} onChange={e=>setF({...f,status:e.target.value})}>{['Open','Assigned','Completed','Closed'].map(s=><option key={s}>{s}</option>)}</select></Field>}</div>
      <Field label="Class"><select className="sel" value={f.class_id} onChange={e=>setF({...f,class_id:e.target.value})}><option value="">All classes</option>{classes.map(c=><option key={c.id} value={c.id}>{clsName(c)}</option>)}</select></Field>
    </div>
    <div className="row" style={{marginTop:20,justifyContent:'flex-end'}}><button className="btn" onClick={onClose}>Cancel</button><button className="btn pri" disabled={busy} onClick={submit}>{busy?'Saving…':'Save'}</button></div></div>
  </>;
}
