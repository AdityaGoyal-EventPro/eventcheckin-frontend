import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Camera } from 'lucide-react';
import { guestsAPI, eventsAPI } from '../api';
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
  const [isGlobalScan, setIsGlobalScan] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('QRScanner mounted', { eventId, user: user?.name });
    
    // Initialize scanner mode
    initializeScanner();
    
    return () => {
      // Cleanup scanner on unmount
      if (scanner) {
        console.log('Cleaning up scanner');
        scanner.stop().catch(err => console.error('Cleanup error:', err));
      }
    };
  }, [eventId]);

  const initializeScanner = async () => {
    try {
      setIsLoading(true);
      
      // Check if this is global scan (no eventId) or event-specific scan
      if (!eventId) {
        console.log('Initializing Global QR Scanner mode');
        setIsGlobalScan(true);
        // Set placeholder event for global scan
        setEvent({ 
          name: 'Global Scanner', 
          venue_name: user?.venue_name || 'All Events' 
        });
        setIsLoading(false);
      } else {
        console.log('Initializing Event-specific QR Scanner mode for event:', eventId);
        setIsGlobalScan(false);
        await loadEventData();
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error initializing scanner:', error);
      setError('Failed to initialize scanner');
      setIsLoading(false);
    }
  };

  const loadEventData = async () => {
    if (!eventId) return;
    
    try {
      console.log('Loading event data for ID:', eventId);
      const response = await eventsAPI.getById(eventId);
      console.log('Event loaded:', response.data.event);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Error loading event:', error);
      setError('Failed to load event details. Scanner will still work.');
      // Set a fallback event so scanner can still work
      setEvent({ name: 'Event', venue_name: user.venue_name || 'Venue' });
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
    
    // Pause scanning temporarily to prevent multiple scans
    if (scanner && scanning) {
      await scanner.pause(true);
    }
    
    try {
      // Parse QR code data
      const qrData = JSON.parse(decodedText);
      const guestId = qrData.guest_id;
      const qrEventId = qrData.event_id; // Event ID from QR code

      if (!guestId) {
        setError('Invalid QR code - missing guest ID');
        // Resume scanning after 2 seconds
        setTimeout(() => {
          if (scanner) scanner.resume();
          setError('');
        }, 2000);
        return;
      }

      // For event-specific scan, verify it's the right event
      if (eventId && qrEventId && eventId !== qrEventId) {
        setError('Wrong event! This QR is for a different event.');
        setTimeout(() => {
          if (scanner) scanner.resume();
          setError('');
        }, 2000);
        return;
      }

      // Perform check-in (scanner still paused)
      console.log('Checking in guest:', guestId);
      await guestsAPI.checkIn(guestId);

      // Get guest details - use QR event ID for global scan, eventId for event-specific
      const targetEventId = isGlobalScan ? qrEventId : eventId;
      
      console.log('Fetching guest details from event:', targetEventId);
      const response = await guestsAPI.getByEvent(targetEventId);
      const guest = response.data.guests.find(g => g.id === guestId);

      if (guest) {
        setCheckedInGuest(guest);
        setShowSuccess(true);
        // Scanner will resume when success dialog closes
      } else {
        setError('Guest checked in but details not found');
        setTimeout(() => {
          if (scanner) scanner.resume();
          setError('');
        }, 2000);
      }

    } catch (error) {
      console.error('Check-in error:', error);
      setError(error.response?.data?.error || 'Check-in failed. Please try again.');
      // Resume scanner after error
      setTimeout(() => {
        if (scanner) scanner.resume();
        setError('');
      }, 3000);
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
    // Resume scanner for next guest (don't restart, just resume)
    if (scanner) {
      scanner.resume();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-white text-xl font-bold">
            {isGlobalScan ? '📱 Global QR Scanner' : '🎫 Event QR Scanner'}
          </h1>
          <button
            onClick={handleClose}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
        {event && (
          <div className="text-gray-300 text-sm">
            {isGlobalScan ? (
              <p>Scan any event QR code{event.venue_name && event.venue_name !== 'All Events' ? ` at ${event.venue_name}` : ''}</p>
            ) : (
              <p>{event.name}{event.venue_name ? ` • ${event.venue_name}` : ''}</p>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Initializing scanner...</p>
          </div>
        </div>
      ) : (
        <>
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
      </>
      )}

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
