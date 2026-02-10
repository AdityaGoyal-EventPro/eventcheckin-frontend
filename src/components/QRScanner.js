import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Camera, Zap } from 'lucide-react';
import { eventsAPI } from '../api';
import CheckInSuccessDialog from './CheckInSuccessDialog';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// ✅ Instant haptic feedback (like GPay)
function vibrate(pattern = [50]) {
  try { navigator.vibrate?.(pattern); } catch (e) {}
}

// ✅ Short beep sound for feedback
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1200;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {}
}

function QRScanner({ user }) {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [checkedInGuest, setCheckedInGuest] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [event, setEvent] = useState(null);
  const [isGlobalScan, setIsGlobalScan] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scanCount, setScanCount] = useState(0);
  const [processing, setProcessing] = useState(false); // ✅ Show "processing" flash

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const processingRef = useRef(false);
  const lastTokenRef = useRef('');
  const lastScanTimeRef = useRef(0);
  const scanLoopRef = useRef(null);
  const nativeScannerRef = useRef(null);

  // ✅ Check if native BarcodeDetector is available (Chrome Android — same as GPay)
  const hasNativeScanner = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  useEffect(() => {
    initializeScanner();
    return () => stopScanner();
  }, [eventId]);

  const initializeScanner = async () => {
    try {
      setIsLoading(true);
      if (!eventId) {
        setIsGlobalScan(true);
        setEvent({ name: 'Global Scanner', venue_name: user?.venue_name || 'All Events' });
      } else {
        setIsGlobalScan(false);
        await loadEventData();
      }
    } catch (error) {
      console.error('Init error:', error);
      setError('Failed to initialize scanner');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEventData = async () => {
    if (!eventId) return;
    try {
      const response = await eventsAPI.getById(eventId);
      setEvent(response.data.event);
    } catch (error) {
      setEvent({ name: 'Event', venue_name: user?.venue_name || 'Venue' });
    }
  };

  // ✅ CORE: Process a scanned token — instant feedback, then API in background
  const processToken = useCallback(async (rawText) => {
    const now = Date.now();
    const token = rawText.trim().toUpperCase();

    // Skip if same token within 1.5s or still processing
    if (token === lastTokenRef.current && now - lastScanTimeRef.current < 1500) return;
    if (processingRef.current) return;

    // ✅ INSTANT feedback — before any network call
    processingRef.current = true;
    lastTokenRef.current = token;
    lastScanTimeRef.current = now;
    vibrate([50, 30, 50]);
    playBeep();
    setProcessing(true);

    try {
      const response = await fetch(`${API_URL}/api/checkin/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Check-in failed');
      }

      const result = await response.json();
      const guest = result.guest;

      if (result.already_checked_in) {
        vibrate([100, 50, 100]);
        setError(`${guest.name} — already checked in!`);
        setProcessing(false);
        setTimeout(() => {
          setError('');
          processingRef.current = false;
        }, 1500);
        return;
      }

      // ✅ Success!
      vibrate([50]);
      if (isGlobalScan && guest.event_id) {
        try {
          const eventResponse = await eventsAPI.getById(guest.event_id);
          setEvent(eventResponse.data.event);
        } catch (e) {}
      }

      setScanCount(prev => prev + 1);
      setCheckedInGuest(guest);
      setShowSuccess(true);
      setProcessing(false);
      processingRef.current = false;

    } catch (error) {
      vibrate([200]);
      setError(error.message || 'Check-in failed');
      setProcessing(false);
      setTimeout(() => {
        setError('');
        processingRef.current = false;
      }, 2000);
    }
  }, [isGlobalScan]);

  // ✅ METHOD 1: Native BarcodeDetector (Chrome Android — GPay speed)
  const startNativeScanner = async (stream) => {
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
    nativeScannerRef.current = detector;
    const video = videoRef.current;

    const scan = async () => {
      if (!video || video.readyState < 2 || processingRef.current) {
        scanLoopRef.current = requestAnimationFrame(scan);
        return;
      }
      try {
        const barcodes = await detector.detect(video);
        if (barcodes.length > 0) {
          processToken(barcodes[0].rawValue);
        }
      } catch (e) {}
      scanLoopRef.current = requestAnimationFrame(scan);
    };

    scanLoopRef.current = requestAnimationFrame(scan);
  };

  // ✅ METHOD 2: html5-qrcode fallback (for iOS / older browsers)
  const startFallbackScanner = async (stream) => {
    // Dynamic import so it doesn't load unless needed
    const { Html5Qrcode } = await import('html5-qrcode');
    const html5QrCode = new Html5Qrcode("qr-fallback-reader");
    nativeScannerRef.current = html5QrCode;

    await html5QrCode.start(
      { facingMode: "environment" },
      { fps: 30, qrbox: 220, aspectRatio: 1.0, disableFlip: false },
      (decodedText) => processToken(decodedText),
      () => {} // ignore errors
    );
  };

  const startScanner = async () => {
    try {
      setError('');

      if (hasNativeScanner) {
        // ✅ Native path: get camera stream directly
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
            // ✅ Autofocus for faster reads
            focusMode: 'continuous',
            frameRate: { ideal: 30 }
          }
        });
        streamRef.current = stream;

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }

        await startNativeScanner(stream);
      } else {
        // ✅ Fallback for iOS / older browsers
        await startFallbackScanner();
      }

      setScanning(true);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to start camera. Please check permissions.');
    }
  };

  const stopScanner = async () => {
    // Stop native scan loop
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    // Stop html5-qrcode fallback
    if (nativeScannerRef.current?.stop) {
      try { await nativeScannerRef.current.stop(); } catch (e) {}
    }
    nativeScannerRef.current = null;

    setScanning(false);
  };

  const handleClose = async () => {
    await stopScanner();
    navigate(-1);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setCheckedInGuest(null);
    processingRef.current = false;
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
          <div className="mt-2 flex items-center gap-3">
            <div className="bg-green-900 bg-opacity-40 border border-green-500 rounded px-3 py-1 inline-flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-xs font-bold">
                {hasNativeScanner ? '⚡ NATIVE SCAN' : '📷 SCANNING'} • {scanCount} checked in
              </span>
            </div>
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
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md">

            {/* ✅ Camera View */}
            {hasNativeScanner ? (
              // Native: direct video element
              <div
                className="rounded-xl overflow-hidden shadow-2xl mb-4 relative"
                style={{
                  border: processing ? '4px solid #22c55e' : scanning ? '4px solid #eab308' : '4px solid #4b5563',
                  boxShadow: processing ? '0 0 30px rgba(34,197,94,0.5)' : scanning ? '0 0 20px rgba(234,179,8,0.3)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  style={{ width: '100%', display: scanning ? 'block' : 'none' }}
                />
                {/* Scan target overlay */}
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-56 h-56 border-2 border-white/30 rounded-2xl" />
                  </div>
                )}
                {/* Processing flash */}
                {processing && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/60 rounded-full px-4 py-2">
                      <span className="text-white font-bold text-sm">Processing...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Fallback: html5-qrcode container
              <div
                id="qr-fallback-reader"
                className="rounded-xl overflow-hidden shadow-2xl mb-4"
                style={{
                  border: processing ? '4px solid #22c55e' : scanning ? '4px solid #eab308' : '4px solid #4b5563',
                  transition: 'all 0.15s'
                }}
              />
            )}

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
                  <span>Start Scanning</span>
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

            {/* Scanning tips */}
            {scanning && (
              <div className="mt-4 bg-blue-900/30 border border-blue-500 p-3 rounded-lg">
                <p className="text-blue-300 text-xs flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  Hold steady • 15-25cm away • You'll feel a vibration on scan
                </p>
              </div>
            )}
          </div>
        </div>
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
