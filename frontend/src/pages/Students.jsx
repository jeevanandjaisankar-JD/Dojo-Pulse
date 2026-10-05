import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';

import { getStudents } from '../services/api';

const Students = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');

  /*
   * Read the filter from the URL.
   *
   * Examples:
   * /students
   * /students?filter=improved
   * /students?filter=attention
   * /students?filter=squad138
   * /students?filter=python
   */
  const [filter, setFilter] = useState(
    searchParams.get('filter') || 'all'
  );

  /* =========================================================
     Helpers
     ========================================================= */

  const sname = (student) =>
    student?.name ||
    student?.studentName ||
    student?.fullName ||
    'Unknown Student';

  const sid = (student) =>
    student?.studentId ||
    student?.id ||
    student?._id ||
    '';

  const semail = (student) =>
    student?.email ||
    student?.studentEmail ||
    '—';

  const sbatch = (student) =>
    student?.batch ||
    student?.squad ||
    '';

  const slanguages = (student) => {
    if (Array.isArray(student?.languagesAttempted)) {
      return student.languagesAttempted;
    }

    if (Array.isArray(student?.languages)) {
      return student.languages;
    }

    if (typeof student?.language === 'string') {
      return student.language ? [student.language] : [];
    }

    return [];
  };

  const isimproved = (student) =>
    student?.improvementStatus === 'IMPROVED';

  /* =========================================================
     Load Students
     ========================================================= */

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getStudents();

        const data =
          response?.data?.data ??
          response?.data?.students ??
          response?.data ??
          response;

        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load students:', err);
        setError('Could not load students.');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  /* =========================================================
     Keep Filter In Sync With URL
     ========================================================= */

  useEffect(() => {
    const urlFilter = searchParams.get('filter') || 'all';

    if (urlFilter !== filter) {
      setFilter(urlFilter);
    }
  }, [searchParams]);

  /* =========================================================
     Filter Change
     ========================================================= */

  const handleFilterChange = (event) => {
    const value = event.target.value;

    setFilter(value);

    if (value === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ filter: value });
    }
  };

  /* =========================================================
     Filter Students
     ========================================================= */

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();

    return students.filter((student) => {
      /* Search */
      const matchesSearch =
        !q ||
        sname(student).toLowerCase().includes(q) ||
        sid(student).toLowerCase().includes(q) ||
        semail(student).toLowerCase().includes(q);

      if (!matchesSearch) {
        return false;
      }

      /* Filter */
      switch (filter) {
        case 'improved':
          return isimproved(student);

        case 'attention':
          return !isimproved(student);

        case 'squad138':
          return sbatch(student)
            .toLowerCase()
            .includes('138');

        case 'squad139':
          return sbatch(student)
            .toLowerCase()
            .includes('139');

        case 'python':
          return slanguages(student).some(
            (language) =>
              String(language).toLowerCase() === 'python'
          );

        case 'nodejs':
          return slanguages(student).some((language) =>
            ['node.js', 'nodejs', 'node'].includes(
              String(language).toLowerCase()
            )
          );

        case 'java':
          return slanguages(student).some(
            (language) =>
              String(language).toLowerCase() === 'java'
          );

        case 'cpp':
          return slanguages(student).some((language) =>
            ['c++', 'cpp', 'c plus plus'].includes(
              String(language).toLowerCase()
            )
          );

        case 'all':
        default:
          return true;
      }
    });
  }, [students, query, filter]);

  /* =========================================================
     Filter Label
     ========================================================= */

  const filterLabel = useMemo(() => {
    switch (filter) {
      case 'improved':
        return 'Improved Students';

      case 'attention':
        return 'Needs Attention';

      case 'squad138':
        return 'Squad 138';

      case 'squad139':
        return 'Squad 139';

      case 'python':
        return 'Python';

      case 'nodejs':
        return 'Node.js';

      case 'java':
        return 'Java';

      case 'cpp':
        return 'C++';

      default:
        return 'All Students';
    }
  }, [filter]);

  /* =========================================================
     Loading
     ========================================================= */

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Students
        </h1>

        <div className="mt-6 overflow-hidden rounded-2xl border border-[#E6EBF2] bg-white">
          <div className="animate-pulse space-y-4 p-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-12 rounded-lg bg-[#E2E8F0]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     Error
     ========================================================= */

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Students
        </h1>

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  /* =========================================================
     Render
     ========================================================= */

  return (
    <div className="p-6">
      {/* =====================================================
          Header
          ===================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Students
        </h1>

        <p className="mt-1 text-sm text-[#64748B]">
          View and track student progress.
        </p>
      </div>

      {/* =====================================================
          Search + Filter
          ===================================================== */}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />

          <input
            type="text"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search students..."
            className="input-base w-full pl-10"
          />
        </div>

        {/* Filter */}
        <select
          value={filter}
          onChange={handleFilterChange}
          aria-label="Filter students"
          className="input-base w-full sm:w-56"
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

      {/* =====================================================
          Active Filter
          ===================================================== */}

      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-[#64748B]">
            Showing
          </p>

          <p className="text-lg font-semibold text-[#0F172A]">
            {filterLabel}
          </p>
        </div>

        <p className="text-sm text-[#64748B]">
          {filteredStudents.length}{' '}
          {filteredStudents.length === 1
            ? 'student'
            : 'students'}
        </p>
      </div>

      {/* =====================================================
          Students Table
          ===================================================== */}

      <div className="mt-4 overflow-hidden rounded-2xl border border-[#E6EBF2] bg-white">
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                    Student
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                    Student ID
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                    Squad
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                    Languages
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E6EBF2]">
                {filteredStudents.map((student) => {
                  const languages =
                    slanguages(student);

                  const improved =
                    isimproved(student);

                  return (
                    <tr
                      key={
                        student._id ??
                        student.studentId
                      }
                      className="transition-colors hover:bg-[#F8FAFC]"
                    >
                      {/* Student */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#0F172A]">
                          {sname(student)}
                        </div>
                      </td>

                      {/* ID */}
                      <td className="px-6 py-4 text-sm text-[#64748B]">
                        {sid(student) || '—'}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-sm text-[#64748B]">
                        {semail(student)}
                      </td>

                      {/* Squad */}
                      <td className="px-6 py-4 text-sm text-[#64748B]">
                        {sbatch(student) || '—'}
                      </td>

                      {/* Languages */}
                      <td className="px-6 py-4 text-sm text-[#64748B]">
                        {languages.length > 0
                          ? languages.join(', ')
                          : '—'}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            improved
                              ? 'bg-green-50 text-green-700'
                              : 'bg-orange-50 text-orange-700'
                          }`}
                        >
                          {improved
                            ? 'Improved'
                            : 'Needs Attention'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/students/${student.studentId ?? student._id}`
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#2563EB] transition-colors hover:bg-[#EFF6FF]"
                        >
                          <Eye size={16} />

                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* =================================================
             Empty State
             ================================================= */

          <div className="p-10 text-center">
            <p className="text-base font-semibold text-[#0F172A]">
              No students found
            </p>

            <p className="mt-1 text-sm text-[#64748B]">
              No students match the current search or filter.
            </p>

            {(filter !== 'all' || query) && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setFilter('all');
                  setSearchParams({});
                }}
                className="mt-4 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8]"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;