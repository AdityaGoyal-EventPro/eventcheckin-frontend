import React, { useEffect } from 'react';
import { CheckCircle, X, User, Calendar, MapPin, Users, Award } from 'lucide-react';

function CheckInSuccessDialog({ guest, event, onClose }) {
  useEffect(() => {
    // Auto-close after 4 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce-slow">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Check-In Successful!</h2>
          <p className="text-green-100 text-sm">Welcome to the event</p>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Guest Info - Compact */}
          <div className="bg-purple-50 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">{guest.name}</h3>
                <p className="text-sm text-gray-600">{guest.category || 'General'} Guest</p>
              </div>
            </div>
            {guest.plus_ones > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-lg px-3 py-1.5 mt-2">
                <Users className="w-4 h-4" />
                <span>+{guest.plus_ones} Guest{guest.plus_ones > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* WRISTBAND - Compact but Prominent */}
          <div className={`${colors.light} border-3 ${colors.border} rounded-xl p-4 mb-3 text-center`}>
            <Award className={`w-10 h-10 ${colors.text} mx-auto mb-2`} />
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Wristband Color</h3>
            <div className={`${colors.bg} rounded-full px-6 py-3 inline-block shadow-lg`}>
              <span className="text-2xl font-bold text-white uppercase tracking-wider">
                {wristbandColor}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2 font-medium">
              🎫 Provide a <span className={colors.text}>{wristbandColor.toUpperCase()}</span> wristband
            </p>
          </div>

          {/* Event Summary - Compact */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${colors.light} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Calendar className={`w-4 h-4 ${colors.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{event?.name || 'Event'}</div>
                <div className="text-xs text-gray-500 truncate">{event?.date || ''} • {event?.time_start || ''}</div>
              </div>
            </div>

            {event?.venue_name && (
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 ${colors.light} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <MapPin className={`w-4 h-4 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500">Venue</div>
                  <div className="font-medium text-gray-900 truncate">{event.venue_name}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${colors.light} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <CheckCircle className={`w-4 h-4 ${colors.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500">Check-In Time</div>
                <div className="font-medium text-gray-900">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-close indicator - Compact */}
        <div className="px-4 pb-3">
          <div className="text-center text-xs text-gray-400 mb-1">
            Auto-closing in 4 seconds...
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
            <div className={`${colors.bg} h-full animate-progress-4s`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckInSuccessDialog;
