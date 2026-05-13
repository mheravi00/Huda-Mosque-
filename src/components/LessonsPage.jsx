import { useState } from 'react';
import './LessonsPage.css';

function LessonsPage({ lessons, onUpdateLessonStatus, onOpenResource, onAskTeacher }) {
  let todayLesson = lessons[0];

  lessons.forEach((lesson) => {
    if (lesson.status === 'Today') {
      todayLesson = lesson;
    }
  });

  const [selectedLessonId, setSelectedLessonId] = useState(todayLesson?.id);
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) || todayLesson;
  const homeworkStatuses = ['Undone', 'Partially complete', 'Done'];
  const currentHomeworkStatus = homeworkStatuses.includes(selectedLesson.status) ? selectedLesson.status : 'Undone';

  function getStatusClass(status) {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  return (
    <div className="page lessons-page">
      <div className="page-header small-header">
        <div>
          <p className="section-label">Week of 27 April · Class An-Noor</p>
          <h1>Lessons</h1>
          <p className="subheader">What Mohammed is learning this week, posted by Zakariah.</p>
        </div>
        <button className="button-outline" onClick={() => setSelectedLessonId(todayLesson?.id)}>
          Today’s lesson
        </button>
      </div>
      <div className="lessons-layout">
        <div className="lesson-list">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              className={`lesson-card ${getStatusClass(lesson.status)} ${lesson.id === selectedLesson.id ? 'selected' : ''}`}
              onClick={() => setSelectedLessonId(lesson.id)}
            >
              <div className="lesson-date-block">{lesson.date.split(' ')[0]}</div>
              <div>
                <p className="lesson-subject small-heading">{lesson.subject}</p>
                <h3>{lesson.title}</h3>
              </div>
              <span className="status-pill small">{lesson.status}</span>
            </button>
          ))}
        </div>
        <div className="lesson-detail panel">
          <span className="tag">{selectedLesson.subject}</span>
          <h2>{selectedLesson.title}</h2>
          <p className="subheader">{selectedLesson.objective}</p>
          <div className="detail-block">
            <h4>In class</h4>
            <ul>
              {selectedLesson.inClass.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="detail-block">
            <h4>Homework</h4>
            <p>{selectedLesson.homework}</p>
          </div>
          <div className="detail-block">
            <h4>Resources</h4>
            <button className="file-button" onClick={() => onOpenResource(selectedLesson.resource)}>
              {selectedLesson.resource}
            </button>
          </div>
          <div className="detail-actions">
            <button className="button-outline" onClick={() => onAskTeacher(selectedLesson)}>Ask teacher</button>
            <label className="status-control">
              Homework status
              <select
                value={currentHomeworkStatus}
                onChange={(event) => onUpdateLessonStatus(selectedLesson.id, event.target.value)}
              >
                {homeworkStatuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LessonsPage;
