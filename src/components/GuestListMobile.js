import React, { useState } from 'react';
import { CheckCircle, Edit, Trash2, QrCode, X } from 'lucide-react';

function GuestListMobile({ guests, onCheckIn, onEdit, onDelete }) {
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showQR, setShowQR] = useState(false);

  if (!guests || guests.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No guests yet</p>
      </div>
    );
  }

  const getQRCodeURL = (guest) => {
    const qrData = JSON.stringify({
      guest_id: guest.id,
      guest_name: guest.name,
      event_id: guest.event_id
    });
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
  };

  const handleViewQR = (guest) => {
    setSelectedGuest(guest);
    setShowQR(true);
  };

  return (
    <div className="divide-y divide-gray-200">
      {guests.map((guest) => {
        const isCheckedIn = guest.checked_in;
        
        return (
          <div
            key={guest.id}
            className={`p-4 ${isCheckedIn ? 'bg-green-50' : 'bg-white'} hover:bg-gray-50 transition`}
          >
            {/* Guest Info */}
            <div className="mb-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{guest.name}</h3>
                  {guest.email && (
                    <p className="text-sm text-gray-600">{guest.email}</p>
                  )}
                  {guest.phone && (
                    <p className="text-sm text-gray-600">{guest.phone}</p>
                  )}
                </div>
                
                {isCheckedIn && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                    ✓ Checked In
                  </span>
                )}
              </div>

              {/* Guest Details */}
              <div className="flex gap-4 text-xs text-gray-600">
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {guest.category || 'General'}
                </span>
                {guest.plus_ones > 0 && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    +{guest.plus_ones}
                  </span>
                )}
                {guest.is_walk_in && (
                  <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded">
                    Walk-In
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!isCheckedIn && (
                <button
                  onClick={() => onCheckIn(guest)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
                >
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Check In
                </button>
              )}
              
              <button
                onClick={() => handleViewQR(guest)}
                className={`${isCheckedIn ? 'flex-1' : ''} px-4 py-2 ${
                  isCheckedIn ? 'bg-gray-100 text-gray-700' : 'bg-blue-50 text-blue-700'
                } text-sm font-medium rounded-lg hover:bg-opacity-80 transition`}
              >
                <QrCode className="w-4 h-4 inline mr-1" />
                QR
              </button>

              <button
                onClick={() => onEdit(guest)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
              >
                <Edit className="w-4 h-4 inline" />
              </button>

              <button
                onClick={() => onDelete(guest.id)}
                className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition"
              >
                <Trash2 className="w-4 h-4 inline" />
              </button>
            </div>
          </div>
        );
      })}

      {/* QR Code Modal */}
      {showQR && selectedGuest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">QR Code</h3>
              <button
                onClick={() => {
                  setShowQR(false);
                  setSelectedGuest(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center">
              <h4 className="font-semibold text-lg mb-2">{selectedGuest.name}</h4>
              <p className="text-sm text-gray-600 mb-4">{selectedGuest.email}</p>
              
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <img
                  src={getQRCodeURL(selectedGuest)}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              </div>

              {selectedGuest.checked_in && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 font-medium">✓ Already Checked In</p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setShowQR(false);
                setSelectedGuest(null);
              }}
              className="btn btn-secondary w-full mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GuestListMobile;
