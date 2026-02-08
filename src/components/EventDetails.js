import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, guestsAPI } from '../api';
import GuestListMobile from './GuestListMobile';
import EditGuestModal from './EditGuestModal';
import CheckInSuccessDialog from './CheckInSuccessDialog';

function EventDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showEditGuest, setShowEditGuest] = useState(false);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [checkedInGuest, setCheckedInGuest] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load both in parallel
      const [eventResponse, guestsResponse] = await Promise.all([
        eventsAPI.getById(id),
        guestsAPI.getByEvent(id)
      ]);

      if (eventResponse.data && eventResponse.data.event) {
        setEvent(eventResponse.data.event);
      } else {
        setError('Event not found');
      }

      setGuests(guestsResponse.data.guests || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async (guest) => {
    try {
      await guestsAPI.checkIn(guest.id);
      setCheckedInGuest(guest);
      setShowSuccessDialog(true);
      setShowManualSearch(false); // Close search modal
      loadData(); // Reload to update counts
    } catch (error) {
      alert('Check-in failed');
    }
  };

  const handleEditGuest = (guest) => {
    setSelectedGuest(guest);
    setShowEditGuest(true);
  };

  const handleDeleteGuest = async (guestId) => {
    if (!window.confirm('Remove this guest?')) return;
    
    try {
      await guestsAPI.delete(guestId);
      loadData();
    } catch (error) {
      alert('Failed to delete guest');
    }
  };

  const handleDeleteEvent = async () => {
    setDeleting(true);
    try {
      await eventsAPI.softDelete(id, user.role);
      alert('Event deleted');
      navigate('/');
    } catch (error) {
      alert('Failed to delete event');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isHost = user.role === 'host';
  const stats = {
    total: guests.length,
    checkedIn: guests.filter(g => g.checked_in).length,
    vip: guests.filter(g => g.category === 'VIP').length,
    walkIns: guests.filter(g => g.is_walk_in).length
  };

  // LOADING STATE - Show spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  // ERROR STATE - Show error
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This event doesn\'t exist or you don\'t have access to it.'}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary w-full">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // SUCCESS STATE - Show event
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => navigate('/')} className="btn btn-ghost btn-sm">
            ← Back
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger btn-sm">
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Event Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-indigo-100">
            <span>📅 {event.date}</span>
            <span>🕐 {event.time_start} - {event.time_end}</span>
            <span>📍 {event.venue_name}</span>
            {event.host_name && <span>👤 {event.host_name}</span>}
          </div>
        </div>

        {/* Guest Management - Host Only */}
        {isHost && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Guest Management</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button onClick={() => setShowAddGuest(true)} className="btn btn-primary btn-md">
                ➕ Add Guest
              </button>
              <button onClick={() => setShowImportCSV(true)} className="btn btn-secondary btn-md">
                📤 Import CSV
              </button>
              <button onClick={() => alert('Email invitations feature coming soon!')} className="btn btn-secondary btn-md">
                ✉️ Send Invitations
              </button>
            </div>
          </div>
        )}

        {/* Check-In Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Check-In</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button 
              onClick={() => {
                console.log('Navigating to QR scanner for event:', id);
                navigate(`/scan/${id}`);
              }} 
              className="btn btn-success btn-md"
            >
              📷 Scan QR
            </button>
            <button onClick={() => setShowManualSearch(true)} className="btn btn-secondary btn-md">
              🔍 Manual Search
            </button>
            <button onClick={() => setShowWalkIn(true)} className="btn btn-warning btn-md">
              🚶 Walk-In
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-indigo-600">{stats.total}</div>
            <div className="text-sm text-gray-600 mt-1">Total</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.checkedIn}</div>
            <div className="text-sm text-gray-600 mt-1">Checked In</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.vip}</div>
            <div className="text-sm text-gray-600 mt-1">VIP</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-amber-600">{stats.walkIns}</div>
            <div className="text-sm text-gray-600 mt-1">Walk-Ins</div>
          </div>
        </div>

        {/* Guest List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Guest List ({guests.length})</h2>
          </div>
          <GuestListMobile
            guests={guests}
            onCheckIn={handleManualCheckIn}
            onEdit={handleEditGuest}
            onDelete={handleDeleteGuest}
          />
        </div>
      </div>

      {/* ALL MODALS */}
      
      {showAddGuest && (
        <AddGuestModal
          eventId={id}
          onClose={() => setShowAddGuest(false)}
          onSuccess={() => {
            setShowAddGuest(false);
            loadData();
          }}
        />
      )}

      {showImportCSV && (
        <ImportCSVModal
          eventId={id}
          onClose={() => setShowImportCSV(false)}
          onSuccess={() => {
            setShowImportCSV(false);
            loadData();
          }}
        />
      )}

      {showManualSearch && (
        <ManualSearchModal
          guests={guests}
          onClose={() => setShowManualSearch(false)}
          onCheckIn={handleManualCheckIn}
        />
      )}

      {showWalkIn && (
        <WalkInModal
          eventId={id}
          onClose={() => setShowWalkIn(false)}
          onSuccess={(newGuest) => {
            setShowWalkIn(false);
            setCheckedInGuest(newGuest);
            setShowSuccessDialog(true);
            loadData();
          }}
        />
      )}

      {showEditGuest && selectedGuest && (
        <EditGuestModal
          guest={selectedGuest}
          onClose={() => {
            setShowEditGuest(false);
            setSelectedGuest(null);
          }}
          onSave={() => {
            setShowEditGuest(false);
            setSelectedGuest(null);
            loadData();
          }}
        />
      )}

      {showSuccessDialog && checkedInGuest && (
        <CheckInSuccessDialog
          guest={checkedInGuest}
          event={event}
          onClose={() => {
            setShowSuccessDialog(false);
            setCheckedInGuest(null);
          }}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Delete Event?</h3>
            <p className="text-gray-600 mb-6">This will permanently delete <strong>{event.name}</strong> and all guest data.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleDeleteEvent} className="btn btn-danger flex-1" disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// ADD GUEST MODAL
// ============================================
function AddGuestModal({ eventId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'General',
    plus_ones: 0
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await guestsAPI.create({
        ...formData,
        event_id: eventId
      });
      onSuccess();
    } catch (error) {
      alert('Failed to add guest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Add Guest</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              className="w-full px-4 py-3 border rounded-lg"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg"
              placeholder="+1234567890"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg"
            >
              <option value="General">General</option>
              <option value="VIP">VIP</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Plus Ones</label>
            <input
              type="number"
              min="0"
              value={formData.plus_ones}
              onChange={(e) => setFormData({...formData, plus_ones: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
              {loading ? 'Adding...' : 'Add Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// IMPORT CSV MODAL
// ============================================
function ImportCSVModal({ eventId, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const rows = text.split('\n').filter(row => row.trim());
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        
        let imported = 0;
        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].split(',').map(v => v.trim());
          const guest = {
            event_id: eventId,
            name: values[headers.indexOf('name')] || '',
            email: values[headers.indexOf('email')] || '',
            phone: values[headers.indexOf('phone')] || '',
            category: values[headers.indexOf('category')] || 'General'
          };
          
          if (guest.name) {
            await guestsAPI.create(guest);
            imported++;
          }
        }
        
        alert(`${imported} guests imported successfully!`);
        onSuccess();
      } catch (error) {
        alert('Failed to import CSV');
      } finally {
        setLoading(false);
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4">Import CSV</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm">
          <p className="font-medium mb-2">CSV Format:</p>
          <code className="text-xs">name,email,phone,category</code>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full px-4 py-3 border rounded-lg"
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1" disabled={!file || loading}>
              {loading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// MANUAL SEARCH MODAL
// ============================================
function ManualSearchModal({ guests, onClose, onCheckIn }) {
  const [search, setSearch] = useState('');
  
  const filtered = guests.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.email?.toLowerCase().includes(search.toLowerCase()) ||
    g.phone?.includes(search)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold mb-4">Manual Search & Check-In</h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full px-4 py-3 border rounded-lg"
            autoFocus
          />
        </div>
        <div className="overflow-y-auto max-h-96 p-6">
          {filtered.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No guests found</p>
          ) : (
            <div className="space-y-3">
              {filtered.map(guest => (
                <div key={guest.id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <div className="font-semibold">{guest.name}</div>
                    <div className="text-sm text-gray-600">{guest.email}</div>
                    {guest.checked_in && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-1 inline-block">
                        ✓ Checked In
                      </span>
                    )}
                  </div>
                  {!guest.checked_in && (
                    <button
                      onClick={() => onCheckIn(guest)}
                      className="btn btn-success btn-sm"
                    >
                      Check In
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 border-t">
          <button onClick={onClose} className="btn btn-secondary w-full">Close</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// WALK-IN MODAL
// ============================================
function WalkInModal({ eventId, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await guestsAPI.create({
        event_id: eventId,
        name: name,
        is_walk_in: true,
        category: 'General'
      });
      
      const newGuest = response.data.guest;
      await guestsAPI.checkIn(newGuest.id);
      
      // Pass the guest back for success dialog
      onSuccess({ ...newGuest, checked_in: true });
    } catch (error) {
      alert('Failed to add walk-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4">Walk-In Guest</h2>
        <p className="text-sm text-gray-600 mb-4">Add and check in a guest who arrived without an invitation.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Guest Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg"
              placeholder="Enter name..."
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
              {loading ? 'Processing...' : 'Add & Check In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventDetails;
