import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Search, RefreshCw, X, Plus, UserPlus, Upload, Mail } from 'lucide-react';
import { eventsAPI, guestsAPI } from '../api';
import GuestListMobile from './GuestListMobile';
import SendInvitationsModal from './SendInvitationsModal';
import WalkInModal from './WalkInModal';
import EditGuestModal from './EditGuestModal';
import CheckInSuccessDialog from './CheckInSuccessDialog';
import CSVImport from './CSVImport';
import AddGuestModal from './AddGuestModal';
import InvitationStatusBadge from './InvitationStatusBadge';
import PhoneContactPicker from './PhoneContactPicker';

function EventDetails({ user }) {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [showSendInvitations, setShowSendInvitations] = useState(false);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [showEditGuest, setShowEditGuest] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [checkedInGuest, setCheckedInGuest] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [checkingIn, setCheckingIn] = useState(null);

  const isHost = user?.role === 'host' || user?.role === 'admin';
  const isVenue = user?.role === 'venue';

  useEffect(() => {
    loadEventData();
    const interval = setInterval(() => loadEventData(true), 10000);
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

  const handleRefresh = () => { setRefreshing(true); loadEventData(); };

  const handleManualCheckIn = async (guest) => {
    if (!window.confirm(`Check in ${guest.name}?`)) return;
    setCheckingIn(guest.id);
    try {
      await guestsAPI.checkIn(guest.id);
      setCheckedInGuest(guest);
      setShowSuccessDialog(true);
      loadEventData();
    } catch (error) {
      alert(`Failed to check in ${guest.name}.`);
    } finally {
      setCheckingIn(null);
    }
  };

  const handleEditGuest = (guest) => { setSelectedGuest(guest); setShowEditGuest(true); };

  const handleSaveGuest = async (guestId, updatedData) => {
    try {
      await guestsAPI.update(guestId, updatedData);
      setShowEditGuest(false);
      setSelectedGuest(null);
      loadEventData();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteGuest = async (guestId) => {
    if (!window.confirm('Remove this guest?')) return;
    try { await guestsAPI.delete(guestId); loadEventData(); } catch { alert('Failed to delete guest'); }
  };

  const getFilteredGuests = () => {
    let filtered = guests;
    if (statusFilter === 'checked-in') filtered = filtered.filter(g => g.checked_in);
    else if (statusFilter === 'pending') filtered = filtered.filter(g => !g.checked_in);
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
  const invitedCount = guests.filter(g => g.invitation_sent).length;
  const openedCount = guests.filter(g => g.invitation_opened).length;

  const progress = Math.min((checkedInCount / (totalGuests || 1)) * 100, 100);

  if (loading && !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 safe-top">
        <div className="max-w-5xl mx-auto px-4 py-3">
          {/* Top Row: Back + Actions */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 -ml-1 py-1"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Back</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button onClick={handleRefresh} disabled={refreshing} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <RefreshCw className={`w-4.5 h-4.5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => navigate(`/scan/${eventId}`)}
                className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 active:scale-[0.97] transition text-sm font-semibold"
              >
                <Camera className="w-4 h-4" />
                <span>Scan</span>
              </button>
            </div>
          </div>

          {/* Event Info */}
          {event && (
            <div>
              <h1 className="text-lg font-bold text-gray-900 line-clamp-1">{event.name}</h1>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-1">
                <span>{event.date}</span>
                <span>{event.time_start}{event.time_end ? ` - ${event.time_end}` : ''}</span>
                {event.venue_name && <span>{event.venue_name}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Stats — Horizontal scroll on mobile */}
        <div className="-mx-4 px-4 mb-5">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { label: 'Total', value: totalGuests, color: 'text-gray-900', bg: 'bg-white' },
              { label: 'Checked In', value: checkedInCount, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Pending', value: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'VIP', value: vipCount, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Walk-In', value: walkInCount, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Invited', value: invitedCount, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Opened', value: openedCount, color: 'text-blue-600', bg: 'bg-blue-50' },
            ].map(({ label, value, color, bg }) => (
              <div
                key={label}
                className={`${bg} rounded-xl px-4 py-3 border border-gray-100 flex-shrink-0 min-w-[90px] text-center`}
              >
                <div className={`text-xl font-bold ${color} animate-countUp`}>{value}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Overall Progress */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm font-semibold text-indigo-600 flex-shrink-0">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        {isHost ? (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4 scrollbar-none">
            {[
              { label: 'Add Guest', icon: Plus, onClick: () => setShowAddGuest(true) },
              { label: 'Import CSV', icon: Upload, onClick: () => setShowImportCSV(true) },
              { label: 'Send Invites', icon: Mail, onClick: () => setShowSendInvitations(true) },
              { label: 'Walk-In', icon: UserPlus, onClick: () => setShowWalkIn(true) },
            ].map(({ label, icon: Icon, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 active:scale-[0.97] transition flex-shrink-0 text-sm font-medium text-gray-700"
              >
                <Icon className="w-4 h-4 text-indigo-600" />
                <span>{label}</span>
              </button>
            ))}
            {/* Phone Contact Picker */}
            <div className="flex-shrink-0">
              <PhoneContactPicker eventId={eventId} onSuccess={loadEventData} />
            </div>
          </div>
        ) : isVenue && (
          <div className="mb-5">
            <button
              onClick={() => setShowWalkIn(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-5 py-3 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition"
            >
              <UserPlus className="w-5 h-5" />
              <span>Register Walk-In</span>
            </button>
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search guests..."
                className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-gray-50"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All ({totalGuests})</option>
              <option value="checked-in">Checked In ({checkedInCount})</option>
              <option value="pending">Pending ({pendingCount})</option>
            </select>
          </div>
          
          {(searchTerm || statusFilter !== 'all') && (
            <div className="mt-2 text-xs text-gray-500">
              {filteredGuests.length} of {totalGuests} guests
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          )}
        </div>

        {/* Guest List */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Guest List
            </h2>
            <span className="text-xs text-gray-400">{filteredGuests.length} guests</span>
          </div>

          {filteredGuests.length === 0 ? (
            <div className="p-10 text-center">
              {searchTerm || statusFilter !== 'all' ? (
                <>
                  <p className="text-gray-500 text-sm mb-2">No guests found</p>
                  <button
                    onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                    className="text-indigo-600 text-sm font-medium"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <p className="text-gray-400 text-sm">No guests added yet</p>
              )}
            </div>
          ) : (
            <GuestListMobile
              guests={filteredGuests}
              onCheckIn={handleManualCheckIn}
              onEdit={isHost ? handleEditGuest : null}
              onDelete={isHost ? handleDeleteGuest : null}
              showInvitationStatus={true}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddGuest && (
        <AddGuestModal eventId={eventId} onClose={() => setShowAddGuest(false)} onGuestAdded={() => { setShowAddGuest(false); loadEventData(); }} />
      )}

      {showImportCSV && (
        <CSVImport eventId={eventId} onClose={() => setShowImportCSV(false)} onImportComplete={() => { setShowImportCSV(false); loadEventData(); }} />
      )}

      {showSendInvitations && (
        <SendInvitationsModal
          event={event}
          guests={guests}
          onClose={() => setShowSendInvitations(false)}
          onSend={async (invitationData) => {
            try {
              const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
              const response = await fetch(`${API_URL}/api/invitations/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  event_id: eventId,
                  channels: invitationData.channels,
                  filter: invitationData.filter || 'all',
                  guest_ids: invitationData.guest_ids || []
                })
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send invitations');
              }

              const result = await response.json();
              setShowSendInvitations(false);
              loadEventData();
              const { email, sms } = result.results;
              alert(`Invitations sent!\n\nEmail: ${email.sent} sent, ${email.failed} failed\nSMS: ${sms.sent} sent, ${sms.failed} failed`);
            } catch (error) {
              alert(`Failed: ${error.message}`);
            }
          }}
        />
      )}

      {showWalkIn && (
        <WalkInModal
          eventId={eventId}
          onClose={() => setShowWalkIn(false)}
          onWalkInAdded={(guest) => { setShowWalkIn(false); setCheckedInGuest(guest); setShowSuccessDialog(true); loadEventData(); }}
        />
      )}

      {showEditGuest && selectedGuest && (
        <EditGuestModal
          guest={selectedGuest}
          onSave={handleSaveGuest}
          onClose={() => { setShowEditGuest(false); setSelectedGuest(null); }}
          onGuestUpdated={() => { setShowEditGuest(false); setSelectedGuest(null); loadEventData(); }}
        />
      )}

      {showSuccessDialog && checkedInGuest && (
        <CheckInSuccessDialog
          guest={checkedInGuest}
          event={event}
          onClose={() => { setShowSuccessDialog(false); setCheckedInGuest(null); }}
        />
      )}
    </div>
  );
}

export default EventDetails;
