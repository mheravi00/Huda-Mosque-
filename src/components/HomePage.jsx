import { Brain, Calendar, Mail, Star } from 'lucide-react';
import './HomePage.css';

function PageSection({ title, children }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function HomePage({ lessons, messages, subjects, prayerTimes, onNavigate }) {
  let unreadMessages = 0;

  messages.forEach((message) => {
    unreadMessages += message.unread;
  });

  const currentPrayer = prayerTimes.find((prayer) => prayer.active) || prayerTimes[0];

  return (
    <div className="page home-page">
      <div className="page-header">
        <div>
          <p className="small-heading">Assalamu alaykum</p>
          <h1>Good afternoon, Mohammed.</h1>
          <p className="subheader">Here’s what’s happening with Mohammed’s week at Al-Huda Mosque.</p>
        </div>
        <div className="prayer-card">
          <p className="small-heading">Today’s prayers</p>
          <div className="prayer-times">
            {prayerTimes.map((prayer) => (
              <button
                key={prayer.name}
                className={prayer.active ? 'active' : ''}
                onClick={() => onNavigate('prayer-times')}
              >
                {prayer.name} {prayer.time}
              </button>
            ))}
          </div>
          <p className="micro">Current: {currentPrayer.name}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <button className="summary-card summary-button" onClick={() => onNavigate('reports')}>
          <div className="summary-title icon-title">
            <Calendar size={18} aria-hidden="true" />
            Attendance
          </div>
          <div className="summary-large">95%</div>
          <div className="summary-meta">58/61 sessions</div>
        </button>
        <button className="summary-card summary-button dark-card" onClick={() => onNavigate('hifz')}>
          <div className="summary-title icon-title">
            <Brain size={18} aria-hidden="true" />
            Hifz progress
          </div>
          <div className="summary-large">13p</div>
          <div className="summary-meta">Streak 14 days</div>
        </button>
        <button className="summary-card summary-button" onClick={() => onNavigate('reports')}>
          <div className="summary-title icon-title">
            <Star size={18} aria-hidden="true" />
            Overall standing
          </div>
          <div className="summary-large">Excellent</div>
          <div className="summary-meta">Spring 2026 · Mid-term</div>
        </button>
        <button className="summary-card summary-button" onClick={() => onNavigate('messaging')}>
          <div className="summary-title icon-title">
            <Mail size={18} aria-hidden="true" />
            Unread messages
          </div>
          <div className="summary-large">{unreadMessages}</div>
          <div className="summary-meta">from teachers</div>
        </button>
      </div>

      <div className="home-grid">
        <PageSection title="This week in class">
          <div className="list-card">
            {lessons.map((lesson) => (
              <button key={lesson.id} className="lesson-row" onClick={() => onNavigate('lessons')}>
                <div>
                  <span className="lesson-date">{lesson.date}</span>
                  <p className="lesson-subject">{lesson.subject}</p>
                  <p>{lesson.title}</p>
                </div>
                <span className={`status-pill ${lesson.status.toLowerCase()}`}>{lesson.status}</span>
              </button>
            ))}
          </div>
        </PageSection>
        <PageSection title="Subjects at a glance">
          <div className="subject-grid">
            {subjects.map((subject) => (
              <div key={subject.title} className="subject-card">
                <div>
                  <h3>{subject.title}</h3>
                  <p>{subject.note}</p>
                </div>
                <span className="grade-pill">{subject.grade}</span>
              </div>
            ))}
          </div>
        </PageSection>
      </div>
    </div>
  );
}

export default HomePage;
