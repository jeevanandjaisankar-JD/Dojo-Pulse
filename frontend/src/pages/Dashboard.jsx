import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MentorBanner from '../components/MentorBanner';
import StatCard from '../components/StatCard';
import { getDashboardStats } from '../services/api';
import {
  Users,
  TrendingUp,
  Award,
  CalendarCheck,
  Code2,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const languages = stats?.languages || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Mentor Greeting Banner */}
      <MentorBanner />

      {/* Belt-System Overview Common Stats */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Overall Dojo Belt Progress
            </h2>
            <p className="text-sm text-slate-400">
              Marking based on belts earned per slot across the 4 programming languages
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
            Belt Hierarchy Analytics
          </span>
        </div>

        {/* 5 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Students"
            value={stats ? stats.totalStudents : '--'}
            subtext="Active in program"
            icon={Users}
            color="blue"
          />

          <StatCard
            title="Students Improved"
            value={stats ? stats.improvedStudents : '--'}
            trend={`+${stats?.improvementRate || 0}% rate`}
            subtext="Earned ≥ 1 belt"
            icon={TrendingUp}
            color="emerald"
          />

          <StatCard
            title="Not Improved"
            value={stats ? stats.notImprovedStudents : '--'}
            trend="0 Belts Earned"
            subtext="Requires intervention"
            icon={AlertCircle}
            color="amber"
          />

          <StatCard
            title="Total Belts Earned"
            value={`+${stats?.totalBeltsEarned || 0}`}
            subtext="Cumulative advancements"
            icon={Award}
            color="rose"
          />

          <StatCard
            title="Slots / Tests Conducted"
            value={stats ? stats.totalSlotsHappened : '--'}
            subtext="Across 4 languages"
            icon={CalendarCheck}
            color="purple"
          />
        </div>
      </section>

      {/* 4 Languages Performance Row */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-white">4 Languages Belt Activity</h3>
          </div>
          <span className="text-xs text-slate-400">
            Total active languages: <strong className="text-white">{stats?.activeLanguagesCount || 0}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(languages).map(([lang, info]) => (
            <div
              key={lang}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition-colors flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {lang}
                </span>
                <span className="text-lg font-black text-white block mt-0.5">
                  {info.slots || 0} Slots Attempted
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                  +{info.beltsEarned || 0} Belts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Test Slot Evaluations */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Test Activity</h3>
            <Link
              to="/students"
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              View All Students <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {(stats?.recentActivity || []).map((act, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:bg-slate-800 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-200">
                      {act.language}
                    </span>
                    <h4 className="text-sm font-semibold text-white">{act.student}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Evaluated on {act.date}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    🥋 Belt Level {act.beltLevel}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      act.status.includes('+')
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {act.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Mentor Quick Actions */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Quick Actions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload evaluation CSV files directly or check student belt progress and same-day multi-slot tests.
            </p>

            <div className="space-y-2.5">
              <Link
                to="/upload"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">Upload Evaluations CSV</span>
                    <span className="text-[10px] text-slate-400">Run Pandas belt cleaner</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/students"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">Student Directory</span>
                    <span className="text-[10px] text-slate-400">Same-day slots & belt progression</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/improvements"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">Improvements Matrix</span>
                    <span className="text-[10px] text-slate-400">Improved vs Not Improved stats</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-white">Marking Rule:</span> If earned belt is +1 or more from verified belt level, it counts as <strong className="text-emerald-400">Improvement</strong>. If 0 belts earned, <strong className="text-amber-400">No Improvement</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
