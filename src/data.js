export const menuItems = [
  { id: 'home', label: 'Home' },
  { id: 'messaging', label: 'Messaging' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'reports', label: 'Reports' },
  { id: 'hifz', label: 'Hifz Tracker' },
];

export const schoolItems = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'prayer-times', label: 'Prayer times' },
  { id: 'settings', label: 'Settings' },
];

export const subjects = [
  { title: "Qur'an Recitation", grade: 'A', note: 'Improving' },
  { title: 'Hifz', grade: 'A-', note: "On track: Juz 'Amma + Surah Al-Mulk" },
  { title: 'Arabic Language', grade: 'B+', note: 'Reading fluency strong; work on broken plurals' },
  { title: 'Islamic Studies', grade: 'A', note: 'Excellent grasp of Seerah; thoughtful questions' },
  { title: 'Akhlaq & Adab', grade: 'A', note: 'Kind to peers; helps younger students' },
  { title: "Du'a & Adhkar", grade: 'A', note: 'Knows daily adhkar by heart' },
];

export const lessons = [
  {
    id: 1,
    date: 'Mon 27 Apr',
    subject: "Qur'an",
    title: 'Surah Al-Mulk · Ayah 1-10',
    status: 'Done',
    objective: 'Practice smooth recitation with clean stops at the end of each ayah.',
    inClass: ['Teacher-led recitation', 'Peer listening pairs', 'Tajweed check on qalqalah letters'],
    homework: 'Listen to the class recording and revise ayat 1-10 after Maghrib.',
    resource: 'al-mulk-ayat-1-10-audio.mp3',
  },
  {
    id: 2,
    date: 'Tue 28 Apr',
    subject: 'Arabic',
    title: "Broken Plurals · Pattern fu'ul",
    status: 'Today',
    objective: "Recognize and form the broken plural pattern fu'ul from singular nouns.",
    inClass: ['Pattern drills on whiteboard', 'Worksheet: 12 nouns to convert'],
    homework: 'Complete worksheet pp. 14-15.',
    resource: 'arabic-wb-pp14-15.pdf',
  },
  {
    id: 3,
    date: 'Wed 29 Apr',
    subject: 'Islamic Studies',
    title: 'The Hijrah · Departure from Makkah',
    status: 'Upcoming',
    objective: 'Understand the trust, planning, and courage shown during the Hijrah.',
    inClass: ['Map the route to Madinah', 'Discuss lessons from the cave of Thawr'],
    homework: 'Write three sentences about one lesson from the Hijrah.',
    resource: 'hijrah-route-map.pdf',
  },
  {
    id: 4,
    date: 'Thu 30 Apr',
    subject: 'Akhlaq',
    title: 'The Adab of Listening',
    status: 'Upcoming',
    objective: 'Practice respectful listening during recitation, discussion, and group work.',
    inClass: ['Role-play class discussion habits', 'Reflect on listening before speaking'],
    homework: 'Notice one moment at home where good listening helped someone.',
    resource: 'adab-listening-reflection.pdf',
  },
];

export const messages = [
  {
    id: 1,
    sender: 'Zakariah',
    subject: 'Mohammed · Tajweed practice this week',
    preview: 'Also, would you be free Wednesday at 4:30pm for a brief check-in?',
    unread: 2,
    time: '10:42',
    child: 'Mohammed',
    conversation: [
      {
        who: 'uk',
        text: 'As-salamu alaykum. Just a note that Mohammed led the class in Surah Ad-Duha this morning, and his recitation has improved so much. Allahumbarik.',
        time: 'Mon 09:14',
      },
      {
        who: 'yh',
        text: "Wa alaykum as-salam Zakariah. That's wonderful to hear. We've been practicing the heavy letters together after Maghrib.",
        time: 'Mon 19:30',
      },
      {
        who: 'uk',
        text: 'Also, would you be free Wednesday at 4:30pm for a brief check-in?',
        time: '10:42',
      },
    ],
  },
  {
    id: 2,
    sender: 'Abdul Rahman',
    subject: 'Mohammed · Fiqh assignment extension',
    preview: 'Wa alaykum as-salam. Of course, Wednesday is fine.',
    unread: 0,
    time: 'Yesterday',
    child: 'Mohammed',
    conversation: [
      {
        who: 'yh',
        text: 'As-salamu alaykum. Mohammed was unwell yesterday. Could he have until Wednesday for the Fiqh assignment?',
        time: 'Yesterday 08:05',
      },
      {
        who: 'uk',
        text: 'Wa alaykum as-salam. Of course, Wednesday is fine. Please tell him to focus on the short answer questions first.',
        time: 'Yesterday 10:12',
      },
    ],
  },
  {
    id: 3,
    sender: 'Abdul Rahman',
    subject: 'Eid al-Fitr term schedule',
    preview: 'Reminder: school closes Thursday 7 May and reopens Monday 18 May.',
    unread: 0,
    time: 'Mon',
    child: 'Mohammed',
    conversation: [
      {
        who: 'uk',
        text: 'Reminder: school closes Thursday 7 May and reopens Monday 18 May. May Allah accept your worship and bless your families.',
        time: 'Mon 12:00',
      },
    ],
  },
];

export const hifzSurahs = [
  {
    title: 'Al-Fatihah',
    memorizedAyat: 7,
    totalAyat: 7,
    progress: 100,
    status: 'Strong',
    subtitle: '7/7 ayat · last reviewed today',
    completedParts: ['Ayat 1-7'],
    strugglingParts: ['Keep the madd consistent in ayah 7'],
    notes: 'Recites confidently. Review slowly once before moving on.',
  },
  {
    title: 'Al-Falaq',
    memorizedAyat: 5,
    totalAyat: 5,
    progress: 100,
    status: 'Strong',
    subtitle: '5/5 ayat · last reviewed yesterday',
    completedParts: ['Ayat 1-5'],
    strugglingParts: ['Needs a gentle pause before ayah 4'],
    notes: 'Strong overall. Practice connecting ayat without rushing.',
  },
  {
    title: 'Az-Zalzalah',
    memorizedAyat: 5,
    totalAyat: 8,
    progress: 63,
    status: 'Needs review',
    subtitle: '5/8 ayat · last reviewed in progress',
    completedParts: ['Ayat 1-5'],
    strugglingParts: ['Ayat 6-8', 'Ending sounds between mithqala and yarah'],
    notes: 'Break the final three ayat into short repeat sets.',
  },
  {
    title: 'Al-Mulk',
    memorizedAyat: 9,
    totalAyat: 30,
    progress: 30,
    status: 'Re-memorize',
    subtitle: '9/30 ayat · last reviewed today',
    completedParts: ['Ayat 1-9'],
    strugglingParts: ['Ayat 7-9', 'Qalqalah clarity in ayah 8'],
    notes: 'Repeat ayat 7-9 after listening to the recording twice.',
  },
  {
    title: 'An-Nas',
    memorizedAyat: 6,
    totalAyat: 6,
    progress: 100,
    status: 'Strong',
    subtitle: '6/6 ayat · last reviewed yesterday',
    completedParts: ['Ayat 1-6'],
    strugglingParts: ['Keep the final three ayat distinct'],
    notes: 'Good fluency. Use as warm-up recitation.',
  },
  {
    title: 'Al-Ikhlas',
    memorizedAyat: 4,
    totalAyat: 4,
    progress: 100,
    status: 'Strong',
    subtitle: '4/4 ayat · last reviewed today',
    completedParts: ['Ayat 1-4'],
    strugglingParts: ['Avoid rushing ayah 3'],
    notes: 'Very secure. Review for tajweed polish.',
  },
];

export const calendarEvents = [
  { id: 1, date: '27 Apr', day: 'Mon', title: "Qur'an recitation assessment", time: '16:00', type: 'Class' },
  { id: 2, date: '29 Apr', day: 'Wed', title: 'Parent check-in with Zakariah', time: '16:30', type: 'Meeting' },
  { id: 3, date: '30 Apr', day: 'Thu', title: 'Akhlaq reflection due', time: '18:00', type: 'Homework' },
  { id: 4, date: '7 May', day: 'Thu', title: 'Last school day before Eid break', time: '17:30', type: 'School' },
  { id: 5, date: '18 May', day: 'Mon', title: 'Classes resume', time: '16:00', type: 'School' },
];

export const prayerTimes = [
  { name: 'Fajr', time: '04:42' },
  { name: 'Dhuhr', time: '12:58' },
  { name: 'Asr', time: '16:34', active: true },
  { name: 'Maghrib', time: '19:51' },
  { name: 'Isha', time: '21:18' },
];
