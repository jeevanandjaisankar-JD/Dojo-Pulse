import { useEffect, useState } from "react";
import { Users, TrendingUp, AlertCircle, Award, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import { getDashboardStats, getMentorProfile } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [mentor, setMentor] = useState({ name: "Mentor" });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, mentorRes] = await Promise.all([
          getDashboardStats(),
          getMentorProfile(),
        ]);

        if (statsRes.success) setStats(statsRes.stats);
        if (mentorRes.success) setMentor(mentorRes.mentor);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#07142D] to-[#0F172A] border border-red-500/20 p-8">
        <div className="absolute right-0 top-0 w-72 h-72 bg-red-500/10 blur-3xl rounded-full" />

        <div className="relative z-10">
          <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-semibold">
            Kalvium Mentor Portal
          </span>

          <h1 className="text-4xl font-black text-white mt-4">
            Welcome back, {mentor.name} 👋
          </h1>

          <p className="text-slate-300 mt-3 max-w-xl">
            Track student belt progression and monitor weekly dojo analytics.
          </p>

          <div className="flex gap-3 mt-6">
            <Link
              to="/students"
              className="bg-[#E63946] hover:bg-red-600 px-5 py-3 rounded-xl text-white font-semibold"
            >
              View Students
            </Link>

            <Link
              to="/upload"
              className="border border-red-500 text-red-400 px-5 py-3 rounded-xl"
            >
              Upload CSV
            </Link>
          </div>
        </div>
      </section>

      {/* KPI */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          title="Students"
          value={stats?.totalStudents ?? "--"}
          icon={Users}
          color="blue"
          subtext="Active students"
        />

        <StatCard
          title="Improved"
          value={stats?.improvedStudents ?? "--"}
          icon={TrendingUp}
          color="emerald"
          subtext="Earned belts"
        />

        <StatCard
          title="Not Improved"
          value={stats?.notImprovedStudents ?? "--"}
          icon={AlertCircle}
          color="amber"
          subtext="Need support"
        />

        <StatCard
          title="Belts Earned"
          value={stats?.totalBeltsEarned ?? "--"}
          icon={Award}
          color="rose"
          subtext="Overall"
        />

        <StatCard
          title="Test Slots"
          value={stats?.totalSlotsHappened ?? "--"}
          icon={Calendar}
          color="purple"
          subtext="Weekly"
        />
      </section>

      {/* Languages */}
      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-[#0F172A] rounded-2xl border border-slate-800 p-6">
          <div className="flex justify-between mb-6">
            <h2 className="text-white font-bold text-lg">
              Language Belt Activity
            </h2>
          </div>

          <div className="h-64 flex items-end justify-around">
            {stats?.languages &&
              Object.entries(stats.languages).map(([lang, item]) => (
                <div key={lang} className="text-center">
                  <div
                    className="w-12 rounded-t-lg bg-red-500"
                    style={{
                      height: `${Math.max(
                        (item.slots || 0) * 18,
                        20
                      )}px`,
                    }}
                  />
                  <p className="text-white mt-2 text-sm">{lang}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Improvement */}
        <div className="bg-[#0F172A] rounded-2xl border border-slate-800 p-6">
          <h2 className="text-white font-bold mb-5">
            Improvement Overview
          </h2>

          <div className="w-36 h-36 mx-auto rounded-full border-[12px] border-red-500 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-3xl font-black text-white">
                {stats?.improvementRate ?? "--"}%
              </h3>
              <p className="text-slate-400 text-sm">
                Improved
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-300">Improved</span>
              <span className="text-emerald-400 font-bold">
                {stats?.improvedStudents ?? "--"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-300">Not Improved</span>
              <span className="text-red-400 font-bold">
                {stats?.notImprovedStudents ?? "--"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}