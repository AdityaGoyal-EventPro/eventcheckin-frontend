import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '../api';

function Dashboard({ user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadEvents = async () => {
    try {
      const response = user.role === 'host' 
        ? await eventsAPI.getByHost(user.id)
        : await eventsAPI.getByVenue(user.venue_id);
      
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
          <button onClick={onLogout} className="btn btn-ghost btn-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-2">Welcome, {user.name}</h2>
        <p className="text-gray-600 mb-6">Manage your events</p>

        <button className="btn btn-primary btn-lg mb-8">
          ➕ Create New Event
        </button>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center">
            <p className="text-gray-600">No events yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div
                key={event.id}
                onClick={() => navigate(`/event/${event.id}`)}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition"
              >
                <h3 className="text-xl font-bold mb-3">{event.name}</h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div>📅 {event.date}</div>
                  <div>🕐 {event.time_start} - {event.time_end}</div>
                  {event.venue_name && <div>📍 {event.venue_name}</div>}
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold">{event.total_guests || 0}</span>
                  <span className="text-2xl font-bold text-green-600">{event.checked_in_count || 0}</span>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {Math.round(((event.checked_in_count || 0) / (event.total_guests || 1)) * 100)}% checked in
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                    style={{ width: `${Math.min(((event.checked_in_count || 0) / (event.total_guests || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
