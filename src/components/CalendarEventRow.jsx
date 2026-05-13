function CalendarEventRow({ event }) {
  return (
    <article className="event-row">
      <div className="date-tile">
        <span>{event.day}</span>
        <strong>{event.date}</strong>
      </div>
      <div>
        <p className="summary-title">{event.type} · {event.time}</p>
        <h3>{event.title}</h3>
      </div>
    </article>
  );
}

export default CalendarEventRow;
