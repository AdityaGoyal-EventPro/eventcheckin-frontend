import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'host',
    venue_id: ''
  });
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    loadVenues();
  }, []);

  // Countdown effect
  useEffect(() => {
    if (successMessage && countdown > 0) {
      const timer = setTimeout(() => {
        console.log('Countdown:', countdown);
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (successMessage && countdown === 0) {
      console.log('⏰ Countdown finished, redirecting...');
      window.location.href = '/login';
    }
  }, [successMessage, countdown]);

  const loadVenues = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/venues`);
      const data = await response.json();
      setVenues(data.venues || []);
    } catch (error) {
      console.error('Failed to load venues:', error);
    }
  };

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 0) {
      setPhoneError('');
      return true;
    }
    
    if (cleaned.length < 10) {
      setPhoneError('Please enter 10 digits');
      return false;
    }
    
    if (cleaned.length > 10) {
      setPhoneError('Maximum 10 digits allowed');
      return false;
    }
    
    if (!['6', '7', '8', '9'].includes(cleaned[0])) {
      setPhoneError('Mobile number should start with 6, 7, 8, or 9');
      return false;
    }
    
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    const cleaned = input.replace(/\D/g, '');
    const limited = cleaned.slice(0, 10);
    
    setFormData({ ...formData, phone: limited });
    validatePhone(limited);
  };

  const handleSubmit = (e) => {
    // CRITICAL: Prevent default form submission
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔍 Form submit triggered');
    console.log('📝 Form data:', formData);
    
    // Run async submission
    submitForm();
  };

  const submitForm = async () => {
    console.log('🚀 Starting form submission...');
    
    setError('');
    setSuccessMessage('');

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      console.log('❌ Validation: Empty fields');
      setError('Please fill in all required fields');
      return;
    }

    if (!validatePhone(formData.phone)) {
      console.log('❌ Validation: Invalid phone');
      return;
    }

    if (formData.phone.length !== 10) {
      console.log('❌ Validation: Phone not 10 digits');
      setError('Mobile number must be exactly 10 digits');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      console.log('❌ Validation: Passwords do not match');
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      console.log('❌ Validation: Password too short');
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.role === 'venue' && !formData.venue_id) {
      console.log('❌ Validation: No venue selected');
      setError('Please select a venue');
      return;
    }

    console.log('✅ Validation passed');
    setLoading(true);

    try {
      console.log('📡 Sending request to:', `${process.env.REACT_APP_API_URL}/api/auth/signup`);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          venue_id: formData.role === 'venue' ? formData.venue_id : null
        })
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok && data.success) {
        console.log('✅ Account created successfully!');
        
        // Show success message
        setSuccessMessage(
          data.message || 
          'Account created successfully! Your account is pending admin approval. Check your email for details.'
        );
        
        // Clear form
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: 'host',
          venue_id: ''
        });
        
        setLoading(false);
        
        // Start countdown
        setCountdown(5);
        console.log('⏰ Starting countdown from 5...');
      } else {
        console.log('❌ Signup failed:', data.error);
        setError(data.error || 'Failed to create account');
        setLoading(false);
      }
    } catch (err) {
      console.error('💥 Error:', err);
      setError('Failed to connect to server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join Event Check-In Pro today</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-800 font-medium">Success!</p>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{countdown}</span>
                  </div>
                  <p className="text-xs text-green-600">
                    Redirecting to login page...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* CRITICAL: onSubmit on form, not button */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'host', venue_id: '' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.role === 'host'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={loading || successMessage}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">🎉</div>
                    <div className="font-semibold text-gray-900">Event Host</div>
                    <div className="text-xs text-gray-500 mt-1">Organize events</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'venue' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.role === 'venue'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={loading || successMessage}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">🏢</div>
                    <div className="font-semibold text-gray-900">Venue</div>
                    <div className="text-xs text-gray-500 mt-1">Manage venue</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Name - ADD name ATTRIBUTE */}
            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="John Doe"
                  disabled={loading || successMessage}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* Email - ADD name ATTRIBUTE */}
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="john@example.com"
                  disabled={loading || successMessage}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Phone Number - ADD name ATTRIBUTE */}
            <div>
              <label htmlFor="signup-phone" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number * <span className="text-xs text-gray-500">(10 digits only, no country code)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <div className="absolute left-11 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  +91
                </div>
                <input
                  id="signup-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className={`w-full pl-20 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    phoneError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="9876543210"
                  maxLength="10"
                  disabled={loading || successMessage}
                  autoComplete="tel"
                  required
                />
              </div>
              {phoneError && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {phoneError}
                </p>
              )}
              {formData.phone && !phoneError && formData.phone.length === 10 && (
                <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Valid mobile number
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                📱 Enter 10 digits starting with 6, 7, 8, or 9
              </p>
            </div>

            {/* Venue Selection - ADD name ATTRIBUTE */}
            {formData.role === 'venue' && (
              <div>
                <label htmlFor="signup-venue" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Venue *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    id="signup-venue"
                    name="venue_id"
                    value={formData.venue_id}
                    onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                    disabled={loading || successMessage}
                    required
                  >
                    <option value="">Choose a venue...</option>
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name} - {venue.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Password - ADD name ATTRIBUTE */}
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength="6"
                  disabled={loading || successMessage}
                  autoComplete="new-password"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            {/* Confirm Password - ADD name ATTRIBUTE */}
            <div>
              <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                  disabled={loading || successMessage}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {/* Submit Button - type="submit" is CRITICAL */}
            <button
              type="submit"
              disabled={loading || successMessage || !!phoneError || (formData.phone && formData.phone.length !== 10)}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </span>
              ) : successMessage ? (
                'Account Created ✓'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          {!successMessage && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                  Login here
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Approval Notice */}
        {!successMessage && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800 text-center">
              ℹ️ All {formData.role === 'host' ? 'Event Host' : 'Venue'} accounts require admin approval before you can login.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Signup;
