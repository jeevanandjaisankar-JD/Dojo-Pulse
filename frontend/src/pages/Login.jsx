
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import kalviumLogo from '../assets/kalvium-logo.svg';

const Login = () => {
  const { loginGoogle, user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const destinationFor = (account) =>
    account?.role === 'mentor' ? '/' : '/student';

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      navigate(destinationFor(user), { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('Google did not return a sign-in token. Please try again.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await loginGoogle(credentialResponse.credential);

      if (result.success) {
        navigate(destinationFor(result.user), { replace: true });
      } else {
        setError(result.message || 'Google sign-in failed.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Google sign-in failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F7F9FC] p-6">
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
           
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
            <img
              src={kalviumLogo}
              alt="Kalvium"
              className="mr-2 inline-block h-10 w-auto object-contain"
            />
            Sign in
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
            For Kalvium mentors and students
          </p>
        </div>

        <div className="rounded-2xl border border-[#E6EBF2] bg-white p-8 shadow-xl">
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          <div className="flex justify-center">
            {googleClientId ? (
              <div className="flex w-full flex-col items-center gap-3">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    setError('Google sign-in was cancelled or failed.')
                  }
                  theme="outline"
                  shape="rectangular"
                  size="large"
                  text="continue_with"
                  width="320"
                />

                {loading && (
                  <p className="text-sm text-slate-500" role="status">
                    Verifying your Kalvium account...
                  </p>
                )}
              </div>
            ) : (
              <p className="w-full rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Google sign-in is not configured. Please contact the Dojo Pulse
                administrator.
              </p>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Forgot your Google password?{' '}
            <a
              href="https://accounts.google.com/signin/recovery"
              className="font-semibold text-blue-600 hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              Recover your account
            </a>
          </p>

          <div className="mt-6 border-t border-[#E6EBF2] pt-5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#E63946]" />
              Secure access
            </p>
            <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
              Sign in with your verified Kalvium Google account. The server
              determines your role and access permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
