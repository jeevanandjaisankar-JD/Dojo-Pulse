
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldCheck, GraduationCap } from 'lucide-react';

const StudentHome = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC] p-6">
      <main className="w-full max-w-xl rounded-2xl border border-[#E6EBF2] bg-white p-8 shadow-xl">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <GraduationCap className="h-7 w-7" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Dojo Pulse · Student Portal
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Welcome, {user?.name || 'Student'}!
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          You are signed in to Dojo Pulse. Your student account is separate
          from the mentor dashboard.
        </p>

        <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Email
            </p>
            <p className="mt-1 break-all text-sm font-medium text-slate-900">
              {user?.email}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Squad
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {user?.squad || 'Not assigned'}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <p className="text-sm leading-relaxed text-emerald-800">
            Your account permissions are checked by the server. Mentor-only
            tools are not available through this student portal.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </main>
    </div>
  );
};

export default StudentHome;
