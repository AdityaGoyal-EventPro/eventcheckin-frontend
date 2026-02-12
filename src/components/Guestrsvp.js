import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'https://eventcheckin-backend-production.up.railway.app';

// ─── Helper: Convert 24hr to 12hr AM/PM ───
function formatTime12(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

// ─── Helper: Format date nicely ───
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// ─── Helper: Get day and month parts ───
function getDateParts(dateStr) {
  if (!dateStr) return { day: '', month: '', weekday: '' };
  const d = new Date(dateStr);
  return {
    day: d.getDate(),
    month: d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
    weekday: d.toLocaleDateString('en-IN', { weekday: 'long' })
  };
}

function GuestRSVP() {
  const { token } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [guestName, setGuestName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    loadEvent();
  }, [token]);

  const loadEvent = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rsvp/${token}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Invalid registration link');
        return;
      }
      setEvent(data.event);
    } catch (err) {
      setError('Unable to load event. Please check the link and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: cleaned });
    if (cleaned.length === 0) setPhoneError('');
    else if (cleaned.length < 10) setPhoneError('Enter 10 digits');
    else if (!['6', '7', '8', '9'].includes(cleaned[0])) setPhoneError('Must start with 6, 7, 8, or 9');
    else setPhoneError('');
  };

  const handleSubmit = async () => {
    setSubmitError('');
    if (!formData.name.trim()) { setSubmitError('Please enter your name'); return; }
    if (!formData.phone || formData.phone.length !== 10) { setSubmitError('Please enter a valid 10-digit mobile number'); return; }
    if (phoneError) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/rsvp/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) { setSubmitError(data.error || 'Registration failed'); setSubmitting(false); return; }
      setGuestName(formData.name.trim());
      setSubmitted(true);
    } catch (err) {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ─── Error ───
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Link Not Valid</h1>
          <p className="text-gray-500 text-sm leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  const dateParts = getDateParts(event?.date);

  // ─── Success ───
  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500"></div>
        <div className="max-w-lg mx-auto px-5 py-16 text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">You're in, {guestName}!</h1>
          <p className="text-gray-500 mb-10">You've been registered for this event.</p>

          <div className="bg-gray-50 rounded-2xl p-6 text-left">
            <h2 className="font-semibold text-gray-900 text-lg mb-4">{event.name}</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{formatDate(event.date)}</span>
              </div>
              {event.time_start && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{formatTime12(event.time_start)}{event.time_end ? ` — ${formatTime12(event.time_end)}` : ''}</span>
                </div>
              )}
              {event.venue_name && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{event.venue_name}</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-8">You can close this page now.</p>
        </div>
      </div>
    );
  }

  // ─── Main RSVP Page ───
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"></div>

      <div className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-8 md:py-14">

          {/* Two column layout on desktop */}
          <div className="md:grid md:grid-cols-5 md:gap-12">

            {/* Left: Event Info */}
            <div className="md:col-span-3 mb-10 md:mb-0">

              {/* Date badge */}
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="bg-gray-900 text-white rounded-xl w-14 h-14 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-semibold tracking-wider leading-none">{dateParts.month}</span>
                  <span className="text-xl font-bold leading-none mt-0.5">{dateParts.day}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{dateParts.weekday}</p>
                  {event.time_start && (
                    <p className="text-sm text-gray-500">{formatTime12(event.time_start)}{event.time_end ? ` — ${formatTime12(event.time_end)}` : ''}</p>
                  )}
                </div>
              </div>

              {/* Event name */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
                {event.name}
              </h1>

              {/* Venue */}
              {event.venue_name && (
                <div className="flex items-center gap-2 text-gray-600 mb-8">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{event.venue_name}</span>
                </div>
              )}

              {/* Divider + note (desktop only) */}
              <div className="hidden md:block border-t border-gray-100 pt-8 mt-8">
                <p className="text-sm text-gray-400 leading-relaxed">
                  Register to confirm your attendance. You'll be added to the guest list instantly.
                </p>
              </div>
            </div>

            {/* Right: Registration Form */}
            <div className="md:col-span-2">
              <div className="bg-gray-50 rounded-2xl p-6 md:sticky md:top-8">
                <h3 className="font-semibold text-gray-900 mb-1 text-base">Registration</h3>
                <p className="text-xs text-gray-500 mb-5">Enter your details to join</p>

                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Name */}
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition placeholder:text-gray-400"
                    placeholder="Full name *"
                    disabled={submitting}
                  />

                  {/* Phone */}
                  <div>
                    <div className="flex gap-2">
                      <div className="px-3 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-500 font-medium flex-shrink-0">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className={`flex-1 px-4 py-3 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition placeholder:text-gray-400 ${
                          phoneError ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="Mobile number *"
                        maxLength="10"
                        disabled={submitting}
                      />
                    </div>
                    {phoneError && <p className="mt-1 text-xs text-red-500 ml-1">{phoneError}</p>}
                    {formData.phone && !phoneError && formData.phone.length === 10 && (
                      <p className="mt-1 text-xs text-emerald-600 ml-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Valid number
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition placeholder:text-gray-400"
                    placeholder="Email (optional)"
                    disabled={submitting}
                  />

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !!phoneError || (formData.phone && formData.phone.length !== 10)}
                    className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Registering...
                      </span>
                    ) : (
                      'Register'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-5 py-4">
          <p className="text-xs text-gray-400">Powered by Check-In Pro</p>
        </div>
      </div>
    </div>
  );
}

export default GuestRSVP;
