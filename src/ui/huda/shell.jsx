'use client';
// Huda — app shell: sidebar, top bar, notifications dropdown, profile menu, access denied.
import React from'react';
import{Av,H,Ico,Menu,name}from'./ui';

export const NAV={
  admin:[
    ['Overview',[['dashboard','Dashboard','grid']]],
    ['People',[['students','Students','user'],['guardians','Guardians','home'],['staff','Teachers','badge'],['requests','Teacher Requests','userplus','requests']]],
    ['Academic',[['classes','Classes','layers'],['subjects','Subjects','book'],['attendance','Attendance','checksq'],['homework','Homework','pencil'],['assessments','Assessments','award'],['bracket','Bracket Review','scale','bracket']]],
    ['Reports',[['reports','Student Reports','file','review'],['report-requests','Report Requests','clock']]],
    ['Communication',[['templates','Message Templates','mail']]],
    ['Updates',[['notifications','Notifications','bell','unread']]],
    ['Madrasa',[['settings','Settings','gear'],['files','Files','folder']]],
  ],
  teacher:[
    ['Overview',[['dashboard','Dashboard','grid']]],
    ['Teaching',[['classes','My Classes','layers'],['students','Students','user'],['attendance','Attendance','checksq'],['homework','Homework','pencil'],['assessments','Assessments','award'],['notes','Student Notes','note']]],
    ['Reports',[['reports','Reports','file','changes'],['report-requests','Report Requests','clock']]],
    ['Updates',[['notifications','Notifications','bell','unread']]],
  ],
};
// [label, parent nav key, admin only, teacher only]
export const ROUTE={
  dashboard:['Dashboard'],students:['Students'],'student-edit':['Edit student','students',1],'student-add':['Add student','students',1],
  guardians:['Guardians',0,1],'guardian-add':['Add guardian','guardians',1],staff:['Teachers',0,1],requests:['Teacher Requests',0,1],
  classes:['Classes'],subjects:['Subjects',0,1],attendance:['Attendance'],register:['Register','attendance'],homework:['Homework'],assessments:['Assessments'],
  bracket:['Bracket Review',0,1],reports:['Student Reports'],'report-requests':['Report Requests'],notes:['Student Notes',0,0,1],
  templates:['Message Templates',0,1],notifications:['Notifications'],settings:['Settings',0,1],files:['Files',0,1],
};
export const routeLabel=(r,role)=>r==='classes'&&role==='teacher'?'My Classes':r==='reports'&&role==='teacher'?'Reports':(ROUTE[r]||['Page'])[0];
export const navKey=r=>(ROUTE[r]&&ROUTE[r][1])||r;
export const isAdminOnly=r=>!!(ROUTE[r]&&ROUTE[r][2]);
export const isTeacherOnly=r=>!!(ROUTE[r]&&ROUTE[r][3]);

// Notifications store links like "attendance?class_id=…&date=…"; turn them into routes.
export function linkToRoute(link){
  if(!link)return null;
  const[target,query]=String(link).replace(/^\//,'').split('?');const p=Object.fromEntries(new URLSearchParams(query||''));
  if(target==='attendance'&&p.class_id&&p.date)return['register',{classId:p.class_id,date:p.date}];
  if(target==='attendance'&&p.class_id)return['attendance',{classId:p.class_id}];
  if(target==='reports'&&(p.id||p.report_id))return['reports',{id:p.id||p.report_id}];
  if(ROUTE[target])return[target,Object.keys(p).length?p:null];
  return null;
}

export const Sidebar=({role,route,go,collapsed,setCollapsed,counts,onNav})=>(
  <nav className="sb" aria-label="Main">
    <div className="sb-brand">
      <div className="mark">H</div>
      <div className="sb-hide"><div className="sb-name">Huda Tarbiyah Portal</div><div className="sb-sub">{role==='admin'?'Administration':'Teaching staff'}</div></div>
    </div>
    {NAV[role].map(([g,items])=>(
      <div key={g}>
        <div className="sb-gl">{g}</div>
        {items.map(([k,l,ic,cnt])=>{
          const n=cnt?counts[cnt]:0;
          return <button key={k} className={`sb-item${navKey(route)===k?' on':''}`} onClick={()=>{go(k);onNav()}} title={collapsed?l:undefined} aria-current={navKey(route)===k?'page':undefined}>
            <Ico n={ic} s={18}/><span className="sb-hide grow">{l}</span>{n>0&&<span className="sb-cnt">{n}</span>}
          </button>;
        })}
      </div>
    ))}
    <div className="sb-foot">
      <button className="sb-item collapse-btn" onClick={()=>setCollapsed(!collapsed)} title={collapsed?'Expand sidebar':undefined}>
        <Ico n="sidebar" s={18}/><span className="sb-hide">Collapse sidebar</span>
      </button>
    </div>
  </nav>
);

export const TopBar=({role,route,go,me,notes,unread,onMenu,onLogout,openNotice,search,setSearch})=>(
  <header className="tb">
    <button className="tbtn hamb" onClick={onMenu} aria-label="Open menu"><Ico n="menu" s={18}/></button>
    <div className="crumb">{role==='admin'?'Administration':'Teaching'}<span>/</span><b>{routeLabel(route,role)}</b></div>
    <div className="tsearch"><Ico n="search" s={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search within the current area" aria-label="Search within the current area"/></div>
    <Menu button={t=><button className="tbtn" onClick={t} aria-label={`Notifications, ${unread} unread`}><Ico n="bell" s={18}/>{unread>0&&<span className="bubble">{unread}</span>}</button>}>
      <div style={{width:340,maxWidth:'calc(100vw - 32px)'}}>
        <div className="row" style={{padding:'8px 10px 10px',justifyContent:'space-between'}}><b className="serif" style={{fontSize:18,fontWeight:500}}>Notifications</b>{unread>0&&<span className="badge bad plain">{unread} new</span>}</div>
        {notes.length===0&&<div className="sub" style={{padding:'4px 10px 10px'}}>No notifications yet.</div>}
        {notes.map(n=><button key={n.id} className="mi" style={{alignItems:'flex-start',background:n.read_at?'':'#f6f1de'}} onClick={()=>openNotice(n)}>
          <span className="dot" style={{background:n.read_at?'transparent':'var(--gold)',marginTop:7}}></span>
          <span className="grow"><b style={{fontWeight:500,display:'block'}}>{n.title}</b><span className="sub" style={{display:'block',marginTop:2}}>{n.message}</span><span className="lab" style={{display:'block',marginTop:4,fontSize:11}}>{H.when(n.created_at)}</span></span>
        </button>)}
        <div className="msep"></div>
        <button className="mi" style={{justifyContent:'center',fontWeight:500,color:'var(--ink2)'}} onClick={()=>go('notifications')}>View all notifications</button>
      </div>
    </Menu>
    <Menu button={t=><button className="prof" onClick={t}><Av p={me} tone="ink" size="sm"/><span className="t" style={{textAlign:'left'}}><b>{me.first_name}</b><small>{role==='admin'?'Administrator':'Teacher'}</small></span><Ico n="chevd" s={14} className="t"/></button>}>
      <div style={{padding:'8px 10px 10px'}}><div className="nm">{name(me)}</div><div className="sub">{[me.username,role==='admin'?'Administrator':'Teacher'].filter(Boolean).join(' · ')}</div></div>
      <div className="msep"></div>
      {role==='admin'&&<button className="mi" onClick={()=>go('settings')}><Ico n="gear" s={16}/>Account preferences</button>}
      <button className="mi bad" onClick={onLogout}><Ico n="logout" s={16}/>Log out</button>
    </Menu>
  </header>
);

export const AccessDenied=({go})=>(
  <div className="card" style={{maxWidth:560,margin:'40px auto'}}>
    <div className="state" style={{padding:'56px 32px'}}>
      <span className="ic" style={{width:64,height:64}}><Ico n="shield" s={28}/></span>
      <h4 style={{fontSize:26}}>Access denied</h4>
      <p>This page is only available to the madrasa office. If you think you should have access, please speak to an administrator.</p>
      <button className="btn pri" onClick={()=>go('dashboard')}>Return to dashboard</button>
    </div>
  </div>
);
