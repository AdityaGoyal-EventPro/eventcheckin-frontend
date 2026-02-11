import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, AlertCircle, Shield, Zap, Users, Award, Eye, EyeOff } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  const navigationMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setPendingApproval(false);

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const user = data.user;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('session', JSON.stringify(data.session));
        
        let redirectPath = '/dashboard';
        if (user.role === 'admin') redirectPath = '/admin';
        else if (user.role === 'venue') redirectPath = '/venue-dashboard';
        
        try {
          navigate(redirectPath, { replace: true });
          setTimeout(() => {
            if (window.location.pathname === '/login') window.location.href = redirectPath;
          }, 500);
        } catch (navError) {
          window.location.href = redirectPath;
        }
      } else {
        if (data.status === 'pending') {
          setPendingApproval(true);
          setError(data.message || 'Your account is pending admin approval');
        } else if (data.status === 'rejected') {
          setError(data.message || 'Your account was not approved. Please contact support.');
        } else {
          setError(data.error || 'Invalid email or password');
        }
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to server. Please try again.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess(false);

    if (!resetEmail) {
      setResetError('Please enter your email address');
      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess(true);
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetEmail('');
          setResetSuccess(false);
        }, 3000);
      } else {
        setResetError(data.error || 'Failed to send reset link. Please try again.');
      }
    } catch (err) {
      setResetError('Failed to connect to server. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side — Branding (Desktop only) */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Check-In Pro</span>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Effortless Event<br />Check-In
            </h2>
            <p className="text-indigo-100 text-lg max-w-sm">
              Manage guests, scan QR codes, and track check-ins in real time.
            </p>

            <div className="space-y-3">
              {[
                { icon: Zap, title: 'Instant QR Scan', desc: 'Check in guests in under 1 second' },
                { icon: Shield, title: 'Secure & Reliable', desc: 'Bank-grade encryption for data' },
                { icon: Users, title: 'Trusted by 10K+', desc: 'Events managed successfully' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
                  <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{title}</div>
                    <div className="text-xs text-indigo-200">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 pt-6 border-t border-white/20 text-center">
            <div><div className="text-2xl font-bold">10K+</div><div className="text-xs text-indigo-200">Events</div></div>
            <div className="h-8 w-px bg-white/20" />
            <div><div className="text-2xl font-bold">500K+</div><div className="text-xs text-indigo-200">Guests</div></div>
            <div className="h-8 w-px bg-white/20" />
            <div><div className="text-2xl font-bold">99.9%</div><div className="text-xs text-indigo-200">Uptime</div></div>
          </div>
        </div>
      </div>

      {/* Right Side — Form */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gradient-to-br from-indigo-600 to-purple-700 px-6 pt-12 pb-8 text-white safe-top">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-lg font-bold">Check-In Pro</span>
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-indigo-200 text-sm mt-1">Sign in to manage your events</p>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-start lg:items-center justify-center px-6 py-8 lg:px-12">
          <div className="w-full max-w-md">
            {/* Desktop Welcome (hidden on mobile) */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
              <p className="text-gray-500">Sign in to access your dashboard</p>
            </div>

            {/* Forgot Password View */}
            {showForgotPassword ? (
              <div>
                <button
                  onClick={() => { setShowForgotPassword(false); setResetEmail(''); setResetError(''); setResetSuccess(false); }}
                  className="text-sm text-indigo-600 mb-4 flex items-center gap-1"
                >
                  ← Back to login
                </button>

                <h2 className="text-xl font-bold text-gray-900 mb-1">Reset password</h2>
                <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send a reset link</p>

                {resetSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800">Reset link sent! Check your email.</p>
                  </div>
                )}

                {resetError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{resetError}</p>
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      placeholder="you@company.com"
                      disabled={resetLoading}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {resetLoading ? 'Sending...' : 'Send reset link'}
                  </button>
                </form>
              </div>
            ) : (
              <>
                {/* Alerts */}
                {navigationMessage && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">{navigationMessage}</p>
                  </div>
                )}

                {pendingApproval && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Pending Approval</p>
                      <p className="text-xs text-amber-700 mt-0.5">You'll get an email within 24-48 hours.</p>
                    </div>
                  </div>
                )}

                {error && !pendingApproval && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="you@company.com"
                      disabled={loading}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-gray-700">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-xs font-medium text-indigo-600"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                        placeholder="••••••••"
                        disabled={loading}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 shadow-sm"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-gray-400">New here?</span>
                  </div>
                </div>

                <a
                  href="/signup"
                  className="block w-full py-3 text-center border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
                >
                  Create an account
                </a>
              </>
            )}

            {/* Trust Footer */}
            <div className="mt-8 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center gap-5 text-xs text-gray-400">
                <div className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /><span>Secure</span></div>
                <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /><span>10K+ Users</span></div>
                <div className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /><span>Trusted</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
