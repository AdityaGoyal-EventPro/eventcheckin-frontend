import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Search, RefreshCw, Check, X, Plus, UserPlus, Edit2, Trash2, Upload, Mail, QrCode } from 'lucide-react';
import { eventsAPI, guestsAPI } from '../api';
import GuestListMobile from './GuestListMobile';
import SendInvitationsModal from './SendInvitationsModal';
import WalkInModal from './WalkInModal';
import EditGuestModal from './EditGuestModal';
import CheckInSuccessDialog from './CheckInSuccessDialog';
import CSVImport from './CSVImport';
import AddGuestModal from './AddGuestModal';  // ✅ ADDED THIS LINE

function EventDetails({ user }) {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [showSendInvitations, setShowSendInvitations] = useState(false);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [showEditGuest, setShowEditGuest] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [checkedInGuest, setCheckedInGuest] = useState(null);
  const [showManualSearch, setShowManualSearch] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [checkingIn, setCheckingIn] = useState(null);

  // Check if user is host (can edit) or venue (view-only)
  const isHost = user?.role === 'host' || user?.role === 'admin';
  const isVenue = user?.role === 'venue';

  useEffect(() => {
    loadEventData();
    
    const interval = setInterval(() => {
      loadEventData(true);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [eventId]);

  const loadEventData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const eventResponse = await eventsAPI.getById(eventId);
      setEvent(eventResponse.data.event);

      const guestsResponse = await guestsAPI.getByEvent(eventId);
      setGuests(guestsResponse.data.guests || []);
    } catch (error) {
      console.error('Error loading event data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEventData();
  };

  const handleManualCheckIn = async (guest) => {
    if (!window.confirm(`Check in ${guest.name}?`)) {
      return;
    }

    setCheckingIn(guest.id);
    
    try {
      await guestsAPI.checkIn(guest.id);
      setCheckedInGuest(guest);
      setShowSuccessDialog(true);
      loadEventData();
    } catch (error) {
      console.error('Error checking in guest:', error);
      alert(`Failed to check in ${guest.name}. Please try again.`);
    } finally {
      setCheckingIn(null);
    }
  };

  const handleEditGuest = (guest) => {
    setSelectedGuest(guest);
    setShowEditGuest(true);
  };

  const handleSaveGuest = async (guestId, updatedData) => {
    try {
      await guestsAPI.update(guestId, updatedData);
      setShowEditGuest(false);
      setSelectedGuest(null);
      loadEventData();
    } catch (error) {
      console.error('Update guest error:', error);
      throw error; // Re-throw so EditGuestModal can show error
    }
  };

  const handleDeleteGuest = async (guestId) => {
    if (!window.confirm('Remove this guest from the list?')) {
      return;
    }

    try {
      await guestsAPI.delete(guestId);
      loadEventData();
    } catch (error) {
      alert('Failed to delete guest');
    }
  };

  // ❌ REMOVED: handleAddGuest function (not needed with component)

  const getFilteredGuests = () => {
    let filtered = guests;

    if (statusFilter === 'checked-in') {
      filtered = filtered.filter(g => g.checked_in);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(g => !g.checked_in);
    }

    if (searchTerm) {
      filtered = filtered.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.email && g.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (g.phone && g.phone.includes(searchTerm))
      );
    }

    return filtered;
  };

  const filteredGuests = getFilteredGuests();
  const totalGuests = guests.length;
  const checkedInCount = guests.filter(g => g.checked_in).length;
  const pendingCount = totalGuests - checkedInCount;
  const walkInCount = guests.filter(g => g.is_walk_in).length;
  const vipCount = guests.filter(g => g.category === 'VIP').length;

  if (loading && !event) {
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => navigate(`/scan/${eventId}`)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <Camera className="w-5 h-5" />
                <span>Scan QR</span>
              </button>
            </div>
          </div>

          {event && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>📅 {event.date}</span>
                <span>🕐 {event.time_start}{event.time_end ? ` - ${event.time_end}` : ''}</span>
                <span>📍 {event.venue_name}</span>
                {event.host_name && <span>👤 {event.host_name}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">{totalGuests}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600">{checkedInCount}</div>
            <div className="text-sm text-gray-600">Checked In</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-orange-600">{pendingCount}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-purple-600">{vipCount}</div>
            <div className="text-sm text-gray-600">VIP</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-amber-600">{walkInCount}</div>
            <div className="text-sm text-gray-600">Walk-Ins</div>
          </div>
        </div>

        {/* Action Buttons - Host gets all 4, Venue gets Walk-In only */}
        {isHost ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => setShowAddGuest(true)}
              className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-indigo-500 rounded-xl p-4 transition"
            >
              <Plus className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">Add Guest</span>
            </button>

            <button
              onClick={() => setShowImportCSV(true)}
              className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-indigo-500 rounded-xl p-4 transition"
            >
              <Upload className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">Import CSV</span>
            </button>

            <button
              onClick={() => setShowSendInvitations(true)}
              className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-indigo-500 rounded-xl p-4 transition"
            >
              <Mail className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">Send Invites</span>
            </button>

            <button
              onClick={() => setShowWalkIn(true)}
              className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-indigo-500 rounded-xl p-4 transition"
            >
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">Walk-In</span>
            </button>
          </div>
        ) : isVenue && (
          <div className="mb-8">
            <button
              onClick={() => setShowWalkIn(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-6 py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
            >
              <UserPlus className="w-6 h-6" />
              <span>Register Walk-In Guest</span>
            </button>
            <p className="text-sm text-gray-600 mt-2">
              For guests not on the pre-registered list
            </p>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Guests ({totalGuests})</option>
              <option value="checked-in">✅ Checked In ({checkedInCount})</option>
              <option value="pending">⏳ Pending ({pendingCount})</option>
            </select>
          </div>
          
          {(searchTerm || statusFilter !== 'all') && (
            <div className="mt-3 text-sm text-gray-600">
              Showing {filteredGuests.length} of {totalGuests} guests
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          )}
        </div>

        {/* Guest List - Using existing GuestListMobile component */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Guest List</h2>
          </div>

          {filteredGuests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {searchTerm || statusFilter !== 'all' ? (
                <>
                  <p className="text-lg mb-2">No guests found</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <p>No guests yet</p>
              )}
            </div>
          ) : (
            <GuestListMobile
              guests={filteredGuests}
              onCheckIn={handleManualCheckIn}
              onEdit={isHost ? handleEditGuest : null}
              onDelete={isHost ? handleDeleteGuest : null}
            />
          )}
        </div>
      </div>

      {/* ✅ REPLACED: Using AddGuestModal component instead of inline form */}
      {showAddGuest && (
        <AddGuestModal
          eventId={eventId}
          onClose={() => setShowAddGuest(false)}
          onGuestAdded={() => {
            setShowAddGuest(false);
            loadEventData();
          }}
        />
      )}

      {/* Import CSV Modal */}
      {showImportCSV && (
        <CSVImport
          eventId={eventId}
          onClose={() => setShowImportCSV(false)}
          onImportComplete={() => {
            setShowImportCSV(false);
            loadEventData();
          }}
        />
      )}

      {/* Existing Modals */}
      {showSendInvitations && (
        <SendInvitationsModal
          eventId={eventId}
          event={event}
          guests={guests}
          onClose={() => setShowSendInvitations(false)}
        />
      )}

      {showWalkIn && (
        <WalkInModal
          eventId={eventId}
          onClose={() => setShowWalkIn(false)}
          onWalkInAdded={(guest) => {
            setShowWalkIn(false);
            setCheckedInGuest(guest);
            setShowSuccessDialog(true);
            loadEventData();
          }}
        />
      )}

      {showEditGuest && selectedGuest && (
        <EditGuestModal
          guest={selectedGuest}
          onSave={handleSaveGuest}
          onClose={() => {
            setShowEditGuest(false);
            setSelectedGuest(null);
          }}
          onGuestUpdated={() => {
            setShowEditGuest(false);
            setSelectedGuest(null);
            loadEventData();
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
