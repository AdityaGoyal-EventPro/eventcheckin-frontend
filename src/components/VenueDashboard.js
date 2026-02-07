import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Scan, Users, Calendar, MapPin, Eye, UserPlus, Filter, Clock } from 'lucide-react';
import { eventsAPI, guestsAPI } from '../api';
import WalkInModal from './WalkInModal';
import QRScanner from './QRScanner';
import CheckInSuccessDialog from './CheckInSuccessDialog';
import WristbandAssignment from './WristbandAssignment';

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
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [checkedInGuest, setCheckedInGuest] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [customDate, setCustomDate] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    loadVenueData();
    const interval = setInterval(loadVenueData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, dateFilter, customDate]);

  const filterEvents = () => {
    if (dateFilter === 'all') {
      setFilteredEvents(events);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const filtered = events.filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);

      if (dateFilter === 'today') {
        return eventDate.getTime() === today.getTime();
      } else if (dateFilter === 'tomorrow') {
        return eventDate.getTime() === tomorrow.getTime();
      } else if (dateFilter === 'custom' && customDate) {
        const selectedDate = new Date(customDate);
        selectedDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === selectedDate.getTime();
      }
      return true;
    });

    setFilteredEvents(filtered);
  };

  const loadVenueData = async () => {
    try {
      let events = [];
      
      if (user.venue_id) {
        console.log('Loading events for venue_id:', user.venue_id);
        const eventsResponse = await eventsAPI.getByVenue(user.venue_id);
        events = eventsResponse.data.events || [];
        console.log('Loaded events for venue:', events);
      } else {
        console.warn('User has no venue_id, showing all events as fallback');
        const eventsResponse = await eventsAPI.getAll();
        events = eventsResponse.data.events || [];
      }
      
      console.log('Final events array:', events);
      setEvents(Array.isArray(events) ? events : []);

      const guestsPromises = events.map(event => 
        guestsAPI.getByEvent(event.id).catch(() => ({ data: { guests: [] } }))
      );
      const guestsResponses = await Promise.all(guestsPromises);
      const allGuestsData = guestsResponses.flatMap(res => res.data.guests || []);
      setAllGuests(allGuestsData);

      const recent = allGuestsData
        .filter(g => g.checked_in)
        .sort((a, b) => new Date(b.checked_in_at) - new Date(b.checked_in_at))
        .slice(0, 5)
        .map(g => {
          const event = events.find(e => e.id === g.event_id);
          return {
            id: g.id,
            guestName: g.name,
            eventName: event?.name || 'Unknown Event',
            scanner: g.checked_in_by || 'Unknown',
            time: new Date(g.checked_in_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          };
        });
      setRecentActivity(recent);
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
      checkedIn: allGuests.filter(g => g.checked_in).length
    };
  };

  const getEventStats = (eventId) => {
    const eventGuests = allGuests.filter(g => g.event_id === eventId);
    const checkedIn = eventGuests.filter(g => g.checked_in).length;
    const total = eventGuests.length;
    return {
      total,
      checkedIn,
      percentage: total > 0 ? Math.round((checkedIn / total) * 100) : 0
    };
  };

  const handleCheckIn = async (guestId) => {
    try {
      const guest = allGuests.find(g => g.id === guestId);
      await guestsAPI.checkIn(guestId, activeScanner);
      
      if (guest) {
        setCheckedInGuest(guest);
        setShowSuccessDialog(true);
      }
      
      await loadVenueData();
    } catch (error) {
      alert('Error checking in guest');
    }
  };

  const handleWristbandAssignment = async (eventId, colorName) => {
    try {
      const response = await fetch(`https://eventcheckin-backend-production.up.railway.app/api/events/${eventId}/wristband`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wristband_color: colorName })
      });
      
      if (!response.ok) throw new Error('Failed to update wristband');
      
      await loadVenueData();
    } catch (error) {
      console.error('Error assigning wristband:', error);
      throw error;
    }
  };

  const stats = getGlobalStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading venue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Venue Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">{user.venue_name || 'Venue Operations'}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Global Scan Card - Airbnb Style */}
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Global Scan</h2>
                    <p className="text-purple-200 text-sm">Scan any guest at this venue</p>
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="text-3xl font-bold text-white">{stats.totalEvents}</div>
                    <div className="text-xs text-purple-200 mt-1">Events</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="text-3xl font-bold text-white">{stats.totalGuests}</div>
                    <div className="text-xs text-purple-200 mt-1">Guests</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="text-3xl font-bold text-green-300">{stats.checkedIn}</div>
                    <div className="text-xs text-purple-200 mt-1">Checked In</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scan Button - Full Width */}
            <button
              onClick={() => setShowGlobalScanner(true)}
              className="w-full py-4 bg-white text-purple-700 rounded-2xl font-bold text-lg hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <Scan className="w-6 h-6" />
              Start Global Scan
            </button>
          </div>
        </div>

        {/* Date Filters - Airbnb Style Pills */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Filter Events</h3>
            <span className="text-sm text-gray-500">{filteredEvents.length} events</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Events' },
              { value: 'today', label: 'Today' },
              { value: 'tomorrow', label: 'Tomorrow' },
              { value: 'custom', label: 'Pick Date' }
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setDateFilter(filter.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  dateFilter === filter.value
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {dateFilter === 'custom' && (
            <div className="mt-3">
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Events List - Airbnb Style Cards */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500">
                {dateFilter === 'today' && 'No events scheduled for today'}
                {dateFilter === 'tomorrow' && 'No events scheduled for tomorrow'}
                {dateFilter === 'custom' && 'No events on selected date'}
                {dateFilter === 'all' && 'No events at this venue yet'}
              </p>
            </div>
          ) : (
            filteredEvents.map(event => {
              const eventStats = getEventStats(event.id);
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
                >
                  <div className="p-5">
                    {/* Event Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{event.name}</h3>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{event.time_start} - {event.time_end}</span>
                          </div>
                          {event.host_name && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">By {event.host_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Stats Badge */}
                      <div className="ml-4 flex-shrink-0 text-right">
                        <div className="text-3xl font-bold text-purple-600">{eventStats.percentage}%</div>
                        <div className="text-xs text-gray-500">{eventStats.checkedIn}/{eventStats.total}</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${eventStats.percentage}%` }}
                      ></div>
                    </div>

                    {/* Wristband */}
                    <div className="mb-4">
                      <WristbandAssignment 
                        event={event}
                        onColorAssigned={handleWristbandAssignment}
                      />
                    </div>

                    {/* Action Buttons - Clean Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowGlobalScanner(true);
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition text-sm"
                      >
                        <Scan className="w-4 h-4" />
                        <span className="hidden sm:inline">Scan</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowWalkIn(true);
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition text-sm"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Walk-In</span>
                      </button>
                      <button
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="flex items-center justify-center gap-2 px-3 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modals */}
      {showGlobalScanner && (
        <QRScanner
          availableGuests={allGuests.filter(g => !g.checked_in)}
          onScan={(qrData) => {
            console.log('VenueDashboard: QR scanned:', qrData);
            const guest = allGuests.find(g => g.id === qrData.guest_id);
            if (guest) {
              console.log('VenueDashboard: Found guest:', guest.name);
              console.log('VenueDashboard: Calling handleCheckIn for guest ID:', guest.id);
              handleCheckIn(guest.id);
              setShowGlobalScanner(false);
            } else {
              console.error('VenueDashboard: Guest not found for ID:', qrData.guest_id);
              alert('Guest not found in venue database');
            }
          }}
          onClose={() => {
            setShowGlobalScanner(false);
            setSelectedEvent(null);
          }}
        />
      )}

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

      {showSuccessDialog && checkedInGuest && (
        <CheckInSuccessDialog
          guest={checkedInGuest}
          event={selectedEvent || events.find(e => e.id === checkedInGuest.event_id)}
          onClose={() => {
            setShowSuccessDialog(false);
            setCheckedInGuest(null);
          }}
        />
      )}
    </div>
  );
}

export default VenueDashboard;
