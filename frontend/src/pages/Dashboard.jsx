import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  CalendarClock,
  Sparkles,
  TrendingUp,
  Upload,
  User,
  Users,
} from 'lucide-react';

import {
  getDashboardStats,
  getImprovementsAnalytics,
  getMentorProfile,
  getUploadHistory,
} from '../services/api';

import {
  TONES,
  fmtDate,
  fmtTime,
  isToday,
  toList,
  unwrap,
} from '../components/StatCard';

import StatCard from '../components/StatCard';
import BeltChart from '../components/BeltChart';

const TONE_CYCLE = ['blue', 'red', 'green', 'amber'];

const LAUNCHER = [
  {
    to: '/students',
    label: 'Students',
    desc: 'Browse and search',
    icon: Users,
    tone: 'blue',
  },
  {
    to: '/improvements',
    label: 'Improvements',
    desc: 'Progress analytics',
    icon: TrendingUp,
    tone: 'green',
  },
  {
    to: '/upload',
    label: 'Upload',
    desc: 'Add dojo CSV data',
    icon: Upload,
    tone: 'amber',
  },
  {
    to: '/profile',
    label: 'Profile',
    desc: 'Your mentor details',
    icon: User,
    tone: 'red',
  },
];

const greetingWord = () => {
  const hour = new Date().getHours();

  if (hour < 12) return 'Hii, Good morning..';
  if (hour < 17) return 'Hii, Good afternoon..';

  return 'Hii, Good evening..';
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

    Promise.allSettled([
      getDashboardStats(),
      getImprovementsAnalytics(),
      getUploadHistory(),
      getMentorProfile(),
    ]).then(([statsResult, improvementsResult, historyResult, mentorResult]) => {
      if (!alive) return;

      if (statsResult.status === 'fulfilled') {
        setStats(unwrap(statsResult.value));
      } else {
        setError('Could not load dashboard stats.');
      }

      if (improvementsResult.status === 'fulfilled') {
        setImprovements(unwrap(improvementsResult.value));
      }

      if (historyResult.status === 'fulfilled') {
        setHistory(
          toList(historyResult.value, 'history', 'uploads')
        );
      }

      if (mentorResult.status === 'fulfilled') {
        setMentor(unwrap(mentorResult.value));
      }

      setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, []);

  // Logged-in mentor name
  const fullName =
    mentor?.name ??
    mentor?.full_name ??
    mentor?.fullName ??
    '';

  const firstName = fullName.trim().split(' ')[0];

  // Real dashboard KPI fields from /api/dashboard/stats
  const kpis = [
    {
      label: 'Total Students',
      value: stats?.totalStudents ?? 0,
      tone: 'blue',
    },
    {
      label: 'Improved Students',
      value: stats?.improvedStudents ?? 0,
      tone: 'green',
    },
    {
      label: 'Not Improved',
      value: stats?.notImprovedStudents ?? 0,
      tone: 'red',
    },
    {
      label: 'Improvement Rate',
      value: `${stats?.improvementRate ?? 0}%`,
      tone: 'amber',
    },
    {
      label: 'Belts Earned',
      value: stats?.totalBeltsEarned ?? 0,
      tone: 'green',
    },
    {
      label: 'Slots Happened',
      value: stats?.totalSlotsHappened ?? 0,
      tone: 'blue',
    },
    {
      label: 'Active Languages',
      value: stats?.activeLanguagesCount ?? 0,
      tone: 'amber',
    },
  ];

  // Real language data from stats.languages
  const languages = Object.entries(stats?.languages ?? {}).map(
    ([label, value]) => ({
      label,
      value: Number(value?.slots) || 0,
    })
  );

  // Backend does not provide a belt-distribution object.
  // This chart therefore shows belts earned by language.
  const belts = Object.entries(stats?.languages ?? {}).map(
    ([label, value]) => ({
      label,
      value: Number(value?.beltsEarned) || 0,
    })
  );

  // Real improvement analytics fields
  const improvementTiles = [
    {
      label: 'Improved Students',
      value: improvements?.improvedCount ?? 0,
    },
    {
      label: 'Not Improved',
      value: improvements?.notImprovedCount ?? 0,
    },
    {
      label: 'Improvement Rate',
      value: `${improvements?.improvementRate ?? 0}%`,
    },
    {
      label: 'Belts Earned',
      value: improvements?.totalBeltsEarned ?? 0,
    },
  ];

  // Belts earned by language
  const improvementBars = Object.entries(
    improvements?.languages ?? {}
  ).map(([label, value]) => ({
    label,
    value: Number(value?.beltsEarned) || 0,
  }));

  // Today's real activity from dashboard stats
  const recentActivity = toList(stats?.recentActivity);

  const dayItems = recentActivity
    .filter((item) => isToday(item.timestamp ?? item.date))
    .map((item) => ({
      title: item.student ?? 'Student',
      time: fmtTime(item.timestamp ?? item.date),
      note: `${item.language ?? 'Unknown'} • ${
        item.status ?? 'Attempted'
      }`,
    }));

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 pb-28 sm:p-6 md:pb-8 lg:p-8">

      {/* Greeting */}
      <section className="grid-hero animate-rise relative overflow-hidden rounded-[20px] border border-[#D6E4FA] p-6 sm:p-10">
        <div className="relative z-10 max-w-xl">

          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#2563EB]">
            <Sparkles size={14} />
            {today}
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {greetingWord()}
            {firstName ? `, ${firstName}` : ''}
          </h1>

          <p className="mt-2 text-[#475569]">
            Here is how your dojo is doing today.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/students"
              className="btn-primary"
            >
              <Users size={16} />
              View students
            </Link>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-[#E63946]/30 bg-[#FDECEE] px-4 py-3 text-sm text-[#B91C1C]">
          {error}
        </div>
      )}

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          [0, 1, 2, 3].map((i) => (
            <StatCard
              key={i}
              loading
              label="Loading"
              icon={BarChart3}
            />
          ))
        ) : (
          kpis.map((item, index) => (
            <StatCard
              key={item.label}
              label={item.label}
              value={item.value}
              icon={BarChart3}
              tone={
                item.tone ??
                TONE_CYCLE[index % TONE_CYCLE.length]
              }
            />
          ))
        )}

        {!loading && kpis.length === 0 && (
          <p className="card col-span-full text-center text-sm text-[#64748B]">
            No stats yet. Upload dojo data to get started.
          </p>
        )}
      </section>

      {/* My Day + Quick Access */}
      <section className="grid gap-6 lg:grid-cols-5">

        {/* My Day */}
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <CalendarClock
                size={18}
                className="text-[#2563EB]"
              />
              My Day
            </h3>

            <span className="text-xs font-medium text-[#64748B]">
              {today}
            </span>
          </div>

          <div className="mt-5 space-y-3">

            {loading &&
              [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="skeleton h-14 w-full"
                />
              ))}

            {!loading && dayItems.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#D6E0EE] py-10 text-center">
                <p className="text-sm font-semibold">
                  No activity recorded today
                </p>

                <p className="mt-1 text-xs text-[#64748B]">
                  Today's student activity will appear here.
                </p>
              </div>
            )}

            {!loading &&
              dayItems.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="flex items-center gap-4 rounded-2xl border border-[#E6EBF2] bg-[#F8FAFC] px-4 py-3"
                >
                  <span className="w-16 shrink-0 text-xs font-bold text-[#2563EB]">
                    {item.time || 'Today'}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {item.title}
                    </p>

                    {item.note && (
                      <p className="truncate text-xs capitalize text-[#64748B]">
                        {item.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Quick Access */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-bold">
            Quick access
          </h3>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {LAUNCHER.map(
              ({ to, label, desc, icon: Icon, tone }) => (
                <Link
                  key={to}
                  to={to}
                  className="card-hover rounded-2xl border border-[#E6EBF2] bg-white p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40"
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONES[tone]}`}
                  >
                    <Icon size={20} />
                  </span>

                  <p className="mt-3 text-sm font-bold">
                    {label}
                  </p>

                  <p className="text-xs text-[#64748B]">
                    {desc}
                  </p>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* Language + Belts */}
      <section className="grid gap-6 lg:grid-cols-2">
        <BeltChart
          title="Language performance"
          data={languages}
          loading={loading}
          colorByBelt={false}
        />

        <BeltChart
          title="Belts earned by language"
          data={belts}
          loading={loading}
        />
      </section>

      {/* Improvement + Recent Activity */}
      <section className="grid gap-6 lg:grid-cols-2">

        {/* Improvement Overview */}
        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <TrendingUp
                size={18}
                className="text-[#10B981]"
              />
              Improvement overview
            </h3>

            <Link
              to="/improvements"
              className="text-sm font-semibold text-[#2563EB] hover:underline"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="skeleton mt-6 h-24 w-full" />
          ) : improvementTiles.length === 0 &&
            improvementBars.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#64748B]">
              No improvement data yet.
            </p>
          ) : (
            <>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {improvementTiles.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[#E6EBF2] bg-[#F8FAFC] p-4"
                  >
                    <p className="text-xs text-[#64748B]">
                      {item.label}
                    </p>

                    <p className="mt-1 text-2xl font-extrabold">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {improvementBars.length > 0 && (
                <div className="mt-4 space-y-2">
                  {improvementBars
                    .slice(0, 5)
                    .map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-[#64748B]">
                          {item.label}
                        </span>

                        <span className="font-bold text-[#10B981]">
                          {item.value}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-bold">
            Recent activity
          </h3>

          <div className="mt-5 space-y-3">

            {loading &&
              [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="skeleton h-14 w-full"
                />
              ))}

            {!loading && history.length === 0 && (
              <p className="py-8 text-center text-sm text-[#64748B]">
                No uploads yet.
              </p>
            )}

            {!loading &&
              history.slice(0, 5).map((item, index) => (
                <div
                  key={item.id ?? item._id ?? index}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#E6EBF2] bg-[#F8FAFC] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {item.filename ??
                        item.file_name ??
                        item.fileName ??
                        item.name ??
                        'Upload'}
                    </p>

                    <p className="text-xs text-[#64748B]">
                      {fmtDate(
                        item.uploaded_at ??
                          item.uploadedAt ??
                          item.created_at ??
                          item.createdAt ??
                          item.date
                      )}
                    </p>
                  </div>

                  {item.status && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        /fail|error/i.test(item.status)
                          ? 'bg-[#FDECEE] text-[#B91C1C]'
                          : 'bg-[#E3F7EF] text-[#047857]'
                      }`}
                    >
                      {item.status}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
