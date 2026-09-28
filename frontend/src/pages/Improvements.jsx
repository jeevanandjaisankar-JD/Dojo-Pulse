import { useEffect, useState } from "react";
import { TrendingUp, AlertCircle } from "lucide-react";
import {
  getImprovementsAnalytics,
  getStudents,
} from "../services/api";

export default function Improvements() {
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsData, studentsData] = await Promise.all([
          getImprovementsAnalytics(),
          getStudents({ status: "ALL" }),
        ]);

        if (analyticsData.success) {
          setAnalytics(analyticsData.data);
        }

        if (studentsData.success) {
          setStudents(studentsData.students);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <p className="text-slate-400">Loading improvement analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto">
        <p className="text-red-400">
          Unable to load improvement analytics.
        </p>
      </div>
    );
  }

  const notImproved = students.filter(
    (student) => student.improvementStatus === "NO_IMPROVEMENT"
  );

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

        {/* Improved */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-emerald-400" />

            <h2 className="text-white font-bold">
              Improved
            </h2>
          </div>

          <p className="text-5xl font-black text-white">
            {analytics.improvedCount}
          </p>

          <p className="text-slate-400 mt-2">
            Students earned one or more belts
          </p>
        </div>

        {/* Needs Attention */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-400" />

            <h2 className="text-white font-bold">
              Needs Attention
            </h2>
          </div>

          <p className="text-5xl font-black text-white">
            {analytics.notImprovedCount}
          </p>

          <p className="text-slate-400 mt-2">
            No belt progression detected
          </p>
        </div>

      </div>

      {/* Improvement Rate */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-2">
          Improvement Rate
        </h2>

        <p className="text-4xl font-black text-white">
          {analytics.improvementRate}%
        </p>

        <p className="text-slate-400 mt-2">
          Percentage of students who advanced a belt level
        </p>
      </div>

      {/* Student List */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">

        <h2 className="text-white font-bold mb-5">
          Students Requiring Support
        </h2>

        <div className="space-y-3">

          {notImproved.length === 0 ? (
            <p className="text-slate-400">
              All students have shown improvement.
            </p>
          ) : (
            notImproved.map((student) => (
              <div
                key={student.studentId}
                className="flex justify-between items-center bg-slate-800 rounded-xl p-4"
              >

                <div>
                  <h3 className="text-white font-semibold">
                    {student.name}
                  </h3>

                  <p className="text-slate-400 text-sm">
                    {student.languagesAttempted?.join(", ") ||
                      "No language data"}
                  </p>
                </div>

                <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-semibold">
                  No Improvement
                </span>

              </div>
            ))
          )}

        </div>
      </div>

    </div>
  );
}