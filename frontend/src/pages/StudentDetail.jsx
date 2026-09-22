import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentById } from '../services/api';
import {
  ArrowLeft,
  User,
  Award,
  TrendingUp,
  Minus,
  Calendar,
  Layers,
  Code2,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import StatCard from '../components/StatCard';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getStudentById(id);
        if (data.success) {
          setStudent(data.student);
        }
      } catch (err) {
        console.error('Failed to load student details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm">
        <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading student belt history & same-day test progress...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Student Record Not Found</h2>
        <p className="text-sm text-slate-400">
          No student matching ID/Email "{id}" was found in the database.
        </p>
        <button
          onClick={() => navigate('/students')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors"
        >
          Return to Student Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/students')}
        className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students Directory
      </button>

      {/* Student Banner Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                {student.batch || 'Batch S.138'}
              </span>
              <span className="text-xs text-slate-400">Mentor: {student.mentorName || 'Aravind'}</span>
            </div>
            <h1 className="text-2xl font-black text-white">{student.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {student.email || student.studentId}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="px-4 py-2 rounded-xl text-sm font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
            🥋 Belt Level {student.currentBeltLevel}
          </span>
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
              student.improvementStatus === 'IMPROVED'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}
          >
            {student.improvementStatus === 'IMPROVED' ? 'Improved (Belt Earned)' : 'No Improvement (0 Belts)'}
          </span>
        </div>
      </div>

      {/* Belt KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Verified Belts"
          value={`Level ${student.verifiedBelts || 0}`}
          subtext="Base belts already verified"
          icon={Award}
          color="blue"
        />

        <StatCard
          title="Current Belt Level"
          value={`Level ${student.currentBeltLevel || 0}`}
          subtext="Post-slot evaluation status"
          icon={Award}
          color="rose"
        />

        <StatCard
          title="Belts Earned"
          value={`+${student.totalBeltsEarned || 0}`}
          trend={student.totalBeltsEarned > 0 ? 'Belt Advanced' : 'No Change'}
          subtext="Net advancement across slots"
          icon={TrendingUp}
          color={student.totalBeltsEarned > 0 ? 'emerald' : 'amber'}
        />

        <StatCard
          title="Total Slots Attempted"
          value={student.totalSlotsAttempted || 0}
          subtext="Across test slots"
          icon={Layers}
          color="purple"
        />
      </div>

      {/* Same-Day Multi-Slot & Multi-Language Progress */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-400" />
              Same-Day Test Progress & Multi-Language Attempts
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracks slots attempted on the same date across different programming languages
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-xl self-start">
            Total Active Days: <strong className="text-white">{student.sameDayProgress?.length || 0}</strong>
          </span>
        </div>

        <div className="space-y-4">
          {(student.sameDayProgress || []).map((day, dIdx) => (
            <div
              key={dIdx}
              className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4"
            >
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 font-mono text-xs font-bold text-white">
                    {day.date}
                  </div>
                  <span className="text-xs text-slate-300 font-medium">
                    Attempted <strong className="text-white">{day.totalSlotsAttempted} slot{day.totalSlotsAttempted === 1 ? '' : 's'}</strong> on this day
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(day.languages || []).map((l) => (
                      <span key={l} className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      day.netBeltsEarned > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-700/60 text-slate-300'
                    }`}
                  >
                    Day Progress: +{day.netBeltsEarned} Belt{day.netBeltsEarned === 1 ? '' : 's'} Earned
                  </span>
                </div>
              </div>

              {/* Slot attempts conducted on this day */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {day.attempts.map((attempt, aIdx) => (
                  <div
                    key={aIdx}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white flex items-center gap-1">
                          <Code2 className="w-3.5 h-3.5 text-rose-400" />
                          {attempt.language}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {attempt.slotId?.slice(0, 8)}...
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Verified: Level {attempt.verifiedBelts} → Post-Slot: Level {attempt.beltLevel}
                      </p>
                      {attempt.time && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> {attempt.time}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      {attempt.isImproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <TrendingUp className="w-3 h-3" /> +{attempt.beltsEarned} Belt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          <Minus className="w-3 h-3" /> 0 Belts
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
