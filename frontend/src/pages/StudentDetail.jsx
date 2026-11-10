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

function ProgressRing({ value, total }) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / total, 1);
  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#E6EBF2" strokeWidth="8" />
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#2563EB" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} />
      </svg>
      <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-[#EFF6FF]">
        <span className="text-2xl font-extrabold text-[#0F172A]">{value}</span>
        <span className="text-[10px] font-semibold text-[#64748B]">of {total} belts</span>
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
  const totalBelts = beltHistory.length;
  const languageCounts = useMemo(() => {
    const counts = Object.fromEntries(LANGUAGE_TILES.map(({ key }) => [key, 0]));
    beltHistory.forEach((entry) => {
      const language = normalizeLanguage(entry?.language);
      if (Object.prototype.hasOwnProperty.call(counts, language)) counts[language] += 1;
    });
    return counts;
  }, [beltHistory]);

  const squad = student?.batch || (student?.squadNumber ? 'Squad ' + student.squadNumber : '');
  const name = student?.name ?? student?.full_name ?? student?.fullName ?? 'Unnamed student';
  const timeline = toList(student?.sameDayProgress ?? student?.weekly_progress ?? student?.weeklyProgress ?? student?.weekly);
  const weekly = toPairs(student?.weekly_progress ?? student?.weeklyProgress ?? student?.weekly);
  const isEligible = totalBelts >= ELIGIBILITY_BELTS;
  const percentage = Math.min(100, Math.round((totalBelts / ELIGIBILITY_BELTS) * 100));

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] min-h-0 max-w-[1600px] flex-col gap-2 overflow-hidden">
      <div className="flex shrink-0 items-center justify-between">
        <Link to="/students" className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748B] hover:text-[#2563EB]"><ArrowLeft size={16} /> Back to students</Link>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigateStudent(-1)} disabled={!hasNavigation} aria-label="Previous student" title="Previous student" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E6EBF2] bg-white text-[#334155] transition hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft size={18} /></button>
          <button type="button" onClick={() => navigateStudent(1)} disabled={!hasNavigation} aria-label="Next student" title="Next student" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E6EBF2] bg-white text-[#334155] transition hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-40"><ArrowRight size={18} /></button>
        </div>
      </div>
      {error && <div className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
      {loading ? (
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-3"><div className="skeleton rounded-[22px]" /><div className="skeleton rounded-[22px]" /></div>
      ) : student ? (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden xl:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.05fr)]">
          <div className="grid min-h-0 grid-rows-[1fr_1fr] gap-3">
            <section className="card flex min-h-0 flex-col items-center justify-between overflow-hidden !p-4">
              <div className="flex w-full items-start justify-between">
                <div className="min-w-0"><p className="text-xs font-medium text-[#64748B]">Dojo overview</p><h1 className="mt-1 truncate text-xl font-extrabold tracking-tight text-[#0F172A]">{name}</h1><p className="mt-1 text-sm text-[#64748B]">{squad ? 'Kalvian from squad ' + String(squad).replace(/^squad\s*/i, '') : 'Squad not available'}</p></div>
                <span className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]"><Award size={18} /></span>
              </div>
              <div className="flex min-h-0 flex-col items-center justify-center">
                <ProgressRing value={totalBelts} total={ELIGIBILITY_BELTS} />
                <p className="mt-1 text-center text-sm font-semibold text-[#0F172A]">{isEligible ? 'Eligibility criteria achieved' : 'Every belt brings you closer.'}</p>
                <p className="mt-1 text-center text-xs text-[#64748B]">{isEligible ? 'All qualifying belts earned' : (ELIGIBILITY_BELTS - totalBelts) + ' belts remaining to meet eligibility'}</p>
              </div>
              <div className="flex w-full shrink-0 items-center justify-between border-t border-[#E6EBF2] pt-2 text-[10px] text-[#94A3B8]"><span>Cumulative progress · {percentage}%</span><span>Updated after final results</span></div>
            </section>
            <section className="card grid min-h-0 grid-cols-2 gap-3 overflow-hidden !p-3">
              <div className="flex min-h-0 flex-col rounded-2xl bg-[#F4F7FB] p-3">
                <div className="flex items-center gap-2"><Target size={15} className="shrink-0 text-[#2563EB]" /><h2 className="text-sm font-bold text-[#0F172A]">Belt progress</h2></div>
                <p className="mt-2 text-2xl font-extrabold text-[#0F172A]">{totalBelts}<span className="ml-1 text-[10px] font-medium text-[#64748B]">total belts</span></p>
                <ProgressTimeline entries={timeline.length ? timeline : weekly} />
                <p className="mt-auto pt-1 text-[9px] text-[#94A3B8]">Based on recorded test history</p>
              </div>
              <div className="flex min-h-0 flex-col items-center justify-center text-center">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748B]">Qualifying belts</p><h2 className="mt-1 text-base font-bold text-[#0F172A]">Eligibility criteria</h2>
                <div className="relative my-2 flex h-20 w-20 shrink-0 items-center justify-center">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" role="img" aria-label={percentage + '% of eligibility belts earned'}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#E6EBF2" strokeWidth="8" /><circle cx="50" cy="50" r="42" fill="none" stroke="#2563EB" strokeWidth="8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 42} strokeDashoffset={(2 * Math.PI * 42) * (1 - percentage / 100)} />
                  </svg>
                  <div className="relative"><p className="text-2xl font-extrabold text-[#0F172A]">{Math.min(totalBelts, ELIGIBILITY_BELTS)}</p><p className="text-[9px] text-[#64748B]">of 10</p></div>
                </div>
                <div className={'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ' + (isEligible ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}><CheckCircle2 size={12} /> {isEligible ? 'Criteria met' : 'In progress'}</div>
                <p className="mt-1 text-[10px] text-[#64748B]">{percentage}% of requirement met</p><p className="mt-1 text-[9px] text-[#94A3B8]">{isEligible ? 'Eligible with 10+ belts' : (ELIGIBILITY_BELTS - totalBelts) + ' more belts needed'}</p>
              </div>
            </section>
          </div>
          <section className="grid min-h-0 grid-cols-2 grid-rows-5 gap-3 overflow-hidden">
            {LANGUAGE_TILES.map((tile) => <article key={tile.key} className="card flex min-h-0 flex-col justify-between !p-3"><p className="text-xs font-semibold text-[#64748B]">{tile.label}</p><div className="flex items-end justify-between"><p className="text-2xl font-extrabold text-[#0F172A]">{languageCounts[tile.key]}</p><span className="mb-1 h-2 w-10 rounded-full" style={{ backgroundColor: tile.color }} /></div></article>)}
            {Array.from({ length: 4 }, (_, index) => <div key={'reserved-' + index} aria-hidden="true" className="min-h-0 rounded-[18px] border border-dashed border-[#E6EBF2] bg-[#F8FAFC]" />)}
            <article className="card col-span-2 flex min-h-0 flex-col !p-3">
              <h2 className="text-sm font-bold text-[#0F172A]">Mentor remarks</h2>
              <textarea disabled placeholder="Mentor remarks are coming soon..." className="mt-2 min-h-0 flex-1 resize-none rounded-xl border border-[#E6EBF2] bg-[#F8FAFC] p-3 text-sm text-[#64748B] placeholder:text-[#94A3B8]" />
              <div className="mt-2 flex shrink-0 items-center justify-between"><span className="text-[10px] text-[#94A3B8]">Coming soon</span><button type="button" disabled className="rounded-lg bg-[#CBD5E1] px-4 py-2 text-xs font-semibold text-white opacity-70">Send · Coming soon</button></div>
            </article>
          </section>
        </div>
      ) : (!error && <div className="card flex-1 text-center text-sm text-[#64748B]">Student not found.</div>)}
    </div>
  );
}
