import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  UploadCloud,
  Award,
  CheckCircle2
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      description: 'Overall Dojo performance'
    },
    {
      label: 'Students',
      path: '/students',
      icon: Users,
      description: 'Belt progress & same-day tests'
    },
    {
      label: 'Improvements',
      path: '/improvements',
      icon: TrendingUp,
      description: 'Improved vs not improved & slots'
    },
    {
      label: 'Data Upload',
      path: '/upload',
      icon: UploadCloud,
      description: 'Upload CSV & history logs'
    }
  ];

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Main Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="block leading-tight">{item.label}</span>
                    <span className="block text-[10px] text-slate-500 leading-tight">
                      {item.description}
                    </span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Program Tracker Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-800/30 border border-slate-700/60">
          <div className="flex items-center gap-2 text-rose-400 mb-2">
            <Award className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Dojo Belt System</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Tracking belts across 4 languages: Python, Node.js, Java & C++.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Restricted to 7 mentor accounts</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
        Kalvium Dojo-Pulse v1.0.0
      </div>
    </aside>
  );
};

export default Sidebar;
