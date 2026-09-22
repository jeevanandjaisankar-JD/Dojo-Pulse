import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, User, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { mentor, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur border-b border-slate-800">
      <div className="flex items-center justify-between px-6 py-3.5">
        {/* Left: Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">DOJO<span className="text-rose-500">PULSE</span></span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Kalvium
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none">Mentor Analytics & Student Progress Engine</p>
          </div>
        </Link>

        {/* Right Corner: Always Display Mentor Profile */}
        {mentor && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all text-left focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            >
              <img
                src={mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`}
                alt={mentor.name}
                className="w-9 h-9 rounded-full bg-slate-700 object-cover ring-2 ring-rose-500/30"
              />
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white leading-tight">{mentor.name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <span className="text-[11px] text-slate-400 block leading-none">{mentor.role}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-800/60">
                  <p className="text-xs text-slate-400 font-medium">Logged in Mentor</p>
                  <p className="text-sm font-semibold text-white truncate">{mentor.name}</p>
                  <p className="text-xs text-rose-400 truncate">{mentor.email}</p>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>View Mentor Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out Session</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
