import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Download, Share2, QrCode as QrCodeIcon, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode';

function GuestInvitePage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invitationData, setInvitationData] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const response = await fetch(`${API_URL}/api/invites/guest/${token}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load invitation');
        }
        
        setInvitationData(await response.json());
      } catch (error) {
        if (error.name === 'AbortError') {
          setError('Connection timed out. Please check your internet and try again.');
        } else {
          setError(error.message || 'Invalid or expired invitation link');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (token) loadInvitation();
  }, [token]);

  const handleShowQR = async () => {
    if (qrCodeUrl) { setShowQR(true); return; }
    try {
      setLoadingQR(true);
      const qrData = invitationData.guest.check_in_token;
      const url = await QRCode.toDataURL(qrData, {
        width: 280, margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      setQrCodeUrl(url);
      setShowQR(true);
    } catch (error) {
      alert('Failed to generate QR code.');
    } finally {
      setLoadingQR(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.download = `${invitationData.guest.name}-qr.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const handleShare = async () => {
    const { guest, event } = invitationData;
    const shareData = {
      title: `Invitation - ${event.name}`,
      text: `Hi ${guest.name}! You're invited to ${event.name}. Open this link for your QR code entry pass.`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleAddToCalendar = () => {
    const { event } = invitationData;
    const eventDate = new Date(event.date);
    const endDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${fmt(eventDate)}\nDTEND:${fmt(endDate)}\nSUMMARY:${event.name}\nLOCATION:${event.venue || ''}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.name}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!invitationData) return null;

  const { guest, event } = invitationData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white safe-top safe-bottom">
      <div className="max-w-lg mx-auto px-4 py-6">
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Gradient Header */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-8 text-white text-center">
            <p className="text-indigo-200 text-sm mb-2">You're Invited!</p>
            <h1 className="text-2xl font-bold mb-1">{event.name}</h1>
            {event.host_name && (
              <p className="text-indigo-200 text-sm">Hosted by {event.host_name}</p>
            )}
          </div>

          <div className="p-5">
            {/* Guest Badge */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5 text-center -mt-6 mx-2 relative z-10 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Invitation for</p>
              <p className="text-lg font-bold text-gray-900">{guest.name}</p>
              <div className="flex items-center justify-center gap-3 mt-2">
                {guest.category && guest.category !== 'General' && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    guest.category === 'VIP' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {guest.category}
                  </span>
                )}
                {guest.plus_ones > 0 && (
                  <span className="text-sm text-indigo-600 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> +{guest.plus_ones}
                  </span>
                )}
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-3 mb-6">
              {event.date && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {new Date(event.date).toLocaleDateString('en-IN', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {event.time && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="font-semibold text-gray-900 text-sm">{event.time}</p>
                  </div>
                </div>
              )}

              {event.venue && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Venue</p>
                    <p className="font-semibold text-gray-900 text-sm">{event.venue}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Already Checked In */}
            {guest.checked_in && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-semibold text-sm">You're checked in!</p>
                  <p className="text-green-600 text-xs">Welcome to the event</p>
                </div>
              </div>
            )}

            {/* QR Code Section */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3 text-center">Your Entry Pass</h3>

              {!showQR ? (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-4">Show this QR at the venue for quick entry</p>
                  <button
                    onClick={handleShowQR}
                    disabled={loadingQR}
                    className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <QrCodeIcon className="w-5 h-5" />
                    <span>{loadingQR ? 'Generating...' : 'Show QR Code'}</span>
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-block bg-white p-3 rounded-2xl shadow-md border border-gray-100 mb-3">
                    <img src={qrCodeUrl} alt="QR Code" className="w-56 h-56 sm:w-64 sm:h-64" />
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Present this at the venue entrance</p>
                  <button
                    onClick={handleDownloadQR}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                  >
                    <Download className="w-4 h-4" />
                    Save QR Code
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={handleAddToCalendar}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-medium text-sm hover:bg-indigo-100 active:scale-[0.97] transition"
              >
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-xl font-medium text-sm hover:bg-purple-100 active:scale-[0.97] transition"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 mt-6 pb-4">
          Powered by Check-In Pro
        </div>
      </div>
    </div>
  );
}

export default GuestInvitePage;
