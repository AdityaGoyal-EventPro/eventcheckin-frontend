import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Camera, Zap } from 'lucide-react';
import { eventsAPI } from '../api';
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
  const [scanCount, setScanCount] = useState(0);
  
  const processingRef = useRef(false);
  const lastScanTimeRef = useRef(0);
  const scannerInstanceRef = useRef(null);

  useEffect(() => {
    console.log('QRScanner mounted', { eventId, user: user?.name });
    initializeScanner();
    
    return () => {
      if (scannerInstanceRef.current) {
        console.log('Cleaning up scanner');
        scannerInstanceRef.current.stop().catch(err => console.error('Cleanup error:', err));
      }
    };
  }, [eventId]);

  const initializeScanner = async () => {
    try {
      setIsLoading(true);
      
      if (!eventId) {
        setIsGlobalScan(true);
        setEvent({ name: 'Global Scanner', venue_name: user?.venue_name || 'All Events' });
        setIsLoading(false);
      } else {
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
      const response = await eventsAPI.getById(eventId);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Error loading event:', error);
      setEvent({ name: 'Event', venue_name: user?.venue_name || 'Venue' });
    }
  };

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerInstanceRef.current = html5QrCode;
      setScanner(html5QrCode);

      // ✅ OPTIMIZED FOR SIMPLE TOKEN QR CODES
      const config = {
        fps: 30,
        qrbox: 250,
        aspectRatio: 1.0,
        disableFlip: false,
      };

      console.log('⚡ Starting token-based scanner...');
      
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        handleScanSuccess,
        handleScanError
      );
      
      setScanning(true);
      setError('');
      console.log('✅ Scanner ready for simple token QR codes');
    } catch (err) {
      console.error('❌ Scanner error:', err);
      setError('Failed to start camera. Please check permissions.');
    }
  };

  const stopScanner = async () => {
    if (scannerInstanceRef.current) {
      try {
        await scannerInstanceRef.current.stop();
        setScanning(false);
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
  };

  const handleScanSuccess = async (decodedText) => {
    const now = Date.now();
    
    // Prevent duplicates within 2 seconds
    if (now - lastScanTimeRef.current < 2000) {
      return;
    }
    
    if (processingRef.current) {
      return;
    }

    console.log('🎯 Token scanned:', decodedText);
    lastScanTimeRef.current = now;
    processingRef.current = true;
    
    // Pause scanner
    if (scannerInstanceRef.current && scanning) {
      scannerInstanceRef.current.pause(true);
    }
    
    try {
      // ✅ SIMPLE TOKEN CHECK-IN
      const token = decodedText.trim().toUpperCase();
      
      console.log('⚡ Checking in with token:', token);
      
      // Call new token-based check-in endpoint
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${API_URL}/api/checkin/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Check-in failed');
      }

      const result = await response.json();
      const guest = result.guest;

      if (result.already_checked_in) {
        setError(`${guest.name} is already checked in!`);
        setTimeout(() => {
          if (scannerInstanceRef.current) scannerInstanceRef.current.resume();
          setError('');
          processingRef.current = false;
        }, 2000);
        return;
      }

      // For global scan, load event data
      if (isGlobalScan && guest.event_id) {
        try {
          const eventResponse = await eventsAPI.getById(guest.event_id);
          setEvent(eventResponse.data.event);
        } catch (error) {
          console.error('⚠️ Failed to load event data');
        }
      }
      
      console.log('✅ Check-in successful:', guest.name);
      setScanCount(prev => prev + 1);
      setCheckedInGuest(guest);
      setShowSuccess(true);
      processingRef.current = false;

    } catch (error) {
      console.error('❌ Check-in error:', error);
      setError(error.message || 'Check-in failed. Please try again.');
      setTimeout(() => {
        if (scannerInstanceRef.current) scannerInstanceRef.current.resume();
        setError('');
        processingRef.current = false;
      }, 2500);
    }
  };

  const handleScanError = (error) => {
    // Silently ignore
  };

  const handleClose = async () => {
    await stopScanner();
    navigate(-1);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setCheckedInGuest(null);
    processingRef.current = false;
    
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.resume();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-indigo-900 p-4 border-b border-indigo-500">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-white text-xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            {isGlobalScan ? 'Global QR Scanner' : 'Event QR Scanner'}
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
        {scanning && (
          <div className="mt-2 bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded px-3 py-1 inline-flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-yellow-300 text-xs font-bold">⚡ FAST TOKEN SCAN • Scans: {scanCount}</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Initializing scanner...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
              {/* QR Reader */}
              <div 
                id="qr-reader" 
                className="rounded-xl overflow-hidden shadow-2xl mb-4"
                style={{ 
                  border: scanning ? '4px solid #eab308' : '4px solid #4b5563',
                  boxShadow: scanning ? '0 0 20px rgba(234, 179, 8, 0.3)' : 'none',
                  transition: 'all 0.3s'
                }}
              ></div>

              {/* Error */}
              {error && (
                <div className="bg-red-500 text-white p-4 rounded-lg mb-4 animate-pulse">
                  <p className="font-semibold">⚠️ {error}</p>
                </div>
              )}

              {/* Controls */}
              <div className="space-y-3">
                {!scanning ? (
                  <button
                    onClick={startScanner}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition shadow-lg"
                  >
                    <Camera className="w-6 h-6" />
                    <span>Start Fast Scanning</span>
                  </button>
                ) : (
                  <button
                    onClick={stopScanner}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition shadow-lg"
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

              {/* Simple Token Info */}
              <div className="mt-6 bg-gradient-to-br from-yellow-900 to-orange-900 bg-opacity-30 border border-yellow-500 rounded-lg p-4">
                <h3 className="text-yellow-300 font-semibold mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  ⚡ Lightning-Fast Token Scanning
                </h3>
                <div className="text-yellow-200 text-sm space-y-1">
                  <p>✓ Simple QR codes (just 8 characters!)</p>
                  <p>✓ Scans instantly on any device</p>
                  <p>✓ Works in any lighting</p>
                  <p>✓ No complex JSON or long data</p>
                </div>
              </div>

              {/* Tips */}
              {scanning && (
                <div className="mt-4 bg-blue-900 bg-opacity-30 border border-blue-500 p-3 rounded-lg">
                  <p className="text-blue-300 text-xs flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    Hold 20cm away • Keep steady • Point at QR
                  </p>
                </div>
              )}
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
