import React, { useState, useEffect } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QRScanner({ onScan, onClose, availableGuests }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [scanner, setScanner] = useState(null);
  const [useSimulation, setUseSimulation] = useState(false);

  useEffect(() => {
    if (scanning && !useSimulation) {
      initializeScanner();
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error('Error clearing scanner:', err));
      }
    };
  }, [scanning, useSimulation]);

  const initializeScanner = () => {
    try {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true
        },
        false
      );

      html5QrcodeScanner.render(onScanSuccess, onScanError);
      setScanner(html5QrcodeScanner);
    } catch (err) {
      console.error('Scanner initialization error:', err);
      setError('Failed to start camera. Please check permissions or use simulation mode.');
      setUseSimulation(true);
    }
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    console.log('QR Code scanned:', decodedText);
    
    try {
      // Try to parse as JSON (our QR codes are JSON)
      const qrData = JSON.parse(decodedText);
      
      // Verify it has the required fields
      if (qrData.guest_id && qrData.event_id) {
        if (scanner) {
          scanner.clear().catch(err => console.error('Error clearing scanner:', err));
        }
        onScan(qrData);
      } else {
        setError('Invalid QR code format. Please scan a valid guest QR code.');
      }
    } catch (err) {
      // If not JSON, might be a simple string
      console.error('QR parse error:', err);
      setError('QR code format not recognized. Please scan a valid guest QR code.');
    }
  };

  const onScanError = (errorMessage) => {
    // This fires constantly while scanning, so we don't show errors unless critical
    if (errorMessage.includes('NotAllowedError') || errorMessage.includes('NotFoundError')) {
      setError('Camera access denied or not available. Please use simulation mode.');
      setUseSimulation(true);
    }
  };

  const handleSimulatedScan = (guest) => {
    const qrData = {
      guest_id: guest.id,
      event_id: guest.event_id,
      guest_name: guest.name
    };
    onScan(qrData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">QR Scanner</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-200">{error}</p>
              {!useSimulation && (
                <button
                  onClick={() => setUseSimulation(true)}
                  className="mt-2 text-xs text-red-300 underline hover:text-red-100"
                >
                  Switch to simulation mode
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => {
              setUseSimulation(false);
              setScanning(true);
              setError('');
            }}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              !useSimulation && scanning
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Camera Scan
          </button>
          <button
            onClick={() => {
              setUseSimulation(true);
              setScanning(false);
              setError('');
              if (scanner) {
                scanner.clear().catch(err => console.error('Error clearing scanner:', err));
              }
            }}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              useSimulation
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Simulation Mode
          </button>
        </div>

        {/* Camera Scanner */}
        {!useSimulation && !scanning && (
          <div className="text-center py-12">
            <Camera className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Ready to Scan</h3>
            <p className="text-gray-400 mb-6">Click below to activate your camera</p>
            <button
              onClick={() => setScanning(true)}
              className="px-8 py-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
            >
              Activate Camera
            </button>
          </div>
        )}

        {/* Camera View */}
        {!useSimulation && scanning && (
          <div className="bg-black rounded-lg overflow-hidden mb-4">
            <div id="qr-reader" className="w-full"></div>
          </div>
        )}

        {/* Simulation Mode */}
        {useSimulation && (
          <div>
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Simulation Mode - Tap a guest to simulate scan
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableGuests.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No guests available to scan</p>
                ) : (
                  availableGuests.map(guest => (
                    <button
                      key={guest.id}
                      onClick={() => handleSimulatedScan(guest)}
                      className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition"
                    >
                      <div className="font-medium text-white">{guest.name}</div>
                      <div className="text-sm text-gray-400">
                        {guest.category} • +{guest.plus_ones || 0}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-400">
            {useSimulation 
              ? '💡 Tap any guest name above to simulate scanning their QR code'
              : '💡 Hold the QR code steady in front of your camera. The scanner will detect it automatically.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

export default QRScanner;
