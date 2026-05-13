import PrayerTimeRow from './PrayerTimeRow.jsx';
import './SchoolPage.css';

function PrayerTimesPage({ prayerTimes }) {
  const activePrayer = prayerTimes.find((prayer) => prayer.active);

  return (
    <div className="page school-page">
      <div className="page-header small-header">
        <div>
          <p className="section-label">Daily schedule</p>
          <h1>Prayer times</h1>
          <p className="subheader">
            Today at Al-Huda Mosque. Times shown are frontend sample data, i need to change this and add based on
            location and al Huda mosque times.
          </p>
        </div>
      </div>
      <div className="school-grid">
        <section className="school-panel prayer-board">
          {prayerTimes.map((prayer) => (
            <PrayerTimeRow key={prayer.name} prayer={prayer} />
          ))}
        </section>
        <section className="school-panel compact-panel">
          <p className="summary-title">Next prayer</p>
          <h2>{activePrayer?.name || 'Fajr'}</h2>
          <p>Set a local reminder from Settings when backend notifications are added later.</p>
        </section>
      </div>
    </div>
  );
}

export default PrayerTimesPage;
