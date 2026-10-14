import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getStudentById } from '../services/api';
import { unwrap, toList, toPairs, humanize, fmtDate } from '../components/StatCard';
import BeltChart, { BeltBadge, beltColor } from '../components/BeltChart';

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getStudentById(id)
      .then((res) => alive && setStudent(unwrap(res)?.student ?? unwrap(res)))
      .catch(() => alive && setError('Could not load this student.'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id]);

  const name = student?.name ?? student?.full_name ?? student?.fullName ?? '';
  const belt = student?.belt ?? student?.current_belt ?? student?.currentBelt ?? '';
  const language = student?.language ?? student?.lang ?? '';
  const timeline = toList(student?.belt_history ?? student?.beltHistory ?? student?.belts ?? student?.timeline);
  const weekly = toPairs(student?.weekly_progress ?? student?.weeklyProgress ?? student?.weekly);
  const details = Object.entries(student || {}).filter(
    ([k, v]) => ['string', 'number'].includes(typeof v) && !/^(id|_id|name|full_name|fullName|belt|current_belt|currentBelt|language|lang)$/.test(k)
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 pb-28 sm:p-6 md:pb-8 lg:p-8">
      <Link to="/students" className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition-colors hover:text-[#0F172A]">
        <ArrowLeft size={16} /> Back to students
      </Link>

      {error && <div className="rounded-2xl border border-[#E63946]/30 bg-[#FDECEE] px-4 py-3 text-sm text-[#B91C1C]">{error}</div>}

      {loading ? (
        <div className="space-y-6">
          <div className="skeleton h-40 w-full rounded-[20px]" />
          <div className="skeleton h-64 w-full rounded-[20px]" />
        </div>
      ) : student ? (
        <>
          <section className="grid-hero relative overflow-hidden rounded-[20px] border border-[#D6E4FA] p-6 sm:p-8">
            <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-3xl font-extrabold text-[#2563EB] shadow-sm">
                {(name || '?').charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-3xl font-extrabold tracking-tight">{name || 'Unnamed student'}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <BeltBadge belt={belt} />
                  {language && <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#475569]">{language}</span>}
                </div>
              </div>
            </div>
          </section>

          {details.length > 0 && (
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {details.slice(0, 8).map(([k, v]) => (
                <div key={k} className="card card-hover p-5">
                  <p className="text-xs text-[#64748B]">{humanize(k)}</p>
                  <p className="mt-1 truncate text-lg font-bold">{typeof v === 'number' ? v.toLocaleString() : v}</p>
                </div>
              ))}
            </section>
          )}

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="card">
              <h3 className="text-lg font-bold">Belt timeline</h3>
              {timeline.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#64748B]">No belt history recorded yet.</p>
              ) : (
                <ol className="mt-6 space-y-6 border-l-2 border-[#E6EBF2] pl-6">
                  {timeline.map((t, i) => {
                    const b = typeof t === 'string' ? t : t.belt ?? t.name ?? t.label;
                    const d = typeof t === 'object' ? t.date ?? t.achieved_at ?? t.achievedAt ?? t.awarded_at : null;
                    return (
                      <li key={i} className="relative">
                        <span className="absolute -left-[33px] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white" style={{ background: beltColor(b) }} />
                        <p className="font-semibold capitalize">{b}</p>
                        {d && <p className="text-xs text-[#64748B]">{fmtDate(d)}</p>}
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
            <BeltChart title="Weekly progress" data={weekly} colorByBelt={false} />
          </section>
        </>
      ) : (
        !error && <div className="card text-center text-sm text-[#64748B]">Student not found.</div>
      )}
    </div>
  );
}
