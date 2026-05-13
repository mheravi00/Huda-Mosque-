import CalendarPage from './CalendarPage.jsx';
import PrayerTimesPage from './PrayerTimesPage.jsx';
import SettingsPage from './SettingsPage.jsx';

function SchoolPage({ page, events, prayerTimes, onNavigate, onSave }) {
  if (page === 'calendar') {
    return <CalendarPage events={events} onNavigate={onNavigate} />;
  }

  if (page === 'prayer-times') {
    return <PrayerTimesPage prayerTimes={prayerTimes} />;
  }

  return <SettingsPage onSave={onSave} />;
}

export default SchoolPage;
