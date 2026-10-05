import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Upload,
  User,
  ArrowLeft,
  Menu,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menu = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/"
  },
  {
    name: "Students",
    icon: Users,
    path: "/students"
  },
  {
    name: "Improvements",
    icon: TrendingUp,
    path: "/improvements"
  },
  {
    name: "Upload",
    icon: Upload,
    path: "/upload"
  },
  {
    name: "Profile",
    icon: User,
    path: "/profile"
  }
];

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 hidden h-screen border-r border-[#D5D9E0] bg-[#e4e6eb] p-4 transition-all duration-300 lg:block ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Collapse Button */}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`mb-6 flex h-10 items-center rounded-xl border border-[#CDD1D8] bg-[#F1F2F5] text-[#334155] transition-all duration-200 hover:bg-[#D8DBE1] hover:text-[#0F172A] ${
            collapsed ? "w-full justify-center" : "w-full justify-start px-3"
          }`}
        >
          {collapsed ? (
            <Menu size={22} />
          ) : (
            <ArrowLeft size={22} />
          )}
        </button>

        {/* Menu Label */}
        {!collapsed && (
          <p className="mb-4 px-1 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Menu
          </p>
        )}

        {/* Navigation */}
        <nav className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex items-center rounded-xl py-3 transition-all duration-200 ${
                    collapsed
                      ? "justify-center px-0"
                      : "gap-3 px-4"
                  } ${
                    isActive
                      ? "bg-[#E63946] text-white shadow-sm"
                      : "text-[#334155] hover:bg-[#D8DBE1]"
                  }`
                }
              >
                <Icon size={20} />

                {!collapsed && (
                  <span className="font-medium">
                    {item.name}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#D5D9E0] bg-white lg:hidden">
        <div className="grid grid-cols-5">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-3 text-[11px] transition-colors ${
                    isActive
                      ? "text-[#E63946]"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`
                }
              >
                <Icon size={20} />

                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}