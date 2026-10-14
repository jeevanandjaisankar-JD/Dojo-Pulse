import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

import { getImprovementsAnalytics } from '../services/api';

import {
  unwrap,
  toPairs,
  humanize,
  fmtVal,
} from '../components/StatCard';

import StatCard from '../components/StatCard';
import BeltChart from '../components/BeltChart';

const TONE_CYCLE = ['blue', 'green', 'amber', 'red'];

const isPrimitive = (v) =>
  typeof v === 'number' ||
  (typeof v === 'string' && v.length < 24);

function DataTable({ title, rows }) {
  const cols = Object.keys(rows[0] || {})
    .filter((k) => isPrimitive(rows[0][k]))
    .slice(0, 6);

  if (cols.length === 0) return null;

  return (
    <div className="card overflow-hidden p-0">
      <h3 className="px-6 pt-6 text-lg font-bold">
        {title}
      </h3>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-y border-[#E6EBF2] bg-[#F8FAFC] text-[#64748B]">
            <tr>
              {cols.map((c) => (
                <th
                  key={c}
                  className="px-6 py-3 font-semibold"
                >
                  {humanize(c)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className="border-b border-[#E6EBF2] last:border-0 hover:bg-[#F4F8FF]"
              >
                {cols.map((c) => (
                  <td
                    key={c}
                    className="px-6 py-3"
                  >
                    {r[c] == null
                      ? '—'
                      : typeof r[c] === 'number'
                        ? fmtVal(r[c])
                        : r[c]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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

export default function Improvements() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    getImprovementsAnalytics()
      .then((res) => {
        if (!alive) return;

        const response = unwrap(res);

        setData(
          response?.data ??
          response
        );
      })
      .catch(() => {
        if (alive) {
          setError(
            'Could not load improvement analytics.'
          );
        }
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  const entries = Object.entries(
    data &&
      typeof data === 'object' &&
      !Array.isArray(data)
      ? data
      : { improvements: data || [] }
  );

  const tiles = entries.filter(([, value]) =>
    isPrimitive(value)
  );

  const timelineProgress = Array.isArray(
    data?.timelineProgress
  )
    ? data.timelineProgress
    : [];

  const groups = entries.filter(
    ([key, value]) =>
      key !== 'timelineProgress' &&
      value &&
      typeof value === 'object'
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 pb-28 sm:p-6 md:pb-8 lg:p-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Improvements
        </h1>

        <p className="mt-1 text-[#64748B]">
          See how students are progressing over time.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-[#E63946]/30 bg-[#FDECEE] px-4 py-3 text-sm text-[#B91C1C]">
          {error}
        </div>
      )}

      {/* Analytics */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <StatCard
              key={i}
              loading
              label="Loading"
              icon={TrendingUp}
            />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Tiles */}
          {tiles.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {tiles.map(([key, value], index) => (
                <Link
                  key={key}
                  to={getTileRoute(key)}
                  className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40"
                >
                  <StatCard
                    label={humanize(key)}
                    value={fmtVal(value)}
                    icon={TrendingUp}
                    tone={
                      TONE_CYCLE[
                        index % TONE_CYCLE.length
                      ]
                    }
                  />
                </Link>
              ))}
            </div>
          )}

          {/* Timeline Progress */}
          {timelineProgress.length > 0 && (
            <div className="lg:col-span-2">
              <DataTable
                title="Timeline Progress"
                rows={timelineProgress}
              />
            </div>
          )}

          {/* Grouped analytics */}
          <div className="grid gap-6 lg:grid-cols-2">
            {groups.map(([key, value]) => {
              const pairs = toPairs(value);

              if (pairs.length > 0) {
                return (
                  <BeltChart
                    key={key}
                    title={humanize(key)}
                    data={pairs}
                    colorByBelt={false}
                  />
                );
              }

              if (
                Array.isArray(value) &&
                value.length > 0 &&
                typeof value[0] === 'object'
              ) {
                return (
                  <div
                    key={key}
                    className="lg:col-span-2"
                  >
                    <DataTable
                      title={humanize(key)}
                      rows={value}
                    />
                  </div>
                );
              }

              return null;
            })}
          </div>

          {!error &&
            tiles.length === 0 &&
            groups.every(
              ([, value]) =>
                !value ||
                value.length === 0
            ) && (
              <div className="card py-14 text-center text-sm text-[#64748B]">
                No improvement data yet. Upload dojo data to see trends.
              </div>
            )}
        </>
      )}
    </div>
  );
}