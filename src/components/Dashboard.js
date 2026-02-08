import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, venuesAPI } from '../api';

function Dashboard({ user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
    loadVenues();
    const interval = setInterval(loadEvents, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadEvents = async () => {
    try {
      // CRITICAL SAFETY CHECK
      if (!user) {
        console.error('No user object found');
        setError('User session invalid. Please log in again.');
        setEvents([]);
        setLoading(false);
        return;
      }

      if (!user.id) {
        console.error('User has no ID:', user);
        setError('User ID missing. Please log out and log in again.');
        setEvents([]);
        setLoading(false);
        return;
      }

      console.log('Loading events for user:', { id: user.id, role: user.role, venue_id: user.venue_id });

      if (user.role === 'host') {
        const response = await eventsAPI.getByHost(user.id);
        console.log('Host events loaded:', response.data.events?.length || 0);
        setEvents(response.data.events || []);
      } else if (user.role === 'venue') {
        if (!user.venue_id) {
          console.error('Venue user has no venue_id:', user);
          setError('Venue ID missing. Please contact support.');
          setEvents([]);
          setLoading(false);
          return;
        }
        const response = await eventsAPI.getByVenue(user.venue_id);
        console.log('Venue events loaded:', response.data.events?.length || 0);
        setEvents(response.data.events || []);
      } else {
        console.error('Unknown user role:', user.role);
        setError('Invalid user role. Please contact support.');
        setEvents([]);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events. Please try again.');
      setEvents([]);
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

  const handleEventClick = (eventId) => {
    console.log('Navigating to event:', eventId);
    navigate(`/event/${eventId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-red-500 text-6xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Authentication Error</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button
            onClick={onLogout}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition"
          >
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
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Check-In Pro
            </span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.name} ({user.role})
            </span>
            <button onClick={onLogout} className="btn btn-ghost btn-sm">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-2">Welcome, {user.name}</h2>
        <p className="text-gray-600 mb-6">
          {user.role === 'host' ? 'Manage your events' : `Managing: ${user.venue_name || 'Venue'}`}
        </p>

        {/* Create Event Button - Host Only */}
        {user.role === 'host' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-lg mb-8"
          >
            ➕ Create New Event
          </button>
        )}

        {/* Debug Info - Remove in production */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-xs">
          <p className="font-semibold mb-1">Debug Info:</p>
          <p>User ID: {user.id || 'MISSING'}</p>
          <p>Role: {user.role}</p>
          <p>Venue ID: {user.venue_id || 'N/A'}</p>
          <p>Events Count: {events.length}</p>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Yet</h3>
            <p className="text-gray-600">
              {user.role === 'host' 
                ? 'Create your first event to get started!' 
                : 'No events scheduled at your venue yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event.id)}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition"
              >
                <h3 className="text-xl font-bold mb-3">{event.name}</h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div>📅 {event.date}</div>
                  <div>🕐 {event.time_start} - {event.time_end}</div>
                  {event.venue_name && <div>📍 {event.venue_name}</div>}
                  {event.host_name && <div>👤 {event.host_name}</div>}
                </div>
                <div className="flex justify-between items-center mb-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {event.total_guests || 0}
                    </div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {event.checked_in_count || 0}
                    </div>
                    <div className="text-xs text-gray-600">Checked In</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                    style={{ 
                      width: `${Math.min(((event.checked_in_count || 0) / (event.total_guests || 1)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
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
      console.error('Error creating event:', error);
      setError(error.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Birthday Party, Wedding, Conference..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.time_start}
                onChange={(e) => setFormData({ ...formData, time_start: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={formData.time_end}
                onChange={(e) => setFormData({ ...formData, time_end: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue *
            </label>
            <select
              value={formData.venue_id}
              onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select a venue...</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} - {venue.city}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
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
