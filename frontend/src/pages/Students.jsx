import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  Search,
  Users,
  Eye,
} from 'lucide-react';

import { getStudents } from '../services/api';

import { toList } from '../components/StatCard';
import { BeltBadge } from '../components/BeltChart';

const sid = (student) =>
  student.id ??
  student._id ??
  student.student_id ??
  student.studentId;

const sname = (student) =>
  student.name ??
  student.full_name ??
  student.fullName ??
  student.student_name ??
  'Unnamed';

const semail = (student) =>
  student.email ??
  student.mail ??
  '';

const slang = (student) =>
  student.language ??
  student.lang ??
  student.primary_language ??
  student.primaryLanguage ??
  '';

const sbelt = (student) =>
  student.belt ??
  student.current_belt ??
  student.currentBelt ??
  '';

const sbatch = (student) =>
  student.batch ??
  student.squad ??
  '';

const slanguages = (student) => {
  if (Array.isArray(student.languagesAttempted)) {
    return student.languagesAttempted.filter(Boolean);
  }

  const language = slang(student);

  return language
    ? [language]
    : [];
};

const isimproved = (student) =>
  student.improvementStatus === 'IMPROVED';

export default function Students() {
  const navigate = useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [students, setStudents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [query, setQuery] =
    useState('');

  const initialFilter =
    searchParams.get('filter') ||
    'all';

  const [filter, setFilter] =
    useState(initialFilter);

  /*
   * Keep filter synchronized with URL.
   */
  useEffect(() => {
    const urlFilter =
      searchParams.get('filter') ||
      'all';

    if (urlFilter !== filter) {
      setFilter(urlFilter);
    }
  }, [searchParams, filter]);

  /*
   * Load students.
   */
  useEffect(() => {
    let alive = true;

    setLoading(true);
    setError('');

    getStudents()
      .then((res) => {
        if (!alive) return;

        const list =
          toList(res, 'students');

        setStudents(
          Array.isArray(list)
            ? list
            : []
        );
      })
      .catch((err) => {
        console.error(
          'Failed to load students:',
          err
        );

        if (alive) {
          setError(
            'Could not load students. Please try again.'
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

  /*
   * Collect all available languages.
   */
  const languages = useMemo(() => {
    const values =
      students.flatMap((student) =>
        slanguages(student)
      );

    return [
      ...new Set(values),
    ]
      .filter(Boolean)
      .sort((a, b) =>
        a.localeCompare(b)
      );
  }, [students]);

  /*
   * Apply search + filter.
   */
  const filtered = useMemo(() => {
    const q =
      query
        .trim()
        .toLowerCase();

    return students.filter(
      (student) => {
        const name =
          sname(student)
            .toLowerCase();

        const id =
          String(
            sid(student) ?? ''
          ).toLowerCase();

        const email =
          semail(student)
            .toLowerCase();

        const matchesSearch =
          !q ||
          name.includes(q) ||
          id.includes(q) ||
          email.includes(q);

        if (!matchesSearch) {
          return false;
        }

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
            return slanguages(
              student
            ).some(
              (language) =>
                language
                  .toLowerCase() ===
                'python'
            );

          case 'nodejs':
            return slanguages(
              student
            ).some((language) =>
              [
                'node.js',
                'nodejs',
                'node',
              ].includes(
                language.toLowerCase()
              )
            );

          case 'java':
            return slanguages(
              student
            ).some(
              (language) =>
                language
                  .toLowerCase() ===
                'java'
            );

          case 'cpp':
            return slanguages(
              student
            ).some((language) =>
              [
                'c++',
                'cpp',
                'c plus plus',
              ].includes(
                language.toLowerCase()
              )
            );

          default:
            /*
             * Dynamic language filters.
             *
             * Example:
             * filter=language:JavaScript
             */
            if (
              filter.startsWith(
                'language:'
              )
            ) {
              const selectedLanguage =
                filter
                  .slice(
                    'language:'.length
                  )
                  .toLowerCase();

              return slanguages(
                student
              ).some(
                (language) =>
                  language
                    .toLowerCase() ===
                  selectedLanguage
              );
            }

            return true;
        }
      }
    );
  }, [
    students,
    query,
    filter,
  ]);

  /*
   * Change filter and update URL.
   */
  const handleFilterChange =
    (value) => {
      setFilter(value);

      const nextParams =
        new URLSearchParams(
          searchParams
        );

      if (value === 'all') {
        nextParams.delete(
          'filter'
        );
      } else {
        nextParams.set(
          'filter',
          value
        );
      }

      setSearchParams(
        nextParams
      );
    };

  /*
   * Clear search + filter.
   */
  const clearFilters = () => {
    setQuery('');
    setFilter('all');
    setSearchParams({});
  };

  /*
   * Open student details.
   */
  const handleStudentClick =
    (student) => {
      const id = sid(student);

      if (!id) {
        return;
      }

      navigate(
        `/students/${id}`
      );
    };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF]">
            <Users
              size={22}
              className="text-[#2563EB]"
            />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
              Students
            </h1>

            <p className="mt-1 text-sm text-[#64748B]">
              View and manage student progress
            </p>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="rounded-2xl border border-[#E6EBF2] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          {/* Search */}
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />

            <input
              type="text"
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search by name, ID or email..."
              className="input-base w-full pl-10"
            />
          </div>

          {/* Filter */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={filter}
              onChange={(event) =>
                handleFilterChange(
                  event.target.value
                )
              }
              aria-label="Filter students"
              className="input-base w-full sm:w-64"
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

              {languages
                .filter((language) => {
                  const normalized =
                    language.toLowerCase();

                  return ![
                    'python',
                    'node',
                    'nodejs',
                    'node.js',
                    'java',
                    'c++',
                    'cpp',
                    'c plus plus',
                  ].includes(
                    normalized
                  );
                })
                .map((language) => (
                  <option
                    key={language}
                    value={`language:${language}`}
                  >
                    {language}
                  </option>
                ))}
            </select>

            {(query ||
              filter !== 'all') && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#0F172A]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Result Count */}
        <div className="mt-4 flex items-center justify-between border-t border-[#E6EBF2] pt-3">
          <p className="text-sm text-[#64748B]">
            Showing{' '}
            <span className="font-bold text-[#0F172A]">
              {filtered.length}
            </span>{' '}
            of{' '}
            <span className="font-bold text-[#0F172A]">
              {students.length}
            </span>{' '}
            students
          </p>

          {filter !== 'all' && (
            <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
              Filter active
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="rounded-2xl border border-[#E6EBF2] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#E2E8F0] border-t-[#2563EB]" />

          <p className="mt-4 text-sm text-[#64748B]">
            Loading students...
          </p>
        </div>
      ) : filtered.length === 0 ? (

        /* Empty State */
        <div className="rounded-2xl border border-[#E6EBF2] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F5F9]">
            <Users
              size={25}
              className="text-[#94A3B8]"
            />
          </div>

          <h3 className="mt-4 text-lg font-bold text-[#0F172A]">
            No students found
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-[#64748B]">
            No students match the current search or
            filter.
          </p>

          {(query ||
            filter !== 'all') && (
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="mt-5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              Clear filters
            </button>
          )}
        </div>

      ) : (

        /* Students Table */
        <div className="overflow-hidden rounded-2xl border border-[#E6EBF2] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">

              <thead>
                <tr className="border-b border-[#E6EBF2] bg-[#F8FAFC]">

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#64748B]">
                    Student
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#64748B]">
                    ID
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#64748B]">
                    Language
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#64748B]">
                    Batch
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#64748B]">
                    Belt
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#64748B]">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-[#64748B]">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-[#E6EBF2]">
                {filtered.map(
                  (student) => {
                    const id =
                      sid(student);

                    const name =
                      sname(student);

                    const email =
                      semail(student);

                    const belt =
                      sbelt(student);

                    const batch =
                      sbatch(student);

                    const studentLanguages =
                      slanguages(
                        student
                      );

                    const improved =
                      isimproved(
                        student
                      );

                    return (
                      <tr
                        key={
                          id ??
                          `${name}-${email}`
                        }
                        onClick={() =>
                          handleStudentClick(
                            student
                          )
                        }
                        className="cursor-pointer transition hover:bg-[#F8FAFC]"
                      >

                        {/* Student */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-sm font-bold text-[#2563EB]">
                              {name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#0F172A]">
                                {name}
                              </p>

                              {email && (
                                <p className="mt-0.5 truncate text-xs text-[#64748B]">
                                  {email}
                                </p>
                              )}
                            </div>

                          </div>
                        </td>

                        {/* ID */}
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-[#475569]">
                            {id ?? '—'}
                          </span>
                        </td>

                        {/* Language */}
                        <td className="px-5 py-4">
                          {studentLanguages.length >
                          0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {studentLanguages.map(
                                (language) => (
                                  <span
                                    key={
                                      language
                                    }
                                    className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-xs font-semibold text-[#475569]"
                                  >
                                    {language}
                                  </span>
                                )
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-[#94A3B8]">
                              —
                            </span>
                          )}
                        </td>

                        {/* Batch */}
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-[#475569]">
                            {batch || '—'}
                          </span>
                        </td>

                        {/* Belt */}
                        <td className="px-5 py-4">
                          {belt ? (
                            <BeltBadge
                              belt={belt}
                            />
                          ) : (
                            <span className="text-sm text-[#94A3B8]">
                              —
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                              improved
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {improved
                              ? 'Improved'
                              : 'Needs Attention'}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={(
                              event
                            ) => {
                              event.stopPropagation();

                              handleStudentClick(
                                student
                              );
                            }}
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF]"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>

                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}