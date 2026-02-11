import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Clock, MapPin, Users, Check, Archive, RotateCcw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { eventsAPI, venuesAPI } from '../api';

// ─── Helper: Check if event is "Live" right now ───
function isEventLive(event) {
  if (!event.date || !event.time_start) return false;
  const now = new Date();
  const start = new Date(`${event.date}T${event.time_start}`);
  const end = event.time_end ? new Date(`${event.date}T${event.time_end}`) : new Date(`${event.date}T23:59`);
  return now >= start && now <= end;
}

// ─── Helper: Check if event is upcoming (future) ───
function isEventUpcoming(event) {
  if (!event.date) return false;
  const end = event.time_end ? new Date(`${event.date}T${event.time_end}`) : new Date(`${event.date}T23:59`);
  return end >= new Date();
}

// ─── Status Badge Component ───
function StatusBadge({ event }) {
  if (event.status === 'archived') {
    return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Archived</span>;
  }
  if (isEventLive(event)) {
    return (
      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        Live
      </span>
    );
  }
  if (event.status === 'completed') {
    return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Completed</span>;
  }
  return null; // 'created' upcoming events don't need a badge
}

// ─── Event Card Component ───
function EventCard({ event, onClick }) {
  const progress = event.total_guests > 0 
    ? Math.min(((event.checked_in_count || 0) / event.total_guests) * 100, 100) 
    : 0;
  
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-5 border border-gray-200 cursor-pointer active:scale-[0.99] hover:border-indigo-300 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 flex-1 min-w-0 mr-2 truncate">{event.name}</h3>
        <StatusBadge event={event} />
      </div>
      
      <div className="space-y-1.5 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          <span>{event.time_start}{event.time_end ? ` – ${event.time_end}` : ''}</span>
        </div>
        {event.venue_name && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{event.venue_name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-indigo-600" />
          <span className="text-lg font-bold text-indigo-600">{event.total_guests || 0}</span>
          <span className="text-xs text-gray-500">guests</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-lg font-bold text-green-600">{event.checked_in_count || 0}</span>
          <span className="text-xs text-gray-500">in</span>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ─── Archived Events Section ───
function ArchivedSection({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadArchived();
  }, [user]);

  const loadArchived = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getArchivedByHost(user.id);
      setEvents(response?.data?.events || []);
    } catch (err) {
      console.error('Failed to load archived:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (deletedAt) => {
    if (!deletedAt) return 30;
    const purge = new Date(deletedAt);
    purge.setDate(purge.getDate() + 30);
    return Math.max(0, Math.ceil((purge - new Date()) / (1000 * 60 * 60 * 24)));
  };

  const handleRestore = async (eventId) => {
    setActionLoading(eventId);
    try {
      await eventsAPI.restore(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err) {
      alert('Failed to restore event');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (eventId) => {
    setActionLoading(eventId);
    try {
      await eventsAPI.hardDelete(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      setConfirmDelete(null);
    } catch (err) {
      alert('Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  if (!loading && events.length === 0) return null;

  return (
    <div className="mt-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl active:scale-[0.99] transition"
      >
        <div className="flex items-center gap-2">
          <Archive className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Archived Events</span>
          <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">{events.length}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {loading ? (
            <p className="text-center py-6 text-sm text-gray-400">Loading...</p>
          ) : events.map(event => {
            const days = getDaysRemaining(event.deleted_at);
            return (
              <div key={event.id} className="bg-white border border-gray-200 rounded-xl p-4 opacity-75">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-800 truncate">{event.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}{event.total_guests || 0} guests
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-medium flex-shrink-0 ${
                    days <= 7 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {days}d left
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    By {event.deleted_by === 'host' ? 'you' : event.deleted_by === 'system' ? 'auto' : 'venue'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRestore(event.id)}
                      disabled={actionLoading === event.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium active:scale-[0.98] transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restore
                    </button>
                    {event.checked_in_count === 0 && (
                      <button
                        onClick={() => setConfirmDelete(confirmDelete === event.id ? null : event.id)}
                        disabled={actionLoading === event.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium active:scale-[0.98] transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {confirmDelete === event.id && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700 mb-2">Permanently delete? Guest data will be kept.</p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmDelete(null)} className="flex-1 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-medium">Cancel</button>
                      <button onClick={() => handlePermanentDelete(event.id)} className="flex-1 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium">Delete Forever</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <p className="text-center text-xs text-gray-400 py-1">Auto-deleted after 30 days. Guest data is always preserved.</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN HOST DASHBOARD
// ============================================
function Dashboard({ user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
    loadVenues();
    // Trigger auto status update on load
    eventsAPI.autoUpdateStatus().catch(() => {});
    const interval = setInterval(loadEvents, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadEvents = async () => {
    try {
      if (!user?.id) {
        setError('User session invalid. Please log in again.');
        setEvents([]);
        setLoading(false);
        return;
      }

      const response = await eventsAPI.getByHost(user.id);
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  const loadVenues = async () => {
    try {
      const response = await venuesAPI.getAll();
      setVenues(response.data.venues || []);
    } catch (error) {
      console.error('Error loading venues:', error);
    }
  };

  // ─── Split events into tabs ───
  const upcomingEvents = events.filter(e => isEventUpcoming(e) && e.status !== 'archived');
  const pastEvents = events.filter(e => !isEventUpcoming(e) && e.status === 'completed');

  const getTabEvents = () => {
    if (activeTab === 'upcoming') return upcomingEvents;
    if (activeTab === 'past') return pastEvents;
    return [];
  };

  const tabEvents = getTabEvents();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Something went wrong</h2>
          <p className="text-gray-600 mb-6 text-sm">{error}</p>
          <button onClick={onLogout} className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl">
            Log Out & Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Check-In Pro
            </span>
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:inline">{user.name}</span>
            <button onClick={onLogout} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome + Create */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Hi, {user.name?.split(' ')[0]}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {upcomingEvents.length} upcoming · {pastEvents.length} past
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm active:scale-[0.98] transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Event</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
          {[
            { key: 'upcoming', label: 'Upcoming', count: upcomingEvents.length },
            { key: 'past', label: 'Past', count: pastEvents.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {tabEvents.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <div className="text-4xl mb-3">
              {activeTab === 'upcoming' ? '📅' : '✅'}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {activeTab === 'upcoming' ? 'No upcoming events' : 'No past events'}
            </h3>
            <p className="text-sm text-gray-500">
              {activeTab === 'upcoming' 
                ? 'Create your first event to get started' 
                : 'Completed events will appear here'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tabEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => navigate(`/event/${event.id}`)}
              />
            ))}
          </div>
        )}

        {/* Archived Section */}
        <ArchivedSection user={user} />
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          user={user}
          venues={venues}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadEvents();
          }}
        />
      )}
    </div>
  );
}

// ============================================
// CREATE EVENT MODAL
// ============================================
function CreateEventModal({ user, venues, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time_start: '',
    time_end: '',
    venue_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await eventsAPI.create({
        ...formData,
        host_id: user.id,
        host_name: user.name
      });
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:rounded-2xl rounded-t-2xl sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Drag handle on mobile */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-9 h-1 bg-gray-300 rounded-full" />
        </div>
        
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create New Event</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Birthday Party, Wedding..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start *</label>
              <input
                type="time"
                value={formData.time_start}
                onChange={(e) => setFormData({ ...formData, time_start: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End *</label>
              <input
                type="time"
                value={formData.time_end}
                onChange={(e) => setFormData({ ...formData, time_end: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
            <select
              value={formData.venue_id}
              onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select a venue...</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>{venue.name} – {venue.city}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm active:scale-[0.98] transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium text-sm active:scale-[0.98] transition">
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;
