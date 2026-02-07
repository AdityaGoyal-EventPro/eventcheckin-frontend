import React, { useEffect } from 'react';
import { CheckCircle, X, User, Calendar, MapPin, Users, Award } from 'lucide-react';

function CheckInSuccessDialog({ guest, event, onClose }) {
  useEffect(() => {
    // Auto-close after 5 seconds (longer to see wristband)
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Get wristband color from event or guest
  const wristbandColor = guest.wristband_color || event?.wristband_color || 'blue';
  
  // Map color names to Tailwind classes
  const colorMap = {
    'red': { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-600', light: 'bg-red-50' },
    'blue': { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
    'green': { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-600', light: 'bg-green-50' },
    'yellow': { bg: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-50' },
    'purple': { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-600', light: 'bg-purple-50' },
    'pink': { bg: 'bg-pink-500', border: 'border-pink-500', text: 'text-pink-600', light: 'bg-pink-50' },
    'orange': { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-600', light: 'bg-orange-50' },
    'teal': { bg: 'bg-teal-500', border: 'border-teal-500', text: 'text-teal-600', light: 'bg-teal-50' },
    'lime': { bg: 'bg-lime-500', border: 'border-lime-500', text: 'text-lime-600', light: 'bg-lime-50' },
    'indigo': { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50' },
    'cyan': { bg: 'bg-cyan-500', border: 'border-cyan-500', text: 'text-cyan-600', light: 'bg-cyan-50' },
    'rose': { bg: 'bg-rose-500', border: 'border-rose-500', text: 'text-rose-600', light: 'bg-rose-50' },
    'emerald': { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' },
    'violet': { bg: 'bg-violet-500', border: 'border-violet-500', text: 'text-violet-600', light: 'bg-violet-50' },
    'fuchsia': { bg: 'bg-fuchsia-500', border: 'border-fuchsia-500', text: 'text-fuchsia-600', light: 'bg-fuchsia-50' },
  };
  
  const colors = colorMap[wristbandColor.toLowerCase()] || colorMap.blue;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
        {/* Success Icon */}
        <div className="bg-gradient-to-br from-green-400 to-emerald-500 px-6 py-8 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Check-In Successful!</h2>
          <p className="text-green-50">Welcome to the event</p>
        </div>

        {/* Guest Details */}
        <div className="px-6 py-6">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 mb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{guest.name}</h3>
                <p className="text-sm text-gray-600">{guest.category || 'General'} Guest</p>
              </div>
            </div>

            {guest.plus_ones > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-lg px-3 py-2">
                <Users className="w-4 h-4" />
                <span>+{guest.plus_ones} Guest{guest.plus_ones > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* WRISTBAND COLOR - BIG DISPLAY */}
          <div className={`${colors.light} border-4 ${colors.border} rounded-2xl p-8 mb-4 text-center animate-pulse-slow`}>
            <div className="mb-4">
              <Award className={`w-16 h-16 ${colors.text} mx-auto animate-bounce-slow`} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Wristband Color</h3>
            <div className={`${colors.bg} rounded-full px-8 py-5 inline-block shadow-2xl transform hover:scale-105 transition`}>
              <span className="text-4xl font-bold text-white uppercase tracking-wider">
                {wristbandColor}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-4 font-semibold">
              🎫 Please provide a <span className={colors.text}>{wristbandColor.toUpperCase()}</span> wristband
            </p>
          </div>

          {/* Event Summary */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{event?.name || 'Event'}</div>
                <div className="text-xs text-gray-500">{event?.date || ''} • {event?.time_start || ''}</div>
              </div>
            </div>

            {event?.venue_name && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Venue</div>
                  <div className="text-xs text-gray-500">{event.venue_name}</div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Check-In Time</div>
                <div className="text-xs text-gray-500">{guest.checked_in_time || new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
          >
            Done
          </button>
        </div>

        {/* Auto-close indicator */}
        <div className="px-6 pb-4">
          <div className="text-center text-xs text-gray-400">
            Auto-closing in 5 seconds...
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-2 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-full animate-progress-5s"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckInSuccessDialog;
