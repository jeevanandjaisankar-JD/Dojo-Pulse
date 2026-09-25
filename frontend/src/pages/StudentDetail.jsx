import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Trophy, Code2, Calendar } from "lucide-react";
import { getStudentById } from "../services/api";

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getStudentById(id);
        if (data.success) setStudent(data.student);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [id]);

  if (!student) {
    return (
      <div className="flex justify-center items-center h-96 text-slate-400">
        Loading student...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Student Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#07142D] to-[#0F172A] border border-red-500/20 p-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[#E63946] flex items-center justify-center text-4xl font-black text-white">
            {student.name.charAt(0)}
          </div>

          <div>
            <h1 className="text-4xl font-black text-white">
              {student.name}
            </h1>
            <p className="text-slate-300 mt-1">
              Student ID : {student.id}
            </p>
          </div>
        </div>
      </div>

      {/* Belt Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {student.languages.map((lang) => (
          <div
            key={lang.name}
            className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5"
          >
            <Code2 className="text-red-400 mb-3" />

            <h3 className="text-white font-bold">
              {lang.name}
            </h3>

            <p className="text-3xl font-black text-white mt-2">
              Belt {lang.belt}
            </p>

            <p className="text-slate-400 text-sm mt-1">
              {lang.slots} Slots
            </p>
          </div>
        ))}
      </div>

      {/* Progress Timeline */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-5">
          Weekly Progress
        </h2>

        <div className="space-y-4">
          {student.history.map((item) => (
            <div
              key={item.week}
              className="flex justify-between items-center bg-slate-800 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <Calendar className="text-red-400" />

                <div>
                  <h3 className="text-white font-semibold">
                    {item.week}
                  </h3>

                  <p className="text-slate-400 text-sm">
                    {item.language}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Trophy size={18} />
                +{item.belts} Belt
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}