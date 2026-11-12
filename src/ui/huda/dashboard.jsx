'use client';
// Huda — Dashboard (admin + teacher)
import React from'react';
import{attendanceApi,reportRequestsApi,reportsApi}from'../../lib/api/resources';
import{useApiResource}from'../useApiResource';
import{listAll,useClasses,useStudents}from'./data';
import{Av,Badge,Empty,H,Ico,Loading,PageHead,classCount,classTeachers,classWhen,clsName,name,today,useUI}from'./ui';

export function Dashboard(){
  const {role,me,go,counts}=useUI();const admin=role==='admin';
  const classes=useClasses();const students=useStudents(role);
  const reports=useApiResource(()=>listAll(reportsApi.list,{sort:'created_at',direction:'desc'}),[]);
  const requests=useApiResource(()=>listAll(reportRequestsApi.list),[]);
  const todayName=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
  const activeClasses=classes.data.filter(c=>c.active);
  const todayClasses=activeClasses.filter(c=>c.day_of_week===todayName);
  const liveStudents=students.data.filter(s=>String(s.status).toLowerCase()==='active');
  const reps=reports.data;
  const review=reps.filter(r=>r.status==='Submitted'||r.status==='Under Review').sort((a,b)=>String(b.created_at).localeCompare(a.created_at));
  const changes=reps.filter(r=>r.status==='Changes Requested');
  const drafts=reps.filter(r=>r.status==='Draft');
  const deadlines=requests.data.filter(q=>q.status==='Open'||q.status==='Assigned').sort((a,b)=>String(a.deadline||'').localeCompare(b.deadline||''));

  const stats=admin?[
    ['Students',liveStudents.length,`${activeClasses.length} active classes`,'students'],
    ['Classes today',todayClasses.length,todayClasses.length?`${todayName}`:'none today','classes'],
    ['Reports',reps.filter(r=>r.status!=='Sent').length,`${review.length} waiting for review`,'reports'],
    ['Unread',counts.unread||0,'notifications','notifications'],
  ]:[
    ['My students',liveStudents.length,`across ${activeClasses.length} classes`,'students'],
    ['Classes today',todayClasses.length,todayClasses.length?todayName:'none today','classes'],
    ['Reports',reps.filter(r=>r.status!=='Sent').length,changes.length?`${changes.length} need changes`:'in progress','reports'],
    ['Unread',counts.unread||0,'notifications','notifications'],
  ];

  const ClassRow=({c})=>(
    <div className="list-row" style={{alignItems:'center',flexWrap:'wrap',rowGap:10}}>
      <div className="datebox"><span>Today</span><b style={{fontSize:16,marginTop:3}}>{H.time(c.start_time)||'—'}</b></div>
      <div className="grow" style={{minWidth:180}}>
        <div className="nm">{c.name}</div>
        <div className="sub">{[classWhen(c),c.room_location,admin?classTeachers(c).map(name).join(', '):`${classCount(c)} students`].filter(Boolean).join(' · ')}</div>
      </div>
      <button className="btn sm pri" onClick={()=>go('register',{classId:c.id,date:today()})}>{admin?'Open register':'Take register'}</button>
    </div>
  );

  return <div className="enter">
    <PageHead eyebrow={H.fmtL(today())} title={`Assalamu alaykum, ${me.first_name}`} desc={`Signed in as ${name(me)}.`}>
      {admin?<button className="btn pri" onClick={()=>go('student-add')}><Ico n="plus" s={16}/>Add student</button>
        :<button className="btn pri" onClick={()=>go('reports',{new:1})}><Ico n="plus" s={16}/>New report</button>}
    </PageHead>

    <div className="card stats">
      {stats.map(([k,v,s,r])=><button key={k} className="stat" onClick={()=>go(r)}><div className="lab">{k}</div><div className="v">{classes.loading&&r==='classes'?'…':v}</div><div className="s">{s}</div></button>)}
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,420px),1fr))',gap:20,alignItems:'start'}}>
      <div className="col" style={{gap:20}}>
        <div className="card">
          <div className="card-h"><div><h3>Classes today</h3><p>{todayClasses.length?`${todayClasses.length} ${todayClasses.length===1?'class meets':'classes meet'} today`:'No classes today'}</p></div><button className="btn sm ghost" onClick={()=>go('attendance')}>Attendance<Ico n="arrowr" s={14}/></button></div>
          {classes.loading?<Loading/>:todayClasses.length===0?<Empty icon="checksq" title="Nothing today" body="No classes are scheduled for today."/>:todayClasses.map(c=><ClassRow key={c.id} c={c}/>)}
        </div>

        {admin?<div className="card">
          <div className="card-h"><div><h3>Reports requiring attention</h3><p>Submitted by teachers and waiting on the office</p></div><button className="btn sm ghost" onClick={()=>go('reports')}>View reports<Ico n="arrowr" s={14}/></button></div>
          {reports.loading?<Loading/>:review.length===0?<Empty icon="file" title="All caught up" body="No reports are waiting for review."/>:review.slice(0,5).map(r=><div key={r.id} className="list-row click" onClick={()=>go('reports',{id:r.id})}>
            <Av p={r.student}/><div className="grow"><div className="nm">{r.student?name(r.student):'Student'}</div><div className="sub">{r.report_period}{r.teacher?` · ${r.teacher.first_name}`:''}</div></div><Badge s={r.status}/>
          </div>)}
        </div>:<div className="card">
          <div className="card-h"><div><h3>Reports to do</h3><p>Sent back, in draft and upcoming deadlines</p></div><button className="btn sm ghost" onClick={()=>go('reports')}>Reports<Ico n="arrowr" s={14}/></button></div>
          {reports.loading?<Loading/>:changes.length+drafts.length+deadlines.length===0?<Empty icon="file" title="Nothing to do" body="You have no reports in progress."/>:<div className="card-b col" style={{gap:10}}>
            {changes.map(r=><button key={r.id} className="qtile" style={{borderColor:'#ead6b0',background:'#fcf6e8'}} onClick={()=>go('reports',{id:r.id})}><Av p={r.student} size="sm"/><span className="grow"><b style={{fontWeight:500}}>{r.student?name(r.student):'Student'}</b><span className="sub" style={{display:'block'}}>Changes requested · {r.report_period}</span></span><Badge s="Changes Requested" plain>Revise</Badge></button>)}
            {drafts.map(r=><button key={r.id} className="qtile" onClick={()=>go('reports',{id:r.id})}><Av p={r.student} size="sm"/><span className="grow"><b style={{fontWeight:500}}>{r.student?name(r.student):'Student'}</b><span className="sub" style={{display:'block'}}>Draft · {r.report_period}</span></span><Ico n="chevr" s={16} style={{color:'var(--muted)'}}/></button>)}
            {deadlines.map(q=><div key={q.id} className="row" style={{padding:'4px 2px'}}><Ico n="clock" s={16} style={{color:'var(--gold-ink)'}}/><span className="grow sm-t">{q.report_type} reports · {clsName(classes.data.find(c=>c.id===q.class_id))}</span><span className="sm-t" style={{fontWeight:500}}>Due {H.fmtS(q.deadline)}</span></div>)}
          </div>}
        </div>}
      </div>

      <div className="col" style={{gap:20}}>
        {admin&&<div className="card">
          <div className="card-h"><div><h3>Needs your attention</h3><p>Things only the office can action</p></div></div>
          <div className="card-b col" style={{gap:10}}>
            <button className="qtile" onClick={()=>go('requests')}><span className="ic"><Ico n="userplus" s={17}/></span><span className="grow"><b style={{fontWeight:500}}>{counts.requests||0} teacher {counts.requests===1?'request':'requests'}</b><span className="sub" style={{display:'block'}}>Waiting for approval</span></span><Ico n="chevr" s={16} style={{color:'var(--muted)'}}/></button>
            <button className="qtile" onClick={()=>go('bracket')}><span className="ic"><Ico n="scale" s={17}/></span><span className="grow"><b style={{fontWeight:500}}>{counts.bracket||0} students outside their bracket</b><span className="sub" style={{display:'block'}}>Review before the next term</span></span><Ico n="chevr" s={16} style={{color:'var(--muted)'}}/></button>
            {changes.length>0&&<button className="qtile" onClick={()=>go('reports')}><span className="ic"><Ico n="file" s={17}/></span><span className="grow"><b style={{fontWeight:500}}>{changes.length} reports sent back</b><span className="sub" style={{display:'block'}}>Teachers are revising these</span></span><Ico n="chevr" s={16} style={{color:'var(--muted)'}}/></button>}
          </div>
        </div>}

        <div className="card">
          <div className="card-h"><h3>Shortcuts</h3></div>
          <div className="card-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {[['students','Students','user'],['attendance','Attendance','checksq'],['reports','Reports','file'],['notifications','Notifications','bell']].map(([r,l,i])=><button key={r} className="qtile" onClick={()=>go(r)}><span className="ic"><Ico n={i} s={16}/></span><span style={{fontWeight:500}}>{l}</span></button>)}
          </div>
        </div>
      </div>
    </div>
  </div>;
}
