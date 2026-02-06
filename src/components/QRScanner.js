import React, { useState } from 'react';
import { Scan, X } from 'lucide-react';

function QRScanner({ onScan, onClose, availableGuests }) {
  const [scanning, setScanning] = useState(false);

  const handleGuestClick = (guest) => {
    // Simulate QR code scan
    const qrData = {
      guest_id: guest.id,
      event_id: guest.eventId,
      guest_name: guest.name
    };
    onScan(qrData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">QR Scanner</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!scanning ? (
          <div className="text-center py-12">
            <Scan className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Ready to Scan</h3>
            <p className="text-gray-400 mb-6">Position QR code within the frame</p>
            <button
              onClick={() => setScanning(true)}
              className="px-8 py-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
            >
              Activate Scanner
            </button>
          </div>
        ) : (
          <div>
            {/* Camera Simulation */}
            <div className="bg-gray-800 rounded-lg p-8 mb-6 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-purple-500 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-80 flex items-center justify-center">
                <div className="text-center text-white z-10">
                  <Scan className="w-16 h-16 mx-auto mb-4 text-purple-400 animate-pulse" />
                  <p className="text-lg">Point camera at QR code</p>
                </div>
              </div>
            </div>

            {/* Demo Guest List */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-white font-semibold mb-3">Demo: Tap a guest to simulate scan</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableGuests.map(guest => (
                  <button
                    key={guest.id}
                    onClick={() => handleGuestClick(guest)}
                    className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition"
                  >
                    <div className="font-medium text-white">{guest.name}</div>
                    <div className="text-sm text-gray-400">
                      {guest.category} • +{guest.plus_ones || 0}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setScanning(false)}
              className="w-full px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition"
            >
              Close Scanner
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QRScanner;
