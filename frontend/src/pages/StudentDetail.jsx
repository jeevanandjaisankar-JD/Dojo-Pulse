import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Award, CheckCircle2, Target } from 'lucide-react';
import { getStudentById, getStudents } from '../services/api';
import { unwrap, toList, toPairs, fmtDate } from '../components/StatCard';

const ELIGIBILITY_BELTS = 10;
const LANGUAGE_TILES = [
  { key: 'Python', label: 'Python belts', color: '#2563EB' },
  { key: 'Java', label: 'Java belts', color: '#E63946' },
  { key: 'Node.js', label: 'Node.js belts', color: '#0F9D75' },
  { key: 'C++', label: 'C++ belts', color: '#7C3AED' }
];
const getStudentId = (student) => student?.id ?? student?._id ?? student?.student_id ?? student?.studentId;
const normalizeLanguage = (value = '') => {
  const language = String(value).trim().toLowerCase();
  if (['node', 'nodejs', 'node.js'].includes(language)) return 'Node.js';
  if (['cpp', 'c++', 'c plus plus'].includes(language)) return 'C++';
  if (language === 'python') return 'Python';
  if (language === 'java') return 'Java';
  return value;
};

function ProgressRing({ value, total, photo, name }) {
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const gap = circumference * 0.12;
  const arcLength = circumference - gap;
  const progress = Math.min(Math.max(value / total, 0), 1);
  const initials = String(name || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="relative flex h-64 w-64 max-w-full items-center justify-center">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" role="img" aria-label={value + ' of ' + total + ' total belts earned'}>
        <path d="M 64 165 A 78 78 0 1 1 136 165" fill="none" stroke="#ECEEEA" strokeWidth="9" strokeLinecap="round" />
        <path
          d="M 64 165 A 78 78 0 1 1 136 165"
          fill="none"
          stroke="#788273"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={arcLength * (1 - progress)}
        />
      </svg>
      <div className="relative z-10 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-[5px] border-[#F1F0EB] bg-[#F4F2EC] shadow-sm">
        {photo ? (
          <img src={photo} alt={name + ' profile'} className="h-full w-full object-cover" />
        ) : (
          <span className="text-4xl font-bold text-[#788273]">{initials}</span>
        )}
      </div>
      <div className="absolute bottom-0 left-1/2 z-20 min-w-36 -translate-x-1/2 rounded-2xl border border-[#E9E7E0] bg-[#F5F4F0] px-5 py-2 text-center shadow-sm">
        <p className="text-xl font-extrabold leading-tight text-[#343A34]">{value} / {total}</p>
        <p className="mt-0.5 text-[10px] font-medium text-[#85877F]">earned belts</p>
      </div>
    </div>
  );
}

function ProgressTimeline({ entries }) {
  const points = entries.map((entry) => ({
    label: entry.date || entry.label || '',
    value: Number(entry.netBeltsEarned ?? entry.value ?? entry.beltsEarned ?? 0)
  })).filter((entry) => Number.isFinite(entry.value));
  const width = 520;
  const height = 120;
  const max = Math.max(1, ...points.map((point) => point.value));
  const coordinates = points.map((point, index) => ({
    x: points.length <= 1 ? width / 2 : 24 + (index * (width - 48)) / (points.length - 1),
    y: height - 16 - (point.value / max) * (height - 32),
    ...point
  }));
  const path = coordinates.map((point, index) => (index === 0 ? 'M' : 'L') + ' ' + point.x + ' ' + point.y).join(' ');
  return (
    <div className="mt-2">
      {coordinates.length > 1 ? (
        <>
          <svg viewBox={'0 0 ' + width + ' ' + height} className="h-24 w-full overflow-visible" role="img" aria-label="Recorded belt progress timeline">
            {[0, 1, 2].map((line) => <line key={line} x1="18" x2={width - 12} y1={18 + line * 40} y2={18 + line * 40} stroke="#E6EBF2" strokeDasharray="3 5" />)}
            <path d={path} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {coordinates.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="4" fill="#2563EB" stroke="white" strokeWidth="2" />)}
          </svg>
          <div className="flex justify-between text-[10px] text-[#94A3B8]">
            <span>{coordinates[0].label ? fmtDate(coordinates[0].label) : 'Start'}</span>
            <span>{coordinates[coordinates.length - 1].label ? fmtDate(coordinates[coordinates.length - 1].label) : 'Latest record'}</span>
          </div>
        </>
      ) : (
        <div className="flex h-24 items-center justify-center rounded-xl bg-[#F8FAFC] text-center text-xs text-[#94A3B8]">Progress timeline will appear as test history is recorded.</div>
      )}
    </div>
  );
}

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    getStudentById(id)
      .then((res) => alive && setStudent(unwrap(res)?.student ?? unwrap(res)))
      .catch(() => alive && setError('Could not load this student.'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    let alive = true;
    getStudents()
      .then((res) => {
        if (!alive) return;
        const list = toList(res, 'students');
        setStudentList(Array.isArray(list) ? list : []);
      })
      .catch(() => alive && setStudentList([]));
    return () => { alive = false; };
  }, []);

  const currentIndex = studentList.findIndex((item) => String(getStudentId(item)) === String(id));
  const hasNavigation = studentList.length > 1 && currentIndex >= 0;
  const navigateStudent = (direction) => {
    if (!hasNavigation) return;
    const nextIndex = (currentIndex + direction + studentList.length) % studentList.length;
    const nextId = getStudentId(studentList[nextIndex]);
    if (nextId != null) navigate('/students/' + nextId);
  };

  const beltHistory = toList(student?.beltHistory ?? student?.belt_history);
  const languageCounts = useMemo(() => {
    const counts = Object.fromEntries(LANGUAGE_TILES.map(({ key }) => [key, 0]));
    beltHistory.forEach((entry) => {
      const language = normalizeLanguage(entry?.language);
      if (Object.prototype.hasOwnProperty.call(counts, language)) {
        counts[language] = Math.min(7, counts[language] + 1);
      }
    });
    return counts;
  }, [beltHistory]);
  // Four languages, capped at seven belts each, gives a maximum of 28.
  const totalBelts = Object.values(languageCounts).reduce((sum, count) => sum + count, 0);

  const squad = student?.batch || (student?.squadNumber ? 'Squad ' + student.squadNumber : '');
  const name = student?.name ?? student?.full_name ?? student?.fullName ?? 'Unnamed student';
  const timeline = toList(student?.sameDayProgress ?? student?.weekly_progress ?? student?.weeklyProgress ?? student?.weekly);
  const weekly = toPairs(student?.weekly_progress ?? student?.weeklyProgress ?? student?.weekly);
  const isEligible = totalBelts >= ELIGIBILITY_BELTS;
  const percentage = Math.min(100, Math.round((totalBelts / 28) * 100));
  const eligibilityPercentage = Math.min(100, Math.round((totalBelts / ELIGIBILITY_BELTS) * 100));
  const profilePhoto = student?.picture || student?.photoURL || student?.profilePicture || student?.avatar || student?.googlePicture || student?.imageUrl || '';

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-[1600px] flex-col gap-4 pb-6">
      <div className="flex shrink-0 items-center justify-between">
        <Link to="/students" className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748B] hover:text-[#2563EB]"><ArrowLeft size={16} /> Back to students</Link>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigateStudent(-1)} disabled={!hasNavigation} aria-label="Previous student" title="Previous student" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E6EBF2] bg-white text-[#334155] transition hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft size={18} /></button>
          <button type="button" onClick={() => navigateStudent(1)} disabled={!hasNavigation} aria-label="Next student" title="Next student" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E6EBF2] bg-white text-[#334155] transition hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-40"><ArrowRight size={18} /></button>
        </div>
      </div>
      {error && <div className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
      {loading ? (
        <div className="grid min-h-[620px] grid-cols-1 gap-4 xl:grid-cols-2"><div className="skeleton rounded-[22px]" /><div className="skeleton rounded-[22px]" /></div>
      ) : student ? (
        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(390px,0.92fr)_minmax(0,1.08fr)]">
          <div className="flex flex-col gap-5">
            <section className="card flex min-h-[570px] flex-col items-center !p-7 sm:!p-8">
              <div className="flex w-full items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#777B72]">Dojo overview</p>
                  <h1 className="mt-1 truncate text-2xl font-extrabold tracking-tight text-[#343A34]">{name}</h1>
                  <p className="mt-2 text-sm text-[#85877F]">{squad ? 'Kalvian from squad ' + String(squad).replace(/^squad\s*/i, '') : 'Squad not available'}</p>
                </div>
                <span className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F3F2EE] text-2xl" aria-label="Dojo shrine">⛩️</span>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center py-8">
                <ProgressRing value={totalBelts} total={28} photo={profilePhoto} name={name} />
                <p className="mt-12 text-center text-base font-semibold text-[#343A34]">{isEligible ? 'Eligibility criteria achieved' : 'Every belt brings you closer.'}</p>
                <p className="mt-2 text-center text-sm text-[#85877F]">{isEligible ? 'All qualifying belts earned' : (ELIGIBILITY_BELTS - totalBelts) + ' belts remaining to meet eligibility'}</p>
              </div>

              <div className="flex w-full shrink-0 items-center justify-between border-t border-[#ECEBE6] pt-4 text-xs text-[#85877F]">
                <span>Cumulative progress · {percentage}% complete</span>
                <span>Updated after final results</span>
              </div>
            </section>

            <section className="card grid min-h-[280px] grid-cols-1 gap-6 !p-6 sm:grid-cols-2">
              <div className="flex min-w-0 flex-col rounded-2xl bg-[#F4F7FB] p-5">
                <div className="flex items-center gap-2"><Target size={17} className="shrink-0 text-[#2563EB]" /><h2 className="text-base font-bold text-[#0F172A]">Belt progress</h2></div>
                <p className="mt-3 text-3xl font-extrabold text-[#0F172A]">{totalBelts}<span className="ml-1 text-xs font-medium text-[#64748B]">of 28 belts</span></p>
                <ProgressTimeline entries={timeline.length ? timeline : weekly} />
                <p className="mt-auto pt-3 text-xs text-[#94A3B8]">Based on recorded test history</p>
              </div>
              <div className="flex min-w-0 flex-col items-center justify-center rounded-2xl bg-[#FAFBFD] p-5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Qualifying belts</p>
                <h2 className="mt-1 text-lg font-bold text-[#0F172A]">Eligibility criteria</h2>
                <div className="relative my-4 flex h-28 w-28 shrink-0 items-center justify-center">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" role="img" aria-label={eligibilityPercentage + '% of eligibility belts earned'}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#E6EBF2" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#2563EB" strokeWidth="8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 42} strokeDashoffset={(2 * Math.PI * 42) * (1 - eligibilityPercentage / 100)} />
                  </svg>
                  <div className="relative"><p className="text-3xl font-extrabold text-[#0F172A]">{Math.min(totalBelts, ELIGIBILITY_BELTS)}</p><p className="text-[10px] text-[#64748B]">of 10</p></div>
                </div>
                <div className={'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ' + (isEligible ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}><CheckCircle2 size={13} /> {isEligible ? 'Criteria met' : 'In progress'}</div>
                <p className="mt-2 text-xs text-[#64748B]">{eligibilityPercentage}% of requirement met</p>
                <p className="mt-1 text-[11px] text-[#94A3B8]">{isEligible ? 'Eligible with 10+ belts' : (ELIGIBILITY_BELTS - totalBelts) + ' more belts needed'}</p>
              </div>
            </section>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {LANGUAGE_TILES.map((tile) => (
                <article key={tile.key} className="card flex min-h-[150px] flex-col justify-between !p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#64748B]">{tile.label}</p>
                    <span className="h-2.5 w-12 rounded-full" style={{ backgroundColor: tile.color }} />
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-4xl font-extrabold text-[#0F172A]">{languageCounts[tile.key]}<span className="ml-2 text-sm font-medium text-[#94A3B8]">/ 7</span></p>
                    <p className="text-xs text-[#94A3B8]">belts earned</p>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF2F6]">
                    <div className="h-full rounded-full" style={{ width: (languageCounts[tile.key] / 7 * 100) + '%', backgroundColor: tile.color }} />
                  </div>
                </article>
              ))}
            </section>

            <section className="card flex min-h-[380px] flex-1 flex-col !p-6 sm:!p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">Mentor remarks</h2>
                  <p className="mt-1 text-sm text-[#64748B]">Notes and feedback for this student's progress</p>
                </div>
                <span className="rounded-xl bg-[#F4F7FB] px-3 py-2 text-xs font-semibold text-[#64748B]">Coming soon</span>
              </div>
              <textarea disabled placeholder="Mentor remarks will be available here soon..." className="mt-5 min-h-[250px] w-full flex-1 resize-y rounded-2xl border border-[#E6EBF2] bg-[#F8FAFC] p-5 text-sm leading-7 text-[#64748B] placeholder:text-[#94A3B8]" />
              <div className="mt-4 flex shrink-0 items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Remarks feature is under development</span>
                <button type="button" disabled className="rounded-xl bg-[#CBD5E1] px-5 py-2.5 text-sm font-semibold text-white opacity-70">Send · Coming soon</button>
              </div>
            </section>
          </div>
        </div>
      ) : (!error && <div className="card flex-1 text-center text-sm text-[#64748B]">Student not found.</div>)}
    </div>
  );
}
