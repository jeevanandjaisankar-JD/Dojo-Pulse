import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Calendar, BookOpen, ShieldCheck } from 'lucide-react';

const MentorBanner = () => {
  const { mentor } = useAuth();

  if (!mentor) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border border-rose-500/20 p-6 shadow-xl">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`}
            alt={mentor.name}
            className="w-16 h-16 rounded-2xl ring-4 ring-rose-500/30 bg-slate-800 object-cover shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-rose-400" />
                Kalvium Mentor Portal
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Active Session
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome back, {mentor.name}!
            </h1>
            <p className="text-sm text-slate-300">
              {mentor.role} <span className="text-slate-500">•</span> {mentor.track}
            </p>
          </div>
        </div>

        {/* Quick Mentor Context Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-rose-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Track</p>
              <p className="text-xs font-medium text-white">{mentor.track || 'Core Problem Solving'}</p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Current Program</p>
              <p className="text-xs font-medium text-white">Kalvium Dojo 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorBanner;
