'use client';
// Huda — Behaviour log: strike entries per student, a student-panel tab and a full log page.
import React,{useState}from'react';
import{behaviourApi}from'../../lib/api/resources';
import{useApiResource}from'../useApiResource';
import{useClasses,useStudents}from'./data';
import{Alert,Av,BEHAVIOUR,Badge,Chips,Empty,Field,H,Ico,Listing,Loading,Menu,Modal,PageHead,SearchBox,Seg,Sw,behaviourMeta,clsName,name,studentClass,today,useUI}from'./ui';

const CODECLASS={'RFC':'s1','CWP':'s2','CWT':'s3','E/R':'ac'};
export const StrikeCode=({code})=><span className={`bh-code ${CODECLASS[code]||''}`} title={behaviourMeta(code)[1]}>{code}</span>;

// Shared add/edit form (as a modal).
function BehaviourForm({entry,student,students,classes,onClose,onSaved}){
  const edit=!!entry?.id;
  const [f,setF]=useState({student_id:student?.id||entry?.student_id||'',class_id:entry?.class_id||(student?studentClass(student)?.id:'')||'',code:entry?.code||'RFC',reason:entry?.reason||'',incident_date:entry?.incident_date||today(),comment:entry?.comment||'',flagged:entry?.flagged||false});
  const [t,setT]=useState(false);const [busy,setBusy]=useState(false);const [err,setErr]=useState('');
  const e={student:!f.student_id,reason:!f.reason.trim()};
  const save=async()=>{setT(true);if(e.student||e.reason)return;setBusy(true);setErr('');
    try{
      const body={class_id:f.class_id||null,code:f.code,reason:f.reason.trim(),incident_date:f.incident_date,comment:f.comment.trim()||null,flagged:f.flagged};
      const r=edit?await behaviourApi.update(entry.id,body):await behaviourApi.create(f.student_id,body);
      onSaved(r.data);onClose();
    }catch(x){setErr(x.message)}finally{setBusy(false)}};
  return <Modal title={edit?'Edit behaviour entry':'New behaviour entry'} desc={student?name(student):'Record an incident and the action taken.'} onClose={onClose}
    foot={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn pri" disabled={busy} onClick={save}>{busy?'Saving…':edit?'Save entry':'Add entry'}</button></>}>
    <Alert style={{marginBottom:14}}>{err}</Alert>
    <div className="col" style={{gap:16}}>
      {!student&&<Field label="Student" req error={t&&e.student?'Choose a student':''}><select className={`sel${t&&e.student?' bad':''}`} value={f.student_id} onChange={ev=>{const s=students.find(x=>x.id===ev.target.value);setF({...f,student_id:ev.target.value,class_id:s?studentClass(s)?.id||'':f.class_id})}}><option value="">Choose a student…</option>{students.map(s=><option key={s.id} value={s.id}>{name(s)}{studentClass(s)?` — ${studentClass(s).name}`:''}</option>)}</select></Field>}
      <div className="g2">
        <Field label="Action / strike"><select className="sel" value={f.code} onChange={ev=>setF({...f,code:ev.target.value})}>{BEHAVIOUR.map(([c,m,s])=><option key={c} value={c}>{c} — {m} ({s})</option>)}</select></Field>
        <Field label="Date"><input className="inp" type="date" value={f.incident_date} max={today()} onChange={ev=>setF({...f,incident_date:ev.target.value})}/></Field>
      </div>
      <Field label="Class"><select className="sel" value={f.class_id} onChange={ev=>setF({...f,class_id:ev.target.value})}><option value="">—</option>{classes.map(c=><option key={c.id} value={c.id}>{clsName(c)}</option>)}</select></Field>
      <Field label="Reason" req error={t&&e.reason?'Enter a reason':''}><input className={`inp${t&&e.reason?' bad':''}`} value={f.reason} onChange={ev=>setF({...f,reason:ev.target.value})} placeholder="e.g. Constant disruption"/></Field>
      <Field label="Comment" opt><textarea className="ta" value={f.comment} onChange={ev=>setF({...f,comment:ev.target.value})} placeholder="Any detail the office or team should know"/></Field>
      <label className="check"><input type="checkbox" checked={f.flagged} onChange={ev=>setF({...f,flagged:ev.target.checked})}/><span>Highlight in red<span className="hint" style={{display:'block'}}>Marks this as a serious incident that needs attention.</span></span></label>
    </div>
  </Modal>;
}

// Rows list used in the panel tab and the full page.
function BehaviourRows({rows,classes,onEdit,onDel,showStudent}){
  const cls=id=>classes.find(c=>c.id===id);
  return <div className="card" style={{boxShadow:'none'}}>
    <div className="tscroll"><table className="tbl"><thead><tr>{showStudent&&<th>Student</th>}<th>Strike</th><th>Reason</th><th className="hide-sm">Class</th><th>Date</th><th></th></tr></thead>
      <tbody>{rows.map(x=><tr key={x.id} className={`bh-row${x.flagged||x.code==='E/R'?' flag':''}`}>
        {showStudent&&<td><div className="who"><Av p={x.students}/><div style={{minWidth:0}}><div className="nm">{name(x.students)}</div><div className="sub">{x.students?.student_id}</div></div></div></td>}
        <td><StrikeCode code={x.code}/></td>
        <td><div style={{fontWeight:500}}>{x.reason}</div>{x.comment&&<div className="sub">{x.comment}</div>}</td>
        <td className="hide-sm sm-t">{x.classes?x.classes.name+(x.classes.section?' '+x.classes.section:''):'—'}</td>
        <td className="sm-t">{H.fmt(x.incident_date)}</td>
        <td className="r"><Menu button={tg=><button className="btn icon sm ghost" onClick={tg} aria-label="Entry options"><Ico n="dots" s={16}/></button>}>
          <button className="mi" onClick={()=>onEdit(x)}><Ico n="pencil" s={15}/>Edit entry</button>
          <button className="mi bad" onClick={()=>onDel(x)}><Ico n="trash" s={15}/>Delete entry</button>
        </Menu></td>
      </tr>)}</tbody></table></div>
  </div>;
}

// Used inside the student details panel.
export function BehaviourTab({student}){
  const {toast,confirm}=useUI();const classes=useClasses();
  const res=useApiResource(()=>behaviourApi.forStudent(student.id),[student.id]);
  const [form,setForm]=useState(null);
  const del=async x=>{if(!(await confirm({title:'Delete this entry?',body:'The behaviour entry will be permanently removed.',label:'Delete entry',danger:true})))return;try{await behaviourApi.remove(x.id);res.setData(rs=>rs.filter(y=>y.id!==x.id));toast('Entry deleted')}catch(e){toast(e.message)}};
  const strikes=res.data.filter(x=>x.code!=='E/R').length;
  return <div className="p-sec">
    <div className="row" style={{marginBottom:12}}><span className="grow"><span className="lab">Behaviour</span>{!res.loading&&<div className="sub">{strikes} {strikes===1?'strike':'strikes'} on record</div>}</span><button className="btn sm pri" onClick={()=>setForm({})}><Ico n="plus" s={14}/>Add entry</button></div>
    {res.loading?<Loading/>:res.data.length===0?<Empty icon="shield" title="No behaviour entries" body={`Nothing recorded for ${student.first_name}. Alhamdulillah.`}/>:<BehaviourRows rows={res.data} classes={classes.data} onEdit={setForm} onDel={del}/>}
    {form&&<BehaviourForm entry={form.id?form:null} student={student} classes={classes.data} onClose={()=>setForm(null)} onSaved={()=>res.refresh().catch(()=>{})}/>}
  </div>;
}

// Dedicated page: legend + full log with filters.
export function BehaviourPage(){
  const {role,toast,confirm}=useUI();
  const students=useStudents(role);const classes=useClasses();
  const res=useApiResource(()=>behaviourApi.list(),[]);
  const [q,setQ]=useState('');const [code,setCode]=useState('All');const [form,setForm]=useState(null);
  const ql=q.trim().toLowerCase();
  const list=res.data.filter(x=>(code==='All'||x.code===code)&&(!ql||`${name(x.students)} ${x.students?.student_id||''} ${x.reason}`.toLowerCase().includes(ql)))
    .sort((a,b)=>String(a.students?.last_name||'').localeCompare(b.students?.last_name||'')||String(b.incident_date).localeCompare(a.incident_date));
  const del=async x=>{if(!(await confirm({title:'Delete this entry?',body:'The behaviour entry will be permanently removed.',label:'Delete entry',danger:true})))return;try{await behaviourApi.remove(x.id);res.setData(rs=>rs.filter(y=>y.id!==x.id));toast('Entry deleted')}catch(e){toast(e.message)}};
  const n=c=>c==='All'?res.data.length:res.data.filter(x=>x.code===c).length;
  return <div className="enter">
    <PageHead title="Behaviour Log" desc="Strikes and actions recorded for students. Serious incidents are highlighted in red.">
      <button className="btn pri" onClick={()=>setForm({})}><Ico n="plus" s={16}/>New entry</button>
    </PageHead>
    <div className="card" style={{marginBottom:20}}>
      <div className="card-h"><h3>How strikes work</h3></div>
      <div className="card-b"><div className="bh-leg">
        {BEHAVIOUR.map(([c,m,s])=><div key={c} className="flat"><StrikeCode code={c}/><div><div style={{fontWeight:500}}>{s}</div><div className="sub">{c} · {m}</div></div></div>)}
      </div></div>
    </div>
    <div className="card">
      <div className="toolbar"><SearchBox value={q} onChange={setQ} placeholder="Search student or reason"/><span className="count">{list.length} entries</span></div>
      <div className="toolbar" style={{paddingTop:10,paddingBottom:10}}><Chips value={code} onChange={setCode} options={[['All','All',n('All')],...BEHAVIOUR.map(([c])=>[c,c,n(c)])]}/></div>
      <Listing res={res} count={list.length} empty="No behaviour entries" emptyIcon="shield" emptyBody={q||code!=='All'?'Nothing matches this filter.':'Entries you record will appear here.'}>
        <BehaviourRows rows={list} classes={classes.data} onEdit={setForm} onDel={del} showStudent/>
      </Listing>
    </div>
    {form&&<BehaviourForm entry={form.id?form:null} students={students.data.filter(s=>String(s.status).toLowerCase()==='active')} classes={classes.data} onClose={()=>setForm(null)} onSaved={()=>res.refresh().catch(()=>{})}/>}
  </div>;
}
