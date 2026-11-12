'use client';
// Huda — Homework + Assessments
import React,{useState}from'react';
import{assessmentsApi,homeworkApi,studentsApi}from'../../lib/api/resources';
import{useApiResource}from'../useApiResource';
import{listAll,sStatus,useClasses}from'./data';
import{Alert,Av,Chips,ClassPill,Diamond,Empty,Field,H,Ico,Listing,Loading,PageHead,Panel,PanelHead,clsName,name,today,useUI}from'./ui';

const dueText=d=>{if(!d)return'No due date';const n=H.days(today(),d);return n<0?`${-n} ${n===-1?'day':'days'} ago`:n===0?'Today':n===1?'Tomorrow':`In ${n} days`};
const useClassKids=classId=>useApiResource(()=>classId?listAll(studentsApi.list,{class_id:classId}):Promise.resolve({data:[]}),[classId]);

function HWForm({h,classes,onSave,onCancel}){
  const [f,setF]=useState({title:h.title||'',class_id:h.class_id||classes[0]?.id||'',description:h.description||'',due_date:h.due_date||'',instructions:h.instructions||''});const [t,setT]=useState(false);const [busy,setBusy]=useState(false);const [err,setErr]=useState('');
  const s=k=>e=>setF({...f,[k]:e.target.value});
  const e={title:!f.title.trim(),due:!f.due_date,cls:!f.class_id};
  const submit=async()=>{setT(true);if(e.title||e.due||e.cls)return;setBusy(true);setErr('');try{await onSave({...f,title:f.title.trim()})}catch(x){setErr(x.message)}finally{setBusy(false)}};
  return <div className="col" style={{gap:16}}>
    <Alert>{err}</Alert>
    <Field label="Title" req error={t&&e.title?'Give the homework a title':''}><input className={`inp${t&&e.title?' bad':''}`} value={f.title} onChange={s('title')} placeholder="e.g. Surah Al-Mulk, ayat 1–10"/></Field>
    <div className="g2">
      <Field label="Class" req error={t&&e.cls?'Choose a class':''}><select className="sel" value={f.class_id} onChange={s('class_id')} disabled={!!h.id}>{classes.map(c=><option key={c.id} value={c.id}>{clsName(c)}</option>)}</select></Field>
      <Field label="Due date" req error={t&&e.due?'Choose a due date':''}><input className={`inp${t&&e.due?' bad':''}`} type="date" value={f.due_date} onChange={s('due_date')}/></Field>
    </div>
    <Field label="Description" hint="One line — shown in the homework list"><input className="inp" value={f.description} onChange={s('description')}/></Field>
    <Field label="Instructions" opt hint="What students and parents need to know"><textarea className="ta" value={f.instructions} onChange={s('instructions')}/></Field>
    <div className="row" style={{justifyContent:'flex-end'}}><button className="btn" onClick={onCancel}>Cancel</button><button className="btn pri" disabled={busy} onClick={submit}>{busy?'Saving…':'Save homework'}</button></div>
  </div>;
}

export function Homework(){
  const {params,toast}=useUI();
  const classes=useClasses();const active=classes.data.filter(c=>c.active);
  const res=useApiResource(async()=>{
    const hw=await listAll(homeworkApi.list,{sort:'due_date',direction:'desc'});
    const subs=await Promise.all(hw.data.map(h=>homeworkApi.submissions(h.id).then(r=>r.data||[]).catch(()=>[])));
    return{data:hw.data.map((h,i)=>({...h,subs:subs[i]}))};
  },[]);
  const [cf,setCf]=useState('all');const [sel,setSel]=useState(params?.id||null);
  const list=res.data.filter(h=>cf==='all'||h.class_id===cf).sort((a,b)=>String(b.due_date||'').localeCompare(a.due_date||''));
  const h=sel&&sel!=='new'&&res.data.find(x=>x.id===sel);
  const cls=id=>classes.data.find(c=>c.id===id);
  return <div className="enter">
    <PageHead title="Homework" desc="Set homework for a class and track who has handed it in."><button className="btn pri" onClick={()=>setSel('new')} disabled={!active.length}><Ico n="plus" s={16}/>New homework</button></PageHead>
    <div className={`split${sel==='new'||h?' has':''}`}>
      <div className="card">
        <div className="toolbar"><Chips value={cf} onChange={setCf} options={[['all','All classes'],...active.map(c=>[c.id,c.name])]}/><span className="count">{list.length} set</span></div>
        <Listing res={res} count={list.length} empty="No homework set" emptyIcon="pencil" emptyBody="Homework you set will appear here.">
          <div className="tscroll"><table className="tbl click"><thead><tr><th>Homework</th><th className="hide-sm">Class</th><th>Due</th><th className="hide-md">Assigned</th><th className="hide-sm">Handed in</th></tr></thead>
          <tbody>{list.map(x=>{const done=x.subs.filter(s=>s.status!=='Not completed').length;const n=x.due_date?H.days(today(),x.due_date):null;const tot=Math.max(x.subs.length,0);return <tr key={x.id} className={sel===x.id?'sel':''} onClick={()=>setSel(x.id)} tabIndex={0} onKeyDown={e=>{if(e.key==='Enter')setSel(x.id)}}>
            <td><div style={{fontWeight:500}}>{x.title}</div><div className="sub">{x.description}</div></td>
            <td className="hide-sm"><ClassPill c={cls(x.class_id)}/></td>
            <td><div className="sm-t" style={{fontWeight:500,color:n==null||n<0?'var(--muted)':n<=1?'var(--warn-ink)':'var(--ink)'}}>{H.fmtS(x.due_date)}</div><div className="sub">{dueText(x.due_date)}</div></td>
            <td className="hide-md sm-t muted">{H.fmtS(x.assigned_date)}</td>
            <td className="hide-sm" style={{width:140}}><div className="bar" style={{height:6}}><i style={{width:`${tot?done/tot*100:0}%`}}></i></div><div className="sub" style={{marginTop:4}}>{done} marked</div></td>
          </tr>})}</tbody></table></div>
        </Listing>
      </div>
      {sel==='new'&&<Panel key="new" onClose={()=>setSel(null)}>
        <PanelHead onClose={()=>setSel(null)} avatar={<span className="av lg g"><Ico n="pencil" s={22}/></span>} title="New homework" sub="Every student in the class appears on the submissions list."/>
        <div className="p-b" style={{borderTop:'1px solid var(--line2)'}}><HWForm h={{}} classes={active} onCancel={()=>setSel(null)} onSave={async f=>{const r=await homeworkApi.create({...f,assigned_date:today()});res.setData(rs=>[{...r.data,subs:[]},...rs]);toast('Homework set');setSel(r.data.id)}}/></div>
      </Panel>}
      {h&&<Panel key={h.id} onClose={()=>setSel(null)}><HWPanel h={h} c={cls(h.class_id)} classes={active} onClose={()=>setSel(null)} onChange={patch=>res.setData(rs=>rs.map(x=>x.id===h.id?{...x,...patch}:x))}/></Panel>}
    </div>
  </div>;
}
function HWPanel({h,c,classes,onClose,onChange}){
  const {toast}=useUI();const [edit,setEdit]=useState(false);const [err,setErr]=useState('');
  const kids=useClassKids(h.class_id);
  const status=id=>h.subs.find(s=>s.student_id===id)?.status||'Not completed';
  const list=kids.data.filter(s=>sStatus(s)==='Active'||h.subs.some(x=>x.student_id===s.id)).sort((a,b)=>String(a.first_name).localeCompare(b.first_name));
  const cnt=k=>list.filter(s=>status(s.id)===k).length;
  const setStatus=async(sid,v)=>{setErr('');try{const r=await homeworkApi.updateSubmission(h.id,sid,{status:v});const subs=[...h.subs.filter(x=>x.student_id!==sid),r.data||{student_id:sid,status:v}];onChange({subs})}catch(e){setErr(e.message)}};
  return <>
    <PanelHead onClose={onClose} avatar={<span className="av lg g"><Ico n="pencil" s={22}/></span>} title={h.title} sub={`${clsName(c)} · due ${H.fmt(h.due_date)}`}/>
    <div className="p-b" style={{borderTop:'1px solid var(--line2)'}}>
      {edit?<HWForm h={h} classes={classes} onCancel={()=>setEdit(false)} onSave={async f=>{const{class_id,...rest}=f;const r=await homeworkApi.update(h.id,{...rest,due_date:rest.due_date||null});onChange(r.data);setEdit(false);toast('Homework updated')}}/>:<>
        <dl className="kv"><dt>Assigned</dt><dd>{H.fmt(h.assigned_date)}</dd><dt>Due</dt><dd>{H.fmt(h.due_date)} <span className="muted">· {dueText(h.due_date)}</span></dd><dt>Description</dt><dd>{h.description||'—'}</dd></dl>
        {h.instructions&&<div className="flat" style={{marginTop:14,fontSize:13.5,lineHeight:1.55}}><div className="lab" style={{marginBottom:6}}>Instructions</div>{h.instructions}</div>}
        <button className="btn sm" style={{marginTop:14}} onClick={()=>setEdit(true)}><Ico n="pencil" s={14}/>Edit homework</button>
        <Diamond/>
        <div className="row" style={{marginBottom:10}}><span className="lab grow">Submissions</span><span className="sub">{cnt('Completed')} done · {cnt('Late')} late · {cnt('Not completed')} outstanding</span></div>
        <Alert style={{marginBottom:10}}>{err}</Alert>
        {kids.loading?<Loading/>:list.length===0?<Empty icon="user" title="No students in this class"/>:<div className="card" style={{boxShadow:'none'}}>{list.map(s=>{const v=status(s.id);return <div key={s.id} className="list-row" style={{padding:'9px 12px'}}>
          <Av p={s} size="sm"/><span className="nm grow" style={{fontSize:15.5}}>{name(s)}</span>
          <select className="sel" style={{width:150,height:34,fontSize:13,borderRadius:10,color:v==='Completed'?'var(--good)':v==='Late'?'var(--warn-ink)':'var(--muted)'}} value={v} onChange={e=>setStatus(s.id,e.target.value)} aria-label={`Status for ${s.first_name}`}>
            {['Not completed','Completed','Late'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>})}</div>}
      </>}
    </div>
  </>;
}

/* ---------- Assessments ---------- */
const avg=x=>x.results.length?Math.round(x.results.reduce((s,r)=>s+Number(r.score||0),0)/x.results.length*10)/10:null;
export function Assessments(){
  const {toast}=useUI();
  const classes=useClasses();const active=classes.data.filter(c=>c.active);
  const res=useApiResource(async()=>{
    const as=await listAll(assessmentsApi.list,{sort:'date',direction:'desc'});
    const rs=await Promise.all(as.data.map(a=>assessmentsApi.results(a.id).then(r=>r.data||[]).catch(()=>[])));
    return{data:as.data.map((a,i)=>({...a,results:rs[i]}))};
  },[]);
  const [sel,setSel]=useState(null);
  const list=[...res.data].sort((a,b)=>String(b.assessment_date).localeCompare(a.assessment_date));
  const a=sel&&sel!=='new'&&res.data.find(x=>x.id===sel);
  const cls=id=>classes.data.find(c=>c.id===id);
  return <div className="enter">
    <PageHead title="Assessments" desc="Tests and recitation checks, with a score and grade for each student."><button className="btn pri" onClick={()=>setSel('new')} disabled={!active.length}><Ico n="plus" s={16}/>New assessment</button></PageHead>
    <div className={`split${sel==='new'||a?' has':''}`}>
      <div className="card"><Listing res={res} count={list.length} empty="No assessments yet" emptyIcon="award" emptyBody="Create an assessment to start recording results.">
        <div className="tscroll"><table className="tbl click"><thead><tr><th>Assessment</th><th className="hide-sm">Class</th><th className="hide-md">Date</th><th>Average</th><th>Grade</th></tr></thead>
        <tbody>{list.map(x=>{const m=avg(x);const max=Number(x.maximum_score)||null;return <tr key={x.id} className={sel===x.id?'sel':''} onClick={()=>setSel(x.id)} tabIndex={0} onKeyDown={e=>{if(e.key==='Enter')setSel(x.id)}}>
          <td><div style={{fontWeight:500}}>{x.assessment_name}</div><div className="sub">{x.results.length} results</div></td>
          <td className="hide-sm"><ClassPill c={cls(x.class_id)}/></td><td className="hide-md sm-t muted">{H.fmt(x.assessment_date)}</td>
          <td><span className="serif" style={{fontSize:19}}>{m??'—'}</span>{max&&<span className="sub"> / {max}</span>}</td>
          <td>{m!=null&&max&&<span className="serif" style={{fontSize:21}}>{H.grade(m/max*100)}</span>}</td>
        </tr>})}</tbody></table></div>
      </Listing></div>
      {sel==='new'&&<Panel key="new" onClose={()=>setSel(null)}><NewAssessment classes={active} onClose={()=>setSel(null)} onSave={async(f,r)=>{const made=await assessmentsApi.create(f);const results=[];if(r){const x=await assessmentsApi.createResult(made.data.id,r);results.push(x.data)}res.setData(rs=>[{...made.data,results},...rs]);toast('Assessment created');setSel(made.data.id)}}/></Panel>}
      {a&&<Panel key={a.id} onClose={()=>setSel(null)}><AssessPanel a={a} c={cls(a.class_id)} onClose={()=>setSel(null)} onAdded={row=>res.setData(rs=>rs.map(x=>x.id===a.id?{...x,results:[...x.results,row]}:x))}/></Panel>}
    </div>
  </div>;
}
function ResultInputs({kids,max,r,setR}){
  const pct=r.score!==''&&max?(+r.score/+max*100):null;
  return <div className="g3" style={{gridTemplateColumns:'minmax(0,2fr) minmax(0,1fr) minmax(0,1fr)'}}>
    <Field label="Student"><select className="sel" value={r.student_id} onChange={e=>setR({...r,student_id:e.target.value})}><option value="">Choose…</option>{kids.map(s=><option key={s.id} value={s.id}>{name(s)}</option>)}</select></Field>
    <Field label={`Score / ${max||'?'}`} error={r.score!==''&&max&&+r.score>+max?'Over max':''}><input className="inp" type="number" min="0" max={max} value={r.score} onChange={e=>{const v=e.target.value;setR({...r,score:v,grade:v!==''&&max?H.grade(+v/+max*100):r.grade})}}/></Field>
    <Field label="Grade" hint={pct!=null?`${Math.round(pct)}%`:''}><select className="sel" value={r.grade} onChange={e=>setR({...r,grade:e.target.value})}>{['','A','B','C','D'].map(g=><option key={g} value={g}>{g||'—'}</option>)}</select></Field>
  </div>;
}
function NewAssessment({classes,onClose,onSave}){
  const [f,setF]=useState({name:'',classId:classes[0]?.id||'',date:today(),max:'20'});const [r,setR]=useState({student_id:'',score:'',grade:''});const [t,setT]=useState(false);const [busy,setBusy]=useState(false);const [err,setErr]=useState('');
  const kids=useClassKids(f.classId);const s=k=>e=>setF({...f,[k]:e.target.value});
  const submit=async()=>{setT(true);if(!f.name.trim()||!+f.max||!f.classId)return;setBusy(true);setErr('');
    try{await onSave({assessment_name:f.name.trim(),class_id:f.classId,assessment_date:f.date,maximum_score:+f.max},r.student_id&&r.score!==''?{student_id:r.student_id,score:+r.score,grade:r.grade||undefined}:null)}catch(x){setErr(x.message)}finally{setBusy(false)}};
  return <>
    <PanelHead onClose={onClose} avatar={<span className="av lg g"><Ico n="award" s={22}/></span>} title="New assessment"/>
    <div className="p-b" style={{borderTop:'1px solid var(--line2)'}}><div className="col" style={{gap:16}}>
      <Alert>{err}</Alert>
      <Field label="Assessment name" req error={t&&!f.name.trim()?'Give it a name':''}><input className={`inp${t&&!f.name.trim()?' bad':''}`} value={f.name} onChange={s('name')} placeholder="e.g. Juz 'Amma recitation check"/></Field>
      <Field label="Class" req><select className="sel" value={f.classId} onChange={s('classId')}>{classes.map(c=><option key={c.id} value={c.id}>{clsName(c)}</option>)}</select></Field>
      <div className="g2"><Field label="Date"><input className="inp" type="date" value={f.date} onChange={s('date')}/></Field><Field label="Maximum score" req error={t&&!+f.max?'Enter a maximum':''}><input className="inp" type="number" min="1" value={f.max} onChange={s('max')}/></Field></div>
      <div className="flat"><div className="lab" style={{marginBottom:12}}>First result · optional</div><ResultInputs kids={kids.data.filter(k=>sStatus(k)==='Active')} max={f.max} r={r} setR={setR}/></div>
    </div>
    <div className="row" style={{marginTop:20,justifyContent:'flex-end'}}><button className="btn" onClick={onClose}>Cancel</button><button className="btn pri" disabled={busy} onClick={submit}>{busy?'Creating…':'Create assessment'}</button></div></div>
  </>;
}
function AssessPanel({a,c,onClose,onAdded}){
  const {toast}=useUI();
  const kids=useClassKids(a.class_id);const max=Number(a.maximum_score)||null;
  const [r,setR]=useState({student_id:'',score:'',grade:''});const [busy,setBusy]=useState(false);const [err,setErr]=useState('');
  const done=new Set(a.results.map(x=>x.student_id));
  const left=kids.data.filter(s=>sStatus(s)==='Active'&&!done.has(s.id));
  const stu=id=>kids.data.find(s=>s.id===id);
  const rows=[...a.results].sort((p,q)=>Number(q.score)-Number(p.score));
  const add=async()=>{setBusy(true);setErr('');try{const x=await assessmentsApi.createResult(a.id,{student_id:r.student_id,score:+r.score,grade:r.grade||(max?H.grade(+r.score/max*100):undefined)});onAdded(x.data);setR({student_id:'',score:'',grade:''});toast('Result added')}catch(e){setErr(e.message)}finally{setBusy(false)}};
  return <>
    <PanelHead onClose={onClose} avatar={<span className="av lg g"><Ico n="award" s={22}/></span>} title={a.assessment_name} sub={[clsName(c),H.fmt(a.assessment_date),max&&`out of ${max}`].filter(Boolean).join(' · ')}/>
    <div className="p-b" style={{borderTop:'1px solid var(--line2)'}}>
      <div className="lab" style={{marginBottom:10}}>Results · {rows.length}</div>
      <div className="card" style={{boxShadow:'none'}}>{rows.length===0&&<Empty icon="award" title="No results yet"/>}{rows.map(x=>{const s=stu(x.student_id);return <div key={x.student_id} className="list-row" style={{padding:'9px 14px'}}>
        <Av p={s} size="sm"/><span className="nm grow" style={{fontSize:15.5}}>{s?name(s):'Student'}</span><span className="mono sm-t">{x.score??'—'}{max?`/${max}`:''}</span><span className="serif" style={{fontSize:20,width:24,textAlign:'right'}}>{x.grade||''}</span>
      </div>})}</div>
      {kids.loading?<Loading/>:left.length>0&&<div className="flat" style={{marginTop:16}}>
        <div className="lab" style={{marginBottom:12}}>Add result</div>
        <Alert style={{marginBottom:12}}>{err}</Alert>
        <ResultInputs kids={left} max={max} r={r} setR={setR}/>
        <div className="row" style={{justifyContent:'flex-end',marginTop:12}}><button className="btn sm pri" disabled={busy||!r.student_id||r.score===''||(max&&+r.score>max)} onClick={add}>{busy?'Adding…':'Add result'}</button></div>
      </div>}
    </div>
  </>;
}
