import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, guestsAPI } from '../api';
import { LogoText } from './Logo';
import GuestListMobile from './GuestListMobile';
import EditGuestModal from './EditGuestModal';
import CheckInSuccessDialog from './CheckInSuccessDialog';
import { ArrowLeft, UserPlus, Upload, Mail, QrCode, Search, UserCheck } from 'lucide-react';

function EventDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [showEditGuest, setShowEditGuest] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [checkedInGuest, setCheckedInGuest] = useState(null);

  useEffect(() => {
    loadEventData();
    loadGuests();
  }, [id]);

  const loadEventData = async () => {
    try {
      const response = await eventsAPI.getById(id);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Error loading event:', error);
    }
  };

  const loadGuests = async () => {
    try {
      const response = await guestsAPI.getByEvent(id);
      setGuests(response.data.guests || []);
    } catch (error) {
      console.error('Error loading guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async (guest) => {
    try {
      await guestsAPI.checkIn(guest.id);
      setCheckedInGuest(guest);
      setShowSuccessDialog(true);
      loadGuests();
    } catch (error) {
      alert('Check-in failed');
    }
  };

  const handleEditGuest = (guest) => {
    setSelectedGuest(guest);
    setShowEditGuest(true);
  };

  const handleDeleteGuest = async (guestId) => {
    if (!window.confirm('Remove this guest?')) return;
    
    try {
      await guestsAPI.delete(guestId);
      loadGuests();
    } catch (error) {
      alert('Failed to delete guest');
    }
  };

  const isHost = user.role === 'host';
  const stats = {
    total: guests.length,
    checkedIn: guests.filter(g => g.checked_in).length,
    vip: guests.filter(g => g.category === 'VIP').length,
    walkIns: guests.filter(g => g.is_walk_in).length
  };

  if (loading || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="btn btn-ghost btn-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <LogoText />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Event Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-indigo-100">
            <span>📅 {event.date}</span>
            <span>🕐 {event.time_start} - {event.time_end}</span>
            <span>📍 {event.venue_name}</span>
            {event.host_name && <span>👤 Organized by {event.host_name}</span>}
          </div>
        </div>

        {/* Action Buttons - Host Only */}
        {isHost && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Guest Management</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setShowAddGuest(true)}
                className="btn btn-primary btn-md"
              >
                <UserPlus className="w-5 h-5" />
                Add Guest
              </button>
              <button
                onClick={() => setShowImportCSV(true)}
                className="btn btn-secondary btn-md"
              >
                <Upload className="w-5 h-5" />
                Import CSV
              </button>
              <button
                onClick={() => alert('Coming soon!')}
                className="btn btn-secondary btn-md"
              >
                <Mail className="w-5 h-5" />
                Send Invitations
              </button>
            </div>
          </div>
        )}

        {/* Check-In Actions - Everyone */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Check-In</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate(`/scan/${id}`)}
              className="btn btn-success btn-md"
            >
              <QrCode className="w-5 h-5" />
              Scan QR
            </button>
            <button
              onClick={() => setShowManualSearch(true)}
              className="btn btn-secondary btn-md"
            >
              <Search className="w-5 h-5" />
              Manual Search
            </button>
            <button
              onClick={() => setShowAddGuest(true)}
              className="btn btn-warning btn-md"
            >
              <UserCheck className="w-5 h-5" />
              Walk-In
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-indigo-600">{stats.total}</div>
            <div className="text-sm text-gray-600 mt-1">Total Guests</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.checkedIn}</div>
            <div className="text-sm text-gray-600 mt-1">Checked In</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.vip}</div>
            <div className="text-sm text-gray-600 mt-1">VIP</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-amber-600">{stats.walkIns}</div>
            <div className="text-sm text-gray-600 mt-1">Walk-Ins</div>
          </div>
        </div>

        {/* Guest List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Guest List</h2>
          </div>
          <GuestListMobile
            guests={guests}
            onCheckIn={handleManualCheckIn}
            onEdit={handleEditGuest}
            onDelete={handleDeleteGuest}
          />
        </div>
      </div>

      {/* Modals */}
      {showEditGuest && selectedGuest && (
        <EditGuestModal
          guest={selectedGuest}
          onClose={() => {
            setShowEditGuest(false);
            setSelectedGuest(null);
          }}
          onSave={() => {
            setShowEditGuest(false);
            setSelectedGuest(null);
            loadGuests();
          }}
        />
      )}

      {showSuccessDialog && checkedInGuest && (
        <CheckInSuccessDialog
          guest={checkedInGuest}
          event={event}
          onClose={() => {
            setShowSuccessDialog(false);
            setCheckedInGuest(null);
          }}
        />
      )}
    </div>
  );
}

export default EventDetails;
