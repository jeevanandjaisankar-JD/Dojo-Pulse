import React, { useState, useEffect } from 'react';
import { getImprovementsAnalytics } from '../services/api';
import StatCard from '../components/StatCard';
import {
  TrendingUp,
  TrendingDown,
  CalendarCheck2,
  Zap,
  BarChart3,
  Layers,
  Code2,
  Award,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const Improvements = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getImprovementsAnalytics();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load improvements analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm">
        <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Calculating belt improvement dynamics across 4 languages...
      </div>
    );
  }

  const {
    totalStudents = 0,
    improvedCount = 0,
    notImprovedCount = 0,
    totalSlotsHappened = 0,
    totalBeltsEarned = 0,
    languages = {},
    progressHappened = {},
    timelineProgress = []
  } = data || {};

  const improvedPercentage = Math.round((improvedCount / Math.max(totalStudents, 1)) * 100);
  const notImprovedPercentage = 100 - improvedPercentage;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Dojo Belt Improvement Analytics
        </h1>
        <p className="text-sm text-slate-400">
          Tracking students who earned belts versus students who stagnated with 0 belts earned
        </p>
      </div>

      {/* The 4 Specific Actions/Metrics Requested */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Students Improved"
          value={improvedCount}
          trend={`${improvedPercentage}% of total`}
          subtext="Earned +1 or more belts"
          icon={TrendingUp}
          color="emerald"
        />

        <StatCard
          title="Students Not Improved"
          value={notImprovedCount}
          trend={`${notImprovedPercentage}% of total`}
          subtext="Earned 0 belts in test slots"
          icon={TrendingDown}
          color="amber"
        />

        <StatCard
          title="Slots (Tests) Happened"
          value={totalSlotsHappened}
          trend="Evaluated"
          subtext="Total attempts across slots"
          icon={CalendarCheck2}
          color="blue"
        />

        <StatCard
          title="Progress Happened"
          value={`+${totalBeltsEarned} Belts`}
          trend={progressHappened.cohortPassRate || 'Cohort Growth'}
          subtext={progressHappened.netGainText || 'Cumulative belt advancements'}
          icon={Zap}
          color="rose"
        />
      </div>

      {/* Visual Ratio Bar */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-rose-400" />
            Cohort Improvement Distribution (Belt Advancements)
          </span>
          <span className="text-xs text-slate-400">
            Total Students: <strong className="text-white">{totalStudents}</strong>
          </span>
        </div>

        <div className="w-full h-5 rounded-full bg-slate-800 overflow-hidden flex">
          <div
            style={{ width: `${improvedPercentage}%` }}
            className="h-full bg-emerald-500 transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-emerald-950"
            title={`Improved: ${improvedCount} students (${improvedPercentage}%)`}
          >
            {improvedPercentage}% Improved
          </div>
          <div
            style={{ width: `${notImprovedPercentage}%` }}
            className="h-full bg-amber-500 transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-amber-950"
            title={`Not Improved: ${notImprovedCount} students (${notImprovedPercentage}%)`}
          >
            {notImprovedPercentage}% No Improvement
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Earned Belt (+1 or more): <strong className="text-emerald-400">{improvedCount} students</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>Stagnant (0 Belts): <strong className="text-amber-400">{notImprovedCount} students</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Programming Languages Comparison */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white">4 Languages Progression Breakdown</h3>
          </div>
          <span className="text-xs text-slate-400">
            Total Languages Supervised: <strong className="text-white">4 (Python, Node.js, Java, C++)</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(languages).map(([lang, info]) => (
            <div key={lang} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-rose-400" />
                  {lang}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  +{info.beltsEarned || 0} Belts
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <p>Slots Attempted: <strong className="text-slate-200">{info.slots || 0}</strong></p>
                <p>Improved Students: <strong className="text-emerald-400">{info.improvedStudents || 0}</strong></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Periods Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white">Test Rounds & Historical Progress</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Testing Period</th>
                <th className="px-5 py-3.5">Slots Attempted</th>
                <th className="px-5 py-3.5">Belts Earned</th>
                <th className="px-5 py-3.5">Primary Language Focus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {timelineProgress.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 font-semibold text-white">
                    {p.period}
                  </td>
                  <td className="px-5 py-4 font-mono text-slate-300">
                    {p.slotsAttempted} tests
                  </td>
                  <td className="px-5 py-4 font-bold text-emerald-400">
                    +{p.beltsEarned} Belts
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-rose-300">
                    {p.topLanguage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Improvements;
