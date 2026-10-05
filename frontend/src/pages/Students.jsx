import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import { getStudents } from '../services/api';
import { toList } from '../components/StatCard';
import { BeltBadge } from '../components/BeltChart';

const sid = (s) =>
  s.id ?? s._id ?? s.student_id ?? s.studentId;

const sname = (s) =>
  s.name ??
  s.full_name ??
  s.fullName ??
  s.student_name ??
  'Unnamed';

const slang = (s) =>
  s.language ??
  s.lang ??
  s.primary_language ??
  s.primaryLanguage ??
  '';

const sbelt = (s) =>
  s.belt ??
  s.current_belt ??
  s.currentBelt ??
  '';

const sbatch = (s) =>
  s.batch ??
  s.squad ??
  '';

const slanguages = (s) => {
  if (Array.isArray(s.languagesAttempted)) {
    return s.languagesAttempted;
  }

  const language = slang(s);
  return language ? [language] : [];
};

const isimproved = (s) =>
  s.improvementStatus === 'IMPROVED';

export default function Students() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let alive = true;

    getStudents()
      .then((res) => {
        if (alive) {
          setStudents(toList(res, 'students'));
        }
      })
      .catch(() => {
        if (alive) {
          setError('Could not load students. Please try again.');
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return students.filter((s) => {
      const matchesSearch =
        !q ||
        sname(s).toLowerCase().includes(q);

      if (!matchesSearch) {
        return false;
      }

      switch (filter) {
        case 'improved':
          return isimproved(s);

        case 'attention':
          return !isimproved(s);

        case 'squad138':
          return sbatch(s)
            .toLowerCase()
            .includes('138');

        case 'squad139':
          return sbatch(s)
            .toLowerCase()
            .includes('139');

        case 'python':
          return slanguages(s).some(
            (language) =>
              String(language).toLowerCase() === 'python'
          );

        case 'nodejs':
          return slanguages(s).some((language) =>
            ['node.js', 'nodejs', 'node'].includes(
              String(language).toLowerCase()
            )
          );

        case 'java':
          return slanguages(s).some(
            (language) =>
              String(language).toLowerCase() === 'java'
          );

        case 'cpp':
          return slanguages(s).some((language) =>
            ['c++', 'cpp', 'c plus plus'].includes(
              String(language).toLowerCase()
            )
          );

        default:
          return true;
      }
    });
  }, [students, query, filter]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 pb-28 sm:p-6 md:pb-8 lg:p-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Students
        </h1>

        <p className="mt-1 text-[#64748B]">
          {loading
            ? 'Loading…'
            : `${filtered.length} of ${students.length} students`}
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">

        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students by name"
            aria-label="Search students"
            className="input-base pl-10"
          />
        </div>

        {/* Student Filters */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter students"
          className="input-base sm:w-56"
        >
          <option value="all">
            All Students
          </option>

          <option value="improved">
            Improved Students
          </option>

          <option value="attention">
            Needs Attention
          </option>

          <option value="squad138">
            Squad 138
          </option>

          <option value="squad139">
            Squad 139
          </option>

          <option value="python">
            Python
          </option>

          <option value="nodejs">
            Node.js
          </option>

          <option value="java">
            Java
          </option>

          <option value="cpp">
            C++
          </option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-[#E63946]/30 bg-[#FDECEE] px-4 py-3 text-sm text-[#B91C1C]">
          {error}
        </div>
      )}

      {/* Students Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">

            <thead className="border-b border-[#E6EBF2] bg-[#F8FAFC] text-[#64748B]">
              <tr>
                <th className="px-6 py-4 font-semibold">
                  Student
                </th>

                <th className="px-6 py-4 font-semibold">
                  Language
                </th>

                <th className="px-6 py-4 font-semibold">
                  Belt
                </th>
              </tr>
            </thead>

            <tbody>

              {/* Loading Skeleton */}
              {loading &&
                [0, 1, 2, 3, 4].map((i) => (
                  <tr
                    key={i}
                    className="border-b border-[#E6EBF2] last:border-0"
                  >
                    <td
                      className="px-6 py-4"
                      colSpan={3}
                    >
                      <div className="skeleton h-6 w-full" />
                    </td>
                  </tr>
                ))}

              {/* Students */}
              {!loading &&
                filtered.map((s, i) => (
                  <tr
                    key={sid(s) ?? i}
                    onClick={() =>
                      sid(s) != null &&
                      navigate(`/students/${sid(s)}`)
                    }
                    className="cursor-pointer border-b border-[#E6EBF2] transition-colors last:border-0 hover:bg-[#F4F8FF]"
                  >

                    {/* Student */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">

                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF2FF] font-bold text-[#2563EB]">
                          {sname(s)
                            .charAt(0)
                            .toUpperCase()}
                        </span>

                        <span className="font-semibold">
                          {sname(s)}
                        </span>

                      </div>
                    </td>

                    {/* Languages */}
                    <td className="px-6 py-4 text-[#64748B]">
                      {slanguages(s).length > 0
                        ? slanguages(s).join(', ')
                        : '—'}
                    </td>

                    {/* Belt */}
                    <td className="px-6 py-4">
                      <BeltBadge belt={sbelt(s)} />
                    </td>

                  </tr>
                ))}

            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!loading &&
          filtered.length === 0 &&
          !error && (
            <div className="flex flex-col items-center gap-2 py-14 text-center text-[#64748B]">

              <Users size={28} />

              <p className="text-sm">
                {students.length === 0
                  ? 'No students yet. Upload dojo data to add them.'
                  : 'No students match your filters.'}
              </p>

            </div>
          )}
      </div>
    </div>
  );
}