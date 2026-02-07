import React from 'react';
import { CheckCircle, Clock, QrCode, Users, Mail, Phone } from 'lucide-react';

function GuestListMobile({ guests, onViewQR, onCheckIn, onEdit, onDelete }) {
  // Separate checked-in and pending
  const checkedInGuests = guests.filter(g => g.checked_in);
  const pendingGuests = guests.filter(g => !g.checked_in);

  const GuestCard = ({ guest }) => {
    const isCheckedIn = guest.checked_in;
    
    return (
      <div className={`bg-white rounded-xl p-4 shadow-sm border-2 ${
        isCheckedIn ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
      } mb-3`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-gray-900 truncate">{guest.name}</h3>
              {isCheckedIn && (
                <div className="flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">{guest.category || 'General'}</p>
          </div>
          <div className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
            isCheckedIn 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {isCheckedIn ? 'Checked In' : 'Pending'}
          </div>
        </div>

        {/* Contact Info - Compact */}
        <div className="space-y-1 mb-3 text-xs text-gray-600">
          {guest.email && (
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{guest.email}</span>
            </div>
          )}
          {guest.phone && (
            <div className="flex items-center gap-2 truncate">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{guest.phone}</span>
            </div>
          )}
          {guest.plus_ones > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              <span>+{guest.plus_ones} guest{guest.plus_ones > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!isCheckedIn && (
            <button
              onClick={() => onCheckIn(guest.id)}
              className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Check In
            </button>
          )}
          <button
            onClick={() => onViewQR(guest)}
            className={`${isCheckedIn ? 'flex-1' : ''} px-4 py-2 ${
              isCheckedIn ? 'bg-gray-100 text-gray-700' : 'bg-blue-50 text-blue-700'
            } text-sm font-medium rounded-lg hover:bg-opacity-80 transition flex items-center justify-center gap-2`}
          >
            <QrCode className="w-4 h-4" />
            QR Code
          </button>
        </div>

        {/* Edit/Delete Actions */}
        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
          <button
            onClick={() => onEdit && onEdit(guest)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete ${guest.name}?`)) {
                onDelete && onDelete(guest.id);
              }
            }}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>

        {/* Check-in time if checked in */}
        {isCheckedIn && guest.checked_in_at && (
          <div className="mt-2 pt-2 border-t border-green-200 flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {new Date(guest.checked_in_at).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 text-white">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{guests.length}</div>
            <div className="text-xs text-purple-200">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-300">{checkedInGuests.length}</div>
            <div className="text-xs text-purple-200">Checked In</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{pendingGuests.length}</div>
            <div className="text-xs text-purple-200">Pending</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      {pendingGuests.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              Pending ({pendingGuests.length})
            </h3>
          </div>
          {pendingGuests.map(guest => (
            <GuestCard key={guest.id} guest={guest} />
          ))}
        </>
      )}

      {checkedInGuests.length > 0 && (
        <>
          <div className="flex items-center justify-between mt-6">
            <h3 className="text-lg font-bold text-gray-900">
              Checked In ({checkedInGuests.length})
            </h3>
          </div>
          {checkedInGuests.map(guest => (
            <GuestCard key={guest.id} guest={guest} />
          ))}
        </>
      )}

      {guests.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No guests yet</p>
          <p className="text-sm">Import a CSV or add guests manually</p>
        </div>
      )}
    </div>
  );
}

export default GuestListMobile;
