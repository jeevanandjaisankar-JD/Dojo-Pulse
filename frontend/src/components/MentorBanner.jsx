import { BookOpen, CalendarDays, ShieldCheck } from "lucide-react";

export default function MentorBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#07142D] via-[#0F172A] to-[#1E293B] border border-red-500/20 p-8">
      <div className="absolute -right-20 -top-20 w-72 h-72 bg-red-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">
              KALVIUM DOJO
            </span>

            <div className="flex items-center gap-1 text-emerald-400 text-xs">
              <ShieldCheck size={14} />
              Active Session
            </div>
          </div>

          <h1 className="text-4xl font-black text-white">
            Welcome back, Mentor 👋
          </h1>

          <p className="text-slate-300 mt-3 max-w-xl">
            Monitor student belt progression across JavaScript, Python,
            Java and C++ with real-time dojo analytics.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 min-w-[260px]">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <BookOpen className="text-red-400 mb-2" size={20} />
            <p className="text-slate-400 text-xs">Track</p>
            <h3 className="text-white font-bold">Growth & Dev</h3>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <CalendarDays className="text-red-400 mb-2" size={20} />
            <p className="text-slate-400 text-xs">Program</p>
            <h3 className="text-white font-bold">2026 Dojo</h3>
          </div>
        </div>
      </div>
    </section>
  );
}