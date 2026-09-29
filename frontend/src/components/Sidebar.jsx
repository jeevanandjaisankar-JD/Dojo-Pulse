import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, TrendingUp, Upload, User } from 'lucide-react';

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/improvements', label: 'Improvements', icon: TrendingUp },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  return (
    <>
      {/* Tablet + desktop: icon rail */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-20 shrink-0 flex-col items-center border-r border-[#E6EBF2] bg-white py-5 md:flex">
        <nav className="flex flex-col gap-2" aria-label="Main">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              aria-label={label}
              className={({ isActive }) =>
                `group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-200 ${
                  isActive ? 'bg-[#FDECEE] text-[#E63946]' : 'text-[#64748B] hover:bg-[#F4F7FB] hover:text-[#0F172A]'
                }`
              }
            >
              <Icon size={22} />
              <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-[#0F172A] px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                {label}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile: bottom bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-[#E6EBF2] bg-white/95 px-2 py-2 backdrop-blur md:hidden"
      >
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-semibold transition-colors ${
                isActive ? 'bg-[#FDECEE] text-[#E63946]' : 'text-[#64748B]'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
