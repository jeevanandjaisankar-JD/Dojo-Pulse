import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { getImprovementsAnalytics } from '../services/api';

const Improvements = () => {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getImprovementsAnalytics();

        const data =
          response?.data?.data ??
          response?.data ??
          response;

        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load improvements analytics:', err);
        setError('Could not load improvements analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const getTileAction = (label) => {
    const normalizedLabel = String(label)
      .toLowerCase()
      .replace(/_/g, ' ');

    if (
      normalizedLabel.includes('improved') &&
      !normalizedLabel.includes('not')
    ) {
      return () => navigate('/students?filter=improved');
    }

    if (
      normalizedLabel.includes('not improved') ||
      normalizedLabel.includes('no improvement') ||
      normalizedLabel.includes('attention')
    ) {
      return () => navigate('/students?filter=attention');
    }

    return () => navigate('/students?filter=all');
  };

  const stats = [
    {
      label: 'Total Students',
      value: analytics?.totalStudents ?? 0,
    },
    {
      label: 'Improved Students',
      value: analytics?.improvedCount ?? 0,
    },
    {
      label: 'Not Improved',
      value: analytics?.notImprovedCount ?? 0,
    },
    {
      label: 'Improvement Rate',
      value: `${analytics?.improvementRate ?? 0}%`,
    },
    {
      label: 'Total Slots Happened',
      value: analytics?.totalSlotsHappened ?? 0,
    },
    {
      label: 'Total Belts Earned',
      value: analytics?.totalBeltsEarned ?? 0,
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Improvements
        </h1>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-[#E2E8F0]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Improvements
        </h1>

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Improvements
        </h1>

        <p className="mt-1 text-sm text-[#64748B]">
          Track student improvement, progress and performance analytics.
        </p>
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={getTileAction(item.label)}
            className="group block w-full rounded-2xl text-left transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40"
          >
            <StatCard
              label={item.label}
              value={item.value}
            />
          </button>
        ))}
      </div>

      {/* Progress Overview */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[#0F172A]">
          Progress Overview
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Progress Happened */}
          <div className="rounded-2xl border border-[#E6EBF2] bg-white p-5">
            <h3 className="text-sm font-semibold text-[#0F172A]">
              Progress Happened
            </h3>

            <div className="mt-4 space-y-3">
              {analytics?.progressHappened &&
              Object.keys(analytics.progressHappened).length > 0 ? (
                Object.entries(analytics.progressHappened).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-4 py-3"
                    >
                      <span className="text-sm capitalize text-[#64748B]">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>

                      <span className="font-semibold text-[#0F172A]">
                        {value}
                      </span>
                    </div>
                  )
                )
              ) : (
                <p className="text-sm text-[#64748B]">
                  No progress data available.
                </p>
              )}
            </div>
          </div>

          {/* Languages */}
          <div className="rounded-2xl border border-[#E6EBF2] bg-white p-5">
            <h3 className="text-sm font-semibold text-[#0F172A]">
              Languages
            </h3>

            <div className="mt-4 space-y-3">
              {analytics?.languages &&
              Object.keys(analytics.languages).length > 0 ? (
                Object.entries(analytics.languages).map(
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
                )
              ) : (
                <p className="text-sm text-[#64748B]">
                  No language data available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[#0F172A]">
          Progress Timeline
        </h2>

        <div className="mt-4 overflow-hidden rounded-2xl border border-[#E6EBF2] bg-white">
          {analytics?.timelineProgress?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Period
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Slots Attempted
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Belts Earned
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Languages
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E6EBF2]">
                  {analytics.timelineProgress.map((item, index) => (
                    <tr
                      key={`${item.period || 'period'}-${index}`}
                      className="hover:bg-[#F8FAFC]"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-[#0F172A]">
                        {item.period ?? '—'}
                      </td>

                      <td className="px-6 py-4 text-sm text-[#64748B]">
                        {item.slotsAttempted ?? 0}
                      </td>

                      <td className="px-6 py-4 text-sm text-[#64748B]">
                        {item.beltsEarned ?? 0}
                      </td>

                      <td className="px-6 py-4 text-sm text-[#64748B]">
                        {item.languages
                          ? typeof item.languages === 'object'
                            ? Object.keys(item.languages).join(', ')
                            : String(item.languages)
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-sm text-[#64748B]">
              No timeline data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Improvements;