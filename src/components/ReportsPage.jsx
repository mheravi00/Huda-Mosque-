import { Calendar, Star } from 'lucide-react';
import './ReportsPage.css';

function ReportsPage({ subjects, onDiscuss }) {
  function handleDownload() {
    const reportText = [
      'Mohammed - Spring 2026 Mid-term Report',
      'Overall standing: Excellent',
      'Attendance: 95%',
      ...subjects.map((subject) => `${subject.grade} - ${subject.title}: ${subject.note}`),
    ].join('\n');
    const report = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(report);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'mohammed-mid-term-report.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page reports-page">
      <div className="page-header small-header">
        <div>
          <p className="section-label">Spring 2026 · Mid-term</p>
          <h1>Academic Report</h1>
          <p className="subheader">Mohammed · Year 4 · Class An-Noor</p>
        </div>
        <div className="report-actions">
          <button className="button-outline" onClick={handleDownload}>Download report</button>
          <button className="button-primary" onClick={onDiscuss}>Discuss with teacher</button>
        </div>
      </div>
      <div className="report-grid">
        <div className="report-panel">
          <p className="summary-title icon-title">
            <Star size={18} aria-hidden="true" />
            Overall standing
          </p>
          <h2>Excellent</h2>
          <p className="report-description">Mohammed is a thoughtful, kind student with strong recitation. He has grown notably in confidence this term and now leads class du'a regularly. Continue to encourage written reflection.</p>
          <div className="report-quote">"A pleasure to teach. - Zakariah"</div>
        </div>
        <div className="report-panel mini-panel">
          <p className="summary-title icon-title">
            <Calendar size={18} aria-hidden="true" />
            Attendance
          </p>
          <div className="attendance-score">95%</div>
          <div className="attendance-bar"><span style={{ width: '95%' }} /></div>
          <div className="attendance-meta">Present 58 · Late 1 · Absent 2</div>
        </div>
        <div className="report-panel subject-overview">
          {subjects.map((subject) => (
            <div key={subject.title} className="subject-summary">
              <div><span>{subject.grade}</span> {subject.title}</div>
              <div className="tiny">{subject.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
