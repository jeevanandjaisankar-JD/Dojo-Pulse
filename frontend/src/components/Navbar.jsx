import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, User } from 'lucide-react';
import kalviumLogo from '../assets/kalvium-logo.svg';

export default function Navbar() {
  const { user } = useAuth();

  const name = user?.name ?? user?.full_name ?? user?.fullName ?? '';
  const photo =
    user?.avatar ??
    user?.avatar_url ??
    user?.avatarUrl ??
    user?.photo ??
    user?.picture ??
    user?.photoURL ??
    user?.imageUrl;

  return (
    <header className="sticky top-0 z-50 border-b border-[#E6EBF2] bg-white/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img
            src={kalviumLogo}
            alt="Kalvium"
            className="h-9 w-auto object-contain"
          />
          <span className="text-lg font-extrabold tracking-tight">
            Dojo Pulse
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6EBF2] bg-white text-[#64748B] transition-colors hover:bg-[#F4F7FB] hover:text-[#0F172A]"
          >
            <Bell size={18} />
          </Link>

          <Link
            to="/profile"
            aria-label="Mentor profile"
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#E6EBF2] bg-[#EAF2FF] text-sm font-bold text-[#2563EB] transition-shadow hover:shadow-md"
          >
            {photo ? (
              <img
                src={photo}
                alt={name || 'Mentor'}
                className="h-full w-full object-cover"
              />
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
