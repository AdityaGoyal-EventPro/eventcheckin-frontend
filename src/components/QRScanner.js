import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Camera, Zap } from 'lucide-react';
import { guestsAPI, eventsAPI } from '../api';
import { Html5Qrcode, Html5QrcodeScanType } from 'html5-qrcode';
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
  
  // ✅ Prevent duplicate scans
  const processingRef = useRef(false);
  const lastScanTimeRef = useRef(0);
  const scannerInstanceRef = useRef(null);

  useEffect(() => {
    console.log('QRScanner mounted', { eventId, user: user?.name });
    
    // Initialize scanner mode
    initializeScanner();
    
    return () => {
      // Cleanup scanner on unmount
      if (scannerInstanceRef.current) {
        console.log('Cleaning up scanner');
        scannerInstanceRef.current.stop().catch(err => console.error('Cleanup error:', err));
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
      setEvent({ name: 'Event', venue_name: user?.venue_name || 'Venue' });
    }
  };

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerInstanceRef.current = html5QrCode;
      setScanner(html5QrCode);

      // ✅ ULTRA-OPTIMIZED CONFIG - Maximum speed settings
      const config = {
        fps: 60,  // ⬆️⬆️ DOUBLED from 30 to 60 FPS! (Maximum possible)
        qrbox: function(viewfinderWidth, viewfinderHeight) {
          // ✅ Responsive qrbox - smaller box = faster detection
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdge * 0.7);  // 70% of screen
          return {
            width: qrboxSize,
            height: qrboxSize
          };
        },
        aspectRatio: 1.0,
        disableFlip: true,  // ✅ Skip horizontal flip (faster)
        
        // ✅ CRITICAL: Only scan QR codes (skip barcodes for speed)
        formatsToSupport: [ Html5QrcodeScanType.SCAN_TYPE_CAMERA ],
        
        // ✅ Advanced settings for speed
        videoConstraints: {
          facingMode: "environment",
          focusMode: "continuous",  // Continuous autofocus
          width: { ideal: 1920 },   // Higher resolution for better detection
          height: { ideal: 1080 }
        },
        
        // ✅ Use experimental features for speed
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true  // Use native API if available
        }
      };

      console.log('⚡ Starting ULTRA-FAST scanner (60 FPS)...');
      
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        handleScanSuccess,
        handleScanError
      );
      
      setScanning(true);
      setError('');
      console.log('✅ Scanner started: 60 FPS, QR-only, Native API enabled');
    } catch (err) {
      console.error('❌ Scanner error:', err);
      
      let errorMessage = 'Failed to start camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is being used by another application.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage += 'Camera constraints not supported.';
      } else {
        errorMessage += err.message || 'Please check camera permissions.';
      }
      
      setError(errorMessage);
    }
  };

  const stopScanner = async () => {
    if (scannerInstanceRef.current) {
      try {
        await scannerInstanceRef.current.stop();
        setScanning(false);
        console.log('Scanner stopped');
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
  };

  const handleScanSuccess = async (decodedText) => {
    const now = Date.now();
    
    // ✅ ULTRA-FAST DEBOUNCE: 1 second only (reduced from 2)
    if (now - lastScanTimeRef.current < 1000) {
      return;
    }
    
    // ✅ Prevent concurrent processing
    if (processingRef.current) {
      return;
    }

    console.log('🎯 QR Code detected at', new Date().toLocaleTimeString());
    lastScanTimeRef.current = now;
    processingRef.current = true;
    
    // ✅ INSTANT PAUSE - Critical for fast feedback
    if (scannerInstanceRef.current && scanning) {
      scannerInstanceRef.current.pause(true);
    }
    
    try {
      // Parse QR code data
      const qrData = JSON.parse(decodedText);
      const guestId = qrData.guest_id;
      const qrEventId = qrData.event_id;

      if (!guestId) {
        setError('Invalid QR code - missing guest ID');
        setTimeout(() => {
          if (scannerInstanceRef.current) scannerInstanceRef.current.resume();
          setError('');
          processingRef.current = false;
        }, 1500);  // ✅ Faster error recovery (1.5s instead of 2s)
        return;
      }

      // For event-specific scan, verify it's the right event
      if (eventId && qrEventId && eventId !== qrEventId) {
        setError('Wrong event! This QR is for a different event.');
        setTimeout(() => {
          if (scannerInstanceRef.current) scannerInstanceRef.current.resume();
          setError('');
          processingRef.current = false;
        }, 1500);
        return;
      }

      // ✅ PARALLEL PROCESSING: Check-in and fetch data simultaneously
      console.log('⚡ Processing check-in...');
      const targetEventId = isGlobalScan ? qrEventId : eventId;
      
      const [checkInResult, guestsResponse] = await Promise.all([
        guestsAPI.checkIn(guestId),
        guestsAPI.getByEvent(targetEventId)
      ]);

      const guest = guestsResponse.data.guests.find(g => g.id === guestId);

      if (guest) {
        // For global scan, load event data if needed
        if (isGlobalScan && qrEventId) {
          try {
            const eventResponse = await eventsAPI.getById(qrEventId);
            setEvent(eventResponse.data.event);
          } catch (error) {
            console.error('⚠️ Failed to load event data:', error);
          }
        }
        
        console.log('✅ Check-in complete:', guest.name);
        setCheckedInGuest(guest);
        setShowSuccess(true);
        processingRef.current = false;
      } else {
        setError('Guest checked in but details not found');
        setTimeout(() => {
          if (scannerInstanceRef.current) scannerInstanceRef.current.resume();
          setError('');
          processingRef.current = false;
        }, 1500);
      }

    } catch (error) {
      console.error('❌ Check-in error:', error);
      setError(error.response?.data?.error || 'Check-in failed. Please try again.');
      setTimeout(() => {
        if (scannerInstanceRef.current) scannerInstanceRef.current.resume();
        setError('');
        processingRef.current = false;
      }, 2000);
    }
  };

  const handleScanError = (error) => {
    // Completely ignore scan errors (no QR in frame is normal)
  };

  const handleClose = async () => {
    await stopScanner();
    navigate(-1);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setCheckedInGuest(null);
    processingRef.current = false;
    
    // ✅ INSTANT RESUME - No delay
    if (scannerInstanceRef.current) {
      console.log('⚡ Resuming scanner...');
      scannerInstanceRef.current.resume();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 border-b border-green-500">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-white text-xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-green-400" />
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
        {/* ✅ ULTRA-SPEED indicator */}
        {scanning && (
          <div className="mt-2 bg-green-900 bg-opacity-30 border border-green-500 rounded px-3 py-1 inline-flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs font-bold">⚡ ULTRA-FAST MODE • 60 FPS • QR ONLY</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Initializing ultra-fast scanner...</p>
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
                className="rounded-xl overflow-hidden shadow-2xl mb-4 relative"
                style={{ 
                  border: scanning ? '4px solid #10b981' : '4px solid #4b5563',
                  transition: 'border-color 0.3s',
                  boxShadow: scanning ? '0 0 30px rgba(16, 185, 129, 0.5)' : 'none'
                }}
              >
                {scanning && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
                    60 FPS
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500 text-white p-4 rounded-lg mb-4 animate-pulse">
                  <p className="font-semibold">⚠️ {error}</p>
                </div>
              )}

              {/* Control Buttons */}
              <div className="space-y-3">
                {!scanning ? (
                  <button
                    onClick={startScanner}
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition shadow-lg transform hover:scale-105"
                  >
                    <Zap className="w-6 h-6" />
                    <span>Start Ultra-Fast Scanning</span>
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

              {/* Performance Stats */}
              <div className="mt-6 bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-400" />
                  Ultra-Fast Scanner Features:
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-700 bg-opacity-50 p-2 rounded">
                    <div className="text-green-400 font-bold">60 FPS</div>
                    <div className="text-gray-400">Frame Rate</div>
                  </div>
                  <div className="bg-gray-700 bg-opacity-50 p-2 rounded">
                    <div className="text-green-400 font-bold">QR Only</div>
                    <div className="text-gray-400">No Barcodes</div>
                  </div>
                  <div className="bg-gray-700 bg-opacity-50 p-2 rounded">
                    <div className="text-green-400 font-bold">Native API</div>
                    <div className="text-gray-400">If Supported</div>
                  </div>
                  <div className="bg-gray-700 bg-opacity-50 p-2 rounded">
                    <div className="text-green-400 font-bold">1080p</div>
                    <div className="text-gray-400">Resolution</div>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              {scanning && (
                <div className="mt-4 bg-blue-900 bg-opacity-30 border border-blue-500 p-3 rounded-lg">
                  <p className="text-blue-300 text-xs font-medium flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    Hold steady • Good lighting • Fill the box = Instant scan!
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
