'use client';
// Huda — sign-in flow (choose portal → sign in → create teacher account → request sent)
import React,{useState}from'react';
import{authApi}from'../../lib/api/resources';
import{ApiError}from'../../lib/api/client';
import{Field,Ico}from'./ui';

export function SignIn({onLogin,notice}){
  const [step,setStep]=useState('choose');
  const [role,setRole]=useState('admin');
  const [u,setU]=useState('');const [p,setP]=useState('');const [show,setShow]=useState(false);const [err,setErr]=useState(notice||'');const [busy,setBusy]=useState(false);
  const [f,setF]=useState({first:'',last:'',email:'',phone:'',qual:'',msg:'',pw:'',pw2:''});
  const [fe,setFe]=useState({});const [made,setMade]=useState(null);
  const set=k=>e=>setF({...f,[k]:e.target.value});
  const submit=async e=>{
    e.preventDefault();if(!u.trim()||!p){setErr('Enter your username and password to continue.');return}
    setErr('');setBusy(true);
    try{await onLogin(u.trim(),p,role)}catch(x){setErr(x instanceof ApiError?x.message:'Incorrect username or password.')}finally{setBusy(false)}
  };
  const signup=async e=>{
    e.preventDefault();const x={};
    if(!f.first.trim())x.first='Enter your first name';if(!f.last.trim())x.last='Enter your last name';
    if(!/^\S+@\S+\.\S+$/.test(f.email))x.email='Enter a valid email address';
    if(!f.phone.trim())x.phone='Enter a phone number';
    if(f.pw.length<12)x.pw='Use at least 12 characters';if(f.pw2!==f.pw)x.pw2="Passwords don't match";
    setFe(x);if(Object.keys(x).length)return;
    setBusy(true);setErr('');
    try{
      const body={first_name:f.first.trim(),last_name:f.last.trim(),email:f.email.trim(),phone:f.phone.trim(),password:f.pw};
      if(f.qual.trim())body.qualification=f.qual.trim();if(f.msg.trim())body.application_note=f.msg.trim();
      const res=await authApi.requestTeacherAccount(body);setMade(res.data);setStep('sent');
    }catch(x){setErr(x.message||'Your request could not be sent.')}finally{setBusy(false)}
  };
  const Opt=({r,title,desc,icon})=><button className="qtile" style={{padding:'18px 18px',borderRadius:18}} onClick={()=>{setRole(r);setStep('login');setErr('')}}>
    <span className="ic" style={{width:44,height:44,borderRadius:14}}><Ico n={icon} s={20}/></span>
    <span className="grow"><span className="serif" style={{fontSize:21,display:'block',lineHeight:1.15}}>{title}</span><span className="sub" style={{fontSize:13}}>{desc}</span></span>
    <Ico n="chevr" s={18} style={{color:'var(--muted)'}}/>
  </button>;
  const errBox=err&&<div className="alert bad" style={{marginBottom:16}}><Ico n="alert" s={17}/>{err}</div>;
  return <div className="signin">
    <div className="si-brand">
      <div className="mark">H</div>
      <h1>Huda Tarbiyah Portal</h1>
      <div className="lab" style={{color:'rgba(239,237,218,.55)'}}>Staff administration system</div>
      <div className="diamond" style={{maxWidth:220,margin:'34px 0'}}><i></i></div>
      <p style={{maxWidth:'34ch',color:'rgba(239,237,218,.75)',fontSize:15,lineHeight:1.6,margin:0}}>Registers, reports and records for the madrasa office and teaching staff.</p>
      <div style={{marginTop:'auto',fontSize:13,color:'rgba(239,237,218,.55)'}}>For account access, contact the madrasa office.</div>
    </div>
    <div className="si-form">
      <div className="si-inner enter" key={step}>
        <div className="si-mob"><div className="mark" style={{background:'var(--ink)'}}>H</div><div className="serif" style={{fontSize:19}}>Huda Tarbiyah Portal</div></div>
        {step==='choose'&&<>
          <h2>Sign in</h2><p className="muted" style={{margin:'0 0 26px'}}>Choose the portal you work in.</p>
          {errBox}
          <div className="col" style={{gap:12}}>
            <Opt r="admin" title="Admin login" desc="Madrasa office and administrators" icon="shield"/>
            <Opt r="teacher" title="Teacher login" desc="Teaching staff" icon="book"/>
          </div>
        </>}
        {step==='login'&&<form onSubmit={submit} noValidate>
          <button type="button" className="backlink" onClick={()=>{setStep('choose');setErr('')}}><Ico n="chevl" s={15}/>Choose a different portal</button>
          <h2>{role==='admin'?'Admin login':'Teacher login'}</h2><p className="muted" style={{margin:'0 0 24px'}}>{role==='admin'?'Madrasa office and administrators.':'Teaching staff.'}</p>
          {errBox}
          <div className="col" style={{gap:16}}>
            <Field label="Username or email"><input className={`inp${err&&!u?' bad':''}`} value={u} onChange={e=>setU(e.target.value)} placeholder="firstname.lastname" autoComplete="username" autoCapitalize="none" spellCheck={false} autoFocus/></Field>
            <Field label="Password"><div className="inwrap"><input className={`inp${err&&!p?' bad':''}`} type={show?'text':'password'} value={p} onChange={e=>setP(e.target.value)} autoComplete="current-password"/><button type="button" className="ib" onClick={()=>setShow(!show)} aria-label={show?'Hide password':'Show password'}><Ico n={show?'eyeoff':'eye'} s={17}/></button></div></Field>
            <button className="btn pri block" style={{height:44,marginTop:4}} disabled={busy}>{busy?<><span className="spin" style={{width:16,height:16,margin:0,borderColor:'rgba(255,255,255,.3)',borderTopColor:'#fff'}}></span>Signing in…</>:'Sign in'}</button>
          </div>
          {role==='teacher'&&<p style={{marginTop:22,textAlign:'center',fontSize:13.5}} className="muted">New teacher? <a href="#" onClick={e=>{e.preventDefault();setErr('');setStep('signup')}}>Create teacher account</a></p>}
        </form>}
        {step==='signup'&&<form onSubmit={signup} noValidate>
          <button type="button" className="backlink" onClick={()=>{setStep('login');setErr('')}}><Ico n="chevl" s={15}/>Back to teacher login</button>
          <h2>Create teacher account</h2>
          <p className="muted" style={{margin:'0 0 20px'}}>An admin will review your request before you can sign in. Your username is created for you.</p>
          {errBox}
          <div className="g2">
            <Field label="First name" req error={fe.first}><input className={`inp${fe.first?' bad':''}`} value={f.first} onChange={set('first')} autoComplete="given-name"/></Field>
            <Field label="Last name" req error={fe.last}><input className={`inp${fe.last?' bad':''}`} value={f.last} onChange={set('last')} autoComplete="family-name"/></Field>
            <Field label="Email" req error={fe.email} span><input className={`inp${fe.email?' bad':''}`} type="email" value={f.email} onChange={set('email')} autoComplete="email"/></Field>
            <Field label="Phone" req error={fe.phone} span><input className={`inp${fe.phone?' bad':''}`} type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel"/></Field>
            <Field label="Qualifications" opt span><input className="inp" value={f.qual} onChange={set('qual')} placeholder="e.g. Ijazah in Hifz, teaching certificate"/></Field>
            <Field label="Message to the admin" opt span><textarea className="ta" style={{minHeight:80}} value={f.msg} onChange={set('msg')} placeholder="Which days you can teach, which classes you'd like…"/></Field>
            <Field label="Password" req error={fe.pw} hint="At least 12 characters"><input className={`inp${fe.pw?' bad':''}`} type="password" value={f.pw} onChange={set('pw')} autoComplete="new-password"/></Field>
            <Field label="Confirm password" req error={fe.pw2}><input className={`inp${fe.pw2?' bad':''}`} type="password" value={f.pw2} onChange={set('pw2')} autoComplete="new-password"/></Field>
          </div>
          <button className="btn pri block" style={{height:44,marginTop:22}} disabled={busy}>{busy?'Sending…':'Send request'}</button>
        </form>}
        {step==='sent'&&made&&<div>
          <span className="state" style={{padding:0,display:'block',textAlign:'left'}}><span className="ic" style={{background:'var(--good-bg)',color:'var(--good)'}}><Ico n="check" s={22}/></span></span>
          <h2 style={{marginTop:18}}>Request sent — jazakAllahu khayran</h2>
          <p className="muted" style={{margin:'0 0 24px'}}>The madrasa office will review your request. You&apos;ll be able to sign in once it has been approved.</p>
          <div className="flat" style={{padding:'18px 20px'}}>
            <div className="lab">Your username</div>
            <div className="mono" style={{fontSize:26,fontWeight:500,margin:'8px 0 4px',wordBreak:'break-all'}}>{made.username}</div>
            <div className="sub" style={{color:'var(--gold-ink)',fontWeight:500}}>Write this down — you&apos;ll need it to sign in.</div>
          </div>
          <button className="btn pri block" style={{height:44,marginTop:22}} onClick={()=>{setRole('teacher');setStep('login');setU(made.username||'');setP('')}}>Go to Teacher login</button>
        </div>}
      </div>
    </div>
  </div>;
}
