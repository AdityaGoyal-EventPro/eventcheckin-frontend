import React, { useEffect } from 'react';
import { CheckCircle, X, User, Calendar, MapPin, Users, Award } from 'lucide-react';

function CheckInSuccessDialog({ guest, event, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const wristbandColor = guest.wristband_color || event?.wristband_color || 'blue';
  
  const colorMap = {
    'red': { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50', border: 'border-red-400' },
    'blue': { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-400' },
    'green': { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-400' },
    'yellow': { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-50', border: 'border-yellow-400' },
    'purple': { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-400' },
    'pink': { bg: 'bg-pink-500', text: 'text-pink-600', light: 'bg-pink-50', border: 'border-pink-400' },
    'orange': { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50', border: 'border-orange-400' },
    'teal': { bg: 'bg-teal-500', text: 'text-teal-600', light: 'bg-teal-50', border: 'border-teal-400' },
    'lime': { bg: 'bg-lime-500', text: 'text-lime-600', light: 'bg-lime-50', border: 'border-lime-400' },
    'indigo': { bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-400' },
    'cyan': { bg: 'bg-cyan-500', text: 'text-cyan-600', light: 'bg-cyan-50', border: 'border-cyan-400' },
    'rose': { bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50', border: 'border-rose-400' },
    'emerald': { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-400' },
    'violet': { bg: 'bg-violet-500', text: 'text-violet-600', light: 'bg-violet-50', border: 'border-violet-400' },
    'fuchsia': { bg: 'bg-fuchsia-500', text: 'text-fuchsia-600', light: 'bg-fuchsia-50', border: 'border-fuchsia-400' },
  };
  
  const colors = colorMap[wristbandColor.toLowerCase()] || colorMap.blue;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 animate-fadeIn safe-bottom">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl overflow-hidden animate-slideUpSheet sm:animate-scaleIn">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-5 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-white">Check-In Successful!</h2>
        </div>

        <div className="p-4">
          {/* Guest Info */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-3">
            <div className="w-11 h-11 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate">{guest.name}</h3>
              <p className="text-xs text-gray-500">{guest.category || 'General'} Guest</p>
            </div>
            {guest.plus_ones > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600 bg-white rounded-lg px-2 py-1">
                <Users className="w-3.5 h-3.5" />
                +{guest.plus_ones}
              </div>
            )}
          </div>

          {/* WRISTBAND — Most prominent element */}
          <div className={`${colors.light} border-2 ${colors.border} rounded-xl p-4 mb-3 text-center`}>
            <Award className={`w-8 h-8 ${colors.text} mx-auto mb-1.5`} />
            <p className="text-xs text-gray-600 font-medium mb-2">Wristband Color</p>
            <div className={`${colors.bg} rounded-full px-6 py-2.5 inline-block shadow-md`}>
              <span className="text-xl font-bold text-white uppercase tracking-wider">
                {wristbandColor}
              </span>
            </div>
          </div>

          {/* Event Info (compact) */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{event?.name || 'Event'}</span>
            </div>
            {event?.venue_name && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{event.venue_name}</span>
                </div>
              </>
            )}
          </div>

          {/* Check-in time */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span>Checked in at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Auto-close progress */}
        <div className="px-4 pb-4">
          <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
            <div className={`${colors.bg} h-full animate-progress-4s`} />
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-1.5">Auto-closing...</p>
        </div>
      </div>
    </div>
  );
}

export default CheckInSuccessDialog;
