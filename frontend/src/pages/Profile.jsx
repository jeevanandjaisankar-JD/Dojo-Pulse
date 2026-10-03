import React, { useEffect, useState } from 'react';
import { User, UserX, LogOut } from 'lucide-react';
import { getMentorProfile } from '../services/api';
import { unwrap, humanize } from '../components/StatCard';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { logout } = useAuth();

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    getMentorProfile()
      .then((res) => {
        const d = unwrap(res);
        if (alive) setMentor(d && typeof d === 'object' && Object.keys(d).length ? d : null);
      })
      .catch(() => alive && setError(true))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const name = mentor?.name ?? mentor?.full_name ?? mentor?.fullName ?? '';
  const photo = mentor?.avatar ?? mentor?.avatar_url ?? mentor?.avatarUrl ?? mentor?.photo ?? mentor?.picture;
  const role = mentor?.role ?? mentor?.title ?? '';
  const fields = Object.entries(mentor || {}).filter(
    ([k, v]) => ['string', 'number'].includes(typeof v) && !/^(id|_id|name|full_name|fullName|avatar|avatar_url|avatarUrl|photo|picture|role|title|password|token)$/i.test(k)
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pb-28 sm:p-6 md:pb-8 lg:p-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Profile</h1>

      {loading ? (
        <div className="card space-y-6">
          <div className="flex items-center gap-5">
            <div className="skeleton h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-3"><div className="skeleton h-6 w-48" /><div className="skeleton h-4 w-32" /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-16 w-full" />)}
          </div>
        </div>
      ) : !mentor ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2F7] text-[#64748B]"><UserX size={26} /></span>
          <p className="text-lg font-bold">{error ? "Couldn't load your profile" : 'No profile found'}</p>
          <p className="max-w-sm text-sm text-[#64748B]">
            {error ? 'Check your connection and refresh the page.' : 'Your mentor details will appear here once they are available.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid-hero relative overflow-hidden rounded-[20px] border border-[#D6E4FA] p-6 sm:p-8">
            <div className="relative z-10 flex items-center gap-5">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-3xl font-extrabold text-[#2563EB] shadow-sm">
                {photo ? <img src={photo} alt={name || 'Mentor'} className="h-full w-full object-cover" /> : name ? name.charAt(0).toUpperCase() : <User size={30} />}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-extrabold">{name || 'Mentor'}</h2>
                {role && <p className="text-[#475569]">{role}</p>}
              </div>
            </div>
          </div>
          {fields.length > 0 && (
            <dl className="card grid gap-4 sm:grid-cols-2">
              {fields.map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-[#E6EBF2] bg-[#F8FAFC] p-4">
                  <dt className="text-xs text-[#64748B]">{humanize(k)}</dt>
                  <dd className="mt-1 break-words font-semibold">{String(v)}</dd>
                </div>
              ))}
            </dl>
          )}
          <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={18} />
          Logout
          </button>
        </div>
      )}
    </div>
  );
}
