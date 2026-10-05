// Improvements.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import StatCard from '../components/StatCard';
import {
  getImprovementsAnalytics,
} from '../services/api';

const unwrap = (response) =>
  response?.data ??
  response;

const getTileRoute = (label) => {
  const normalized = String(label)
    .toLowerCase()
    .replace(/_/g, ' ');

  if (
    normalized.includes('improved') &&
    !normalized.includes('not')
  ) {
    return '/students?filter=improved';
  }

  if (
    normalized.includes('not improved') ||
    normalized.includes('no improvement') ||
    normalized.includes('attention')
  ) {
    return '/students?filter=attention';
  }

  return '/students?filter=all';
};

const Improvements = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    const loadAnalytics = async () => {
      setLoading(true);
      setError('');

      try {
        const response =
          await getImprovementsAnalytics();

        if (!alive) return;

        const result = unwrap(response);

        setData(
          result?.data ??
          result
        );
      } catch (err) {
        console.error(
          'Failed to load improvements analytics:',
          err
        );

        if (alive) {
          setError(
            'Could not load improvements analytics.'
          );
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

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

  const tiles = [
    {
      key: 'Improved Students',
      value: data?.improvedCount ?? 0,
    },
    {
      key: 'Not Improved',
      value: data?.notImprovedCount ?? 0,
    },
    {
      key: 'Improvement Rate',
      value: `${data?.improvementRate ?? 0}%`,
    },
    {
      key: 'Total Slots Happened',
      value: data?.totalSlotsHappened ?? 0,
    },
    {
      key: 'Total Belts Earned',
      value: data?.totalBeltsEarned ?? 0,
    },
    {
      key: 'Total Students',
      value: data?.totalStudents ?? 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
          Improvements
        </h1>

        <p className="mt-1 text-sm text-[#64748B]">
          Track student improvement and progress analytics.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Link
            key={tile.key}
            to={getTileRoute(tile.key)}
            className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40"
          >
            <StatCard
              label={tile.key}
              value={tile.value}
            />
          </Link>
        ))}
      </div>

      {/* Languages */}
      {data?.languages && (
        <div className="rounded-2xl border border-[#E6EBF2] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#0F172A]">
            Languages
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(data.languages).map(
              ([language, count]) => (
                <div
                  key={language}
                  className="rounded-xl bg-[#F8FAFC] p-4"
                >
                  <p className="text-sm font-medium text-[#64748B]">
                    {language}
                  </p>

                  <p className="mt-1 text-xl font-bold text-[#0F172A]">
                    {count}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Timeline */}
      {Array.isArray(data?.timelineProgress) &&
        data.timelineProgress.length > 0 && (
          <div className="rounded-2xl border border-[#E6EBF2] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[#0F172A]">
              Progress Timeline
            </h2>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-[#E6EBF2]">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#64748B]">
                      Period
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#64748B]">
                      Slots Attempted
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#64748B]">
                      Belts Earned
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E6EBF2]">
                  {data.timelineProgress.map(
                    (item, index) => (
                      <tr key={item.period ?? index}>
                        <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">
                          {item.period ??
                            item.month ??
                            '—'}
                        </td>

                        <td className="px-4 py-3 text-sm text-[#475569]">
                          {item.slotsAttempted ?? 0}
                        </td>

                        <td className="px-4 py-3 text-sm text-[#475569]">
                          {item.beltsEarned ?? 0}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
};

export default Improvements;