import React from 'react';
import { Check, Edit2, Trash2, User, Lock } from 'lucide-react';
import InvitationStatusBadge from './InvitationStatusBadge';

function GuestListMobile({ guests, onCheckIn, onEdit, onDelete, showInvitationStatus = false }) {
  return (
    <div className="divide-y divide-gray-50">
      {guests.map((guest, i) => (
        <div 
          key={guest.id} 
          className="px-4 py-3 hover:bg-gray-50/50 transition animate-fadeIn"
          style={{ animationDelay: `${Math.min(i * 0.02, 0.3)}s` }}
        >
          {/* Top Row: Avatar + Name + Status */}
          <div className="flex items-center gap-3 mb-2.5">
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              guest.checked_in 
                ? 'bg-green-100' 
                : guest.category === 'VIP' 
                  ? 'bg-purple-100' 
                  : 'bg-gray-100'
            }`}>
              {guest.checked_in ? (
                <Check className={`w-5 h-5 text-green-600`} />
              ) : (
                <User className={`w-5 h-5 ${guest.category === 'VIP' ? 'text-purple-600' : 'text-gray-400'}`} />
              )}
            </div>

            {/* Name & Contact */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{guest.name}</h3>
                {guest.category && guest.category !== 'General' && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${
                    guest.category === 'VIP' ? 'bg-purple-100 text-purple-700'
                    : guest.category === 'VVIP' ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                    {guest.category}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1">
                {guest._masked && <Lock className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                {guest.phone && <span>{guest.phone}</span>}
                {guest.phone && guest.email && <span> • </span>}
                {guest.email && <span>{guest.email}</span>}
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex-shrink-0">
              {guest.checked_in ? (
                <span className="px-2 py-1 bg-green-50 text-green-700 text-[11px] font-semibold rounded-full">
                  ✓ In
                </span>
              ) : (
                <span className="px-2 py-1 bg-amber-50 text-amber-700 text-[11px] font-semibold rounded-full">
                  Pending
                </span>
              )}
            </div>
          </div>

          {/* Meta Row: Tags */}
          {(guest.plus_ones > 0 || guest.is_walk_in) && (
            <div className="flex items-center gap-2 mb-2 ml-[52px]">
              {guest.plus_ones > 0 && (
                <span className="text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                  +{guest.plus_ones} guest{guest.plus_ones > 1 ? 's' : ''}
                </span>
              )}
              {guest.is_walk_in && (
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                  Walk-in
                </span>
              )}
            </div>
          )}

          {/* Invitation Status */}
          {showInvitationStatus && guest.invitation_sent && (
            <div className="mb-2 ml-[52px]">
              <InvitationStatusBadge guest={guest} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 ml-[52px]">
            {!guest.checked_in && onCheckIn && (
              <button
                onClick={() => onCheckIn(guest)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-[0.97] transition text-sm font-medium"
              >
                <Check className="w-4 h-4" />
                <span>Check In</span>
              </button>
            )}

            {guest.checked_in && (
              <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
                <Check className="w-4 h-4" />
                <span>
                  {guest.checked_in_time
                    ? `At ${new Date(guest.checked_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                    : 'Checked In'}
                </span>
              </div>
            )}

            {onEdit && (
              <button
                onClick={() => onEdit(guest)}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 active:scale-[0.95] transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(guest.id)}
                className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 active:scale-[0.95] transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default GuestListMobile;
