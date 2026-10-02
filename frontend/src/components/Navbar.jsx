import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { getMentorProfile } from '../services/api';
import { unwrap } from './StatCard';
import kalviumLogo from '../assets/kalvium-logo.svg';

export default function Navbar() {
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getMentorProfile()
      .then((res) => alive && setMentor(unwrap(res)))
      .catch(() => alive && setMentor(null))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const name = mentor?.name ?? mentor?.full_name ?? mentor?.fullName ?? '';
  const photo = mentor?.avatar ?? mentor?.avatar_url ?? mentor?.avatarUrl ?? mentor?.photo ?? mentor?.picture;

  return (
    <header className="sticky top-0 z-50 border-b border-[#E6EBF2] bg-white/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-left gap-3">
        </Link>
        <img
        src={kalviumLogo}
        alt="Kalvium"
        className="h-9 w-auto object-contain"
        />
        <span className="text-lg font-extrabold tracking-tight">Dojo Pulse</span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6EBF2] bg-white text-[#64748B] transition-colors hover:bg-[#F4F7FB] hover:text-[#0F172A]"
          >
            <Bell size={18} />
          </button>
          <Link
            to="/profile"
            aria-label="Mentor profile"
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#E6EBF2] bg-[#EAF2FF] text-sm font-bold text-[#2563EB] transition-shadow hover:shadow-md"
          >
            {loading ? (
              <span className="skeleton h-full w-full rounded-full" />
            ) : photo ? (
              <img src={photo} alt={name || 'Mentor'} className="h-full w-full object-cover" />
            ) : name ? (
              name.trim().charAt(0).toUpperCase()
            ) : (
              <User size={18} />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
