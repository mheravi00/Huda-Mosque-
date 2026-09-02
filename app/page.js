import {
  Activity,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  MessageSquareText,
  School,
  UserRound,
  Users,
} from 'lucide-react';

const stats = [
  { label: 'Total students', value: '148', delta: '+12 this term', icon: Users },
  { label: 'Total teachers', value: '18', delta: '3 new this year', icon: UserRound },
  { label: 'Classes', value: '26', delta: '4 active today', icon: School },
  { label: 'Reports awaiting review', value: '09', delta: '2 overdue', icon: FileText },
];

const quickActions = [
  'Add Student',
  'Add Teacher',
  'Add Class',
  'Take Attendance',
  'Request Reports',
  'Send Announcement',
];

const activities = [
  { title: 'Attendance submitted', detail: 'Year 5 Qur’an – 20 students marked', time: '09:15 AM' },
  { title: 'Homework checked', detail: 'Islamic Studies – Year 6', time: '11:00 AM' },
  { title: 'Monthly report requested', detail: 'September reporting cycle', time: '01:30 PM' },
  { title: 'Message received', detail: 'Teacher: report approval requested', time: '02:45 PM' },
];

const tasks = [
  { title: 'Attendance to complete', value: '4 classes', tone: 'amber' },
  { title: 'Homework to mark', value: '12 submissions', tone: 'blue' },
  { title: 'Reports to complete', value: '3 drafts', tone: 'green' },
  { title: 'Reports needing changes', value: '1 update', tone: 'rose' },
];

const topStudents = [
  { name: 'Ahmed Khan', className: 'Year 5 Qur’an', status: 'On track' },
  { name: 'Maryam Ali', className: 'Year 4 Qur’an', status: 'Needs focus' },
  { name: 'Omar Yusuf', className: 'Year 3 Islamic Studies', status: 'Excellent' },
];

function cardClass(tone) {
  const tones = {
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    rose: 'bg-rose-100 text-rose-700',
  };

  return tones[tone] || 'bg-slate-100 text-slate-700';
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-green-600 p-6 text-white shadow-soft lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">Madrasa dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">Welcome back, Admin</h1>
          </div>
          <div className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
            <Clock3 className="h-5 w-5" />
            <span>Today: 12 classes scheduled</span>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, delta, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <h2 className="mt-2 text-3xl font-bold">{value}</h2>
                </div>
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-4 text-sm text-emerald-700">{delta}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Today’s activity</h2>
              <Activity className="h-5 w-5 text-slate-500" />
            </div>
            <div className="space-y-4">
              {activities.map((item) => (
                <div key={item.title} className="flex gap-4 rounded-xl border border-slate-200 p-4">
                  <div className="mt-1 rounded-full bg-emerald-100 p-2 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.detail}</p>
                  </div>
                  <span className="text-xs text-slate-400">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Quick actions</h2>
              <Bell className="h-5 w-5 text-slate-500" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Teacher dashboard</h2>
              <GraduationCap className="h-5 w-5 text-slate-500" />
            </div>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.title} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${cardClass(task.tone)}`}>
                      {task.title}
                    </span>
                  </div>
                  <strong>{task.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent students</h2>
              <BookOpen className="h-5 w-5 text-slate-500" />
            </div>
            <div className="space-y-4">
              {topStudents.map((student) => (
                <div key={student.name} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-slate-500">{student.className}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {student.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-emerald-700" />
              <h3 className="font-semibold">Calendar</h3>
            </div>
            <p className="text-sm text-slate-600">Upcoming class schedule and report deadlines are visible to admin and assigned teachers.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <MessageSquareText className="h-5 w-5 text-emerald-700" />
              <h3 className="font-semibold">Messages</h3>
            </div>
            <p className="text-sm text-slate-600">Internal admin-to-teacher communication and parent outreach are logged and traceable.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <FileText className="h-5 w-5 text-emerald-700" />
              <h3 className="font-semibold">Reports</h3>
            </div>
            <p className="text-sm text-slate-600">Weekly and monthly student reports flow from teacher to admin review and final PDF delivery.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
