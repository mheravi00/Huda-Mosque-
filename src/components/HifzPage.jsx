import { useState } from 'react';
import './HifzPage.css';

function HifzPage({ hifzSurahs, onLogPractice, onUpdateSurahNotes }) {
  const [selectedSurah, setSelectedSurah] = useState('Al-Mulk');
  const activeSurah = hifzSurahs.find((surah) => surah.title === selectedSurah) || hifzSurahs[0];
  let memorizedAyat = 0;
  let totalAyat = 0;

  hifzSurahs.forEach((surah) => {
    memorizedAyat += surah.memorizedAyat;
    totalAyat += surah.totalAyat;
  });

  const memorizationStats = {
    memorizedAyat,
    totalAyat,
    percent: Math.round((memorizedAyat / totalAyat) * 100),
    surahCount: hifzSurahs.length,
  };

  return (
    <div className="page hifz-page">
      <div className="page-header small-header">
        <div>
          <p className="section-label">Quran Memorization</p>
          <h1>Hifz Tracker</h1>
          <p className="subheader">Complete Juz 'Amma + Surah Al-Mulk</p>
        </div>
        <div className="report-actions">
          <button className="button-outline" onClick={() => setSelectedSurah(activeSurah.title)}>
            Listen to recordings
          </button>
          <button className="button-primary" onClick={() => onLogPractice(activeSurah.title)}>
            Start practice
          </button>
        </div>
      </div>
      <div className="hifz-grid">
        <div className="report-panel large-card">
          <div className="circle-stat">
            <span>{memorizationStats.percent}%</span>
          </div>
          <div>
            <p className="summary-title">Memorized</p>
            <h2>{memorizationStats.memorizedAyat} / {memorizationStats.totalAyat}</h2>
            <p>ayat across {memorizationStats.surahCount} surahs</p>
          </div>
        </div>
        <div className="report-panel stat-card">
          <p className="summary-title">Streak</p>
          <h2>14 days in a row</h2>
          <p>205 min this week</p>
        </div>
        <div className="report-panel stat-card">
          <p className="summary-title">Currently learning</p>
          <h2>Surah {activeSurah.title}</h2>
          <p>{activeSurah.subtitle} · review strength {activeSurah.progress}%</p>
        </div>
      </div>
      <div className="surah-list panel">
        {hifzSurahs.map((surah) => (
          <div key={surah.title} className={surah.title === activeSurah.title ? 'surah-item active' : 'surah-item'}>
            <button className="surah-row" onClick={() => setSelectedSurah(surah.title)}>
              <div>
                <h3>{surah.title}</h3>
                <p>{surah.subtitle}</p>
              </div>
              <div className="progress-line">
                <span style={{ width: `${surah.progress}%` }} />
              </div>
              <span className="status-label">{surah.progress}%</span>
            </button>
            {surah.title === activeSurah.title && (
              <div className="surah-details">
                <div className="surah-detail-columns">
                  <div>
                    <h4>Completed</h4>
                    <ul>
                      {(surah.completedParts || []).map((part) => (
                        <li key={part}>{part}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4>Struggling with</h4>
                    <ul>
                      {(surah.strugglingParts || []).map((part) => (
                        <li key={part}>{part}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <label className="surah-notes">
                  Notes
                  <textarea
                    rows="4"
                    value={surah.notes || ''}
                    onChange={(event) => onUpdateSurahNotes(surah.title, event.target.value)}
                    placeholder="Add notes about fluency, tajweed, mistakes, or next practice..."
                  />
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HifzPage;
