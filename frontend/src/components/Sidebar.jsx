import React from "react";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Upload,
  User,
  Target,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menu = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Students", icon: Users, path: "/students" },
  { name: "Improvements", icon: TrendingUp, path: "/improvements" },
  { name: "Upload", icon: Upload, path: "/upload" },
  { name: "Goals", icon: Target, path: "/goals" },
  { name: "Profile", icon: User, path: "/profile" },
];

export default function Sidebar({ expanded, setExpanded, width, setWidth }) {
  const [isResizing, setIsResizing] = React.useState(false);

  const handleResizeStart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsResizing(true);
    setExpanded(true);
  };

  const handleResize = (event) => {
    if (!isResizing) return;
    setWidth(Math.min(320, Math.max(76, event.clientX)));
  };

  const handleResizeEnd = () => setIsResizing(false);

  return (
    <>
      <aside
        onMouseEnter={(event) => {
          const currentWidth = expanded ? width : 76;
          // Keep the resize edge reachable while collapsed; hovering the
          // interior expands the menu, while hovering the edge shows resize.
          if (Math.abs(event.clientX - currentWidth) > 8) setExpanded(true);
        }}
        onMouseLeave={() => {
          if (!isResizing) setExpanded(false);
        }}
        style={{ width: expanded ? width : 76 }}
        className="fixed left-0 top-0 z-40 hidden h-screen border-r border-[#D5D9E0] bg-[#e4e6eb] px-3 pb-4 pt-20 transition-[width] duration-200 lg:block"
      >
        <p className={`mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-[#64748B] transition-opacity ${expanded ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          Menu
        </p>

        <nav className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/dashboard"}
                onClick={() => setExpanded(false)}
                title={!expanded ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-xl py-3 transition-all duration-200 ${
                    expanded ? "gap-3 px-4" : "justify-center px-0"
                  } ${
                    isActive
                      ? "bg-[#E63946] text-white shadow-sm"
                      : "text-[#334155] hover:bg-[#D8DBE1]"
                  }`
                }
              >
                <Icon size={20} />
                {expanded && <span className="font-medium">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          title="Drag to resize sidebar"
          onPointerDown={handleResizeStart}
          onPointerMove={handleResize}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
          className="absolute -right-1 top-0 z-50 h-full w-2 touch-none cursor-ew-resize bg-transparent transition-colors hover:bg-[#2563EB]/30"
        />
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#D5D9E0] bg-white lg:hidden">
        <div className="grid grid-cols-6">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/dashboard"}
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
