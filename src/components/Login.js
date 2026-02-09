import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, CheckCircle, AlertCircle, Users, BarChart3, QrCode, Zap, Shield, TrendingUp } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  const navigationMessage = location.state?.message;

  const handleSubmit = async (e) => {
    console.log('🔍 Login form submitted');
    e.preventDefault();
    e.stopPropagation();
    
    console.log('📝 Form data:', { email: formData.email, password: '***' });
    
    setError('');
    setPendingApproval(false);

    if (!formData.email || !formData.password) {
      console.log('❌ Validation failed: empty fields');
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    console.log('⏳ Loading state set to true');

    const apiUrl = process.env.REACT_APP_API_URL;
    console.log('🌐 API URL:', apiUrl);
    console.log('🔗 Full endpoint:', `${apiUrl}/api/auth/login`);

    try {
      console.log('📡 Sending login request...');
      
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (response.ok && data.success) {
        console.log('✅ Login successful!');
        const user = data.user;
        console.log('👤 User:', user);
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('session', JSON.stringify(data.session));
        console.log('💾 Saved to localStorage');
        
        // Redirect based on role
        let redirectPath = '/dashboard';
        if (user.role === 'admin') {
          redirectPath = '/admin';
        } else if (user.role === 'venue') {
          redirectPath = '/venue-dashboard';
        }
        
        console.log('🚀 Navigating to:', redirectPath);
        navigate(redirectPath);
      } else {
        console.log('❌ Login failed');
        // Handle errors
        if (data.status === 'pending') {
          console.log('⏳ Account pending approval');
          setPendingApproval(true);
          setError(data.message || 'Your account is pending admin approval');
        } else if (data.status === 'rejected') {
          console.log('🚫 Account rejected');
          setError(data.message || 'Your account was not approved. Please contact support.');
        } else {
          console.log('🔑 Invalid credentials or other error');
          setError(data.error || 'Invalid email or password');
        }
      }
    } catch (err) {
      console.error('💥 Fetch error:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      setError('Failed to connect to server. Please check console for details.');
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Login Form */}
        <div className="flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            {/* Debug Info */}
            <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs">
              <p className="font-mono">API URL: {process.env.REACT_APP_API_URL || 'NOT SET'}</p>
              <p className="font-mono text-red-600">Open browser console (F12) to see debug logs</p>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-4 shadow-lg">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your Event Check-In Pro account</p>
            </div>

            {/* Navigation Message */}
            {navigationMessage && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">{navigationMessage}</p>
              </div>
            )}

            {/* Pending Approval Message */}
            {pendingApproval && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Account Pending Approval</p>
                    <p className="text-sm text-yellow-800 mt-1">
                      Your account is awaiting admin approval. You'll receive an email notification once approved.
                    </p>
                    <p className="text-xs text-yellow-700 mt-2">
                      ⏱️ This usually takes 24-48 hours
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && !pendingApproval && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        console.log('📧 Email changed:', e.target.value);
                        setFormData({ ...formData, email: e.target.value });
                      }}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="you@example.com"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => {
                        console.log('🔒 Password changed');
                        setFormData({ ...formData, password: e.target.value });
                      }}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="••••••••"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  onClick={() => console.log('🖱️ Button clicked')}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Signup Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-semibold">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                <span>Fast</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>Trusted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Benefits (same as before) */}
        <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-12">
          <div className="max-w-lg text-white">
            <div className="mb-12">
              <h2 className="text-4xl font-bold mb-4">Transform Your Event Management</h2>
              <p className="text-purple-100 text-lg">
                The modern solution for seamless guest list management and check-ins
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-6 h-6" />
                For Event Hosts
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Digital QR Code Invitations</h4>
                    <p className="text-purple-100 text-sm">Send personalized QR codes via email & SMS instantly</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Real-Time Analytics</h4>
                    <p className="text-purple-100 text-sm">Track RSVPs, check-ins, and guest attendance live</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Guest List Management</h4>
                    <p className="text-purple-100 text-sm">Import, manage, and categorize unlimited guests</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Lightning-Fast Check-In</h4>
                    <p className="text-purple-100 text-sm">Scan QR codes for instant guest verification</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                For Venues
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Multi-Event Dashboard</h4>
                    <p className="text-purple-100 text-sm">View all events at your venue in one place</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Enhanced Security</h4>
                    <p className="text-purple-100 text-sm">Controlled access with verified QR codes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Capacity Management</h4>
                    <p className="text-purple-100 text-sm">Monitor attendance and venue capacity in real-time</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Host Collaboration</h4>
                    <p className="text-purple-100 text-sm">Seamless coordination with event organizers</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-purple-100 text-sm mt-1">Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">500K+</div>
                <div className="text-purple-100 text-sm mt-1">Guests</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-purple-100 text-sm mt-1">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
