import React from "react";

const colors = {
  blue: {
    icon: "bg-[#2563EB]/10 text-[#60A5FA]",
    badge: "bg-[#2563EB]/10 text-[#93C5FD]",
  },
  emerald: {
    icon: "bg-[#10B981]/10 text-[#34D399]",
    badge: "bg-[#10B981]/10 text-[#6EE7B7]",
  },
  amber: {
    icon: "bg-[#F59E0B]/10 text-[#FBBF24]",
    badge: "bg-[#F59E0B]/10 text-[#FCD34D]",
  },
  rose: {
    icon: "bg-[#E63946]/10 text-[#F87171]",
    badge: "bg-[#E63946]/10 text-[#FCA5A5]",
  },
  purple: {
    icon: "bg-[#7C3AED]/10 text-[#A78BFA]",
    badge: "bg-[#7C3AED]/10 text-[#C4B5FD]",
  },
};

const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  color = "blue",
  trend,
}) => {
  const theme = colors[color];

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 hover:border-[#E63946]/40 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            {title}
          </p>

          <h2 className="text-3xl font-black text-white mt-3">
            {value}
          </h2>
        </div>

        <div className={`p-3 rounded-xl ${theme.icon}`}>
          <Icon size={22} />
        </div>
      </div>

      <div className="space-y-2">
        {trend && (
          <span
            className={`text-xs px-2 py-1 rounded-full font-semibold ${theme.badge}`}
          >
            {trend}
          </span>
        )}

        <p className="text-xs text-slate-400">{subtext}</p>
      </div>
    </div>
  );
};

export default StatCard;