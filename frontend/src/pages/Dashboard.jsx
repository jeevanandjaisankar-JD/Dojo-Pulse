// Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import StatCard from '../components/StatCard';
import {
  getDashboardStats,
  getImprovementsAnalytics,
  getUploadHistory,
  getMentorProfile,
} from '../services/api';

const unwrap = (response) =>
  response?.data ??
  response;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [improvements, setImprovements] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [mentor, setMentor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    const loadDashboard = async () => {
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

      if (!alive) return;

      if (statsResult.status === 'fulfilled') {
        const dashboardData = unwrap(statsResult.value);

        setStats(
          dashboardData?.stats ??
          dashboardData
        );
      } else {
        setError('Could not load dashboard stats.');
      }

      if (improvementsResult.status === 'fulfilled') {
        const improvementsData =
          unwrap(improvementsResult.value);

        setImprovements(
          improvementsData?.data ??
          improvementsData
        );
      }

      if (historyResult.status === 'fulfilled') {
        const historyData =
          unwrap(historyResult.value);

        setUploadHistory(
          Array.isArray(historyData)
            ? historyData
            : historyData?.history ??
              historyData?.uploads ??
              []
        );
      }

      if (mentorResult.status === 'fulfilled') {
        const mentorData =
          unwrap(mentorResult.value);

        setMentor(
          mentorData?.mentor ??
          mentorData
        );
      }

      setLoading(false);
    };

    loadDashboard();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E2E8F0] border-t-[#2563EB]" />
      </div>
    );
  }

  const improvementTiles = [
    {
      label: 'Improved Students',
      value: improvements?.improvedCount ?? 0,
      to: '/students?filter=improved',
    },
    {
      label: 'Not Improved',
      value: improvements?.notImprovedCount ?? 0,
      to: '/students?filter=attention',
    },
    {
      label: 'Improvement Rate',
      value: `${improvements?.improvementRate ?? 0}%`,
      to: '/students?filter=all',
    },
    {
      label: 'Belts Earned',
      value: improvements?.totalBeltsEarned ?? 0,
      to: '/students?filter=all',
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-[#64748B]">
          Welcome back
          {mentor?.name ? `, ${mentor.name}` : ''}.
          Here is your student progress overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {improvementTiles.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40"
          >
            <StatCard
              label={item.label}
              value={item.value}
            />
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Students"
          value={stats?.totalStudents ?? 0}
        />

        <StatCard
          label="Slots Happened"
          value={stats?.totalSlotsHappened ?? 0}
        />

        <StatCard
          label="Active Languages"
          value={stats?.activeLanguagesCount ?? 0}
        />

        <StatCard
          label="Improvement Rate"
          value={`${stats?.improvementRate ?? 0}%`}
        />
      </div>

      {/* Keep your existing dashboard charts / activity sections below this point */}
      {/* Use stats, improvements, uploadHistory as before */}
    </div>
  );
};

export default Dashboard;