import { useState } from 'react';
import './SchoolPage.css';

const pageCopy = {
  calendar: {
    eyebrow: 'School calendar',
    title: 'Calendar',
    text: 'Important class dates, meetings, homework deadlines, and term breaks.',
  },
  'prayer-times': {
    eyebrow: 'Daily schedule',
    title: 'Prayer times',
    text: 'Today at Al-Huda Mosque. Times shown are frontend sample data.',
  },
  settings: {
    eyebrow: 'Parent portal',
    title: 'Settings',
    text: 'Manage local notification preferences for this frontend prototype.',
  },
};

function CalendarView({ events, onNavigate }) {
  const [filter, setFilter] = useState('All');
  let filteredEvents = events;
  const filters = ['All'];

  if (filter !== 'All') {
    filteredEvents = events.filter((event) => event.type === filter);
  }

  events.forEach((event) => {
    if (!filters.includes(event.type)) {
      filters.push(event.type);
    }
  });

  return (
    <div className="school-grid">
      <section className="school-panel">
        <div className="filter-row">
          {filters.map((item) => (
            <button key={item} className={filter === item ? 'tab active' : 'tab'} onClick={() => setFilter(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className="event-list">
          {filteredEvents.map((event) => (
            <article key={event.id} className="event-row">
              <div className="date-tile">
                <span>{event.day}</span>
                <strong>{event.date}</strong>
              </div>
              <div>
                <p className="summary-title">{event.type} · {event.time}</p>
                <h3>{event.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="school-panel compact-panel">
        <p className="summary-title">Next action</p>
        <h2>Parent check-in</h2>
        <p>Confirm or discuss Wednesday's meeting from Messages.</p>
        <button className="button-primary" onClick={() => onNavigate('messaging')}>Open messages</button>
      </section>
    </div>
  );
}

function PrayerTimesView({ prayerTimes }) {
  const activePrayer = prayerTimes.find((prayer) => prayer.active);

  return (
    <div className="school-grid">
      <section className="school-panel prayer-board">
        {prayerTimes.map((prayer) => (
          <button key={prayer.name} className={prayer.active ? 'prayer-row active' : 'prayer-row'}>
            <span>{prayer.name}</span>
            <strong>{prayer.time}</strong>
          </button>
        ))}
      </section>
      <section className="school-panel compact-panel">
        <p className="summary-title">Next prayer</p>
        <h2>{activePrayer?.name || 'Fajr'}</h2>
        <p>Set a local reminder from Settings when backend notifications are added later.</p>
      </section>
    </div>
  );
}

function SettingsView({ onSave }) {
  const [settings, setSettings] = useState({
    lessonReminders: true,
    messageAlerts: true,
    weeklyReport: false,
    theme: 'Light',
  });

  function toggle(key) {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <section className="school-panel settings-panel">
      <label className="setting-row">
        <span>
          <strong>Lesson reminders</strong>
          <small>Show local reminders for homework and class prep.</small>
        </span>
        <input type="checkbox" checked={settings.lessonReminders} onChange={() => toggle('lessonReminders')} />
      </label>
      <label className="setting-row">
        <span>
          <strong>Message alerts</strong>
          <small>Highlight unread teacher and office messages.</small>
        </span>
        <input type="checkbox" checked={settings.messageAlerts} onChange={() => toggle('messageAlerts')} />
      </label>
      <label className="setting-row">
        <span>
          <strong>Weekly report email</strong>
          <small>Prepared for a future backend email workflow.</small>
        </span>
        <input type="checkbox" checked={settings.weeklyReport} onChange={() => toggle('weeklyReport')} />
      </label>
      <label className="setting-row select-row">
        <span>
          <strong>Theme</strong>
          <small>Stored locally for this prototype session.</small>
        </span>
        <select value={settings.theme} onChange={(event) => setSettings({ ...settings, theme: event.target.value })}>
          <option>Light</option>
          <option>High contrast</option>
        </select>
      </label>
      <button className="button-primary" onClick={() => onSave('Settings saved locally.')}>Save settings</button>
    </section>
  );
}

function SchoolPage({ page, events, prayerTimes, onNavigate, onSave }) {
  const copy = pageCopy[page];

  return (
    <div className="page school-page">
      <div className="page-header small-header">
        <div>
          <p className="section-label">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="subheader">{copy.text}</p>
        </div>
      </div>
      {page === 'calendar' && <CalendarView events={events} onNavigate={onNavigate} />}
      {page === 'prayer-times' && <PrayerTimesView prayerTimes={prayerTimes} />}
      {page === 'settings' && <SettingsView onSave={onSave} />}
    </div>
  );
}

export default SchoolPage;
