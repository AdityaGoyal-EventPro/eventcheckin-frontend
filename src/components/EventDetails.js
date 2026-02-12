import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Search, RefreshCw, Check, X, Plus, UserPlus, Edit2, Trash2, Upload, Mail, QrCode, Share2, Link, ChevronDown, ChevronUp, FileText } from 'lucide-react';
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
import DeleteEventButton from './DeleteEventButton';

// ─── Helper: Check if event is "Live" right now ───
function isEventLive(event) {
  if (!event?.date || !event?.time_start) return false;
  const now = new Date();
  const start = new Date(`${event.date}T${event.time_start}`);
  const end = event.time_end ? new Date(`${event.date}T${event.time_end}`) : new Date(`${event.date}T23:59`);
  return now >= start && now <= end;
}

// ─── Status Badge ───
function EventStatusBadge({ event }) {
  if (event.status === 'archived') {
    return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Archived</span>;
  }
  if (isEventLive(event)) {
    return (
      <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full inline-flex items-center gap-1.5">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Live Now
      </span>
    );
  }
  if (event.status === 'completed') {
    return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Completed</span>;
  }
  return null;
}

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
  const [showShareLink, setShowShareLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showEditDescription, setShowEditDescription] = useState(false);
  const [savingDescription, setSavingDescription] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [checkingIn, setCheckingIn] = useState(null);

  // Check if user is host (can edit) or venue (view-only)
  const isHost = user?.role === 'host' || user?.role === 'admin';
  const isVenue = user?.role === 'venue';

  // Check if event is editable (not completed/archived)
  const isEditable = event && event.status !== 'completed' && event.status !== 'archived';
  const isCompleted = event?.status === 'completed';
  const isArchived = event?.status === 'archived';

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

      const guestsResponse = await guestsAPI.getByEvent(eventId, user?.role);
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
      throw error;
    }
  };

  const handleDeleteGuest = async (guestId) => {
    if (!window.confirm('Remove this guest from the list?')) return;
    try {
      await guestsAPI.delete(guestId);
      loadEventData();
    } catch (error) {
      alert('Failed to delete guest');
    }
  };

  const getFilteredGuests = () => {
    let filtered = guests;
    if (statusFilter === 'checked-in') filtered = filtered.filter(g => g.checked_in);
    else if (statusFilter === 'pending') filtered = filtered.filter(g => !g.checked_in);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(g => {
        // Venue users can only search by name (phone/email are masked)
        if (isVenue) return g.name.toLowerCase().includes(term);
        return g.name.toLowerCase().includes(term) ||
          (g.email && g.email.toLowerCase().includes(term)) ||
          (g.phone && g.phone.includes(searchTerm));
      });
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

  if (loading && !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading event...</p>
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
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              {!isCompleted && !isArchived && (
                <button
                  onClick={() => navigate(`/scan/${eventId}`)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  <Camera className="w-5 h-5" />
                  <span>Scan QR</span>
                </button>
              )}
            </div>
          </div>

          {event && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
                <EventStatusBadge event={event} />
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>📅 {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span>🕐 {event.time_start}{event.time_end ? ` – ${event.time_end}` : ''}</span>
                <span>📍 {event.venue_name}</span>
                {event.host_name && <span>👤 {event.host_name}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Completed/Archived Banner */}
      {isCompleted && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-blue-700">
            <Check className="w-4 h-4" />
            <span>This event has ended. Guest list is locked.</span>
          </div>
        </div>
      )}
      {isArchived && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-amber-700">
            <span>📦</span>
            <span>This event is archived. It will be permanently deleted in 30 days.</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
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
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-indigo-600">{invitedCount}</div>
            <div className="text-sm text-gray-600">Invited</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-blue-600">{openedCount}</div>
            <div className="text-sm text-gray-600">Opened</div>
          </div>
        </div>

        {/* About Event Section - Collapsible */}
        {(event?.description || (isHost && isEditable)) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
            <button
              onClick={() => setShowAbout(!showAbout)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="font-medium text-gray-900 text-sm">About Event</span>
                {!showAbout && event?.description && (
                  <span className="text-xs text-gray-400 truncate hidden sm:inline">
                    — {event.description.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60)}...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isHost && isEditable && (
                  <span
                    onClick={(e) => { e.stopPropagation(); setShowEditDescription(true); }}
                    className="text-xs text-indigo-600 font-medium hover:text-indigo-700 px-2 py-1 rounded-lg hover:bg-indigo-50 transition"
                  >
                    {event?.description ? 'Edit' : 'Add'}
                  </span>
                )}
                {showAbout ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            {showAbout && (
              <div className="px-5 pb-5 border-t border-gray-100">
                {event?.description ? (
                  <div 
                    className="text-sm text-gray-600 leading-relaxed pt-4 prose prose-sm prose-gray max-w-none [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-3 [&_h3]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_b]:font-semibold [&_b]:text-gray-800 [&_strong]:font-semibold [&_strong]:text-gray-800"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                ) : (
                  <p className="text-sm text-gray-400 pt-4 italic">No description added yet. Click "Add" to describe your event.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons - Only show if event is editable */}
        {isHost && isEditable ? (
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

            <PhoneContactPicker 
              eventId={eventId}
              onSuccess={loadEventData}
            />

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

            <button
              onClick={() => setShowShareLink(true)}
              className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-green-500 rounded-xl p-4 transition"
            >
              <Share2 className="w-5 h-5 text-green-600" />
              <span className="font-medium">Share Link</span>
            </button>

            {/* Delete/Archive Button */}
            <DeleteEventButton 
              event={event} 
              user={user} 
              guests={guests}
              onDeleted={() => navigate(-1)} 
            />
          </div>
        ) : isHost && !isEditable ? (
          /* Host view for completed/archived events — only archive button */
          <div className="flex gap-3 mb-8">
            <DeleteEventButton 
              event={event} 
              user={user} 
              guests={guests}
              onDeleted={() => navigate(-1)} 
            />
          </div>
        ) : isVenue && isEditable ? (
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
        ) : null}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isVenue ? "Search by name..." : "Search by name, email, or phone..."}
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

        {/* Guest List */}
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
                    onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
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
              onCheckIn={isEditable ? handleManualCheckIn : null}
              onEdit={isHost && isEditable ? handleEditGuest : null}
              onDelete={isHost && isEditable ? handleDeleteGuest : null}
              showInvitationStatus={true}
            />
          )}
        </div>
      </div>

      {/* Modals — only open if event is editable */}
      {showAddGuest && isEditable && (
        <AddGuestModal
          eventId={eventId}
          onClose={() => setShowAddGuest(false)}
          onGuestAdded={() => { setShowAddGuest(false); loadEventData(); }}
        />
      )}

      {showImportCSV && isEditable && (
        <CSVImport
          eventId={eventId}
          onClose={() => setShowImportCSV(false)}
          onImportComplete={() => { setShowImportCSV(false); loadEventData(); }}
        />
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

      {/* Share Registration Link Modal */}
      {showShareLink && event && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:rounded-2xl rounded-t-2xl sm:max-w-md shadow-2xl">
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="w-9 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Share Registration Link</h2>
              <p className="text-sm text-gray-600 mb-5">
                Guests can register themselves using this link. They'll be auto-added to your guest list.
              </p>

              {event.registration_token ? (
                <>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-gray-800 break-all font-mono">
                      {window.location.origin}/rsvp/{event.registration_token}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/rsvp/${event.registration_token}`);
                        setLinkCopied(true);
                        setTimeout(() => setLinkCopied(false), 2000);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
                    >
                      <Link className="w-4 h-4" />
                      {linkCopied ? 'Copied!' : 'Copy Link'}
                    </button>
                    
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/rsvp/${event.registration_token}`;
                        const text = `You're invited to ${event.name}! Register here: ${url}`;
                        if (navigator.share) {
                          navigator.share({ title: event.name, text, url });
                        } else {
                          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-xl">
                  Registration link not available. This event was created before the feature was enabled.
                </p>
              )}

              <button
                onClick={() => { setShowShareLink(false); setLinkCopied(false); }}
                className="w-full mt-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Description Modal */}
      {showEditDescription && event && (
        <EditDescriptionModal
          description={event.description || ''}
          saving={savingDescription}
          onSave={async (newDescription) => {
            setSavingDescription(true);
            try {
              await eventsAPI.updateDescription(event.id, newDescription);
              setEvent({ ...event, description: newDescription });
              setShowEditDescription(false);
              setShowAbout(true);
            } catch (err) {
              console.error('Failed to save description:', err);
            } finally {
              setSavingDescription(false);
            }
          }}
          onClose={() => setShowEditDescription(false)}
        />
      )}
    </div>
  );
}

// ─── Edit Description Modal (Rich Text) ───
function EditDescriptionModal({ description, saving, onSave, onClose }) {
  const editorRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);
  const MAX_WORDS = 500;

  const countWords = useCallback((html) => {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) return 0;
    return text.split(' ').filter(w => w.length > 0).length;
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = description || '';
      setWordCount(countWords(description || ''));
    }
  }, [description, countWords]);

  const handleEditorInput = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const words = countWords(html);
    if (words > MAX_WORDS) return;
    setWordCount(words);
  }, [countWords]);

  const execFormat = (command, value) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value || null);
    handleEditorInput();
  };

  const handleSave = () => {
    const html = editorRef.current?.innerHTML || '';
    const cleaned = html === '<br>' ? '' : html;
    onSave(cleaned);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:rounded-2xl rounded-t-2xl sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-9 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Edit Event Description</h2>
          <p className="text-xs text-gray-500 mt-1">This will be shown on the guest registration page</p>
        </div>

        <div className="p-6">
          {/* Toolbar */}
          <div className="flex items-center gap-1 border border-gray-300 border-b-0 rounded-t-xl bg-gray-50 px-2 py-1.5">
            <button type="button" onClick={() => execFormat('bold')} title="Bold"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 active:bg-gray-300 transition text-sm font-bold text-gray-700">
              B
            </button>
            <button type="button" onClick={() => execFormat('italic')} title="Italic"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 active:bg-gray-300 transition text-sm italic text-gray-700">
              I
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1"></div>
            <button type="button" onClick={() => execFormat('formatBlock', 'h3')} title="Heading"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 active:bg-gray-300 transition text-xs font-bold text-gray-700">
              H
            </button>
            <button type="button" onClick={() => execFormat('insertUnorderedList')} title="Bullet List"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 active:bg-gray-300 transition text-sm text-gray-700">
              •≡
            </button>
            <button type="button" onClick={() => execFormat('insertOrderedList')} title="Numbered List"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 active:bg-gray-300 transition text-sm text-gray-700">
              1.
            </button>
            <div className="flex-1"></div>
            <span className={`text-xs tabular-nums ${wordCount > MAX_WORDS * 0.9 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
              {wordCount}/{MAX_WORDS}
            </span>
          </div>

          {/* Editable area */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            data-placeholder="Describe your event — what guests can expect, dress code, special notes..."
            className="w-full min-h-[180px] max-h-[300px] overflow-y-auto px-4 py-3 border border-gray-300 rounded-b-xl text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
            style={{ wordBreak: 'break-word' }}
            suppressContentEditableWarning
          />

          <div className="flex gap-3 mt-5">
            <button onClick={onClose} disabled={saving}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
