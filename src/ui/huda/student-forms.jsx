'use client';
// Huda — Edit student + family form (add student / add guardian)
import React,{useEffect,useMemo,useState}from'react';
import{familiesApi,guardiansApi,notesApi,studentsApi}from'../../lib/api/resources';
import{useApiResource}from'../useApiResource';
import{listAll,useClasses}from'./data';
import{Alert,Av,Badge,Empty,ErrorBox,Field,H,Ico,Loading,LoadError,PageHead,Seg,bracketText,classFor,classWhen,clsName,inBracket,name,useUI}from'./ui';

export const RELS=['Father','Mother','Grandparent','Uncle','Aunt','Guardian'];
const GENDERS=[['male','Male'],['female','Female']];

export function EditStudent(){
  const {params,go}=useUI();const id=params?.id;
  const res=useApiResource(async()=>{
    const[s,links,gl]=await Promise.all([studentsApi.admin.get(id),studentsApi.classes(id),studentsApi.guardians(id)]);
    return{data:[{student:s.data,link:(links.data||[])[0]||null,guardians:(gl.data||[]).map(x=>x.guardians).filter(Boolean)}]};
  },[id]);
  if(!id)return <Empty title="Student not found" action={<button className="btn" onClick={()=>go('students')}>Back to students</button>}/>;
  if(res.loading)return <Loading/>;
  if(res.error||!res.data[0]?.student)return <LoadError message={res.error||'This student may have been removed.'} onRetry={()=>res.refresh().catch(()=>{})}/>;
  return <EditStudentForm {...res.data[0]}/>;
}

function EditStudentForm({student:orig,link,guardians:origGuardians}){
  const {go,confirm,toast,setGuard}=useUI();
  const classes=useClasses();
  const allGuardians=useApiResource(()=>listAll(guardiansApi.admin.list,{sort:'name'}),[]);
  const notes=useApiResource(()=>notesApi.list(orig.id),[orig.id]);
  const init=useMemo(()=>({first:orig.first_name||'',last:orig.last_name||'',dob:orig.date_of_birth||'',gender:String(orig.gender||'').toLowerCase(),address:orig.address||'',enrolled:orig.enrolment_date||'',guardianIds:origGuardians.map(g=>g.id),classId:link?.class_id||null,overrideReason:link?.override_reason||''}),[orig.id]);
  const [f,setF]=useState(init);const [errs,setErrs]=useState([]);const [touched,setTouched]=useState(false);const [saving,setSaving]=useState(false);
  const [showAll,setShowAll]=useState(false);const [linkId,setLinkId]=useState('');
  const known=[...origGuardians,...allGuardians.data];const guard=gid=>known.find(g=>g.id===gid);
  const cls=classes.data;const clsById=cid=>cls.find(c=>c.id===cid);
  const rec=classFor(cls,f.gender,f.dob);
  const [pick,setPick]=useState('');
  useEffect(()=>{if(!showAll)setPick(rec?rec.id:'')},[rec&&rec.id,showAll]);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const dirty=JSON.stringify(f)!==JSON.stringify(init);
  useEffect(()=>{setGuard(dirty?'You have unsaved changes to this student.':null);return()=>setGuard(null)},[dirty]);
  const cur=clsById(f.classId);const outside=!!cur&&!inBracket(cur,f.gender,f.dob);
  const options=cls.filter(c=>c.active&&(showAll||inBracket(c,f.gender,f.dob)));
  const pickOutside=pick&&!inBracket(clsById(pick),f.gender,f.dob);
  const leave=async()=>{if(dirty&&!(await confirm({title:'Discard your changes?',body:"You have unsaved changes to this student. If you leave now they'll be lost.",label:'Discard changes',danger:true})))return;setGuard(null);go('students',{id:orig.id})};
  const save=async()=>{
    const e=[];if(!f.first.trim())e.push('First name is required');if(!f.last.trim())e.push('Last name is required');if(!f.dob)e.push('Date of birth is required');if(!f.gender)e.push('Gender is required');
    const classChanged=f.classId!==init.classId;
    if(classChanged&&outside&&!f.overrideReason.trim())e.push('Give a reason for placing this student outside their bracket');
    setErrs(e);setTouched(true);if(e.length){window.scrollTo({top:0,behavior:'smooth'});return}
    setSaving(true);
    try{
      const patch={};const map={first_name:f.first.trim(),last_name:f.last.trim(),date_of_birth:f.dob,gender:f.gender,address:f.address,enrolment_date:f.enrolled};
      const before={first_name:init.first,last_name:init.last,date_of_birth:init.dob,gender:init.gender,address:init.address,enrolment_date:init.enrolled};
      Object.keys(map).forEach(k=>{if(map[k]!==before[k])patch[k]=map[k]});
      if(Object.keys(patch).length)await studentsApi.admin.update(orig.id,patch);
      for(const gid of init.guardianIds.filter(x=>!f.guardianIds.includes(x)))await studentsApi.unlinkGuardian(orig.id,gid);
      for(const gid of f.guardianIds.filter(x=>!init.guardianIds.includes(x)))await studentsApi.linkGuardian(orig.id,gid);
      if(classChanged){
        if(init.classId)await studentsApi.removeClass(orig.id,init.classId);
        if(f.classId)await studentsApi.assignClass(orig.id,f.classId,outside?f.overrideReason.trim():undefined);
      }
      setGuard(null);toast('Student details saved');go('students',{id:orig.id});
    }catch(x){setErrs([x.message||'The student could not be saved.']);window.scrollTo({top:0,behavior:'smooth'})}
    finally{setSaving(false)}
  };
  const age=H.age(f.dob);
  const gs=f.guardianIds.map(guard).filter(Boolean);
  const others=allGuardians.data.filter(g=>!f.guardianIds.includes(g.id)).sort((a,b)=>String(a.last_name).localeCompare(b.last_name));

  return <div className="enter" style={{maxWidth:1080}}>
    <PageHead back={{label:'Back to students',onClick:leave}} title={`Edit ${orig.first_name} ${orig.last_name}`} desc={<>Student <span className="mono">{orig.student_id}</span> · enrolled {H.fmt(orig.enrolment_date)}. Changes are saved to the student record when you press Save.</>}/>
    <ErrorBox errors={errs}/>
    <div className="formcard">
      <section className="fsec">
        <div className="fsec-h"><div className="fsec-n">01</div><h3>Personal details</h3><p>Name, date of birth and gender decide which class the student belongs in.</p></div>
        <div className="g2">
          <Field label="First name" req error={touched&&!f.first.trim()?'Enter a first name':''}><input className={`inp${touched&&!f.first.trim()?' bad':''}`} value={f.first} onChange={e=>set('first',e.target.value)}/></Field>
          <Field label="Last name" req error={touched&&!f.last.trim()?'Enter a last name':''}><input className={`inp${touched&&!f.last.trim()?' bad':''}`} value={f.last} onChange={e=>set('last',e.target.value)}/></Field>
          <Field label="Date of birth" req hint={age!=null?`Age ${age} today`:'Used to work out the class bracket'}><input className="inp" type="date" value={f.dob} onChange={e=>set('dob',e.target.value)}/></Field>
          <Field label="Gender" req><Seg value={f.gender} options={GENDERS} onChange={v=>set('gender',v)}/></Field>
          <Field label="Address" span><input className="inp" value={f.address} onChange={e=>set('address',e.target.value)} placeholder="House number, street, town, postcode"/></Field>
          <Field label="Enrolment date"><input className="inp" type="date" value={f.enrolled} onChange={e=>set('enrolled',e.target.value)}/></Field>
        </div>
      </section>

      <section className="fsec">
        <div className="fsec-h"><div className="fsec-n">02</div><h3>Guardians</h3><p>The first guardian is the primary contact for messages and reports.</p></div>
        <div className="col" style={{gap:10}}>
          {gs.length===0&&<div className="alert warn"><Ico n="alert" s={17}/>No guardian linked. Link at least one so the office can contact the family.</div>}
          {gs.map((g,i)=><div key={g.id} className="linkrow">
            <Av p={g}/><div className="grow"><div style={{fontWeight:500}}>{name(g)}</div><div className="sub">{[g.relationship,i===0?'Primary contact':null,g.phone].filter(Boolean).join(' · ')}</div></div>
            <button className="btn sm ghost" onClick={async()=>{if(await confirm({title:`Unlink ${g.first_name}?`,body:`${name(g)} will no longer be linked to ${orig.first_name}. Their guardian record isn't deleted.`,label:'Unlink',danger:true}))set('guardianIds',f.guardianIds.filter(x=>x!==g.id))}}><Ico n="unlink" s={15}/>Unlink</button>
          </div>)}
          <div className="row wrap" style={{marginTop:4}}>
            <select className="sel grow" style={{minWidth:220}} value={linkId} onChange={e=>setLinkId(e.target.value)} aria-label="Link an existing guardian" disabled={allGuardians.loading}>
              <option value="">{allGuardians.loading?'Loading guardians…':'Link an existing guardian…'}</option>
              {others.map(g=><option key={g.id} value={g.id}>{g.last_name}, {g.first_name}{g.relationship?` — ${g.relationship}`:''}</option>)}
            </select>
            <button className="btn" disabled={!linkId} onClick={()=>{set('guardianIds',[...f.guardianIds,linkId]);setLinkId('')}}><Ico n="link" s={15}/>Link</button>
          </div>
        </div>
      </section>

      <section className="fsec">
        <div className="fsec-h"><div className="fsec-n">03</div><h3>Class</h3><p>Students are placed by gender and age. Placing someone outside their bracket needs a written reason.</p></div>
        <div className="col" style={{gap:14}}>
          {cur?<div className="linkrow" style={outside?{borderColor:'#ead6b0',background:'#fcf7ea'}:null}>
            <span style={{width:38,height:38,borderRadius:12,background:'var(--gold-soft)',color:'var(--gold-ink)',display:'grid',placeItems:'center',flexShrink:0}}><Ico n="layers" s={18}/></span>
            <div className="grow"><div className="row" style={{gap:8}}><span className="nm">{clsName(cur)}</span>{outside&&<Badge s="Override"/>}</div><div className="sub">{[bracketText(cur),classWhen(cur)].filter(Boolean).join(' · ')}</div></div>
            <button className="btn sm ghost" onClick={()=>set('classId',null)}>Remove</button>
          </div>:classes.loading?<div className="hint">Loading classes…</div>:<div className="alert info"><Ico n="info" s={17}/>Not assigned to a class.</div>}

          {!f.dob?<div className="hint row"><Ico n="info" s={15}/>Set a date of birth to see the recommended bracket.</div>
           :!rec?<div className="alert warn"><Ico n="alert" s={17}/>No class bracket matches this student&apos;s age ({age}). Tick “Show all classes” to place them manually.</div>
           :<div className="hint">Recommended for a {age}-year-old {f.gender==='male'?'boy':'girl'}: <b style={{color:'var(--ink)',fontWeight:500}}>{clsName(rec)}</b></div>}

          <div className="row wrap">
            <select className="sel grow" style={{minWidth:220}} value={pick} onChange={e=>setPick(e.target.value)} aria-label="Assign class">
              <option value="">Choose a class…</option>
              {options.map(c=><option key={c.id} value={c.id}>{clsName(c)}{rec&&c.id===rec.id?' (recommended)':''}</option>)}
            </select>
            <button className="btn" disabled={!pick||pick===f.classId} onClick={()=>set('classId',pick)}>Assign class</button>
          </div>
          <label className="check"><input type="checkbox" checked={showAll} onChange={e=>setShowAll(e.target.checked)}/><span>Show all classes<span className="hint" style={{display:'block'}}>Lets you place a student outside their age or gender bracket.</span></span></label>
          {(outside||(showAll&&pickOutside))&&<Field label="Reason for override" req error={touched&&outside&&f.classId!==init.classId&&!f.overrideReason.trim()?'A reason is required for an override':''} hint="This is shown to admins on the student record and in Bracket Review.">
            <textarea className={`ta${touched&&outside&&!f.overrideReason.trim()?' bad':''}`} style={{minHeight:80}} value={f.overrideReason} onChange={e=>set('overrideReason',e.target.value)} placeholder="e.g. Agreed with parents to stay with a sibling for one term" readOnly={f.classId===init.classId&&!!init.overrideReason}/>
          </Field>}
        </div>
      </section>

      <section className="fsec">
        <div className="fsec-h"><div className="fsec-n">04</div><h3>Notes</h3><p>Written by teachers. Admin-only notes are never shown to teachers.</p></div>
        <div className="col" style={{gap:10}}>
          {notes.loading?<div className="hint">Loading notes…</div>:notes.data.length===0?<div className="hint">No notes about {orig.first_name} yet.</div>:notes.data.map(n=><div key={n.id} className="flat">
            <div className="row" style={{marginBottom:6}}><Badge s={n.visibility}/><span className="sub grow">{H.fmt(n.created_at)}</span></div>
            <div style={{fontSize:14,lineHeight:1.55}}>{n.note}</div>
          </div>)}
        </div>
      </section>
    </div>
    <div className="footbar">
      <span className="dirty grow">{dirty?<><i></i>Unsaved changes</>:'No changes yet'}</span>
      <button className="btn" onClick={leave}>Cancel</button>
      <button className="btn pri" onClick={save} disabled={!dirty||saving}><Ico n="check" s={16}/>{saving?'Saving…':'Save changes'}</button>
    </div>
  </div>;
}

let KID=1;
const blankKid=last=>({key:KID++,first:'',last:last||'',lastEdited:false,dob:'',gender:''});
export function FamilyForm({mode}){
  const {go,params,confirm}=useUI();
  const classes=useClasses();
  const guardians=useApiResource(()=>listAll(guardiansApi.admin.list,{sort:'name'}),[]);
  const preset=params?.guardianId;
  const [existing,setExisting]=useState(!!preset);const [gid,setGid]=useState(preset||'');
  const [p,setP]=useState({first:'',last:'',relationship:'',phone:'',email:''});
  const [kids,setKids]=useState([blankKid()]);const [touched,setTouched]=useState(false);const [done,setDone]=useState(null);const [saving,setSaving]=useState(false);const [err,setErr]=useState('');
  const pg=existing?guardians.data.find(g=>g.id===gid):null;const surname=existing?(pg?pg.last_name:''):p.last;
  useEffect(()=>{setKids(ks=>ks.map(k=>k.lastEdited?k:{...k,last:surname||''}))},[surname]);
  const setK=(key,patch)=>setKids(ks=>ks.map(k=>k.key===key?{...k,...patch}:k));
  const pe={first:!existing&&!p.first.trim(),last:!existing&&!p.last.trim(),relationship:!existing&&!p.relationship,contact:!existing&&!p.phone.trim()&&!p.email.trim(),gid:existing&&!gid};
  const ke=k=>({first:!k.first.trim(),last:!k.last.trim(),dob:!k.dob,gender:!k.gender});
  const errCount=Object.values(pe).filter(Boolean).length+kids.reduce((a,k)=>a+Object.values(ke(k)).filter(Boolean).length,0);
  const save=async()=>{
    setTouched(true);if(errCount){window.scrollTo({top:0,behavior:'smooth'});return}
    setSaving(true);setErr('');
    try{
      const body={children:kids.map(k=>({first_name:k.first.trim(),last_name:k.last.trim(),date_of_birth:k.dob,gender:k.gender}))};
      if(existing)body.guardian_id=gid;else body.guardian=Object.fromEntries(Object.entries({first_name:p.first.trim(),last_name:p.last.trim(),relationship:p.relationship,phone:p.phone.trim(),email:p.email.trim()}).filter(([,v])=>v));
      const res=await familiesApi.create(body);
      setDone(res.data.children||[]);window.scrollTo({top:0});
    }catch(x){setErr(x.message||'The family could not be saved.');window.scrollTo({top:0,behavior:'smooth'})}
    finally{setSaving(false)}
  };
  const cancel=async()=>{const touchedAny=p.first||p.last||kids.some(k=>k.first||k.dob);if(touchedAny&&!(await confirm({title:'Discard this family?',body:"Nothing has been saved yet. If you leave now the details you've entered will be lost.",label:'Discard',danger:true})))return;go(mode==='guardian'?'guardians':'students')};
  const T=b=>touched&&b;

  if(done)return <div className="enter" style={{maxWidth:720}}>
    <div className="card" style={{padding:'36px 36px 30px'}}>
      <span className="state" style={{padding:0,display:'block',textAlign:'left'}}><span className="ic" style={{background:'var(--good-bg)',color:'var(--good)'}}><Ico n="check" s={22}/></span></span>
      <h1 className="serif" style={{fontWeight:600,fontSize:32,margin:'16px 0 6px',fontFamily:'var(--display)'}}>Family saved</h1>
      <p className="muted" style={{margin:'0 0 22px'}}>{done.length===1?'The student has':`${done.length} students have`} been enrolled and given an ID.</p>
      <div className="col" style={{gap:10}}>{done.map(k=><div key={k.id} className="linkrow" style={!k.class?{borderColor:'#ebc9c2',background:'#fcf1ee'}:null}>
        <span className="idtag" style={{height:28,fontSize:13,padding:'0 10px'}}>{k.student_id}</span>
        <div className="grow"><div className="nm">{name(k)}</div>{k.class?<div className="sub">Placed in {clsName(classes.data.find(c=>c.id===k.class.id)||k.class)}</div>:<div className="ferr" style={{marginTop:2}}><Ico n="alert" s={13}/>No matching class — assign on the student record</div>}</div>
        {!k.class&&<button className="btn sm" onClick={()=>go('student-edit',{id:k.id})}>Assign</button>}
      </div>)}</div>
      <div className="row wrap" style={{marginTop:26}}>
        <button className="btn pri" onClick={()=>go(mode==='guardian'?'guardians':'students')}>{mode==='guardian'?'View guardians':'View students'}</button>
        <button className="btn" onClick={()=>{setDone(null);setKids([blankKid()]);setP({first:'',last:'',relationship:'',phone:'',email:''});setExisting(false);setGid('');setTouched(false);guardians.refresh().catch(()=>{})}}>Add another family</button>
      </div>
    </div>
  </div>;

  return <div className="enter" style={{maxWidth:1080}}>
    <PageHead back={{label:mode==='guardian'?'Back to guardians':'Back to students',onClick:cancel}} title={mode==='guardian'?'Add guardian':'Add student'} desc="Add a parent or guardian and their children in one go. Each child is placed in a class automatically from their age and gender."/>
    {touched&&errCount>0&&<div className="alert bad" style={{marginBottom:18}}><Ico n="alert" s={17}/><div><b>{errCount} {errCount===1?'field needs':'fields need'} attention.</b> They&apos;re highlighted below.</div></div>}
    <Alert style={{marginBottom:18}}>{err}</Alert>
    <div className="formcard">
      <section className="fsec">
        <div className="fsec-h"><div className="fsec-n">01</div><h3>Parent or guardian</h3><p>Who should the madrasa contact about these children?</p></div>
        <div className="col" style={{gap:16}}>
          <label className="check" style={{padding:'12px 14px',border:'1px solid var(--line2)',borderRadius:14,background:existing?'#eef2ea':'var(--field)'}}><input type="checkbox" checked={existing} onChange={e=>setExisting(e.target.checked)}/><span><b style={{fontWeight:500}}>Parent already registered</b><span className="hint" style={{display:'block'}}>Pick them from the list instead of typing their details again.</span></span></label>
          {existing?<Field label="Choose parent or guardian" req error={T(pe.gid)?'Choose a guardian':''}>
            <select className={`sel${T(pe.gid)?' bad':''}`} value={gid} onChange={e=>setGid(e.target.value)} disabled={guardians.loading}>
              <option value="">{guardians.loading?'Loading…':'Select…'}</option>{[...guardians.data].sort((a,b)=>String(a.last_name).localeCompare(b.last_name)).map(g=><option key={g.id} value={g.id}>{g.last_name}, {g.first_name}{g.relationship?` — ${g.relationship}`:''}{g.phone?` · ${g.phone}`:''}</option>)}
            </select></Field>
          :<div className="g2">
            <Field label="First name" req error={T(pe.first)?'Enter a first name':''}><input className={`inp${T(pe.first)?' bad':''}`} value={p.first} onChange={e=>setP({...p,first:e.target.value})}/></Field>
            <Field label="Last name" req error={T(pe.last)?'Enter a last name':''}><input className={`inp${T(pe.last)?' bad':''}`} value={p.last} onChange={e=>setP({...p,last:e.target.value})}/></Field>
            <Field label="Relationship to the children" req error={T(pe.relationship)?'Choose a relationship':''}><select className={`sel${T(pe.relationship)?' bad':''}`} value={p.relationship} onChange={e=>setP({...p,relationship:e.target.value})}><option value="">Select…</option>{RELS.map(r=><option key={r}>{r}</option>)}</select></Field>
            <div className="hide-sm"></div>
            <Field label="Phone" error={T(pe.contact)?'Enter a phone number or email':''}><input className={`inp${T(pe.contact)?' bad':''}`} type="tel" value={p.phone} onChange={e=>setP({...p,phone:e.target.value})} placeholder="07700 900 000"/></Field>
            <Field label="Email" hint="Reports are emailed here"><input className={`inp${T(pe.contact)?' bad':''}`} type="email" value={p.email} onChange={e=>setP({...p,email:e.target.value})} placeholder="name@example.com"/></Field>
          </div>}
        </div>
      </section>
      <section className="fsec">
        <div className="fsec-h"><div className="fsec-n">02</div><h3>Children</h3><p>Add each child who is joining. Their surname defaults to the parent&apos;s.</p><div className="alert info" style={{marginTop:14,fontSize:12.5}}><Ico n="info" s={15}/>Student IDs are assigned automatically when saved.</div></div>
        <div className="col" style={{gap:14}}>
          {kids.map((k,i)=>{const e=ke(k);const c=classFor(classes.data,k.gender,k.dob);const age=H.age(k.dob);return <div key={k.key} className="flat" style={{padding:'18px 18px 20px',background:'#fbf9ee'}}>
            <div className="row" style={{marginBottom:14}}><span className="serif grow" style={{fontSize:19}}>Child {i+1}{k.first&&<span className="muted"> · {k.first}</span>}</span>{kids.length>1&&<button className="btn sm ghost" style={{color:'var(--bad)'}} onClick={()=>setKids(kids.filter(x=>x.key!==k.key))}><Ico n="trash" s={14}/>Remove</button>}</div>
            <div className="g2">
              <Field label="First name" req error={T(e.first)?'Enter a first name':''}><input className={`inp${T(e.first)?' bad':''}`} value={k.first} onChange={ev=>setK(k.key,{first:ev.target.value})}/></Field>
              <Field label="Last name" req error={T(e.last)?'Enter a last name':''}><input className={`inp${T(e.last)?' bad':''}`} value={k.last} onChange={ev=>setK(k.key,{last:ev.target.value,lastEdited:true})}/></Field>
              <Field label="Date of birth" req error={T(e.dob)?'Enter a date of birth':''}><input className={`inp${T(e.dob)?' bad':''}`} type="date" value={k.dob} onChange={ev=>setK(k.key,{dob:ev.target.value})}/></Field>
              <Field label="Age" hint="Worked out from date of birth"><input className="inp" readOnly value={age!=null?`${age} years`:''} placeholder="—" tabIndex={-1}/></Field>
              <Field label="Gender" req error={T(e.gender)?'Choose a gender':''}><Seg value={k.gender} options={GENDERS} onChange={v=>setK(k.key,{gender:v})}/></Field>
              <Field label="Class" hint={c?'Filled in automatically':''}>
                {!k.dob||!k.gender?<input className="inp" readOnly value="" placeholder="Set date of birth and gender" tabIndex={-1}/>
                 :classes.loading?<input className="inp" readOnly value="" placeholder="Loading classes…" tabIndex={-1}/>
                 :c?<input className="inp" readOnly value={clsName(c)} tabIndex={-1} style={{color:'var(--ink)',background:'#eef2ea',borderColor:'#cfdcc8'}}/>
                 :<div className="alert bad" style={{padding:'10px 12px'}}><Ico n="alert" s={16}/>No matching class for age {age}</div>}
              </Field>
            </div>
          </div>})}
          <button className="btn" style={{alignSelf:'flex-start'}} onClick={()=>setKids([...kids,blankKid(surname)])}><Ico n="plus" s={16}/>Add child</button>
        </div>
      </section>
    </div>
    <div className="footbar">
      <span className="dirty grow">{kids.length} {kids.length===1?'child':'children'} to enrol</span>
      <button className="btn" onClick={cancel}>Cancel</button>
      <button className="btn pri" onClick={save} disabled={saving}><Ico n="check" s={16}/>{saving?'Saving…':'Save family'}</button>
    </div>
  </div>;
}
