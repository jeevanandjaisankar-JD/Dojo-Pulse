import { useEffect, useState } from "react";
import { TrendingUp, AlertCircle } from "lucide-react";
import { getImprovementsAnalytics } from "../services/api";

export default function Improvements() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getImprovementsAnalytics();
        if (data.success) setStudents(data.students);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  const improved = students.filter((s) => s.improved);
  const notImproved = students.filter((s) => !s.improved);

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      <div>
        <h1 className="text-3xl font-black text-white">
          Improvements Analytics
        </h1>

        <p className="text-slate-400">
          Students who earned belts this week
        </p>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-2 gap-5">

        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-emerald-400" />
            <h2 className="text-white font-bold">Improved</h2>
          </div>

          <p className="text-5xl font-black text-white">
            {improved.length}
          </p>

          <p className="text-slate-400 mt-2">
            Students earned one or more belts
          </p>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-400" />
            <h2 className="text-white font-bold">
              Needs Attention
            </h2>
          </div>

          <p className="text-5xl font-black text-white">
            {notImproved.length}
          </p>

          <p className="text-slate-400 mt-2">
            No belt progression detected
          </p>
        </div>

      </div>

      {/* Student List */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
        <h2 className="text-white font-bold mb-5">
          Students Requiring Support
        </h2>

        <div className="space-y-3">
          {notImproved.map((student) => (
            <div
              key={student.id}
              className="flex justify-between items-center bg-slate-800 rounded-xl p-4"
            >
              <div>
                <h3 className="text-white font-semibold">
                  {student.name}
                </h3>

                <p className="text-slate-400 text-sm">
                  {student.language}
                </p>
              </div>

              <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-semibold">
                No Improvement
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}