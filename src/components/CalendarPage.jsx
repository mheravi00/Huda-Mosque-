import { useState } from 'react';
import CalendarEventRow from './CalendarEventRow.jsx';
import './SchoolPage.css';

function CalendarPage({ events, onNavigate }) {
  const [filter, setFilter] = useState('All');
  const filters = ['All'];
  let filteredEvents = events;

  events.forEach((event) => {
    if (!filters.includes(event.type)) {
      filters.push(event.type);
    }
  });

  if (filter !== 'All') {
    filteredEvents = events.filter((event) => event.type === filter);
  }

  return (
    <div className="page school-page">
      <div className="page-header small-header">
        <div>
          <p className="section-label">School calendar</p>
          <h1>Calendar</h1>
          <p className="subheader">Important class dates, meetings, homework deadlines, and term breaks.</p>
        </div>
      </div>
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
              <CalendarEventRow key={event.id} event={event} />
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
    </div>
  );
}

export default CalendarPage;
