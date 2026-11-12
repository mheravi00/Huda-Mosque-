'use client';
// Huda — Attendance analytics: weekly totals and a by-class breakdown.
import React,{useMemo,useState}from'react';
import{attendanceApi}from'../../lib/api/resources';
import{listAllAttendanceRows}from'../attendance-register';
import{useApiResource}from'../useApiResource';
import{useClasses}from'./data';
import{Empty,H,Listing,PageHead,Seg,clsName,secName,useUI}from'./ui';

const present=s=>s==='Present'||s==='Late';
export function Analytics(){
  const classes=useClasses();
  const att=useApiResource(()=>listAllAttendanceRows(attendanceApi.list,{sort:'date',direction:'desc'}),[]);
  const [span,setSpan]=useState('4');
  const model=useMemo(()=>{
    const rows=att.data;
    const dates=[...new Set(rows.map(r=>r.attendance_date))].sort((a,b)=>b.localeCompare(a));
    const weeks=dates.slice(0,+span).reverse();
    const presentBy={};// `${date}|${class}` -> count
    rows.forEach(r=>{if(present(r.status))presentBy[`${r.attendance_date}|${r.class_id}`]=(presentBy[`${r.attendance_date}|${r.class_id}`]||0)+1});
    const totalFor=d=>weeks.includes(d)?rows.filter(r=>r.attendance_date===d&&present(r.status)).length:0;
    const weekTotals=weeks.map(totalFor);
    const activeClasses=[...classes.data].filter(c=>c.active).sort((a,b)=>String(a.gender).localeCompare(b.gender)||(a.min_age??0)-(b.min_age??0)||String(a.section||'').localeCompare(b.section||''));
    // keep only classes that have any attendance in range
    const used=activeClasses.filter(c=>weeks.some(d=>presentBy[`${d}|${c.id}`]));
    const byClass=used.map(c=>{const vals=weeks.map(d=>presentBy[`${d}|${c.id}`]||0);const avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;return{c,vals,avg:Math.round(avg*10)/10}});
    const maxAvg=Math.max(1,...byClass.map(x=>x.avg));
    const avgWeekly=weekTotals.length?Math.round(weekTotals.reduce((a,b)=>a+b,0)/weekTotals.length):0;
    const maxWeek=Math.max(1,...weekTotals);
    return{weeks,weekTotals,byClass,maxAvg,avgWeekly,maxWeek,colTotals:weeks.map(totalFor)};
  },[att.data,classes.data,span]);
  return <div className="enter">
    <PageHead title="Attendance analytics" desc="Weekly present totals across all classes, and the average for each class.">
      <Seg value={span} options={[['4','Last 4'],['8','Last 8'],['12','Last 12']]} onChange={setSpan}/>
    </PageHead>
    <Listing res={att} count={att.data.length} empty="No attendance yet" emptyIcon="checksq" emptyBody="Take some registers and the analytics will appear here.">
      {model.weeks.length===0?<div className="card"><Empty icon="checksq" title="No attendance yet" body="Take some registers and the analytics will appear here."/></div>:<>
      <div className="card" style={{marginBottom:20}}>
        <div className="card-h"><h3>Total attendance each week</h3></div>
        <div className="card-b" style={{display:'flex',flexWrap:'wrap',gap:28,alignItems:'flex-end'}}>
          <div style={{minWidth:150}}><div className="az-avg">{model.avgWeekly}</div><div className="sub" style={{marginTop:6}}>average weekly total,<br/>last {model.weeks.length} {model.weeks.length===1?'week':'weeks'}</div></div>
          <div className="az-bars grow">
            {model.weeks.map((d,i)=><div key={d} className="az-bar">
              <div className="bar-v">{model.weekTotals[i]}</div>
              <div className="bar-fill" style={{height:`${Math.round(model.weekTotals[i]/model.maxWeek*150)+6}px`}}></div>
              <div className="bar-lab">Week {i+1}<br/><span className="muted">{H.fmtS(d)}</span></div>
            </div>)}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-h"><h3>Attendance by class</h3></div>
        <div className="tscroll"><table className="tbl">
          <thead><tr><th>Class</th>{model.weeks.map((d,i)=><th key={d} className="r">Wk {i+1}</th>)}<th className="r">Average</th><th className="hide-sm"></th></tr></thead>
          <tbody>{model.byClass.map(({c,vals,avg})=>{const fem=String(c.gender).toLowerCase()==='female';return <tr key={c.id}>
            <td><div style={{fontWeight:500}}>{secName(c)}</div><div className="sub">{String(c.gender).toLowerCase()==='male'?'Boys':'Girls'} {c.min_age}–{c.max_age}</div></td>
            {vals.map((v,i)=><td key={i} className="r">{v}</td>)}
            <td className="r"><b style={{fontWeight:600}}>{avg}</b></td>
            <td className="hide-sm"><div className="minibar"><i style={{width:`${Math.round(avg/model.maxAvg*100)}%`,background:fem?'#d98aa8':'#5c9fd1'}}></i></div></td>
          </tr>})}</tbody>
          <tfoot><tr style={{borderTop:'2px solid var(--line)'}}><td style={{fontWeight:600}}>Total present</td>{model.colTotals.map((v,i)=><td key={i} className="r" style={{fontWeight:600}}>{v}</td>)}<td className="r" style={{fontWeight:600}}>{model.avgWeekly}</td><td className="hide-sm"></td></tr></tfoot>
        </table></div>
      </div>
      </>}
    </Listing>
  </div>;
}
