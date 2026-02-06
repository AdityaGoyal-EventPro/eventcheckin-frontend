import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

function QRScanner({ onScan, onClose, availableGuests }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [useSimulation, setUseSimulation] = useState(false);
  const [cameraId, setCameraId] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Get available cameras when component mounts
    if (!useSimulation) {
      getCameras();
    }

    return () => {
      stopScanner();
    };
  }, []);

  useEffect(() => {
    if (scanning && !useSimulation && cameraId) {
      startScanner();
    }
  }, [scanning, useSimulation, cameraId]);

  const getCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      console.log('Available cameras:', devices);
      
      if (devices && devices.length > 0) {
        // Prefer back camera on mobile
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        
        const selectedCamera = backCamera || devices[0];
        setCameraId(selectedCamera.id);
        console.log('Selected camera:', selectedCamera);
      } else {
        setError('No cameras found on this device.');
        setUseSimulation(true);
      }
    } catch (err) {
      console.error('Error getting cameras:', err);
      setError('Could not access cameras. Using simulation mode.');
      setUseSimulation(true);
    }
  };

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        onScanSuccess,
        onScanFailure
      );

      console.log('Scanner started successfully');
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError(`Camera error: ${err.message || 'Could not start camera'}`);
      setUseSimulation(true);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        console.log('Scanner stopped');
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    console.log('QR Code detected!');
    console.log('Raw QR data:', decodedText);
    
    try {
      // Try parsing as JSON first
      let qrData;
      try {
        qrData = JSON.parse(decodedText);
        console.log('Parsed JSON:', qrData);
      } catch {
        // If not JSON, treat as plain text
        console.log('Not JSON, treating as plain text');
        qrData = { raw: decodedText };
      }
      
      // Check if it has guest_id and event_id
      if (qrData.guest_id && qrData.event_id) {
        console.log('Valid guest QR code detected');
        setSuccess(`Scanned: ${qrData.guest_name || 'Guest'}`);
        stopScanner();
        setTimeout(() => {
          onScan(qrData);
        }, 500);
      } else {
        // Show what we got for debugging
        console.warn('QR code missing required fields:', qrData);
        setError(`QR code scanned but missing guest info. Data: ${decodedText.substring(0, 50)}...`);
        
        // Try to match with available guests by name if possible
        if (qrData.guest_name) {
          const matchedGuest = availableGuests.find(g => 
            g.name.toLowerCase() === qrData.guest_name.toLowerCase()
          );
          
          if (matchedGuest) {
            console.log('Matched guest by name:', matchedGuest);
            setSuccess(`Matched: ${matchedGuest.name}`);
            stopScanner();
            setTimeout(() => {
              onScan({
                guest_id: matchedGuest.id,
                event_id: matchedGuest.event_id,
                guest_name: matchedGuest.name
              });
            }, 500);
          }
        }
      }
    } catch (err) {
      console.error('Error processing QR code:', err);
      setError(`Error reading QR code: ${err.message}`);
    }
  };

  const onScanFailure = (errorMessage) => {
    // This fires continuously while scanning, only log critical errors
    if (errorMessage.includes('NotAllowedError')) {
      console.error('Camera permission denied');
      setError('Camera permission denied. Please allow camera access.');
      setUseSimulation(true);
    }
    if (errorMessage.includes('NotFoundError')) {
      console.error('No camera found');
      setError('No camera found on this device.');
      setUseSimulation(true);
    }
    // Don't show "No QR code found" errors as they happen constantly
  };

  const handleSimulatedScan = (guest) => {
    const qrData = {
      guest_id: guest.id,
      event_id: guest.event_id,
      guest_name: guest.name
    };
    console.log('Simulated scan:', qrData);
    onScan(qrData);
  };

  const handleModeSwitch = async (toSimulation) => {
    if (toSimulation) {
      await stopScanner();
      setUseSimulation(true);
      setScanning(false);
    } else {
      setUseSimulation(false);
      setError('');
      setSuccess('');
    }
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

        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-200">{success}</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-200">{error}</p>
              {!useSimulation && (
                <button
                  onClick={() => handleModeSwitch(true)}
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
              handleModeSwitch(false);
              setScanning(true);
            }}
            disabled={!cameraId && !useSimulation}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              !useSimulation && scanning
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            📷 Camera Scan
          </button>
          <button
            onClick={() => handleModeSwitch(true)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              useSimulation
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            👆 Simulation Mode
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
              disabled={!cameraId}
              className="px-8 py-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cameraId ? 'Activate Camera' : 'No Camera Available'}
            </button>
          </div>
        )}

        {/* Camera View */}
        {!useSimulation && scanning && (
          <div>
            <div className="bg-black rounded-lg overflow-hidden mb-4">
              <div id="qr-reader" className="w-full"></div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">
                Hold a QR code steady in front of the camera
              </p>
              <p className="text-xs text-gray-500">
                The scanner is active and looking for QR codes...
              </p>
            </div>
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

        {/* Debug Info */}
        {!useSimulation && scanning && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg text-xs text-gray-400">
            <p className="mb-1">🔍 Debug Info:</p>
            <p>Camera ID: {cameraId || 'Not set'}</p>
            <p>Scanner Active: {scannerRef.current?.isScanning ? 'Yes' : 'No'}</p>
            <p className="mt-2">💡 If QR codes aren't being detected:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Make sure QR code is clear and well-lit</li>
              <li>Hold steady for 2-3 seconds</li>
              <li>Try moving closer or further away</li>
              <li>Ensure QR code fits within the purple box</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default QRScanner;
