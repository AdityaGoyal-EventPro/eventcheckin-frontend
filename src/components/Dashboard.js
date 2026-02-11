import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, RefreshCw, Calendar, MapPin, Clock, Users, ChevronRight, X } from 'lucide-react';
import { eventsAPI, venuesAPI } from '../api';

function Dashboard({ user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
    loadVenues();
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

      if (user.role === 'host') {
        const response = await eventsAPI.getByHost(user.id);
        setEvents(response.data.events || []);
      } else if (user.role === 'venue') {
        if (!user.venue_id) {
          setError('Venue ID missing. Please contact support.');
          setEvents([]);
          setLoading(false);
          return;
        }
        const response = await eventsAPI.getByVenue(user.venue_id);
        setEvents(response.data.events || []);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events. Please try again.');
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const handleRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={onLogout}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            Log Out & Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalGuests = events.reduce((sum, e) => sum + (e.total_guests || 0), 0);
  const totalCheckedIn = events.reduce((sum, e) => sum + (e.checked_in_count || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 safe-top">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold gradient-text">Check-In Pro</h1>
            <p className="text-xs text-gray-500 hidden sm:block">{user.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <RefreshCw className={`w-5 h-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Welcome & Stats */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            Hi, {user.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-gray-500">
            {events.length} event{events.length !== 1 ? 's' : ''} • {totalGuests} guests • {totalCheckedIn} checked in
          </p>
        </div>

        {/* Create Event Button */}
        {user.role === 'host' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto mb-6 flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Create Event</span>
          </button>
        )}

        {/* Events */}
        {events.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Events Yet</h3>
            <p className="text-sm text-gray-500">
              {user.role === 'host' ? 'Create your first event to get started' : 'No events scheduled yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 sm:space-y-0">
            {events.map((event, i) => {
              const progress = Math.min(((event.checked_in_count || 0) / (event.total_guests || 1)) * 100, 100);
              return (
                <div
                  key={event.id}
                  onClick={() => navigate(`/event/${event.id}`)}
                  className="bg-white rounded-xl p-4 border border-gray-100 cursor-pointer card-hover active:scale-[0.98] transition animate-slideUp"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-bold text-gray-900 flex-1 mr-2 line-clamp-1">{event.name}</h3>
                    <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                  </div>

                  <div className="space-y-1.5 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{event.time_start}{event.time_end ? ` - ${event.time_end}` : ''}</span>
                    </div>
                    {event.venue_name && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{event.venue_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 mb-3">
                    <div>
                      <div className="text-xl font-bold text-gray-900">{event.total_guests || 0}</div>
                      <div className="text-[11px] text-gray-400 uppercase tracking-wide">Total</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-green-600">{event.checked_in_count || 0}</div>
                      <div className="text-[11px] text-gray-400 uppercase tracking-wide">In</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-xl font-bold text-indigo-600">{Math.round(progress)}%</div>
                      <div className="text-[11px] text-gray-400 uppercase tracking-wide">Done</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          user={user}
          venues={venues}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); loadEvents(); }}
        />
      )}
    </div>
  );
}

// ============================================
// CREATE EVENT MODAL (Bottom Sheet on mobile)
// ============================================
function CreateEventModal({ user, venues, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '', date: '', time_start: '', time_end: '', venue_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await eventsAPI.create({ ...formData, host_id: user.id, host_name: user.name });
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 animate-fadeIn" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto modal-sheet safe-bottom"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center z-10">
          <h2 className="text-lg font-bold text-gray-900">Create Event</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
              placeholder="Birthday, Wedding, Conference..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start *</label>
              <input
                type="time"
                value={formData.time_start}
                onChange={(e) => setFormData({ ...formData, time_start: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End *</label>
              <input
                type="time"
                value={formData.time_end}
                onChange={(e) => setFormData({ ...formData, time_end: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Venue *</label>
            <select
              value={formData.venue_id}
              onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
            >
              <option value="">Select venue...</option>
              {venues.map(v => (
                <option key={v.id} value={v.id}>{v.name} - {v.city}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2 safe-bottom">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 font-semibold"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;
