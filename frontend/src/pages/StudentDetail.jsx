import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award, CheckCircle2, Target } from 'lucide-react';
import { getStudentById } from '../services/api';
import { unwrap, toList, toPairs, fmtDate } from '../components/StatCard';

const ELIGIBILITY_BELTS = 10;
const LANGUAGE_TILES = [
  { key: 'Python', label: 'Python belts', color: '#2563EB' },
  { key: 'Java', label: 'Java belts', color: '#E63946' },
  { key: 'Node.js', label: 'Node.js belts', color: '#0F9D75' },
  { key: 'C++', label: 'C++ belts', color: '#7C3AED' }
];

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
    <div className="relative flex h-44 w-44 items-center justify-center">
      <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#E6EBF2" strokeWidth="8" />
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#2563EB" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} />
      </svg>
      <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#EFF6FF]">
        <span className="text-3xl font-extrabold text-[#0F172A]">{value}</span>
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
  const height = 150;
  const max = Math.max(1, ...points.map((point) => point.value));
  const coordinates = points.map((point, index) => ({
    x: points.length <= 1 ? width / 2 : 24 + (index * (width - 48)) / (points.length - 1),
    y: height - 20 - (point.value / max) * (height - 42),
    ...point
  }));
  const path = coordinates.map((point, index) => (index === 0 ? 'M' : 'L') + ' ' + point.x + ' ' + point.y).join(' ');
  return (
    <div className="mt-3">
      {coordinates.length > 1 ? (
        <>
          <svg viewBox={'0 0 ' + width + ' ' + height} className="h-36 w-full overflow-visible" role="img" aria-label="Recorded belt progress timeline">
            {[0, 1, 2].map((line) => <line key={line} x1="18" x2={width - 12} y1={22 + line * 48} y2={22 + line * 48} stroke="#E6EBF2" strokeDasharray="3 5" />)}
            <path d={path} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {coordinates.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="4" fill="#2563EB" stroke="white" strokeWidth="2" />)}
          </svg>
          <div className="flex justify-between text-[10px] text-[#94A3B8]">
            <span>{coordinates[0].label ? fmtDate(coordinates[0].label) : 'Start'}</span>
            <span>{coordinates[coordinates.length - 1].label ? fmtDate(coordinates[coordinates.length - 1].label) : 'Latest record'}</span>
          </div>
        </>
      ) : (
        <div className="flex h-36 items-center justify-center rounded-xl bg-[#F8FAFC] text-center text-xs text-[#94A3B8]">Progress timeline will appear as test history is recorded.</div>
      )}
    </div>
  );
}

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
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

  const beltHistory = toList(student?.beltHistory ?? student?.belt_history);
  // Unique language + level entries are the source of truth for the totals.\n  const totalBelts = beltHistory.length;
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
    <div className="mx-auto max-w-[1500px] space-y-4 p-4 pb-24 sm:p-6 lg:p-8">
      <Link to="/students" className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748B] hover:text-[#2563EB]"><ArrowLeft size={16} /> Back to students</Link>
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="skeleton h-[340px] rounded-[22px]" />
          <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-28 rounded-[18px]" />)}</div>
          <div className="skeleton h-52 rounded-[22px]" /><div className="skeleton h-52 rounded-[22px]" />
        </div>
      ) : student ? (
        <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(390px,0.95fr)_minmax(0,1.05fr)]">
          <div className="space-y-4">
            <section className="card flex min-h-[340px] flex-col items-center justify-between overflow-hidden !p-5 sm:!p-7">
              <div className="flex w-full items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#64748B]">Dojo overview</p>
                  <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#0F172A]">{name}</h1>
                  <p className="mt-2 text-sm text-[#64748B]">{squad ? 'Kalvian from squad ' + String(squad).replace(/^squad\s*/i, '') : 'Squad not available'}</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]"><Award size={20} /></span>
              </div>
              <div className="flex flex-col items-center py-1">
                <ProgressRing value={totalBelts} total={ELIGIBILITY_BELTS} />
                <p className="-mt-1 text-sm font-semibold text-[#0F172A]">{isEligible ? 'Eligibility criteria achieved' : 'Every belt brings you closer.'}</p>
                <p className="mt-1 text-xs text-[#64748B]">{isEligible ? 'All qualifying belts earned' : (ELIGIBILITY_BELTS - totalBelts) + ' belts remaining to meet eligibility'}</p>
              </div>
              <div className="flex w-full items-center justify-between border-t border-[#E6EBF2] pt-3 text-[10px] text-[#94A3B8]"><span>Cumulative progress · {percentage}%</span><span>Updated after final results</span></div>
            </section>

            <section className="card grid gap-5 sm:grid-cols-2 !p-5">
              <div className="rounded-2xl bg-[#F4F7FB] p-4">
                <div className="flex items-center gap-2"><Target size={16} className="text-[#2563EB]" /><h2 className="text-sm font-bold text-[#0F172A]">Belt progress</h2></div>
                <p className="mt-4 text-3xl font-extrabold text-[#0F172A]">{totalBelts}<span className="ml-2 text-xs font-medium text-[#64748B]">total belts earned</span></p>
                <ProgressTimeline entries={timeline.length ? timeline : weekly} />
                <p className="mt-2 text-[10px] text-[#94A3B8]">Based on recorded test history</p>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Qualifying belts</p>
                <h2 className="mt-1 text-lg font-bold text-[#0F172A]">Eligibility criteria</h2>
                <div className="relative my-3 flex h-24 w-24 items-center justify-center">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" role="img" aria-label={percentage + '% of eligibility belts earned'}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#E6EBF2" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#2563EB" strokeWidth="8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 42} strokeDashoffset={(2 * Math.PI * 42) * (1 - percentage / 100)} />
                  </svg>
                  <div className="relative">
                    <p className="text-3xl font-extrabold text-[#0F172A]">{Math.min(totalBelts, ELIGIBILITY_BELTS)}</p>
                    <p className="text-[10px] text-[#64748B]">of 10</p>
                  </div>
                </div>
                <div className={'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ' + (isEligible ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}><CheckCircle2 size={14} /> {isEligible ? 'Criteria met' : 'In progress'}</div>
                <p className="mt-2 text-xs text-[#64748B]">{isEligible ? '100% of requirement met' : percentage + '% of requirement met'}</p>
                <p className="mt-1 text-[10px] text-[#94A3B8]">{isEligible ? 'Eligible with 10 or more belts' : (ELIGIBILITY_BELTS - totalBelts) + ' more belts to meet eligibility'}</p>
              </div>
            </section>
          </div>

          <section className="grid content-start grid-cols-1 gap-3 sm:grid-cols-2">
            {LANGUAGE_TILES.map((tile) => (
              <article key={tile.key} className="card flex min-h-[112px] flex-col justify-between !p-5">
                <p className="text-xs font-semibold text-[#64748B]">{tile.label}</p>
                <div className="flex items-end justify-between"><p className="text-3xl font-extrabold text-[#0F172A]">{languageCounts[tile.key]}</p><span className="mb-1 h-2 w-10 rounded-full" style={{ backgroundColor: tile.color }} /></div>
              </article>
            ))}
            {Array.from({ length: 5 }, (_, index) => <div key={'reserved-' + index} aria-hidden="true" className={'min-h-[112px] rounded-[18px] border border-dashed border-[#E6EBF2] bg-[#F8FAFC] ' + (index === 4 ? 'sm:col-span-2' : '')} />)}
          </section>
        </div>
      ) : (!error && <div className="card text-center text-sm text-[#64748B]">Student not found.</div>)}
    </div>
  );
}
