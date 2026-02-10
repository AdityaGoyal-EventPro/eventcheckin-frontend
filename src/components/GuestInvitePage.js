import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Download, Share2, QrCode as QrCodeIcon } from 'lucide-react';
import QRCode from 'qrcode';

function GuestInvitePage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invitationData, setInvitationData] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [showQR, setShowQR] = useState(false);  // ✅ NEW: Don't load QR immediately

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('Loading invitation for token:', token);
        
        // ✅ Add timeout for mobile networks
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const response = await fetch(`${API_URL}/api/invites/guest/${token}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load invitation');
        }
        
        const data = await response.json();
        setInvitationData(data);
        
        // ✅ DON'T generate QR code immediately - wait for user to request it
        
      } catch (error) {
        console.error('Failed to load invitation:', error);
        
        if (error.name === 'AbortError') {
          setError('Request timed out. Please check your internet connection and try again.');
        } else {
          setError(error.message || 'Invalid or expired invitation link');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      loadInvitation();
    }
  }, [token]);

  // ✅ NEW: Generate QR code ONLY when user clicks "Show QR"
  const handleShowQR = async () => {
    if (qrCodeUrl) {
      // Already generated, just show it
      setShowQR(true);
      return;
    }

    try {
      setLoadingQR(true);
      
      // ✅ Generate QR code from the simple check-in token
      const qrData = invitationData.guest.check_in_token;
      const url = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(url);
      setShowQR(true);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setLoadingQR(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `${invitationData.guest.name}-qr-code.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const handleShare = async () => {
    const shareData = {
      title: `Invitation - ${invitationData.event.name}`,
      text: `You're invited to ${invitationData.event.name}!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleAddToCalendar = () => {
    const { event } = invitationData;
    const eventDate = new Date(event.date);
    const endDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours

    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDate(eventDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.name}
DESCRIPTION:${event.description || ''}
LOCATION:${event.venue || ''}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.name}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!invitationData) {
    return null;
  }

  const { guest, event } = invitationData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">You're Invited! 🎉</h1>
            <p className="text-lg opacity-90">{event.name}</p>
          </div>

          <div className="p-8">
            {/* Guest Info */}
            <div className="mb-8 text-center">
              <p className="text-gray-600 mb-2">Invitation for:</p>
              <p className="text-2xl font-bold text-gray-900">{guest.name}</p>
              {guest.plus_ones > 0 && (
                <p className="text-sm text-indigo-600 mt-2 flex items-center justify-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>+{guest.plus_ones} guest{guest.plus_ones !== 1 ? 's' : ''}</span>
                </p>
              )}
              {guest.category && (
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                  guest.category === 'VIP' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {guest.category}
                </span>
              )}
            </div>

            {/* Event Details */}
            <div className="space-y-4 mb-8">
              {event.date && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Date</p>
                    <p className="text-gray-600">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {event.time && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Time</p>
                    <p className="text-gray-600">{event.time}</p>
                  </div>
                </div>
              )}

              {event.venue && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Venue</p>
                    <p className="text-gray-600">{event.venue}</p>
                  </div>
                </div>
              )}

              {event.description && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <p className="text-gray-700">{event.description}</p>
                </div>
              )}
            </div>

            {/* ✅ NEW: QR Code Section (Lazy Loaded) */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                Your Entry QR Code
              </h3>

              {!showQR ? (
                // ✅ Show button instead of QR code initially
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Show your QR code at the venue entrance for quick check-in
                  </p>
                  <button
                    onClick={handleShowQR}
                    disabled={loadingQR}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2 mx-auto disabled:opacity-50"
                  >
                    <QrCodeIcon className="w-5 h-5" />
                    <span>{loadingQR ? 'Generating...' : 'Show QR Code'}</span>
                  </button>
                </div>
              ) : (
                // Show QR code once generated
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Present this QR code at the venue entrance
                  </p>
                  <button
                    onClick={handleDownloadQR}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download QR Code</span>
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={handleAddToCalendar}
                className="px-4 py-3 bg-indigo-100 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-200 transition flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Add to Calendar</span>
              </button>

              <button
                onClick={handleShare}
                className="px-4 py-3 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>

            {/* Status */}
            {guest.checked_in && (
              <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 font-semibold">✓ You're checked in!</p>
                <p className="text-green-600 text-sm">Welcome to the event!</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Powered by Event Check-In Pro</p>
        </div>
      </div>
    </div>
  );
}

export default GuestInvitePage;
