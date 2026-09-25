import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { language: "JS", belts: 28 },
  { language: "Python", belts: 22 },
  { language: "Java", belts: 18 },
  { language: "C++", belts: 15 },
];

export default function BeltChart() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-80">
      <h3 className="text-white font-bold mb-4">
        Language-wise Belts Earned
      </h3>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="language" stroke="#94A3B8" />
          <YAxis stroke="#94A3B8" />
          <Tooltip />
          <Bar dataKey="belts" fill="#E11D48" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}