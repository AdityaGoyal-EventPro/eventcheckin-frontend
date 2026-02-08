import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Search, Download, RefreshCw, Check, X } from 'lucide-react';
import { eventsAPI, guestsAPI } from '../api';

function EventDetailsWithVenueFeatures({ user }) {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // NEW: Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'checked-in', 'pending'
  const [checkingIn, setCheckingIn] = useState(null); // ID of guest being checked in

  useEffect(() => {
    loadEventData();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadEventData(true); // Silent refresh
    }, 10000);
    
    return () => clearInterval(interval);
  }, [eventId]);

  const loadEventData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      // Load event details
      const eventResponse = await eventsAPI.getById(eventId);
      setEvent(eventResponse.data.event);

      // Load guests
      const guestsResponse = await guestsAPI.getByEvent(eventId);
      setGuests(guestsResponse.data.guests || []);
    } catch (error) {
      console.error('Error loading event data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEventData();
  };

  // NEW: Manual check-in function
  const handleManualCheckIn = async (guestId, guestName) => {
    if (!window.confirm(`Check in ${guestName}?`)) {
      return;
    }

    setCheckingIn(guestId);
    
    try {
      await guestsAPI.checkIn(guestId);
      
      // Reload guests to show updated status
      const guestsResponse = await guestsAPI.getByEvent(eventId);
      setGuests(guestsResponse.data.guests || []);
      
      // Optional: Show success message
      console.log(`✅ ${guestName} checked in successfully`);
    } catch (error) {
      console.error('Error checking in guest:', error);
      alert(`Failed to check in ${guestName}. Please try again.`);
    } finally {
      setCheckingIn(null);
    }
  };

  // NEW: Filter and search logic
  const getFilteredGuests = () => {
    let filtered = guests;

    // Apply status filter
    if (statusFilter === 'checked-in') {
      filtered = filtered.filter(g => g.checked_in);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(g => !g.checked_in);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.email && g.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (g.phone && g.phone.includes(searchTerm))
      );
    }

    return filtered;
  };

  const filteredGuests = getFilteredGuests();

  // Stats
  const totalGuests = guests.length;
  const checkedInCount = guests.filter(g => g.checked_in).length;
  const pendingCount = totalGuests - checkedInCount;

  if (loading && !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
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
                onClick={() => navigate(`/scan/${eventId}`)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <Camera className="w-5 h-5" />
                <span>Scan QR</span>
              </button>
            </div>
          </div>

          {/* Event Info */}
          {event && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>📅 {event.date}</span>
                <span>🕐 {event.time_start}{event.time_end ? ` - ${event.time_end}` : ''}</span>
                <span>📍 {event.venue_name}</span>
                {event.host_name && <span>👤 {event.host_name}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">{totalGuests}</div>
            <div className="text-sm text-gray-600">Total Guests</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600">{checkedInCount}</div>
            <div className="text-sm text-gray-600">Checked In</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-orange-600">{pendingCount}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>

        {/* NEW: Search and Filter Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Guests ({totalGuests})</option>
              <option value="checked-in">✅ Checked In ({checkedInCount})</option>
              <option value="pending">⏳ Pending ({pendingCount})</option>
            </select>
          </div>
          
          {/* Results count */}
          {(searchTerm || statusFilter !== 'all') && (
            <div className="mt-3 text-sm text-gray-600">
              Showing {filteredGuests.length} of {totalGuests} guests
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          )}
        </div>

        {/* Guest List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Guest List
            </h2>
          </div>

          {filteredGuests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {searchTerm || statusFilter !== 'all' ? (
                <>
                  <p className="text-lg mb-2">No guests found</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <p>No guests yet</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredGuests.map((guest) => (
                <div
                  key={guest.id}
                  className={`p-4 hover:bg-gray-50 transition ${
                    guest.checked_in ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Guest Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{guest.name}</h3>
                        {guest.checked_in && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <Check className="w-3 h-3" />
                            Checked In
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        {guest.email && <div>📧 {guest.email}</div>}
                        {guest.phone && <div>📱 {guest.phone}</div>}
                        {guest.checked_in && guest.checked_in_time && (
                          <div className="text-green-600">
                            ✓ {new Date(guest.checked_in_time).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* NEW: Manual Check-In Button */}
                    {!guest.checked_in && (
                      <button
                        onClick={() => handleManualCheckIn(guest.id, guest.name)}
                        disabled={checkingIn === guest.id}
                        className="ml-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {checkingIn === guest.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Checking in...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Check In</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetailsWithVenueFeatures;
