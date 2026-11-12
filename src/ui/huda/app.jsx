'use client';
// Huda — app root: auth, routing, confirm dialogs, toasts and sidebar counts.
import React,{useCallback,useEffect,useRef,useState}from'react';
import{supabase}from'../../lib/supabase';
import{ApiError}from'../../lib/api/client';
import{authApi,notificationsApi,reportsApi,studentsApi,teacherRequestsApi}from'../../lib/api/resources';
import{Ico,Modal,UI}from'./ui';
import{AccessDenied,Sidebar,TopBar,isAdminOnly,isTeacherOnly,linkToRoute}from'./shell';
import{SignIn}from'./signin';
import{Dashboard}from'./dashboard';
import{Students}from'./students';
import{EditStudent,FamilyForm}from'./student-forms';
import{Guardians,Requests,Staff}from'./people';
import{Bracket,Classes,Subjects}from'./classes';
import{Attendance,Register}from'./attendance';
import{Assessments,Homework}from'./learning';
import{ReportRequests,Reports}from'./reports';
import{Files,Notes,Notifications,Settings,Templates}from'./office';
import'./huda.css';

const PAGES={dashboard:Dashboard,students:Students,'student-edit':EditStudent,'student-add':()=><FamilyForm mode="student"/>,guardians:Guardians,'guardian-add':()=><FamilyForm mode="guardian"/>,
  staff:Staff,requests:Requests,classes:Classes,subjects:Subjects,attendance:Attendance,register:Register,homework:Homework,assessments:Assessments,bracket:Bracket,
  reports:Reports,'report-requests':ReportRequests,notes:Notes,templates:Templates,notifications:Notifications,settings:Settings,files:Files};

const total=r=>r?.meta?.pagination?.total??(Array.isArray(r?.data)?r.data.length:0);

export default function HudaApp(){
  const [auth,setAuth]=useState({loading:true,session:null,profile:null,error:''});
  const [route,setRoute]=useState('dashboard');const [params,setParams]=useState(null);
  const [collapsed,setCollapsed]=useState(false);const [navOpen,setNavOpen]=useState(false);const [search,setSearch]=useState('');
  const [toasts,setToasts]=useState([]);const [cf,setCf]=useState(null);const guard=useRef(null);
  const [counts,setCounts]=useState({});const [notes,setNotes]=useState([]);

  async function resolve(session){
    if(!session){setAuth(a=>({loading:false,session:null,profile:null,error:a.error}));return}
    const{data:profile,error}=await supabase.from('profiles').select('id,auth_user_id,username,first_name,last_name,email,role,active').eq('auth_user_id',session.user.id).maybeSingle();
    if(error||!profile?.active||!['admin','teacher'].includes(profile.role)){await supabase.auth.signOut();setAuth({loading:false,session:null,profile:null,error:'Your account is not permitted to access this application.'});return}
    setAuth({loading:false,session,profile,error:''});
  }
  useEffect(()=>{
    try{setCollapsed(localStorage.getItem('huda-collapsed')==='1')}catch(e){}
    supabase.auth.getSession().then(({data})=>resolve(data.session));
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,session)=>{setTimeout(()=>resolve(session),0)});
    const unauthorized=()=>supabase.auth.signOut();
    window.addEventListener('huda:unauthorized',unauthorized);
    return()=>{subscription.unsubscribe();window.removeEventListener('huda:unauthorized',unauthorized)};
  },[]);
  async function login(identifier,password,portal){
    const{data:tokens}=await authApi.login({identifier,password,portal});
    const{data,error}=await supabase.auth.setSession(tokens);
    if(error)throw new ApiError(401,'INVALID_CREDENTIALS','Sign in failed. Please try again.');
    setRoute('dashboard');setParams(null);await resolve(data.session);
  }
  async function logout(){guard.current=null;await supabase.auth.signOut();setRoute('dashboard');setParams(null)}

  const role=auth.profile?.role==='admin'?'admin':'teacher';
  const refreshCounts=useCallback(async()=>{
    if(!auth.profile)return;
    const safe=p=>p.catch(()=>null);
    const [un,list,...rest]=await Promise.all([
      safe(notificationsApi.list({unread:true,limit:1})),safe(notificationsApi.list({limit:5})),
      ...(role==='admin'?[safe(teacherRequestsApi.list()),safe(studentsApi.bracketReview()),safe(reportsApi.list({status:'Submitted',limit:1}))]
        :[safe(reportsApi.list({status:'Changes Requested',limit:1}))]),
    ]);
    setNotes(list?.data||[]);
    setCounts(role==='admin'?{unread:total(un),requests:total(rest[0]),bracket:total(rest[1]),review:total(rest[2])}:{unread:total(un),changes:total(rest[0])});
  },[auth.profile,role]);
  useEffect(()=>{refreshCounts()},[refreshCounts,route]);

  const toast=useCallback(msg=>{const id=Math.random();setToasts(x=>[...x,{id,msg}]);setTimeout(()=>setToasts(x=>x.filter(y=>y.id!==id)),2800)},[]);
  const confirm=useCallback(o=>new Promise(res=>setCf({...o,res})),[]);
  const setGuard=useCallback(m=>{guard.current=m},[]);
  const go=useCallback(async(r,p)=>{
    if(guard.current){const ok=await confirm({title:'Leave this page?',body:guard.current,label:'Leave without saving',danger:true});if(!ok)return;guard.current=null}
    setRoute(r);setParams(p?{...p,_k:Date.now()}:null);setSearch('');setNavOpen(false);window.scrollTo({top:0});
  },[confirm]);
  const openNotice=async n=>{
    if(!n.read_at)await notificationsApi.update(n.id,{read:true}).catch(()=>{});
    const target=linkToRoute(n.link);
    if(target)go(target[0],target[1]);else{go('notifications')}
    refreshCounts();
  };

  if(auth.loading)return <div className="splash">Huda Tarbiyah Portal</div>;
  if(!auth.session||!auth.profile)return <SignIn onLogin={login} notice={auth.error}/>;

  const me=auth.profile;
  const denied=(role==='teacher'&&isAdminOnly(route))||(role==='admin'&&isTeacherOnly(route));
  const Page=PAGES[route]||PAGES.dashboard;
  const ui={role,me,route,params,go,toast,confirm,setGuard,search,refreshCounts,counts};
  const setCol=v=>{setCollapsed(v);try{localStorage.setItem('huda-collapsed',v?'1':'0')}catch(e){}};

  return <UI.Provider value={ui}>
    <div className={`shell${collapsed?' collapsed':''}${navOpen?' nav-open':''}`}>
      <Sidebar role={role} route={route} go={go} collapsed={collapsed} setCollapsed={setCol} counts={counts} onNav={()=>setNavOpen(false)}/>
      {navOpen&&<div className="sbscrim" onClick={()=>setNavOpen(false)}></div>}
      <div className="main">
        <TopBar role={role} route={route} go={go} me={me} notes={notes} unread={counts.unread||0} onMenu={()=>setNavOpen(true)} onLogout={logout} openNotice={openNotice} search={search} setSearch={setSearch}/>
        <main className="page" key={route+role+(params?._k||'')}>{denied?<AccessDenied go={go}/>:<Page/>}</main>
      </div>
    </div>
    {cf&&<Modal title={cf.title} onClose={()=>{cf.res(false);setCf(null)}} foot={<><button className="btn" onClick={()=>{cf.res(false);setCf(null)}}>Cancel</button><button className={`btn ${cf.danger?'danger solid':'pri'}`} onClick={()=>{cf.res(true);setCf(null)}}>{cf.label||'Confirm'}</button></>}>
      <p style={{margin:0,color:'var(--ink2)',lineHeight:1.55}}>{cf.body}</p>
    </Modal>}
    <div className="toasts" aria-live="polite">{toasts.map(x=><div key={x.id} className="toast"><Ico n="check" s={16} w={2}/>{x.msg}</div>)}</div>
  </UI.Provider>;
}
