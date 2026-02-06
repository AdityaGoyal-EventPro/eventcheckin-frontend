import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Scan, Users, CheckCircle, BarChart3, Clock, Eye, Plus } from 'lucide-react';
import { eventsAPI, guestsAPI } from '../api';
import WalkInModal from './WalkInModal';
import QRScanner from './QRScanner';

function VenueDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [allGuests, setAllGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGlobalScanner, setShowGlobalScanner] = useState(false);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeScanner, setActiveScanner] = useState('Scanner 1');
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadVenueData();
    // Simulate real-time updates every 5 seconds
    const interval = setInterval(loadVenueData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadVenueData = async () => {
    try {
      // Load all events (showing all events for testing)
      const eventsResponse = await eventsAPI.getAll();
      setEvents(eventsResponse.data.events || []);

      // Load all guests for these events
      const guestsPromises = (eventsResponse.data.events || []).map(event =>
        guestsAPI.getByEvent(event.id).catch(() => ({ data: { guests: [] } }))
      );
      const guestsResponses = await Promise.all(guestsPromises);
      const guests = guestsResponses.flatMap(r => r.data.guests || []);
      setAllGuests(guests);

      // Update recent activity from checked-in guests
      const recentCheckins = guests
        .filter(g => g.checked_in && g.checked_in_time)
        .sort((a, b) => new Date(b.checked_in_time) - new Date(a.checked_in_time))
        .slice(0, 10)
        .map(g => {
          const event = (eventsResponse.data.events || []).find(e => e.id === g.event_id);
          return {
            id: g.id,
            guestName: g.name,
            eventName: event?.name || 'Unknown Event',
            scanner: g.checked_in_by || activeScanner,
            time: g.checked_in_time,
            timestamp: new Date(g.checked_in_time).getTime()
          };
        });
      setRecentActivity(recentCheckins);
    } catch (error) {
      console.error('Error loading venue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGlobalStats = () => {
    return {
      totalEvents: events.length,
      totalGuests: allGuests.length,
      checkedIn: allGuests.filter(g => g.checked_in).length,
      pending: allGuests.filter(g => !g.checked_in).length,
      vip: allGuests.filter(g => g.category === 'VIP').length
    };
  };

  const getEventStats = (eventId) => {
    const eventGuests = allGuests.filter(g => g.event_id === eventId);
    return {
      total: eventGuests.length,
      checkedIn: eventGuests.filter(g => g.checked_in).length,
      pending: eventGuests.filter(g => !g.checked_in).length,
      percentage: eventGuests.length > 0 
        ? Math.round((eventGuests.filter(g => g.checked_in).length / eventGuests.length) * 100) 
        : 0
    };
  };

  const handleCheckIn = async (guestId) => {
    try {
      await guestsAPI.checkIn(guestId, activeScanner);
      await loadVenueData();
      alert('✅ Guest checked in successfully!');
    } catch (error) {
      alert('Error checking in guest');
    }
  };

  const stats = getGlobalStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-600">Loading venue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Venue Dashboard</h1>
              <p className="text-sm text-gray-600">{user.venue || 'Venue Staff'}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-600">Active Scanner</div>
                <select 
                  value={activeScanner}
                  onChange={(e) => setActiveScanner(e.target.value)}
                  className="px-3 py-1 border rounded-lg font-medium text-sm bg-white"
                >
                  <option value="Scanner 1">Scanner 1</option>
                  <option value="Scanner 2">Scanner 2</option>
                  <option value="Scanner 3">Scanner 3</option>
                  <option value="Door A">Door A</option>
                  <option value="Door B">Door B</option>
                  <option value="Main Entrance">Main Entrance</option>
                </select>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Real-Time Activity Feed */}
        {recentActivity.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-gray-900">Live Activity</h3>
              <span className="text-xs text-gray-500">(All scanners)</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between text-sm bg-green-50 p-2 rounded">
                  <div>
                    <span className="font-medium text-gray-900">{activity.guestName}</span>
                    <span className="text-gray-600"> • {activity.eventName}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">{activity.scanner}</div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Scan Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Global Scan Mode</h2>
              </div>
              <p className="text-purple-100 mb-4">Scan guests from any event at this venue</p>
              <div className="flex gap-6 text-sm">
                <div>
                  <div className="font-semibold">{stats.totalEvents} Events</div>
                  <div className="text-purple-200">At this venue</div>
                </div>
                <div>
                  <div className="font-semibold">{stats.totalGuests} Guests</div>
                  <div className="text-purple-200">Total expected</div>
                </div>
                <div>
                  <div className="font-semibold">{stats.checkedIn} Checked In</div>
                  <div className="text-purple-200">
                    {stats.totalGuests > 0 ? Math.round((stats.checkedIn/stats.totalGuests)*100) : 0}% arrived
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowGlobalScanner(true)}
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition shadow-lg flex items-center gap-2"
            >
              <Scan className="w-6 h-6" />
              START GLOBAL SCAN
            </button>
          </div>
        </div>

        {/* Today's Events */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Or scan for specific event:
        </h2>

        <div className="grid gap-4">
          {events.map(event => {
            const eventStats = getEventStats(event.id);
            return (
              <div 
                key={event.id} 
                className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100 hover:border-purple-300 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <h3 className="text-xl font-bold text-gray-900">{event.name}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">
                      📅 {event.date} • 🕐 {event.time_start} - {event.time_end}
                    </p>
                    <p className="text-gray-600 text-sm">
                      👤 Organized by {event.host_name || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{eventStats.percentage}%</div>
                    <div className="text-sm text-gray-600">{eventStats.checkedIn}/{eventStats.total}</div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${eventStats.percentage}%` }}
                  ></div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowGlobalScanner(true);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Scan className="w-4 h-4" />
                    Scan for This Event
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowWalkIn(true);
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Walk-In
                  </button>
                  <button
                    onClick={() => navigate(`/event/${event.id}`)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600">There are no events at this venue yet.</p>
          </div>
        )}
      </div>

      {/* Global QR Scanner Modal */}
      {showGlobalScanner && (
        <QRScanner
          availableGuests={
            selectedEvent 
              ? allGuests.filter(g => g.event_id === selectedEvent.id && !g.checked_in)
              : allGuests.filter(g => !g.checked_in)
          }
          onScan={(qrData) => {
            const guest = allGuests.find(g => g.id === qrData.guest_id);
            if (guest) {
              handleCheckIn(guest.id);
              setShowGlobalScanner(false);
            }
          }}
          onClose={() => {
            setShowGlobalScanner(false);
            setSelectedEvent(null);
          }}
        />
      )}

      {/* Walk-In Modal */}
      {showWalkIn && selectedEvent && (
        <WalkInModal
          eventId={selectedEvent.id}
          eventName={selectedEvent.name}
          onClose={() => {
            setShowWalkIn(false);
            setSelectedEvent(null);
          }}
          onSuccess={loadVenueData}
        />
      )}
    </div>
  );
}

export default VenueDashboard;
