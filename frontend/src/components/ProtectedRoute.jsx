
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = ['mentor'] }) => {
  const { user, isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC] text-slate-700">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          <p className="text-sm font-medium tracking-wide text-slate-400">
            Verifying authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC] p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <h1 className="text-xl font-bold text-slate-900">
            Access restricted
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            This section is available to mentors only. Your account does not
            have permission to access it.
          </p>

          <button
            type="button"
            onClick={logout}
            className="mt-6 rounded-xl bg-[#E63946] px-5 py-3 text-sm font-semibold text-white hover:bg-[#D92F3D]"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
