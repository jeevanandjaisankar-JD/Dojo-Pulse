import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, CalendarClock, Sparkles, TrendingUp, Upload, User, Users } from 'lucide-react';
import { getDashboardStats, getImprovementsAnalytics, getMentorProfile, getUploadHistory } from '../services/api';
import StatCard, { TONES, unwrap, toList, toPairs, humanize, fmtVal, fmtDate, fmtTime, isToday } from '../components/StatCard';
import BeltChart from '../components/BeltChart';

const TONE_CYCLE = ['blue', 'red', 'green', 'amber'];
const primitives = (obj) =>
  Object.entries(obj || {}).filter(([, v]) => typeof v === 'number' || (typeof v === 'string' && v.length < 24));

const LAUNCHER = [
  { to: '/students', label: 'Students', desc: 'Browse and search', icon: Users, tone: 'blue' },
  { to: '/improvements', label: 'Improvements', desc: 'Progress analytics', icon: TrendingUp, tone: 'green' },
  { to: '/upload', label: 'Upload', desc: 'Add dojo CSV data', icon: Upload, tone: 'amber' },
  { to: '/profile', label: 'Profile', desc: 'Your mentor details', icon: User, tone: 'red' },
];

const greetingWord = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Hii,Good morning..' : h < 17 ? 'Hii,Good afternoon..' : 'Hii,Good evening..';
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [improvements, setImprovements] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.allSettled([getDashboardStats(), getImprovementsAnalytics(), getUploadHistory(), getMentorProfile()]).then(
      ([s, i, h, m]) => {
        if (!alive) return;
        if (s.status === 'fulfilled') setStats(unwrap(s.value));
        else setError('Could not load dashboard stats.');
        if (i.status === 'fulfilled') setImprovements(unwrap(i.value));
        if (h.status === 'fulfilled') setHistory(toList(h.value, 'history', 'uploads'));
        if (m.status === 'fulfilled') setMentor(unwrap(m.value));
        setLoading(false);
      }
    );
    return () => { alive = false; };
  }, []);

  const fullName = mentor?.name ?? mentor?.full_name ?? mentor?.fullName ?? '';
  const firstName = fullName.trim().split(' ')[0];

  const kpis = primitives(stats).slice(0, 8);
  const languages = toPairs(stats?.language_performance ?? stats?.languagePerformance ?? stats?.languages ?? stats?.language_stats);
  const belts = toPairs(stats?.belt_distribution ?? stats?.beltDistribution ?? stats?.belts);
  const improvementTiles = primitives(improvements).slice(0, 4);
  const improvementBars = toPairs(improvements?.trend ?? improvements?.weekly ?? improvements?.by_language ?? improvements?.byLanguage);

  // My Day: schedule items from the stats API if present, otherwise today's upload activity.
  const schedule = toList(stats?.schedule ?? stats?.my_day ?? stats?.myDay ?? stats?.sessions);
  const dayItems = schedule.length
    ? schedule.map((s) => ({
        title: s.title ?? s.name ?? s.topic ?? 'Session',
        time: s.time ?? s.start_time ?? s.startTime ?? '',
        note: s.description ?? s.location ?? s.status ?? '',
      }))
    : history
        .filter((h) => isToday(h.uploaded_at ?? h.uploadedAt ?? h.created_at ?? h.createdAt ?? h.date))
        .map((h) => ({
          title: `Uploaded ${h.filename ?? h.file_name ?? h.fileName ?? h.name ?? 'file'}`,
          time: fmtTime(h.uploaded_at ?? h.uploadedAt ?? h.created_at ?? h.createdAt ?? h.date),
          note: h.status ?? '',
        }));

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 pb-28 sm:p-6 md:pb-8 lg:p-8">
      {/* Greeting */}
      <section className="grid-hero animate-rise relative overflow-hidden rounded-[20px] border border-[#D6E4FA] p-6 sm:p-10">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#2563EB]">
            <Sparkles size={14} /> {today}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {greetingWord()}
            {firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="mt-2 text-[#475569]">Here is how your dojo is doing today.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/students" className="btn-primary"><Users size={16} /> View students</Link>
        
          </div>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-[#E63946]/30 bg-[#FDECEE] px-4 py-3 text-sm text-[#B91C1C]">{error}</div>}

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? [0, 1, 2, 3].map((i) => <StatCard key={i} loading label="Loading" icon={BarChart3} />)
          : kpis.map(([k, v], i) => (
              <StatCard key={k} label={humanize(k)} value={fmtVal(v)} icon={BarChart3} tone={TONE_CYCLE[i % 4]} />
            ))}
        {!loading && kpis.length === 0 && (
          <p className="card col-span-full text-center text-sm text-[#64748B]">No stats yet. Upload dojo data to get started.</p>
        )}
      </section>

      {/* My Day + launcher */}
      <section className="grid gap-6 lg:grid-cols-5">
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold"><CalendarClock size={18} className="text-[#2563EB]" /> My Day</h3>
            <span className="text-xs font-medium text-[#64748B]">{today}</span>
          </div>
          <div className="mt-5 space-y-3">
            {loading && [0, 1, 2].map((i) => <div key={i} className="skeleton h-14 w-full" />)}
            {!loading && dayItems.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#D6E0EE] py-10 text-center">
                <p className="text-sm font-semibold">Nothing scheduled for today</p>
                <p className="mt-1 text-xs text-[#64748B]">Sessions and today's uploads will show up here.</p>
              </div>
            )}
            {!loading && dayItems.map((d, i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl border border-[#E6EBF2] bg-[#F8FAFC] px-4 py-3">
                <span className="w-16 shrink-0 text-xs font-bold text-[#2563EB]">{d.time || 'Today'}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{d.title}</p>
                  {d.note && <p className="truncate text-xs capitalize text-[#64748B]">{d.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="text-lg font-bold">Quick access</h3>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {LAUNCHER.map(({ to, label, desc, icon: Icon, tone }) => (
              <Link
                key={to}
                to={to}
                className="card-hover rounded-2xl border border-[#E6EBF2] bg-white p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40"
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONES[tone]}`}><Icon size={20} /></span>
                <p className="mt-3 text-sm font-bold">{label}</p>
                <p className="text-xs text-[#64748B]">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Language + belts */}
      <section className="grid gap-6 lg:grid-cols-2">
        <BeltChart title="Language performance" data={languages} loading={loading} colorByBelt={false} />
        <BeltChart title="Belt distribution" data={belts} loading={loading} />
      </section>

      {/* Improvement + activity */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold"><TrendingUp size={18} className="text-[#10B981]" /> Improvement overview</h3>
            <Link to="/improvements" className="text-sm font-semibold text-[#2563EB] hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="skeleton mt-6 h-24 w-full" />
          ) : improvementTiles.length === 0 && improvementBars.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#64748B]">No improvement data yet.</p>
          ) : (
            <>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {improvementTiles.map(([k, v]) => (
                  <div key={k} className="rounded-2xl border border-[#E6EBF2] bg-[#F8FAFC] p-4">
                    <p className="text-xs text-[#64748B]">{humanize(k)}</p>
                    <p className="mt-1 text-2xl font-extrabold">{fmtVal(v)}</p>
                  </div>
                ))}
              </div>
              {improvementBars.length > 0 && (
                <div className="mt-4 space-y-2">
                  {improvementBars.slice(0, 5).map((b) => (
                    <div key={b.label} className="flex items-center justify-between text-sm">
                      <span className="text-[#64748B]">{b.label}</span>
                      <span className="font-bold text-[#10B981]">{fmtVal(b.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-bold">Recent activity</h3>
          <div className="mt-5 space-y-3">
            {loading && [0, 1, 2].map((i) => <div key={i} className="skeleton h-14 w-full" />)}
            {!loading && history.length === 0 && <p className="py-8 text-center text-sm text-[#64748B]">No uploads yet.</p>}
            {!loading && history.slice(0, 5).map((h, i) => (
              <div key={h.id ?? h._id ?? i} className="flex items-center justify-between gap-3 rounded-2xl border border-[#E6EBF2] bg-[#F8FAFC] px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{h.filename ?? h.file_name ?? h.fileName ?? h.name ?? 'Upload'}</p>
                  <p className="text-xs text-[#64748B]">{fmtDate(h.uploaded_at ?? h.uploadedAt ?? h.created_at ?? h.createdAt ?? h.date)}</p>
                </div>
                {h.status && (
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                    /fail|error/i.test(h.status) ? 'bg-[#FDECEE] text-[#B91C1C]' : 'bg-[#E3F7EF] text-[#047857]'
                  }`}>{h.status}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
