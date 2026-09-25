
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Upload,
  User
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menu = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Students", icon: Users, path: "/students" },
  { name: "Improvements", icon: TrendingUp, path: "/improvements" },
  { name: "Upload", icon: Upload, path: "/upload" },
  { name: "Profile", icon: User, path: "/profile" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#07142D] border-r border-red-500/10 p-4">
      <p className="text-slate-500 text-xs mb-4 uppercase tracking-wider">
        Main Navigation
      </p>

      <nav className="space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-[#E63946] text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 p-4 rounded-xl bg-[#0F172A] border border-red-500/20">
        <h3 className="text-white font-semibold text-sm">
          DOJO BELT SYSTEM
        </h3>

        <p className="text-slate-400 text-xs mt-2">
          Track JavaScript, Python, Java & C++ progress.
        </p>
      </div>
    </aside>
  );
}