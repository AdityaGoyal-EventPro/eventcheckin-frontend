import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, venuesAPI } from '../api';

function Dashboard({ user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = user.role === 'host' 
        ? await eventsAPI.getByHost(user.id)
        : await eventsAPI.getByVenue(user.id);
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>👋 Welcome back, {user.name}</h1>
        <p>{user.role === 'host' ? 'Manage your events' : `Managing ${user.venue_name}`}</p>
        
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            ➕ Create New Event
          </button>
          <button className="btn-secondary" onClick={onLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'white', padding: '40px' }}>
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'white', padding: '40px' }}>
          <h2>No events yet</h2>
          <p>Create your first event to get started!</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              onClick={() => navigate(`/event/${event.id}`)}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateEventModal 
          user={user}
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

function EventCard({ event, onClick }) {
  return (
    <div className="event-card" onClick={onClick}>
      <h3>{event.name}</h3>
      <div className="event-info">
        <div>📅 {event.date}</div>
        <div>🕐 {event.time_start} - {event.time_end}</div>
        <div>📍 {event.venue_name}</div>
      </div>
      <div className="event-stats">
        <div className="stat">
          <div className="stat-value">{event.expected_guests || 0}</div>
          <div className="stat-label">Expected</div>
        </div>
        <div className="stat">
          <div className="stat-value">0</div>
          <div className="stat-label">Checked In</div>
        </div>
      </div>
    </div>
  );
}

function CreateEventModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time_start: '',
    time_end: '',
    venue_id: '',
    host_id: user.id,
    expected_guests: ''
  });
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      const response = await venuesAPI.getAll();
      setVenues(response.data.venues || []);
    } catch (err) {
      console.error('Error loading venues:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.venue_id) {
      setError('Please select a venue');
      setLoading(false);
      return;
    }

    try {
      await eventsAPI.create(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Create New Event</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Annual Gala 2026"
              required
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Start Time</label>
            <input
              type="time"
              name="time_start"
              value={formData.time_start}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>End Time</label>
            <input
              type="time"
              name="time_end"
              value={formData.time_end}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Select Venue</label>
            <select
              name="venue_id"
              value={formData.venue_id}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">-- Choose a venue --</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} - {venue.city}
                </option>
              ))}
            </select>
            {venues.length === 0 && (
              <small style={{color: '#666', marginTop: '4px', display: 'block'}}>
                Loading venues...
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Expected Guests</label>
            <input
              type="number"
              name="expected_guests"
              value={formData.expected_guests}
              onChange={handleChange}
              placeholder="100"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;
