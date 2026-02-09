import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, LogOut, RefreshCw } from 'lucide-react';
import { eventsAPI } from '../api';
import WristbandAssignment from './WristbandAssignment';

function VenueDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('VenueDashboard mounted for user:', user);
    loadEvents();
    
    // Auto-refresh every 30 seconds (not 5 seconds to avoid loop)
    const interval = setInterval(() => {
      console.log('Auto-refreshing events...');
      loadEvents();
    }, 30000);
    
    return () => {
      console.log('VenueDashboard unmounting, clearing interval');
      clearInterval(interval);
    };
  }, []); // Empty deps - only run once on mount

  const loadEvents = async () => {
    try {
      if (!user?.venue_id) {
        console.error('No venue_id found for user:', user);
        setEvents([]);
        setLoading(false);
        return;
      }

      console.log('Loading events for venue_id:', user.venue_id);
      const response = await eventsAPI.getByVenue(user.venue_id);
      const loadedEvents = response.data.events || [];
      
      console.log('Loaded events for venue:', loadedEvents);
      setEvents(loadedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const handleEventClick = (eventId) => {
    console.log('Navigating to event:', eventId);
    navigate(`/event/${eventId}`);
  };

  const handleGlobalScan = () => {
    console.log('Opening global scanner');
    navigate('/scan');
  };

  const handleWristbandAssignment = async (eventId, colorName) => {
    try {
      const response = await fetch(`https://eventcheckin-backend-production.up.railway.app/api/events/${eventId}/wristband`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wristband_color: colorName })
      });
      
      if (!response.ok) throw new Error('Failed to update wristband');
      
      // Reload events to show updated wristband color
      loadEvents();
    } catch (error) {
      console.error('Error assigning wristband:', error);
      alert('Failed to assign wristband color');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {user.venue_name || 'Venue Dashboard'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {user.name} • {events.length} event{events.length !== 1 ? 's' : ''}
              </p>
            </div>
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
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Global Scan Button */}
        <button
          onClick={handleGlobalScan}
          className="w-full mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg flex items-center justify-center gap-3"
        >
          <Camera className="w-8 h-8" />
          <span className="text-xl">Scan QR Code</span>
        </button>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events</h3>
            <p className="text-gray-600">
              No events scheduled at {user.venue_name || 'your venue'} yet.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Events at Your Venue
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event.id)}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-indigo-300 transition"
                >
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{event.name}</h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🕐</span>
                      <span>{event.time_start}{event.time_end ? ` - ${event.time_end}` : ''}</span>
                    </div>
                    {event.host_name && (
                      <div className="flex items-center gap-2">
                        <span>👤</span>
                        <span>{event.host_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
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
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {(event.total_guests || 0) - (event.checked_in_count || 0)}
                      </div>
                      <div className="text-xs text-gray-600">Pending</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min(((event.checked_in_count || 0) / (event.total_guests || 1)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>

                  {/* Wristband Assignment */}
                  <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                    <WristbandAssignment 
                      event={event}
                      onColorAssigned={handleWristbandAssignment}
                    />
                  </div>

                  {/* Scan Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/scan/${event.id}`);
                    }}
                    className="w-full mt-4 bg-indigo-50 text-indigo-600 py-2 rounded-lg hover:bg-indigo-100 transition font-medium flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Scan for This Event
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VenueDashboard;
