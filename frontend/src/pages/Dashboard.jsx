import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import StatCard from '../components/StatCard';
import BeltChart from '../components/BeltChart';
import MentorBanner from '../components/MentorBanner';

import {
  getDashboardStats,
  getImprovementsAnalytics,
  getUploadHistory,
  getMentorProfile,
} from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [improvements, setImprovements] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [mentor, setMentor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const unwrap = (response) => {
    return response?.data ?? response;
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          statsResult,
          improvementsResult,
          historyResult,
          mentorResult,
        ] = await Promise.allSettled([
          getDashboardStats(),
          getImprovementsAnalytics(),
          getUploadHistory(),
          getMentorProfile(),
        ]);

        /* ---------------- Dashboard Stats ---------------- */

        if (statsResult.status === 'fulfilled') {
          const dashboardData = unwrap(statsResult.value);

          setStats(
            dashboardData?.stats ?? dashboardData
          );
        }

        /* ---------------- Improvements ---------------- */

        if (improvementsResult.status === 'fulfilled') {
          const improvementsData = unwrap(
            improvementsResult.value
          );

          setImprovements(
            improvementsData?.data ?? improvementsData
          );
        }

        /* ---------------- Upload History ---------------- */

        if (historyResult.status === 'fulfilled') {
          const historyData = unwrap(historyResult.value);

          const history =
            historyData?.history ??
            historyData?.data ??
            historyData;

          setUploadHistory(
            Array.isArray(history) ? history : []
          );
        }

        /* ---------------- Mentor Profile ---------------- */

        if (mentorResult.status === 'fulfilled') {
          const mentorData = unwrap(mentorResult.value);

          setMentor(
            mentorData?.mentor ??
            mentorData?.data ??
            mentorData
          );
        }

        if (
          statsResult.status === 'rejected' &&
          improvementsResult.status === 'rejected'
        ) {
          setError('Could not load dashboard data.');
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Could not load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* =========================================================
     Improvement Tiles
     ========================================================= */

  const improvementTiles = [
    {
      label: 'Improved Students',
      value: improvements?.improvedCount ?? 0,
      onClick: () => navigate('/students?filter=improved'),
    },
    {
      label: 'Not Improved',
      value: improvements?.notImprovedCount ?? 0,
      onClick: () => navigate('/students?filter=attention'),
    },
    {
      label: 'Improvement Rate',
      value: `${improvements?.improvementRate ?? 0}%`,
      onClick: () => navigate('/students?filter=all'),
    },
    {
      label: 'Belts Earned',
      value: improvements?.totalBeltsEarned ?? 0,
      onClick: () => navigate('/students?filter=all'),
    },
  ];

  /* =========================================================
     Loading State
     ========================================================= */

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded-lg bg-[#E2E8F0]" />
          <div className="mt-2 h-4 w-72 rounded bg-[#E2E8F0]" />

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl bg-[#E2E8F0]"
              />
            ))}
          </div>

          <div className="mt-8 h-72 rounded-2xl bg-[#E2E8F0]" />
        </div>
      </div>
    );
  }

  /* =========================================================
     Error State
     ========================================================= */

  if (error && !stats && !improvements) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Dashboard
        </h1>

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* =====================================================
          Header
          ===================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-[#64748B]">
          Overview of student progress and mentor activity.
        </p>
      </div>

      {/* =====================================================
          Mentor Banner
          ===================================================== */}

      {mentor && (
        <div className="mt-6">
          <MentorBanner mentor={mentor} />
        </div>
      )}

      {/* =====================================================
          Main KPI Cards
          ===================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Students"
          value={stats?.totalStudents ?? 0}
        />

        <StatCard
          label="Improved Students"
          value={stats?.improvedStudents ?? 0}
        />

        <StatCard
          label="Not Improved"
          value={stats?.notImprovedStudents ?? 0}
        />

        <StatCard
          label="Improvement Rate"
          value={`${stats?.improvementRate ?? 0}%`}
        />
      </div>

      {/* =====================================================
          Improvement Overview
          Clickable — same implementation as Improvements page
          ===================================================== */}

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">
              Improvement Overview
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Click a tile to view the corresponding students.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {improvementTiles.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="w-full rounded-2xl border border-[#E6EBF2] bg-[#F8FAFC] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#2563EB]/30 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40"
            >
              <p className="text-xs text-[#64748B]">
                {item.label}
              </p>

              <p className="mt-1 text-2xl font-extrabold text-[#0F172A]">
                {item.value}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================
          Belt / Progress Chart
          ===================================================== */}

      <div className="mt-8">
        <div className="rounded-2xl border border-[#E6EBF2] bg-white p-5">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">
              Belt Progress
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Overview of belts earned by students.
            </p>
          </div>

          <div className="mt-5">
            <BeltChart
              data={
                stats?.languages ??
                improvements?.languages ??
                []
              }
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          Dashboard Statistics
          ===================================================== */}

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Slots */}
        <div className="rounded-2xl border border-[#E6EBF2] bg-white p-5">
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Slot Activity
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#F8FAFC] p-4">
              <p className="text-xs text-[#64748B]">
                Total Slots
              </p>

              <p className="mt-1 text-2xl font-extrabold text-[#0F172A]">
                {stats?.totalSlotsHappened ??
                  improvements?.totalSlotsHappened ??
                  0}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F8FAFC] p-4">
              <p className="text-xs text-[#64748B]">
                Belts Earned
              </p>

              <p className="mt-1 text-2xl font-extrabold text-[#0F172A]">
                {stats?.totalBeltsEarned ??
                  improvements?.totalBeltsEarned ??
                  0}
              </p>
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="rounded-2xl border border-[#E6EBF2] bg-white p-5">
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Active Languages
          </h2>

          <div className="mt-5">
            {stats?.languages &&
            Object.keys(stats.languages).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.languages).map(
                  ([language, count]) => (
                    <div
                      key={language}
                      className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-4 py-3"
                    >
                      <span className="text-sm text-[#64748B]">
                        {language}
                      </span>

                      <span className="font-semibold text-[#0F172A]">
                        {count}
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm text-[#64748B]">
                No language data available.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          Recent Activity
          ===================================================== */}

      <div className="mt-8">
        <div className="rounded-2xl border border-[#E6EBF2] bg-white">
          <div className="border-b border-[#E6EBF2] p-5">
            <h2 className="text-lg font-semibold text-[#0F172A]">
              Recent Activity
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Latest student progress activity.
            </p>
          </div>

          {stats?.recentActivity?.length > 0 ? (
            <div className="divide-y divide-[#E6EBF2]">
              {stats.recentActivity.map((activity, index) => (
                <div
                  key={activity._id ?? index}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">
                      {activity.studentName ??
                        activity.name ??
                        'Student'}
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                      {activity.message ??
                        activity.action ??
                        activity.description ??
                        'Progress updated'}
                    </p>
                  </div>

                  <span className="whitespace-nowrap text-xs text-[#94A3B8]">
                    {activity.date ??
                      activity.createdAt ??
                      ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 text-sm text-[#64748B]">
              No recent activity available.
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          Upload History
          ===================================================== */}

      <div className="mt-8">
        <div className="rounded-2xl border border-[#E6EBF2] bg-white">
          <div className="border-b border-[#E6EBF2] p-5">
            <h2 className="text-lg font-semibold text-[#0F172A]">
              Recent Uploads
            </h2>
          </div>

          {uploadHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      File
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Students
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E6EBF2]">
                  {uploadHistory.slice(0, 5).map(
                    (upload, index) => (
                      <tr
                        key={upload._id ?? index}
                        className="hover:bg-[#F8FAFC]"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-[#0F172A]">
                          {upload.filename ??
                            upload.fileName ??
                            upload.name ??
                            '—'}
                        </td>

                        <td className="px-6 py-4 text-sm text-[#64748B]">
                          {upload.studentCount ??
                            upload.studentsProcessed ??
                            0}
                        </td>

                        <td className="px-6 py-4 text-sm text-[#64748B]">
                          {upload.createdAt
                            ? new Date(
                                upload.createdAt
                              ).toLocaleDateString()
                            : '—'}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5 text-sm text-[#64748B]">
              No upload history available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;