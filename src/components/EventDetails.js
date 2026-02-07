import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { guestsAPI, invitationsAPI, eventsAPI } from '../api';
import { QRCodeSVG } from 'qrcode.react';
import CSVImport from './CSVImport';
import WalkInModal from './WalkInModal';
import QRScanner from './QRScanner';
import SendInvitationsModal from './SendInvitationsModal';
import CheckInSuccessDialog from './CheckInSuccessDialog';
import GuestListMobile from './GuestListMobile';
import EditGuestModal from './EditGuestModal';

function EventDetails({ user, onLogout }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [checkedInGuest, setCheckedInGuest] = useState(null);
  const [event, setEvent] = useState(null);
  const [editingGuest, setEditingGuest] = useState(null);

  useEffect(() => {
    loadGuests();
    loadEventData();
  }, [eventId]);

  const loadGuests = async () => {
    try {
      const response = await guestsAPI.getByEvent(eventId);
      setGuests(response.data.guests);
    } catch (error) {
      console.error('Error loading guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEventData = async () => {
    try {
      const response = await eventsAPI.getById(eventId);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Error loading event:', error);
    }
  };

  const handleCheckIn = async (guestId) => {
    try {
      const guest = guests.find(g => g.id === guestId);
      await guestsAPI.checkIn(guestId, 'Manual Check-In');
      
      if (guest) {
        setCheckedInGuest(guest);
        setShowSuccessDialog(true);
      }
      
      await loadGuests();
    } catch (error) {
      console.error('Error checking in guest:', error);
      alert('Failed to check in guest');
    }
  };

  const handleEditGuest = async (guestId, guestData) => {
    try {
      await guestsAPI.update(guestId, guestData);
      await loadGuests();
    } catch (error) {
      console.error('Error updating guest:', error);
      alert('Failed to update guest');
    }
  };

  const handleDeleteGuest = async (guestId) => {
    try {
      await guestsAPI.delete(guestId);
      await loadGuests();
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('Failed to delete guest');
    }
  };

  const stats = {
    total: guests.length,
    checkedIn: guests.filter(g => g.checked_in).length,
    vip: guests.filter(g => g.category === 'VIP').length,
    walkin: guests.filter(g => g.is_walkin).length
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        
        <h1 style={{ marginTop: '20px' }}>Event Guest Management</h1>
        
        <div className="header-actions">
          {/* Host-only actions */}
          {user.role === 'host' && (
            <>
              <button className="btn-primary" onClick={() => setShowAddGuest(true)}>
                ➕ Add Guest
              </button>
              <button className="btn-primary" onClick={() => setShowCSVImport(true)}>
                📄 Import CSV
              </button>
              <button className="btn-primary" onClick={() => setShowInviteModal(true)}>
                📧 Send Invitations
              </button>
            </>
          )}
          
          {/* Everyone can use these */}
          <button className="btn-primary" style={{background: '#eab308'}} onClick={() => setShowWalkIn(true)}>
            🚶 Walk-In
          </button>
          <button className="btn-secondary" onClick={() => setShowQRScanner(true)}>
            📱 Scan QR
          </button>
          <button className="btn-secondary" onClick={() => navigate(`/checkin/${eventId}`)}>
            🔍 Manual Search
          </button>
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        {/* Stats */}
        <div className="event-stats" style={{ marginTop: '30px' }}>
          <div className="stat">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Guests</div>
          </div>
          <div className="stat">
            <div className="stat-value">{stats.checkedIn}</div>
            <div className="stat-label">Checked In</div>
          </div>
          <div className="stat">
            <div className="stat-value">{stats.vip}</div>
            <div className="stat-label">VIP</div>
          </div>
          <div className="stat">
            <div className="stat-value">{stats.walkin}</div>
            <div className="stat-label">Walk-Ins</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'white', padding: '40px' }}>
          <div className="spinner"></div>
          <p>Loading guests...</p>
        </div>
      ) : (
        <div className="guest-list" style={{ padding: '0 16px' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>Guest List</h2>
          
          <GuestListMobile
            guests={guests}
            onViewQR={(guest) => setSelectedGuest(guest)}
            onCheckIn={handleCheckIn}
            onEdit={(guest) => setEditingGuest(guest)}
            onDelete={handleDeleteGuest}
          />
        </div>
      )}

      {showAddGuest && (
        <AddGuestModal 
          eventId={eventId}
          onClose={() => setShowAddGuest(false)}
          onSuccess={() => {
            setShowAddGuest(false);
            loadGuests();
          }}
        />
      )}

      {showInviteModal && (
        <SendInvitationsModal
          eventId={eventId}
          eventName={event?.name || 'Event'}
          guestCount={guests.length}
          onClose={() => setShowInviteModal(false)}
          onSuccess={loadGuests}
        />
      )}

      {selectedGuest && (
        <QRModal 
          guest={selectedGuest}
          onClose={() => setSelectedGuest(null)}
        />
      )}

      {showCSVImport && (
        <CSVImport
          eventId={eventId}
          onImportComplete={loadGuests}
          onClose={() => setShowCSVImport(false)}
        />
      )}

      {showWalkIn && (
        <WalkInModal
          eventId={eventId}
          eventName="Current Event"
          onClose={() => setShowWalkIn(false)}
          onSuccess={loadGuests}
        />
      )}

      {showQRScanner && (
        <QRScanner
          availableGuests={guests.filter(g => !g.checked_in)}
          onScan={(qrData) => {
            console.log('EventDetails: Scanned QR data:', qrData);
            console.log('EventDetails: Current event ID:', eventId);
            console.log('EventDetails: QR event_id:', qrData.event_id);
            
            // VALIDATE: Guest must belong to THIS event
            // Compare as strings to handle type differences
            const scannedEventId = qrData.event_id ? qrData.event_id.toString() : null;
            const currentEventId = eventId ? eventId.toString() : null;
            
            if (scannedEventId && currentEventId && scannedEventId !== currentEventId) {
              alert(`❌ WRONG EVENT!\n\nThis guest belongs to Event ${scannedEventId}\nYou are scanning for Event ${currentEventId}\n\nPlease scan guests from this event only.`);
              return;
            }
            
            // Find guest in THIS event's guest list
            const guest = guests.find(g => g.id.toString() === qrData.guest_id.toString());
            
            if (guest) {
              console.log('✅ EventDetails: Found guest in this event:', guest.name);
              guestsAPI.checkIn(guest.id, 'QR Scanner').then(() => {
                setCheckedInGuest(guest);
                setShowSuccessDialog(true);
                loadGuests();
                setShowQRScanner(false);
              });
            } else {
              console.error('❌ EventDetails: Guest not found in this event');
              alert(`❌ Guest Not Found!\n\nGuest ID ${qrData.guest_id} is not in this event's guest list.`);
            }
          }}
          onClose={() => setShowQRScanner(false)}
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

      {editingGuest && (
        <EditGuestModal
          guest={editingGuest}
          onClose={() => setEditingGuest(null)}
          onSave={handleEditGuest}
        />
      )}
    </div>
  );
}

function AddGuestModal({ eventId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    event_id: eventId,
    name: '',
    email: '',
    phone: '',
    category: 'General',
    plus_ones: 0,
    is_walkin: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await guestsAPI.create(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add guest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Guest</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 1234567890"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="General">General</option>
              <option value="VIP">VIP</option>
              <option value="Press">Press</option>
              <option value="Staff">Staff</option>
            </select>
          </div>

          <div className="form-group">
            <label>Plus Ones</label>
            <input
              type="number"
              name="plus_ones"
              value={formData.plus_ones}
              onChange={handleChange}
              min="0"
              max="10"
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Guest'}
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

function InviteModal({ eventId, onClose }) {
  const [channels, setChannels] = useState({
    email: true,
    sms: false,
    whatsapp: false
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSend = async () => {
    setLoading(true);
    try {
      const response = await invitationsAPI.sendBulk(eventId, channels);
      setResult(response.data.results);
    } catch (error) {
      alert('Error sending invitations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Send Invitations</h2>
        
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Select channels to send invitations to all guests:
        </p>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={channels.email}
              onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
            />
            📧 Email
          </label>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={channels.sms}
              onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
            />
            📱 SMS
          </label>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={channels.whatsapp}
              onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
            />
            💬 WhatsApp
          </label>
        </div>

        {result && (
          <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
            <h3>Results:</h3>
            {result.email && <p>Email: {result.email.sent} sent, {result.email.failed} failed</p>}
            {result.sms && <p>SMS: {result.sms.sent} sent, {result.sms.failed} failed</p>}
            {result.whatsapp && <p>WhatsApp: {result.whatsapp.sent} sent, {result.whatsapp.failed} failed</p>}
          </div>
        )}

        <div className="modal-actions">
          <button 
            className="btn-primary" 
            onClick={handleSend} 
            disabled={loading || (!channels.email && !channels.sms && !channels.whatsapp)}
          >
            {loading ? 'Sending...' : 'Send Invitations'}
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function QRModal({ guest, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{guest.name}</h2>
        
        <div className="qr-display">
          <QRCodeSVG value={guest.qr_code} size={256} />
          <p style={{ marginTop: '20px', color: '#666' }}>
            Show this QR code at check-in
          </p>
        </div>

        <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
          <p><strong>Email:</strong> {guest.email || 'Not provided'}</p>
          <p><strong>Phone:</strong> {guest.phone || 'Not provided'}</p>
          <p><strong>Category:</strong> {guest.category}</p>
          {guest.plus_ones > 0 && <p><strong>Plus Ones:</strong> +{guest.plus_ones}</p>}
        </div>

        <button className="btn-primary" onClick={onClose} style={{ marginTop: '20px' }}>
          Close
        </button>
      </div>
    </div>
  );
}

export default EventDetails;
