import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, LogOut, RefreshCw, Calendar, Clock, Users, ChevronRight } from 'lucide-react';
import { eventsAPI } from '../api';
import WristbandAssignment from './WristbandAssignment';

function VenueDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadEvents = async () => {
    try {
      if (!user?.venue_id) {
        setEvents([]);
        setLoading(false);
        return;
      }
      const response = await eventsAPI.getByVenue(user.venue_id);
      setEvents(response.data.events || []);
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

  const handleWristbandAssignment = async (eventId, colorName) => {
    try {
      const response = await fetch(`https://eventcheckin-backend-production.up.railway.app/api/events/${eventId}/wristband`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wristband_color: colorName.toLowerCase() })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update wristband');
      }
      
      await loadEvents();
    } catch (error) {
      console.error('Error assigning wristband:', error);
      alert(`Failed to assign wristband color: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading events...</p>
        </div>
      </div>
    );
  }

  const totalGuests = events.reduce((sum, e) => sum + (e.total_guests || 0), 0);
  const totalCheckedIn = events.reduce((sum, e) => sum + (e.checked_in_count || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 safe-top">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gray-900 truncate">
                {user.venue_name || 'Venue'}
              </h1>
              <p className="text-xs text-gray-500">
                {events.length} event{events.length !== 1 ? 's' : ''} • {totalGuests} guests
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={handleRefresh} disabled={refreshing} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <RefreshCw className={`w-5 h-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <LogOut className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-gray-900">{totalGuests}</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wide">Total</div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-green-600">{totalCheckedIn}</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wide">Checked In</div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-amber-600">{totalGuests - totalCheckedIn}</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wide">Pending</div>
          </div>
        </div>

        {/* Events */}
        {events.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Events</h3>
            <p className="text-sm text-gray-500">No events scheduled at {user.venue_name || 'your venue'} yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, i) => {
              const total = event.total_guests || 0;
              const checkedIn = event.checked_in_count || 0;
              const pending = total - checkedIn;
              const progress = Math.min((checkedIn / (total || 1)) * 100, 100);

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-slideUp"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Clickable area */}
                  <div
                    onClick={() => navigate(`/event/${event.id}`)}
                    className="p-4 cursor-pointer active:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base truncate">{event.name}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time_start}{event.time_end ? `-${event.time_end}` : ''}</span>
                          {event.host_name && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.host_name}</span>}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" />
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mb-2.5">
                      <div>
                        <div className="text-lg font-bold text-gray-900">{total}</div>
                        <div className="text-[10px] text-gray-400 uppercase">Total</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">{checkedIn}</div>
                        <div className="text-[10px] text-gray-400 uppercase">In</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-amber-600">{pending}</div>
                        <div className="text-[10px] text-gray-400 uppercase">Pending</div>
                      </div>
                      <div className="ml-auto">
                        <div className="text-lg font-bold text-indigo-600">{Math.round(progress)}%</div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {/* Actions - not clickable for navigation */}
                  <div className="px-4 pb-3 pt-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex-1">
                      <WristbandAssignment event={event} onColorAssigned={handleWristbandAssignment} />
                    </div>
                    <button
                      onClick={() => navigate(`/scan/${event.id}`)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition"
                    >
                      <Camera className="w-4 h-4" />
                      <span className="hidden sm:inline">Scan</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Scan Button (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent safe-bottom z-30">
        <button
          onClick={() => navigate('/scan')}
          className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 active:scale-[0.98] transition shadow-lg shadow-indigo-200"
        >
          <Camera className="w-6 h-6" />
          <span className="text-lg">Scan QR Code</span>
        </button>
      </div>
    </div>
  );
}

export default VenueDashboard;
