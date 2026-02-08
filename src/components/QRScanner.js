import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Camera } from 'lucide-react';
import { guestsAPI } from '../api';
import { Html5Qrcode } from 'html5-qrcode';
import CheckInSuccessDialog from './CheckInSuccessDialog';

function QRScanner({ user }) {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState(null);
  const [error, setError] = useState('');
  const [checkedInGuest, setCheckedInGuest] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    // Load event data
    loadEventData();
    
    return () => {
      // Cleanup scanner on unmount
      if (scanner) {
        scanner.stop().catch(console.error);
      }
    };
  }, []);

  const loadEventData = async () => {
    try {
      const { eventsAPI } = await import('../api');
      const response = await eventsAPI.getById(eventId);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Error loading event:', error);
    }
  };

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      setScanner(html5QrCode);

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        handleScanSuccess,
        handleScanError
      );
      
      setScanning(true);
      setError('');
    } catch (err) {
      console.error('Scanner error:', err);
      setError('Failed to start camera. Please check permissions.');
    }
  };

  const stopScanner = async () => {
    if (scanner) {
      try {
        await scanner.stop();
        setScanning(false);
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
  };

  const handleScanSuccess = async (decodedText) => {
    console.log('QR Code scanned:', decodedText);
    
    try {
      // Parse QR code data
      const qrData = JSON.parse(decodedText);
      const guestId = qrData.guest_id;

      if (!guestId) {
        setError('Invalid QR code');
        return;
      }

      // Stop scanner before check-in
      await stopScanner();

      // Perform check-in
      await guestsAPI.checkIn(guestId);

      // Get guest details
      const response = await guestsAPI.getByEvent(eventId);
      const guest = response.data.guests.find(g => g.id === guestId);

      if (guest) {
        setCheckedInGuest(guest);
        setShowSuccess(true);
      }

    } catch (error) {
      console.error('Check-in error:', error);
      setError('Check-in failed. Please try again.');
      // Restart scanner after error
      setTimeout(() => startScanner(), 2000);
    }
  };

  const handleScanError = (error) => {
    // Ignore scan errors (happens when no QR in frame)
  };

  const handleClose = async () => {
    await stopScanner();
    navigate(-1);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setCheckedInGuest(null);
    // Restart scanner for next guest
    startScanner();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">QR Scanner</h1>
        <button
          onClick={handleClose}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* QR Reader Container */}
          <div 
            id="qr-reader" 
            className="rounded-lg overflow-hidden shadow-2xl mb-4"
          ></div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Control Buttons */}
          <div className="space-y-3">
            {!scanning ? (
              <button
                onClick={startScanner}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Camera className="w-6 h-6" />
                Start Scanning
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition"
              >
                Stop Scanner
              </button>
            )}

            <button
              onClick={handleClose}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition"
            >
              Back to Event
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Instructions:</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Allow camera access when prompted</li>
              <li>• Point camera at guest's QR code</li>
              <li>• Hold steady until scan completes</li>
              <li>• Guest will be checked in automatically</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      {showSuccess && checkedInGuest && event && (
        <CheckInSuccessDialog
          guest={checkedInGuest}
          event={event}
          onClose={handleSuccessClose}
        />
      )}
    </div>
  );
}

export default QRScanner;
