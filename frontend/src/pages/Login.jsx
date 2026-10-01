import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogIn, Sparkles, KeyRound } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(username, password);

      if (res.success) {
        navigate('/');
      } else {
        setError(
          res.message || 'Authentication failed. Please check credentials.'
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Server connection failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center items-center p-6 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* Brand Header */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Kalvium Dojo Belt Evaluation Suite
          </div>

          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
            DOJO<span className="text-[#E63946]">PULSE</span>
          </h1>

          <p className="text-sm text-[#64748B] mt-1">
            Restricted Portal — Authorized Mentor Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-2xl bg-white border border-[#E6EBF2] shadow-xl">

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
                Mentor Username / Email
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="mentor1"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D8E0EA] text-[#0F172A] placeholder-[#94A3B8] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D8E0EA] text-[#0F172A] placeholder-[#94A3B8] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#E63946] hover:bg-[#D92F3D] text-white font-semibold text-sm shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Authenticating Mentor...' : 'Sign In as Mentor'}
            </button>
          </form>

          {/* Access Scope */}
          <div className="mt-6 pt-5 border-t border-[#E6EBF2]">

            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#E63946]" />
              Restricted Access
            </p>

            <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs leading-relaxed text-[#475569]">
              Only the seven allowlisted mentor accounts can enter.
              Temporary account details live in the backend mentor
              configuration and must be replaced before deployment.
            </p>
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 mt-5 text-xs text-[#94A3B8]">
          <ShieldCheck className="w-4 h-4" />
          Secure mentor access
        </div>

      </div>
    </div>
  );
};

export default Login;