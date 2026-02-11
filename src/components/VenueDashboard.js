import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, LogOut, RefreshCw, Calendar, Clock, Users, Check, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { eventsAPI } from '../api';
import WristbandAssignment from './WristbandAssignment';

// ─── Helper: Check if event is "Live" right now ───
function isEventLive(event) {
  if (!event.date || !event.time_start) return false;
  const now = new Date();
  const start = new Date(`${event.date}T${event.time_start}`);
  const end = event.time_end ? new Date(`${event.date}T${event.time_end}`) : new Date(`${event.date}T23:59`);
  return now >= start && now <= end;
}

// ─── Helper: Format date for display ───
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

// ─── Helper: Get today's date string (YYYY-MM-DD) ───
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Status Badge ───
function EventBadge({ event }) {
  // Cancelled by host (pre-event)
  if (event.cancelled_before_event && event.status === 'archived') {
    return (
      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full inline-flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Cancelled by Host
      </span>
    );
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
  return null;
}

// ─── Venue Event Card ───
function VenueEventCard({ event, onEventClick, onScanClick, onWristbandAssign }) {
  const isCancelled = event.cancelled_before_event && event.status === 'archived';
  const progress = event.total_guests > 0 
    ? Math.min(((event.checked_in_count || 0) / event.total_guests) * 100, 100) 
    : 0;

  return (
    <div
      onClick={() => !isCancelled && onEventClick(event.id)}
      className={`bg-white rounded-xl p-5 border cursor-pointer active:scale-[0.99] transition ${
        isCancelled 
          ? 'border-red-200 opacity-70 bg-red-50/30' 
          : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className={`text-lg font-bold flex-1 min-w-0 mr-2 truncate ${isCancelled ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
          {event.name}
        </h3>
        <EventBadge event={event} />
      </div>

      <div className="space-y-1.5 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          <span>{event.time_start}{event.time_end ? ` – ${event.time_end}` : ''}</span>
        </div>
        {event.host_name && (
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            <span>Host: {event.host_name}</span>
          </div>
        )}
      </div>

      {!isCancelled && (
        <>
          {/* Stats */}
          <div className="flex items-center gap-6 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-gray-900">{event.total_guests || 0}</span>
              <span className="text-xs text-gray-500">total</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-lg font-bold text-green-600">{event.checked_in_count || 0}</span>
              <span className="text-xs text-gray-500">in</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-orange-500">
                {(event.total_guests || 0) - (event.checked_in_count || 0)}
              </span>
              <span className="text-xs text-gray-500">pending</span>
            </div>
          </div>

          {/* Progress */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>

          {/* Wristband */}
          <div className="mb-3" onClick={(e) => e.stopPropagation()}>
            <WristbandAssignment event={event} onColorAssigned={onWristbandAssign} />
          </div>

          {/* Scan Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onScanClick(event.id); }}
            className="w-full bg-indigo-50 text-indigo-600 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <Camera className="w-4 h-4" />
            Scan for This Event
          </button>
        </>
      )}

      {isCancelled && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 mt-2">
          <p className="text-xs text-red-600">
            This event has been cancelled by the host. It will disappear from your dashboard shortly.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN VENUE DASHBOARD
// ============================================
function VenueDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [dateEvents, setDateEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [dateLoading, setDateLoading] = useState(false);

  useEffect(() => {
    loadEvents();
    // Trigger auto status update
    eventsAPI.autoUpdateStatus().catch(() => {});
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

  const loadEventsByDate = async (date) => {
    try {
      setDateLoading(true);
      const response = await eventsAPI.getByVenueDate(user.venue_id, date);
      setDateEvents(response.data.events || []);
    } catch (error) {
      console.error('Error loading date events:', error);
      setDateEvents([]);
    } finally {
      setDateLoading(false);
    }
  };

  // Load date events when tab switches or date changes
  useEffect(() => {
    if (activeTab === 'bydate') {
      loadEventsByDate(selectedDate);
    }
  }, [activeTab, selectedDate]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEvents();
    if (activeTab === 'bydate') loadEventsByDate(selectedDate);
  };

  const handleWristbandAssignment = async (eventId, colorName) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://eventcheckin-backend-production.up.railway.app';
      const response = await fetch(`${API_URL}/api/events/${eventId}/wristband`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wristband_color: colorName.toLowerCase() })
      });
      if (!response.ok) throw new Error('Failed');
      await loadEvents();
    } catch (error) {
      alert(`Failed to assign wristband: ${error.message}`);
    }
  };

  // ─── Filter events by tab ───
  const todayStr = getTodayStr();
  const todayEvents = events.filter(e => e.date === todayStr || (e.cancelled_before_event && e.status === 'archived'));
  
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
  const pastEvents = events.filter(e => {
    if (e.status !== 'completed') return false;
    const eventDate = new Date(e.date);
    return eventDate < new Date(todayStr) && eventDate >= fifteenDaysAgo;
  });

  const getDisplayEvents = () => {
    if (activeTab === 'today') return todayEvents;
    if (activeTab === 'past') return pastEvents;
    if (activeTab === 'bydate') return dateEvents;
    return [];
  };

  const displayEvents = getDisplayEvents();

  // ─── Date navigation helpers ───
  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading events...</p>
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
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {user.venue_name || 'Venue Dashboard'}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">{user.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleRefresh} disabled={refreshing} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <RefreshCw className={`w-5 h-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={onLogout} className="flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition text-sm">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Global Scan Button */}
        <button
          onClick={() => navigate('/scan')}
          className="w-full mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-5 rounded-xl shadow-lg flex items-center justify-center gap-3 active:scale-[0.99] transition"
        >
          <Camera className="w-7 h-7" />
          <span className="text-lg">Scan QR Code</span>
        </button>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
          {[
            { key: 'today', label: 'Today', count: todayEvents.length },
            { key: 'past', label: 'Past', count: pastEvents.length },
            { key: 'bydate', label: 'By Date' },
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
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1 text-xs ${activeTab === tab.key ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Date Picker (only for By Date tab) */}
        {activeTab === 'bydate' && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {selectedDate !== todayStr && (
                  <button
                    onClick={() => setSelectedDate(todayStr)}
                    className="text-xs text-indigo-600 font-medium px-3 py-1.5 bg-indigo-50 rounded-lg"
                  >
                    Today
                  </button>
                )}
              </div>
              <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              {formatDate(selectedDate)}
            </p>
          </div>
        )}

        {/* Events Grid */}
        {(activeTab === 'bydate' && dateLoading) ? (
          <div className="text-center py-12 text-sm text-gray-400">Loading events...</div>
        ) : displayEvents.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <div className="text-4xl mb-3">
              {activeTab === 'today' ? '🎉' : activeTab === 'past' ? '✅' : '📅'}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {activeTab === 'today' && 'No events today'}
              {activeTab === 'past' && 'No past events'}
              {activeTab === 'bydate' && `No events on ${formatDate(selectedDate)}`}
            </h3>
            <p className="text-sm text-gray-500">
              {activeTab === 'today' && 'Events scheduled for today will appear here'}
              {activeTab === 'past' && 'Completed events from the last 15 days'}
              {activeTab === 'bydate' && 'Try selecting a different date'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayEvents.map(event => (
              <VenueEventCard
                key={event.id}
                event={event}
                onEventClick={(id) => navigate(`/event/${id}`)}
                onScanClick={(id) => navigate(`/scan/${id}`)}
                onWristbandAssign={handleWristbandAssignment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VenueDashboard;
