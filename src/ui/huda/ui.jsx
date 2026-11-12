'use client';
// Huda — UI primitives, icons, formatting helpers and the app context.
// Ported from the Claude Design handoff (huda-ui.jsx), wired to live API data.
import React,{createContext,useContext,useEffect,useRef,useState}from'react';

export const UI=createContext(null);
export const useUI=()=>useContext(UI);

const IP={
grid:<><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/></>,
user:<><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0115 0"/></>,
home:<><path d="M4 10.5L12 4l8 6.5V20H4z"/><path d="M9.5 20v-5.5h5V20"/></>,
badge:<><rect x="4.5" y="3.5" width="15" height="17" rx="2.5"/><circle cx="12" cy="10" r="2.7"/><path d="M8 17a4 4 0 018 0"/></>,
userplus:<><circle cx="10" cy="8" r="3.4"/><path d="M3.5 20a6.5 6.5 0 0113 0"/><path d="M19 8v6M16 11h6"/></>,
layers:<><path d="M12 4l8.5 4.5L12 13 3.5 8.5z"/><path d="M3.5 12.5L12 17l8.5-4.5"/><path d="M3.5 16.5L12 21l8.5-4.5"/></>,
book:<><path d="M5 5.5A2 2 0 017 3.5h12v14H7a2 2 0 00-2 2z"/><path d="M5 19.5a2 2 0 002 2h12v-4"/></>,
check:<path d="M5 12.5l4.5 4.5L19 7.5"/>,
checksq:<><rect x="3.5" y="3.5" width="17" height="17" rx="3.5"/><path d="M8 12.2l2.8 2.8L16.5 9"/></>,
pencil:<><path d="M15 4.5l4.5 4.5L9 19.5H4.5V15z"/><path d="M13 6.5l4.5 4.5"/></>,
award:<><circle cx="12" cy="9" r="5"/><path d="M8.6 13.2L7 20.5l5-2.5 5 2.5-1.6-7.3"/></>,
scale:<><path d="M12 4v16M8 20h8M5 7.5h14"/><path d="M5 7.5L2.5 13a2.5 2.5 0 005 0zM19 7.5L16.5 13a2.5 2.5 0 005 0z"/></>,
file:<><path d="M6 3.5h8l4.5 4.5v12.5H6z"/><path d="M14 3.5V8h4.5M9 12.5h6M9 16h4"/></>,
clock:<><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></>,
mail:<><rect x="3.5" y="5.5" width="17" height="13" rx="2.2"/><path d="M4 7l8 6 8-6"/></>,
bell:<><path d="M6.5 16.5V11a5.5 5.5 0 0111 0v5.5l1.5 2h-14z"/><path d="M10 20.5a2 2 0 004 0"/></>,
gear:<><circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/></>,
folder:<path d="M3.5 7a2 2 0 012-2h4l2 2.5h7a2 2 0 012 2V17a2 2 0 01-2 2h-13a2 2 0 01-2-2z"/>,
note:<><path d="M5 4.5h14v10l-5 5H5z"/><path d="M14 19.5v-5h5M8.5 9h7M8.5 12.5h4"/></>,
search:<><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></>,
plus:<path d="M12 5v14M5 12h14"/>,
x:<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>,
chevl:<path d="M14.5 6l-6 6 6 6"/>,chevr:<path d="M9.5 6l6 6-6 6"/>,chevd:<path d="M6 9.5l6 6 6-6"/>,
dots:<><circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/></>,
phone:<path d="M6.5 4h3l1.5 4-2 1.5a10 10 0 005.5 5.5l1.5-2 4 1.5v3a2 2 0 01-2 2A15.5 15.5 0 014.5 6a2 2 0 012-2z"/>,
trash:<><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/></>,
eye:<><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/></>,
eyeoff:<><path d="M3.5 3.5l17 17"/><path d="M10.6 6A9.6 9.6 0 0112 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 01-2.7 3.4M6.7 6.8A16 16 0 002.5 12s3.5 6.5 9.5 6.5a9.5 9.5 0 004.2-1"/></>,
alert:<><path d="M12 4l9 16H3z"/><path d="M12 10v4.5M12 17.3v.2"/></>,
info:<><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.2"/></>,
shield:<><path d="M12 3.5l7.5 3v5.5c0 4.5-3.2 7.7-7.5 9-4.3-1.3-7.5-4.5-7.5-9V6.5z"/><path d="M9 12l2.2 2.2L15.5 10"/></>,
upload:<><path d="M12 16V4.5M7 9.5l5-5 5 5"/><path d="M4.5 15.5v4h15v-4"/></>,
download:<><path d="M12 4.5V16M7 11l5 5 5-5"/><path d="M4.5 19.5h15"/></>,
link:<><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/></>,
copy:<><rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6A1.5 1.5 0 0014 4.5H6A1.5 1.5 0 004.5 6v8A1.5 1.5 0 006 15.5h2.5"/></>,
logout:<><path d="M9.5 4.5h-4v15h4"/><path d="M15 8l4 4-4 4M19 12H9.5"/></>,
menu:<path d="M4 7h16M4 12h16M4 17h16"/>,
sidebar:<><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M9.5 4.5v15"/></>,
cal:<><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></>,
send:<path d="M4 12L20 4.5 14.5 20l-3-6.5z"/>,
image:<><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8 8.5"/></>,
lock:<><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 018 0v2.5"/></>,
arrowr:<path d="M5 12h14M13.5 6.5L19 12l-5.5 5.5"/>,
archive:<><rect x="3.5" y="4.5" width="17" height="4.5" rx="1"/><path d="M5 9v10.5h14V9M10 13h4"/></>,
refresh:<><path d="M19.5 12a7.5 7.5 0 11-2.2-5.3"/><path d="M19.5 4.5v4h-4"/></>,
unlink:<><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7"/><path d="M4 4l16 16"/></>,
};
export const Ico=({n,s=18,w=1.6,...r})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...r}>{IP[n]}</svg>;

/* ---------- dates ---------- */
const pad=n=>String(n).padStart(2,'0');
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONL=['January','February','March','April','May','June','July','August','September','October','November','December'];
export const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const toD=s=>{const[y,m,d]=String(s).slice(0,10).split('-').map(Number);return new Date(y,m-1,d)};
export const toS=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
export const today=()=>toS(new Date());
export const H={
  fmt:s=>{if(!s)return'—';const d=toD(s);return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`},
  fmtS:s=>{if(!s)return'—';const d=toD(s);return `${d.getDate()} ${MON[d.getMonth()]}`},
  fmtL:s=>{if(!s)return'—';const d=toD(s);return `${DAYS[d.getDay()]} ${d.getDate()} ${MONL[d.getMonth()]} ${d.getFullYear()}`},
  fmtDay:s=>{if(!s)return'—';const d=toD(s);return `${DAYS[d.getDay()].slice(0,3)} ${d.getDate()} ${MON[d.getMonth()]}`},
  when:ts=>{if(!ts)return'';const d=new Date(ts),diff=(Date.now()-d)/6e4;if(diff<1)return'Just now';if(diff<60)return`${Math.round(diff)} min ago`;if(diff<1440)return`${Math.round(diff/60)} h ago`;return H.fmt(toS(d))},
  age:(dob,ref)=>{if(!dob)return null;const b=toD(dob),r=ref?toD(ref):new Date();let a=r.getFullYear()-b.getFullYear();if(r.getMonth()<b.getMonth()||(r.getMonth()===b.getMonth()&&r.getDate()<b.getDate()))a--;return a},
  days:(a,b)=>Math.round((toD(b)-toD(a))/864e5),
  time:t=>t?String(t).slice(0,5):'',
  grade:p=>p>=85?'A':p>=70?'B':p>=55?'C':'D',
  size:n=>n==null?'':n>1e6?(n/1e6).toFixed(1)+' MB':Math.max(1,Math.round(n/1e3))+' KB',
};

/* ---------- people & classes ---------- */
const g0=v=>String(v||'').toLowerCase();
export const name=p=>{if(!p)return'—';const f=p.first_name??p.profiles?.first_name,l=p.last_name??p.profiles?.last_name;return [f,l].filter(Boolean).join(' ')||p.name||'—'};
export const isFemale=p=>g0(p?.gender)==='female'||['mother','aunt','grandmother','grandparent (f)'].includes(g0(p?.relationship));
export const genderLabel=g=>g0(g)==='male'?'Male':g0(g)==='female'?'Female':'—';
export const statusLabel=v=>String(v??'—').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
export const bracketShort=c=>c&&c.min_age!=null?`${g0(c.gender)==='male'?'B':'G'}${c.min_age}–${c.max_age}`:'';
export const clsName=c=>c?(c.min_age!=null?`${c.name} · ${g0(c.gender)==='male'?'Boys':'Girls'} ${c.min_age}–${c.max_age}`:c.name):'Unassigned';
export const bracketText=c=>c?(c.dob_from&&c.dob_to?`Ages ${c.min_age}–${c.max_age}, born ${H.fmt(c.dob_from)} – ${H.fmt(c.dob_to)}`:c.min_age!=null?`Ages ${c.min_age}–${c.max_age}`:'—'):'—';
export const classWhen=c=>c?[c.day_of_week&&`${c.day_of_week}s`,c.start_time&&`${H.time(c.start_time)}–${H.time(c.end_time)}`].filter(Boolean).join(' '):'';
// Classes with a date-of-birth range match on date of birth; others on whole-year age.
export const inBracket=(c,gender,dob)=>{if(!c||!dob||g0(c.gender)!==g0(gender))return false;if(c.dob_from&&c.dob_to)return dob>=c.dob_from&&dob<=c.dob_to;const a=H.age(dob);return a!=null&&a>=c.min_age&&a<=c.max_age};
export const classFor=(classes,gender,dob)=>gender&&dob?classes.find(c=>c.active&&inBracket(c,gender,dob))||null:null;
export const studentLink=s=>s?.class_students?.[0]||null;
export const studentClass=s=>studentLink(s)?.classes||null;
export const classTeachers=c=>(c?.class_teachers||[]).map(t=>t.teachers?.profiles).filter(Boolean);
export const classCount=c=>c?.class_students?.[0]?.count??0;

/* ---------- tones ---------- */
export const TONE={Active:'good',Inactive:'mute',Archived:'bad',Draft:'',Submitted:'info','Under Review':'gold','Changes Requested':'warn',Approved:'good',Sent:'ink',
  Present:'good',Late:'warn',Absent:'bad',Excused:'gold',Open:'gold',Assigned:'info',Completed:'good',Closed:'mute',Pending:'warn','Not completed':'mute',
  Admin:'ink',Teacher:'info','Teacher + Admin':'info','Admin only':'gold',Weekly:'',Monthly:'',Override:'warn'};
export const Badge=({s,tone,plain,children})=><span className={`badge ${tone??TONE[s]??''}${plain?' plain':''}`}>{children||s}</span>;

export const Av=({p,size,sel,tone})=>{
  const f=p?.first_name??p?.profiles?.first_name??'?',l=p?.last_name??p?.profiles?.last_name??'';
  const ini=(String(f||'?')[0]+String(l||'').slice(0,1)).toUpperCase();
  const t=sel?'g':tone||(isFemale(p)?'f':'');
  return <span className={`av ${t} ${size||''}`} aria-hidden="true">{ini}</span>;
};
export const ClassPill=({c})=>c?<span className="pill">{c.name}{c.min_age!=null?` · ${bracketShort(c)}`:''}</span>:<span className="pill none">No class</span>;

/* ---------- layout bits ---------- */
export const PageHead=({eyebrow,title,desc,back,children})=>(
  <div className="ph">
    <div style={{minWidth:0,flex:'1 1 320px'}}>
      {back&&<button className="backlink" onClick={back.onClick}><Ico n="chevl" s={15}/>{back.label}</button>}
      {eyebrow&&<div className="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {desc&&<p>{desc}</p>}
    </div>
    {children&&<div className="ph-a">{children}</div>}
  </div>
);
export const Diamond=()=><div className="diamond"><i></i></div>;

export const Field=({label,req,opt,hint,error,span,children})=>(
  <label className={`field${span?' span2':''}`} onClick={e=>{if(e.target.tagName==='SPAN')e.preventDefault()}}>
    <span className="lbl">{label}{req&&<i>*</i>}{opt&&<span className="opt">Optional</span>}</span>
    {children}
    {error?<span className="ferr"><Ico n="alert" s={13}/>{error}</span>:hint?<span className="hint">{hint}</span>:null}
  </label>
);
export const Seg=({value,options,onChange,className})=>(
  <div className={`seg ${className||''}`} role="radiogroup">
    {options.map(o=>{const [v,l]=Array.isArray(o)?o:[o,o];return <button type="button" key={v} className={value===v?'on':''} onClick={()=>onChange(v)} role="radio" aria-checked={value===v}>{l}</button>})}
  </div>
);
export const Sw=({on,onChange,disabled,label})=><button type="button" className={`sw${on?' on':''}`} disabled={disabled} onClick={e=>{e.stopPropagation();onChange(!on)}} aria-pressed={on} aria-label={label||'Toggle'}></button>;
export const Tabs=({value,tabs,onChange})=>(
  <div className="tabs">{tabs.map(([v,l,n])=><button key={v} className={`tab${value===v?' on':''}`} onClick={()=>onChange(v)}>{l}{n!=null&&<span className="n">{n}</span>}</button>)}</div>
);
export const Chips=({value,options,onChange})=>(
  <div className="chips">{options.map(([v,l,n])=><button key={v} className={`chip${value===v?' on':''}`} onClick={()=>onChange(v)}>{l}{n!=null&&<span className="n">{n}</span>}</button>)}</div>
);
export const SearchBox=({value,onChange,placeholder})=>(
  <div className="isearch"><Ico n="search" s={16}/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder}/></div>
);
// Client-side pager (page is 0-based).
export const Pager=({page,setPage,total,per=25})=>{
  const pages=Math.max(1,Math.ceil(total/per));const a=total?page*per+1:0,b=Math.min(total,(page+1)*per);
  if(total<=per)return null;
  return <div className="pager"><span>Showing {a}–{b} of {total}</span><div className="row" style={{gap:6}}>
    <span className="hide-sm">Page {page+1} of {pages}</span>
    <button className="btn icon sm" disabled={page===0} onClick={()=>setPage(page-1)} aria-label="Previous page"><Ico n="chevl" s={15}/></button>
    <button className="btn icon sm" disabled={page>=pages-1} onClick={()=>setPage(page+1)} aria-label="Next page"><Ico n="chevr" s={15}/></button>
  </div></div>;
};
export const Empty=({icon='search',title,body,action})=><div className="state"><span className="ic"><Ico n={icon} s={22}/></span><h4>{title}</h4>{body&&<p>{body}</p>}{action}</div>;
export const Loading=({label='Loading…'})=><div className="state"><div className="spin"></div><p>{label}</p></div>;
export const LoadError=({message,onRetry})=><div className="state"><span className="ic bad"><Ico n="alert" s={22}/></span><h4>Couldn&apos;t load this</h4><p>{message||'Something went wrong talking to the server. Check your connection and try again.'}</p>{onRetry&&<button className="btn" onClick={onRetry}><Ico n="refresh" s={15}/>Try again</button>}</div>;
// Wraps a resource: loading → error → empty → children.
export const Listing=({res,count,empty,emptyBody,emptyIcon,children})=>{
  if(res&&res.loading&&!res.data?.length)return <Loading/>;
  if(res&&res.error)return <LoadError message={res.error} onRetry={()=>res.refresh().catch(()=>{})}/>;
  if(count===0)return <Empty icon={emptyIcon} title={empty} body={emptyBody}/>;
  return children;
};

export const Modal=({title,desc,onClose,children,foot,size})=>{
  useEffect(()=>{const k=e=>e.key==='Escape'&&onClose();window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)},[onClose]);
  return <div className="mback" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <div className={`modal ${size||''}`} role="dialog" aria-modal="true" aria-label={typeof title==='string'?title:undefined}>
      <div className="m-h"><div><h3>{title}</h3>{desc&&<p>{desc}</p>}</div><button className="btn icon sm ghost" onClick={onClose} aria-label="Close"><Ico n="x" s={16}/></button></div>
      <div className="m-b">{children}</div>
      {foot&&<div className="m-f">{foot}</div>}
    </div>
  </div>;
};

// Sticky right panel on desktop; slide-over sheet on narrow screens.
export const Panel=({onClose,children})=>{
  const [open,setOpen]=useState(false);
  useEffect(()=>{const id=requestAnimationFrame(()=>setOpen(true));return()=>cancelAnimationFrame(id)},[]);
  useEffect(()=>{const k=e=>e.key==='Escape'&&onClose();window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)},[onClose]);
  return <div className={`pwrap${open?' open':''}`}><div className="scrim" onClick={onClose}></div><aside className="panel enter">{children}</aside></div>;
};
export const PanelHead=({avatar,title,sub,onClose,extra})=>(
  <div className="p-h">
    {avatar}
    <div className="grow"><h2>{title}</h2>{sub&&<div className="sub" style={{fontSize:13,marginTop:3}}>{sub}</div>}{extra}</div>
    <button className="btn icon sm" onClick={onClose} aria-label="Close panel" style={{alignSelf:'flex-start'}}><Ico n="x" s={15}/></button>
  </div>
);

export const Menu=({button,children,align='right'})=>{
  const [open,setOpen]=useState(false);const ref=useRef();
  useEffect(()=>{if(!open)return;const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h)},[open]);
  return <div ref={ref} style={{position:'relative'}} onClick={e=>e.stopPropagation()}>
    {button(()=>setOpen(o=>!o),open)}
    {open&&<div className="menu" style={align==='left'?{left:0,right:'auto'}:null} onClick={()=>setOpen(false)}>{children}</div>}
  </div>;
};

export const ErrorBox=({errors})=>errors&&errors.length?<div className="alert bad" role="alert" style={{marginBottom:18}}><Ico n="alert" s={17}/><div><b>Please fix {errors.length===1?'this':'these'} before saving:</b><ul style={{margin:'4px 0 0',paddingLeft:18}}>{errors.map(e=><li key={e}>{e}</li>)}</ul></div></div>:null;
export const Alert=({tone='bad',icon='alert',children,style})=>children?<div className={`alert ${tone}`} role={tone==='bad'?'alert':'status'} style={style}><Ico n={icon} s={17}/><div>{children}</div></div>:null;

// Runs an async action and keeps its busy/error state.
export function useAction(){
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  const run=async fn=>{setBusy(true);setError('');try{return await fn()}catch(e){setError(e.message||'Something went wrong.');return undefined}finally{setBusy(false)}};
  return {busy,error,setError,run};
}
