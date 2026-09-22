import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMentorsRoster } from '../services/api';
import { ShieldCheck, Mail, BookOpen, Award, Code2, Calendar, Users } from 'lucide-react';

const Profile = () => {
  const { mentor } = useAuth();
  const [roster, setRoster] = useState([]);

  useEffect(() => {
    getMentorsRoster()
      .then((response) => {
        if (response.success) setRoster(response.mentors);
      })
      .catch(() => setRoster([]));
  }, []);

  if (!mentor) return null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Mentor Profile Header */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
        <img
          src={mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`}
          alt={mentor.name}
          className="w-24 h-24 rounded-3xl bg-slate-800 object-cover ring-4 ring-rose-500/30 shadow-2xl"
        />

        <div className="space-y-2 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Kalvium Lead Mentor
          </div>
          <h1 className="text-3xl font-black text-white">{mentor.name}</h1>
          <p className="text-sm text-slate-300 font-medium">{mentor.role || 'Kalvium Dojo Mentor'}</p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-rose-400" />
              {mentor.email}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              {mentor.track || 'Growth & Development'}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Kalvium Dojo 2026
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-rose-400" />
          <div>
            <h2 className="text-base font-bold text-white">Authorized Mentor Roster</h2>
            <p className="text-xs text-slate-400">Seven temporary allowlist accounts — passwords are never shown here.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {roster.map((member) => (
            <div key={member.id} className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-4">
              <p className="text-sm font-bold text-white">{member.name}</p>
              <p className="mt-1 text-xs text-rose-300">{member.track}</p>
              <p className="mt-2 truncate text-[11px] text-slate-400">{member.email}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Program Scope Card */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Dojo Belt System & Language Supervision</h2>
            <p className="text-xs text-slate-400">
              Monitoring student test slots, belt advancements, and language proficiencies
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { lang: 'Python', desc: 'Core Algorithms & Data Structures', badge: 'Active' },
            { lang: 'Node.js', desc: 'Backend & Async JavaScript', badge: 'Active' },
            { lang: 'Java', desc: 'Object-Oriented & Enterprise CS', badge: 'Active' },
            { lang: 'C++', desc: 'Memory Management & High Perf', badge: 'Active' }
          ].map((item) => (
            <div key={item.lang} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-rose-400" />
                  {item.lang}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                  {item.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
