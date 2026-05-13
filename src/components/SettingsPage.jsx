import { useState } from 'react';
import SettingRow from './SettingRow.jsx';
import './SchoolPage.css';

function SettingsPage({ onSave }) {
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
    <div className="page school-page">
      <div className="page-header small-header">
        <div>
          <p className="section-label">Parent portal</p>
          <h1>Settings</h1>
          <p className="subheader">Manage local notification preferences for this frontend prototype.</p>
        </div>
      </div>
      <section className="school-panel settings-panel">
        <SettingRow
          title="Lesson reminders"
          text="Show local reminders for homework and class prep."
          checked={settings.lessonReminders}
          onChange={() => toggle('lessonReminders')}
        />
        <SettingRow
          title="Message alerts"
          text="Highlight unread teacher and office messages."
          checked={settings.messageAlerts}
          onChange={() => toggle('messageAlerts')}
        />
        <SettingRow
          title="Weekly report email"
          text="Prepared for a future backend email workflow."
          checked={settings.weeklyReport}
          onChange={() => toggle('weeklyReport')}
        />
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
    </div>
  );
}

export default SettingsPage;
