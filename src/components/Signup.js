import React, { useState, useEffect } from 'react';
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
  const [redirectSeconds, setRedirectSeconds] = useState(0);

  useEffect(() => {
    loadVenues();
  }, []);

  useEffect(() => {
    if (redirectSeconds > 0) {
      const timer = setTimeout(() => {
        setRedirectSeconds(redirectSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (redirectSeconds === 0 && successMessage) {
      window.location.href = '/login';
    }
  }, [redirectSeconds, successMessage]);

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

  const handleSubmit = async () => {
    console.log('🚀🚀🚀 BUTTON CLICKED - FUNCTION CALLED 🚀🚀🚀');
    console.log('Form data:', formData);
    
    setError('');
    setSuccessMessage('');

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      console.log('❌ Validation failed: empty fields');
      setError('Please fill in all required fields');
      return;
    }

    if (!validatePhone(formData.phone)) {
      console.log('❌ Phone validation failed');
      return;
    }

    if (formData.phone.length !== 10) {
      console.log('❌ Phone not 10 digits');
      setError('Mobile number must be exactly 10 digits');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      console.log('❌ Passwords dont match');
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      console.log('❌ Password too short');
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.role === 'venue' && !formData.venue_id) {
      console.log('❌ No venue selected');
      setError('Please select a venue');
      return;
    }

    console.log('✅✅✅ ALL VALIDATION PASSED ✅✅✅');
    setLoading(true);

    try {
      console.log('📡 Sending to:', `${process.env.REACT_APP_API_URL}/api/auth/signup`);
      
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
        console.log('✅✅✅ SUCCESS! ACCOUNT CREATED! ✅✅✅');
        
        setSuccessMessage(
          data.message || 'Account created! Check your email for approval status.'
        );
        
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
        setRedirectSeconds(5);
        console.log('⏰ Starting 5 second countdown...');
      } else {
        console.log('❌ API returned error:', data.error);
        setError(data.error || 'Failed to create account');
        setLoading(false);
      }
    } catch (err) {
      console.error('💥💥💥 FETCH ERROR:', err);
      setError('Connection failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join Event Check-In Pro today</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div className="flex-1">
                <p className="text-sm text-green-800 font-bold">✅ Success!</p>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white font-bold text-lg">{redirectSeconds}</span>
                  </div>
                  <p className="text-sm text-green-600 font-medium">Redirecting...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-5">
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">I am a:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Role button clicked: host');
                    setFormData({ ...formData, role: 'host', venue_id: '' });
                  }}
                  className={`p-4 rounded-xl border-2 ${formData.role === 'host' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                  disabled={loading || successMessage}
                >
                  <div className="text-2xl mb-1">🎉</div>
                  <div className="font-semibold">Host</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log('Role button clicked: venue');
                    setFormData({ ...formData, role: 'venue' });
                  }}
                  className={`p-4 rounded-xl border-2 ${formData.role === 'venue' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  disabled={loading || successMessage}
                >
                  <div className="text-2xl mb-1">🏢</div>
                  <div className="font-semibold">Venue</div>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                placeholder="John Doe"
                disabled={loading || successMessage}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                placeholder="john@example.com"
                disabled={loading || successMessage}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone * (10 digits)
              </label>
              <div className="flex gap-2">
                <div className="px-3 py-3 bg-gray-100 border border-gray-300 rounded-xl font-medium">
                  +91
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 ${phoneError ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="9876543210"
                  maxLength="10"
                  disabled={loading || successMessage}
                />
              </div>
              {phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
              {formData.phone && !phoneError && formData.phone.length === 10 && (
                <p className="mt-1 text-sm text-green-600">✅ Valid</p>
              )}
            </div>

            {/* Venue */}
            {formData.role === 'venue' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Venue *</label>
                <select
                  value={formData.venue_id}
                  onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                  disabled={loading || successMessage}
                >
                  <option value="">Choose...</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
                disabled={loading || successMessage}
              />
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
                disabled={loading || successMessage}
              />
            </div>

            {/* BUTTON WITH INLINE ONCLICK FOR TESTING */}
            <button
              type="button"
              onClick={() => {
                console.log('🔴🔴🔴 BUTTON CLICK EVENT FIRED 🔴🔴🔴');
                handleSubmit();
              }}
              onMouseEnter={() => console.log('🖱️ Mouse over button')}
              onMouseLeave={() => console.log('🖱️ Mouse left button')}
              disabled={loading || successMessage}
              style={{ position: 'relative', zIndex: 9999 }}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 shadow-lg cursor-pointer"
            >
              {loading ? 'Creating...' : successMessage ? '✅ Created' : '🚀 CREATE ACCOUNT 🚀'}
            </button>

            {/* Test button */}
            <button
              type="button"
              onClick={() => console.log('✅ TEST BUTTON WORKS!')}
              className="w-full py-2 bg-gray-200 text-gray-800 rounded-lg text-sm"
            >
              🧪 Click to Test Console (should show message)
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Have account?{' '}
              <a href="/login" className="text-purple-600 font-semibold">Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
