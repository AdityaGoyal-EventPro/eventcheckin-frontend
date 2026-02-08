import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, guestsAPI } from '../api';
import GuestListMobile from './GuestListMobile';
import EditGuestModal from './EditGuestModal';
import CheckInSuccessDialog from './CheckInSuccessDialog';

function EventDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditGuest, setShowEditGuest] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [checkedInGuest, setCheckedInGuest] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadEventData();
    loadGuests();
  }, [id]);

  const loadEventData = async () => {
    try {
      const response = await eventsAPI.getById(id);
      if (response.data && response.data.event) {
        setEvent(response.data.event);
      }
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

  const handleDeleteEvent = async () => {
    setDeleting(true);
    try {
      // Soft delete - marks for deletion
      await eventsAPI.softDelete(id, user.role);
      alert('Event marked for deletion');
      navigate('/');
    } catch (error) {
      alert('Failed to delete event: ' + (error.response?.data?.error || error.message));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isHost = user.role === 'host';
  const stats = {
    total: guests.length,
    checkedIn: guests.filter(g => g.checked_in).length,
    vip: guests.filter(g => g.category === 'VIP').length,
    walkIns: guests.filter(g => g.is_walk_in).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">This event doesn't exist or you don't have access to it.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary w-full">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost btn-sm"
          >
            ← Back
          </button>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn btn-danger btn-sm"
          >
            🗑️ Delete Event
          </button>
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
            {event.host_name && <span>👤 {event.host_name}</span>}
          </div>
        </div>

        {/* Action Buttons - Host Only */}
        {isHost && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Guest Management</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button className="btn btn-primary btn-md">
                ➕ Add Guest
              </button>
              <button className="btn btn-secondary btn-md">
                📤 Import CSV
              </button>
              <button className="btn btn-secondary btn-md">
                ✉️ Send Invitations
              </button>
            </div>
          </div>
        )}

        {/* Check-In Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Check-In</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate(`/scan/${id}`)}
              className="btn btn-success btn-md"
            >
              📷 Scan QR
            </button>
            <button className="btn btn-secondary btn-md">
              🔍 Manual Search
            </button>
            <button className="btn btn-warning btn-md">
              🚶 Walk-In
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-2xl">🗑️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delete Event?</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>{event.name}</strong> will be permanently deleted along with all guest data.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-secondary flex-1"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="btn btn-danger flex-1"
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventDetails;
