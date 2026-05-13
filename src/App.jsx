import { useRef, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import HomePage from './components/HomePage.jsx';
import LessonsPage from './components/LessonsPage.jsx';
import MessagingPage from './components/MessagingPage.jsx';
import ReportsPage from './components/ReportsPage.jsx';
import HifzPage from './components/HifzPage.jsx';
import CalendarPage from './components/CalendarPage.jsx';
import PrayerTimesPage from './components/PrayerTimesPage.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import {
  calendarEvents,
  hifzSurahs,
  lessons,
  menuItems,
  messages as initialMessages,
  prayerTimes,
  schoolItems,
  subjects,
} from './data.js';

function App() {
  const [page, setPage] = useState('home');
  const [lessonItems, setLessonItems] = useState(lessons);
  const [messageItems, setMessageItems] = useState(initialMessages);
  const [selectedMessageId, setSelectedMessageId] = useState(1);
  const [composeDraft, setComposeDraft] = useState(null);
  const [surahItems, setSurahItems] = useState(hifzSurahs);
  const [toast, setToast] = useState('');
  const toastTimeoutRef = useRef(null);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToast(''), 2600);
  }

  function changePage(nextPage) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateLessonStatus(lessonId, status) {
    setLessonItems((currentLessons) =>
      currentLessons.map((lesson) => (lesson.id === lessonId ? { ...lesson, status } : lesson))
    );
    showToast(`Homework marked ${status.toLowerCase()}.`);
  }

  function askTeacherAboutLesson(lesson) {
    setComposeDraft({
      id: `${lesson.id}-${Date.now()}`,
      to: 'Zakariah',
      subject: `Mohammed · ${lesson.title}`,
      text: '',
    });
    changePage('messaging');
  }

  function addMessage({ to, subject, text }) {
    const newMessage = {
      id: Date.now(),
      sender: to,
      subject,
      preview: text,
      unread: 0,
      time: 'Just now',
      child: 'Mohammed',
      conversation: [{ who: 'yh', text, time: 'Just now' }],
    };

    setMessageItems((currentMessages) => [newMessage, ...currentMessages]);
    setSelectedMessageId(newMessage.id);
    showToast('Message sent locally.');
  }

  function sendMessage(messageId, text) {
    setMessageItems((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              preview: text,
              time: 'Just now',
              unread: 0,
              conversation: [...(message.conversation || []), { who: 'yh', text, time: 'Just now' }],
            }
          : message
      )
    );
    showToast('Message sent locally.');
  }

  function markMessageRead(messageId) {
    setSelectedMessageId(messageId);
    setMessageItems((currentMessages) =>
      currentMessages.map((message) => (message.id === messageId ? { ...message, unread: 0 } : message))
    );
  }

  function logPractice(surahTitle) {
    setSurahItems((currentSurahs) =>
      currentSurahs.map((surah) =>
        surah.title === surahTitle
          ? {
              ...surah,
              memorizedAyat: Math.min(surah.totalAyat, surah.memorizedAyat + 1),
              progress: Math.round((Math.min(surah.totalAyat, surah.memorizedAyat + 1) / surah.totalAyat) * 100),
              subtitle:
                surah.memorizedAyat + 1 >= surah.totalAyat
                  ? `${surah.totalAyat}/${surah.totalAyat} ayat · practice logged today`
                  : `${surah.memorizedAyat + 1}/${surah.totalAyat} ayat · practice logged today`,
            }
          : surah
      )
    );
    showToast(`${surahTitle} practice logged.`);
  }

  function updateSurahNotes(surahTitle, notes) {
    setSurahItems((currentSurahs) =>
      currentSurahs.map((surah) => (surah.title === surahTitle ? { ...surah, notes } : surah))
    );
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={changePage} menuItems={menuItems} schoolItems={schoolItems} />
      <main className="main-content">
        {toast && <div className="toast" role="status">{toast}</div>}
        {page === 'home' && (
          <HomePage
            lessons={lessonItems}
            messages={messageItems}
            subjects={subjects}
            prayerTimes={prayerTimes}
            onNavigate={changePage}
          />
        )}
        {page === 'lessons' && (
          <LessonsPage
            lessons={lessonItems}
            onUpdateLessonStatus={updateLessonStatus}
            onOpenResource={(resource) => showToast(`${resource} opened locally.`)}
            onAskTeacher={askTeacherAboutLesson}
          />
        )}
        {page === 'messaging' && (
          <MessagingPage
            messages={messageItems}
            selectedMessageId={selectedMessageId}
            onSelectMessage={markMessageRead}
            onAddMessage={addMessage}
            onSendMessage={sendMessage}
            composeDraft={composeDraft}
            onComposeDraftUsed={() => setComposeDraft(null)}
          />
        )}
        {page === 'reports' && <ReportsPage subjects={subjects} onDiscuss={() => changePage('messaging')} />}
        {page === 'hifz' && (
          <HifzPage hifzSurahs={surahItems} onLogPractice={logPractice} onUpdateSurahNotes={updateSurahNotes} />
        )}
        {page === 'calendar' && <CalendarPage events={calendarEvents} onNavigate={changePage} />}
        {page === 'prayer-times' && <PrayerTimesPage prayerTimes={prayerTimes} />}
        {page === 'settings' && <SettingsPage onSave={showToast} />}
      </main>
    </div>
  );
}

export default App;
