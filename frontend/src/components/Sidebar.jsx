import { useState } from "react";

import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Upload,
  User,
  Menu,
  MoreHorizontal
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

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden min-h-screen shrink-0 border-r border-[#E6EBF2] bg-[#07142D] p-4 transition-all duration-300 lg:block ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
         {/* Collapse button */}
         <button
         type="button"
         onClick={() => setCollapsed((value) => !value)}
         aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
         className="mb-4 flex w-full items-center justify-center rounded-xl border border-slate-700 bg-[#0F172A] py-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
         >
          {collapsed ? (
            <MoreHorizontal size={22} />
          ) : (
          <Menu size={22} />
          )}
          </button>
          
        {!collapsed && (
          <p className="mb-4 text-xs uppercase tracking-wider text-slate-500">
            Menu
          </p>
        )}

        <nav className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex items-center rounded-xl py-3 transition-all ${
                    collapsed
                      ? "justify-center px-0"
                      : "gap-3 px-4"
                  } ${
                    isActive
                      ? "bg-[#E63946] text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={20} />

                {!collapsed && (
                  <span>{item.name}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
       </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E6EBF2] bg-white lg:hidden">
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
                      : "text-slate-500 hover:text-slate-900"
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