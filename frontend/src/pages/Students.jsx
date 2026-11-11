import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Users, Eye, Trophy, X } from 'lucide-react';
import { getStudents } from '../services/api';
import { toList } from '../components/StatCard';

const LANGUAGES = ['Python', 'Node.js', 'Java', 'C++'];

const sid = (student) =>
  student.id ?? student._id ?? student.student_id ?? student.studentId;

const sname = (student) =>
  student.name ?? student.full_name ?? student.fullName ??
  student.student_name ?? 'Unnamed';

const semail = (student) => student.email ?? student.mail ?? '';

const sbeltCount = (student) => {
  const count = student.totalUniqueBelts ?? student.beltHistory?.length;
  return Number.isFinite(Number(count)) ? Number(count) : 0;
};

const sbatch = (student) => student.batch ?? student.squad ?? '';

const normalizeLanguage = (value = '') => {
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'python') return 'Python';
  if (normalized === 'java') return 'Java';
  if (['node', 'nodejs', 'node.js'].includes(normalized)) return 'Node.js';
  if (['cpp', 'c++', 'c plus plus'].includes(normalized)) return 'C++';
  return '';
};

const getImprovedLanguages = (student) => {
  if (Array.isArray(student.improvedLanguages)) {
    return student.improvedLanguages.map(normalizeLanguage).filter(Boolean);
  }
  return [];
};

const isImproved = (student) =>
  String(student.improvementStatus || '').trim().toUpperCase() === 'IMPROVED';

const isImprovedInLanguage = (student, language) =>
  getImprovedLanguages(student).includes(language);

const normalizeFilter = (value) => {
  const normalized = String(value || 'all').trim().toLowerCase()
    .replace(/[\s_]+/g, '-');
  if (['attention', 'needs-attention', 'not-improved', 'no-improvement'].includes(normalized)) {
    return 'attention';
  }
  return normalized || 'all';
};

export const SquadsAvailable = (data = []) => [
  ...new Set(data.map((student) => String(sbatch(student) ?? '').trim()).filter(Boolean))
].sort((first, second) => first.localeCompare(second, undefined, {
  numeric: true,
  sensitivity: 'base'
}));

export default function Students() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [squadFilter, setSquadFilter] = useState(() => searchParams.get('squad') || 'all');
  const [statusFilter, setStatusFilter] = useState(() => {
    const value = searchParams.get('status');
    return ['improved', 'attention', 'leaderboard'].includes(value) ? value : 'all';
  });
  const [language, setLanguage] = useState(() => normalizeLanguage(searchParams.get('language')));

  useEffect(() => {
    const nextSquad = searchParams.get('squad') || 'all';
    const rawStatus = searchParams.get('status');
    const nextStatus = ['improved', 'attention', 'leaderboard'].includes(rawStatus) ? rawStatus : 'all';
    const nextLanguage = normalizeLanguage(searchParams.get('language'));
    if (nextSquad !== squadFilter) setSquadFilter(nextSquad);
    if (nextStatus !== statusFilter) setStatusFilter(nextStatus);
    if (nextLanguage !== language) setLanguage(nextLanguage);
  }, [searchParams, squadFilter, statusFilter, language]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    getStudents()
      .then((response) => {
        if (!alive) return;
        const list = toList(response, 'students');
        setStudents(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error('Failed to load students:', err);
        if (alive) setError('Could not load students. Please try again.');
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const squads = useMemo(() => SquadsAvailable(students), [students]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = students.filter((student) => {
      const matchesSearch = !q || [
        sname(student), sid(student), semail(student)
      ].some((value) => String(value ?? '').toLowerCase().includes(q));
      if (!matchesSearch) return false;

      if (squadFilter !== 'all' &&
          String(sbatch(student)).trim().toLowerCase() !== squadFilter.trim().toLowerCase()) {
        return false;
      }
      if (statusFilter === 'improved' && !isImproved(student)) return false;
      if (statusFilter === 'attention' && isImproved(student)) return false;
      if (language && !isImprovedInLanguage(student, language)) return false;
      return true;
    });

    return result.sort((first, second) => {
      if (statusFilter === 'leaderboard') {
        const beltOrder = sbeltCount(second) - sbeltCount(first);
        if (beltOrder !== 0) return beltOrder;
      }
      return sname(first).localeCompare(sname(second), undefined, {
        sensitivity: 'base',
        numeric: true
      });
    });
  }, [students, query, squadFilter, statusFilter, language]);

  const updateFilters = (nextSquad = squadFilter, nextStatus = statusFilter, nextLanguage = language) => {
    setSquadFilter(nextSquad);
    setStatusFilter(nextStatus);
    setLanguage(nextLanguage);
    const params = new URLSearchParams(searchParams);
    if (nextSquad === 'all') params.delete('squad');
    else params.set('squad', nextSquad);
    if (nextStatus === 'all') params.delete('status');
    else params.set('status', nextStatus);
    if (nextLanguage) params.set('language', nextLanguage);
    else params.delete('language');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setQuery('');
    setSquadFilter('all');
    setStatusFilter('all');
    setLanguage('');
    setSearchParams({});
  };

  const handleStudentClick = (student) => {
    const id = sid(student);
    if (id) navigate('/students/' + id);
  };

  const leaderboard = statusFilter === 'leaderboard';
  const hasFilters = query || squadFilter !== 'all' || statusFilter !== 'all' || language;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF]">
          <Users size={22} className="text-[#2563EB]" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">Students</h1>
          <p className="mt-1 text-sm text-[#64748B]">View and manage student progress</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E6EBF2] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input type="text" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, ID or email..." aria-label="Search students" className="input-base w-full pl-10" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select value={squadFilter} onChange={(event) => updateFilters(event.target.value)} aria-label="Filter by squad" className="input-base min-w-44">
              <option value="all">All Students</option>
              {squads.map((squad) => (
                <option key={squad} value={squad}>
                  {/^squad\b/i.test(squad) ? squad : /^s\.\s*\d+/i.test(squad) ? squad : /^\d+$/.test(squad) ? 'Squad ' + squad : squad}
                </option>
              ))}
            </select>

            <select value={statusFilter} onChange={(event) => updateFilters(squadFilter, event.target.value)} aria-label="Filter improvement status or leaderboard" className="input-base min-w-48">
              <option value="all">Select progress view</option>
              <option value="improved">Improved</option>
              <option value="attention">Needs Attention</option>
              <option value="leaderboard">Leaderboard · Most Belts</option>
            </select>

            {hasFilters && (
              <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#64748B] hover:bg-[#F1F5F9]">
                <X size={15} /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-[#E6EBF2] pt-3 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-[#64748B]">
            Showing <span className="font-bold text-[#0F172A]">{filtered.length}</span> of{' '}
            <span className="font-bold text-[#0F172A]">{students.length}</span> students
            {leaderboard && <span className="ml-2 font-semibold text-amber-700">· Ranked by unique belts</span>}
          </p>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by improved language">
            <span className="mr-1 text-xs font-semibold text-[#64748B]">Improved in:</span>
            {LANGUAGES.map((item) => (
              <button key={item} type="button" onClick={() => updateFilters(squadFilter, statusFilter, language === item ? '' : item)} aria-pressed={language === item} className={'rounded-lg border px-3 py-1.5 text-xs font-bold transition ' + (language === item ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]' : 'border-[#E6EBF2] bg-white text-[#64748B] hover:bg-[#F8FAFC]')}>
                {item}
              </button>
            ))}
          </div>
        </div>
        {(squadFilter !== 'all' || statusFilter !== 'all' || language) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {squadFilter !== 'all' && <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">{squadFilter}</span>}
            {statusFilter !== 'all' && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">{statusFilter === 'attention' ? 'Needs Attention' : statusFilter === 'leaderboard' ? 'Leaderboard' : 'Improved'}</span>}
            {language && <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{language} improved</span>}
          </div>
        )}
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-[#E6EBF2] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#E2E8F0] border-t-[#2563EB]" />
          <p className="mt-4 text-sm text-[#64748B]">Loading students...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#E6EBF2] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F5F9]"><Users size={25} className="text-[#94A3B8]" /></div>
          <h3 className="mt-4 text-lg font-bold text-[#0F172A]">No students found</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#64748B]">No students match the selected squad, progress view, language and search.</p>
          {hasFilters && <button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]">Clear filters</button>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E6EBF2] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead><tr className="border-b border-[#E6EBF2] bg-[#F8FAFC]">
                {leaderboard && <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#64748B]">Rank</th>}
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#64748B]">Student</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#64748B]">Email</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#64748B]">Squad</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#64748B]">Unique Belts</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#64748B]">Status</th>
                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-[#64748B]">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-[#E6EBF2]">
                {filtered.map((student, index) => {
                  const improved = isImproved(student);
                  return (
                    <tr key={sid(student) ?? sname(student) + semail(student)} onClick={() => handleStudentClick(student)} className="cursor-pointer transition hover:bg-[#F8FAFC]">
                      {leaderboard && <td className="px-4 py-4 text-sm font-extrabold text-amber-700">#{index + 1}</td>}
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-sm font-bold text-[#2563EB]">{sname(student).charAt(0).toUpperCase()}</div><p className="truncate font-semibold text-[#0F172A]">{sname(student)}</p></div></td>
                      <td className="px-5 py-4 text-sm font-medium text-[#475569]">{semail(student) || '—'}</td>
                      <td className="px-5 py-4 text-sm font-medium text-[#475569]">{sbatch(student) || '—'}</td>
                      <td className="px-5 py-4"><span className="inline-flex rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">{sbeltCount(student)} {sbeltCount(student) === 1 ? 'belt' : 'belts'}</span></td>
                      <td className="px-5 py-4"><span className={'inline-flex rounded-full px-2.5 py-1 text-xs font-bold ' + (improved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>{improved ? 'Improved' : 'Needs Attention'}</span></td>
                      <td className="px-5 py-4 text-right"><button type="button" onClick={(event) => { event.stopPropagation(); handleStudentClick(student); }} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#2563EB] hover:bg-[#EFF6FF]"><Eye size={16} /> View</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
