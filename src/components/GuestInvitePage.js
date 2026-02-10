import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Download, Share2, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import QRCode from 'qrcode.react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function GuestInvitePage() {
  const { token } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invitation, setInvitation] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/api/invites/guest/${token}`);
      setInvitation(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading invitation:', err);
      setError(err.response?.data?.error || 'Invalid or expired invitation link');
      setLoading(false);
    }
  };

  const downloadQR = () => {
    try {
      const canvas = document.getElementById('invitation-qr-code');
      if (!canvas) return;

      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${invitation.guest.name.replace(/\s+/g, '-')}-Event-QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error downloading QR:', err);
      alert('Failed to download QR code');
    }
  };

  const addToCalendar = () => {
    const { event } = invitation;
    
    // Create .ics file content
    const eventDate = new Date(event.date);
    const startTime = event.time_start || '00:00';
    const endTime = event.time_end || '23:59';
    
    // Format: YYYYMMDDTHHMMSS
    const formatDateTime = (date, time) => {
      const [hours, minutes] = time.split(':');
      const d = new Date(date);
      d.setHours(parseInt(hours), parseInt(minutes), 0);
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const dtStart = formatDateTime(eventDate, startTime);
    const dtEnd = formatDateTime(eventDate, endTime);
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${event.name}`,
      `LOCATION:${event.venue_name}`,
      `DESCRIPTION:You're invited to ${event.name}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.name.replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shareInvitation = async () => {
    const shareData = {
      title: invitation.event.name,
      text: `You're invited to ${invitation.event.name}!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            Please check your invitation link or contact the event host.
          </p>
        </div>
      </div>
    );
  }

  const { guest, event } = invitation;

  // Format date
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">🎉</h1>
            <h2 className="text-2xl font-bold text-white">You're Invited!</h2>
          </div>

          {/* Event Details */}
          <div className="p-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              {event.name}
            </h3>

            {/* Guest Info */}
            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-900">Guest Details</span>
              </div>
              <p className="text-gray-700">
                <strong>{guest.name}</strong>
                {guest.category && (
                  <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                    {guest.category}
                  </span>
                )}
              </p>
              {guest.plus_ones > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Plus {guest.plus_ones} guest{guest.plus_ones > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Event Info */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Date</p>
                  <p className="text-gray-600">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Time</p>
                  <p className="text-gray-600">
                    {event.time_start} {event.time_end && `- ${event.time_end}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Venue</p>
                  <p className="text-gray-600">{event.venue_name}</p>
                </div>
              </div>
            </div>

            {/* Check-in Status */}
            {guest.checked_in && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">Already Checked In</p>
                  <p className="text-sm text-green-700">
                    Checked in at {guest.checked_in_time}
                  </p>
                </div>
              </div>
            )}

            {/* QR Code Section */}
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Your Entry Pass
              </h4>
              <div className="bg-white p-6 rounded-xl border-2 border-gray-200 inline-block">
                <QRCode
                  id="invitation-qr-code"
                  value={guest.qr_code}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Show this QR code at the entrance for check-in
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={downloadQR}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                <Download className="w-4 h-4" />
                <span>Save QR</span>
              </button>

              <button
                onClick={addToCalendar}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition"
              >
                <Calendar className="w-4 h-4" />
                <span>Add to Calendar</span>
              </button>

              <button
                onClick={shareInvitation}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>

            {/* Download Success Message */}
            {downloadSuccess && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800">QR code saved successfully!</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Powered by Event Check-In Pro
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 text-white text-center">
          <p className="text-sm">
            💡 Tip: Save this page or take a screenshot of your QR code for offline access
          </p>
        </div>
      </div>
    </div>
  );
}

export default GuestInvitePage;
