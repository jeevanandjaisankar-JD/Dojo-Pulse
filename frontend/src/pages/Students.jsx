import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getStudents } from "../services/api";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await getStudents();
        if (data.success) setStudents(data.students);
      } catch (err) {
        console.error(err);
      }
    };

    loadStudents();
  }, []);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">
          Students Directory
        </h1>
        <p className="text-slate-400">
          Kalvium Dojo Belt Progress Tracker
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-500" size={18} />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search student..."
          className="w-full bg-[#0F172A] border border-slate-700 rounded-xl py-3 pl-10 text-white outline-none focus:border-red-500"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0F172A]">
        <table className="w-full">
          <thead className="bg-[#07142D]">
            <tr className="text-slate-300 text-left">
              <th className="p-4">Student</th>
              <th className="p-4">Language</th>
              <th className="p-4">Belt</th>
              <th className="p-4">Slots</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((student) => (
              <tr
                key={student.id}
                className="border-t border-slate-800 hover:bg-slate-800/40"
              >
                <td className="p-4 text-white font-medium">
                  {student.name}
                </td>

                <td className="p-4 text-slate-300">
                  {student.language}
                </td>

                <td className="p-4">
                  <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs">
                    Belt {student.beltLevel}
                  </span>
                </td>

                <td className="p-4 text-white">
                  {student.slots}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}