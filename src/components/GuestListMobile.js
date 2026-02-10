import React from 'react';
import { Check, X, Edit2, Trash2 } from 'lucide-react';
import InvitationStatusBadge from './InvitationStatusBadge';

function GuestListMobile({ guests, onCheckIn, onEdit, onDelete, showInvitationStatus = false }) {
  return (
    <div className="space-y-3">
      {guests.map(guest => (
        <div 
          key={guest.id} 
          className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition"
        >
          {/* Guest Info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{guest.name}</h3>
              <div className="text-sm text-gray-600 mt-1 space-y-1">
                {guest.email && <p>{guest.email}</p>}
                {guest.phone && <p>{guest.phone}</p>}
              </div>
            </div>
            
            {/* Status Badge */}
            <div>
              {guest.checked_in ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  ✓ Checked In
                </span>
              ) : (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                  Pending
                </span>
              )}
            </div>
          </div>

          {/* Category and Plus Ones */}
          <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
            {guest.category && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                guest.category === 'VIP' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {guest.category}
              </span>
            )}
            {guest.plus_ones > 0 && (
              <span className="text-xs text-gray-500">+{guest.plus_ones} guests</span>
            )}
            {guest.is_walk_in && (
              <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                Walk-in
              </span>
            )}
          </div>

          {/* ✅ ADDED: Invitation Status Badge */}
          {showInvitationStatus && (
            <div className="mb-3 pb-3 border-b border-gray-100">
              <InvitationStatusBadge guest={guest} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Check In Button */}
            {!guest.checked_in && onCheckIn && (
              <button
                onClick={() => onCheckIn(guest)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Check In</span>
              </button>
            )}

            {/* Checked In Display */}
            {guest.checked_in && (
              <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Checked in {guest.checked_in_time && `at ${new Date(guest.checked_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                </span>
              </div>
            )}

            {/* Edit Button (only if onEdit provided) */}
            {onEdit && (
              <button
                onClick={() => onEdit(guest)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}

            {/* Delete Button (only if onDelete provided) */}
            {onDelete && (
              <button
                onClick={() => onDelete(guest.id)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
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
