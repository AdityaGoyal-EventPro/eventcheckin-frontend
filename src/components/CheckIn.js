import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { guestsAPI } from '../api';

function CheckIn({ user, onLogout }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [guests, setGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuests();
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

  const handleCheckIn = async (guestId) => {
    try {
      await guestsAPI.checkIn(guestId, user.name);
      setCheckInSuccess(true);
      
      // Reload guests to update the list
      await loadGuests();
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCheckInSuccess(false);
        setSelectedGuest(null);
        setSearchTerm('');
      }, 2000);
    } catch (error) {
      alert('Error checking in guest');
    }
  };

  const filteredGuests = guests.filter(guest =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.phone?.includes(searchTerm)
  );

  const stats = {
    total: guests.length,
    checkedIn: guests.filter(g => g.checked_in).length,
    pending: guests.filter(g => !g.checked_in).length
  };

  return (
    <div className="checkin-container" style={{ minHeight: '100vh', paddingTop: '20px' }}>
      <div className="dashboard-header">
        <button className="btn-secondary" onClick={() => navigate(`/event/${eventId}`)}>
          ← Back to Event
        </button>
        
        <h1 style={{ marginTop: '20px' }}>Check-In Mode</h1>
        
        <div className="event-stats" style={{ marginTop: '20px' }}>
          <div className="stat">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat">
            <div className="stat-value" style={{ color: '#4caf50' }}>{stats.checkedIn}</div>
            <div className="stat-label">Checked In</div>
          </div>
          <div className="stat">
            <div className="stat-value" style={{ color: '#ff9800' }}>{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      </div>

      <div className="scan-area" style={{ marginTop: '30px' }}>
        {checkInSuccess ? (
          <div className="success-animation">
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>✅</div>
            <h2 style={{ color: '#4caf50' }}>Check-In Successful!</h2>
            <p style={{ color: '#666', marginTop: '10px' }}>
              {selectedGuest?.name} has been checked in
            </p>
          </div>
        ) : (
          <>
            <div className="scan-icon">📱</div>
            <h2>Search Guest to Check In</h2>
            
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                marginTop: '20px',
                marginBottom: '20px'
              }}
              autoFocus
            />

            {loading ? (
              <div className="spinner"></div>
            ) : searchTerm && filteredGuests.length > 0 ? (
              <div style={{ marginTop: '20px' }}>
                {filteredGuests.map(guest => (
                  <div
                    key={guest.id}
                    style={{
                      background: guest.checked_in ? '#f0f0f0' : '#fff',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '12px',
                      cursor: guest.checked_in ? 'not-allowed' : 'pointer',
                      opacity: guest.checked_in ? 0.6 : 1,
                      textAlign: 'left'
                    }}
                    onClick={() => !guest.checked_in && handleCheckIn(guest.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ marginBottom: '8px' }}>{guest.name}</h3>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          {guest.email && <div>📧 {guest.email}</div>}
                          {guest.phone && <div>📱 {guest.phone}</div>}
                          <div style={{ marginTop: '8px' }}>
                            <span className={`badge ${guest.category === 'VIP' ? 'badge-vip' : ''}`}>
                              {guest.category}
                            </span>
                            {guest.plus_ones > 0 && (
                              <span style={{ marginLeft: '8px', color: '#666' }}>
                                +{guest.plus_ones} guests
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        {guest.checked_in ? (
                          <div style={{ textAlign: 'right' }}>
                            <div className="badge badge-success">✓ Checked In</div>
                            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                              {guest.checked_in_time}
                            </div>
                          </div>
                        ) : (
                          <button 
                            className="btn-primary"
                            style={{ padding: '10px 20px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckIn(guest.id);
                            }}
                          >
                            Check In
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm ? (
              <p style={{ color: '#999', marginTop: '20px' }}>
                No guests found matching "{searchTerm}"
              </p>
            ) : null}

            <div style={{ marginTop: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '12px' }}>Quick Instructions:</h3>
              <ol style={{ textAlign: 'left', color: '#666', paddingLeft: '20px' }}>
                <li>Search for guest by name, email, or phone</li>
                <li>Click on the guest card or "Check In" button</li>
                <li>Confirmation will appear automatically</li>
                <li>VIP guests are highlighted in purple</li>
              </ol>
            </div>
          </>
        )}
      </div>

      {/* Quick Stats at Bottom */}
      <div style={{ marginTop: '40px', textAlign: 'center', color: 'white' }}>
        <p style={{ fontSize: '14px', opacity: 0.8 }}>
          Progress: {stats.checkedIn} of {stats.total} guests checked in 
          ({stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%)
        </p>
      </div>
    </div>
  );
}

export default CheckIn;
```

4. **Click:** "Commit changes"

---

## 🎉 CONGRATULATIONS! BATCH 4 COMPLETE!

You've successfully created ALL the files! Your repository now has:
```
eventcheckin-frontend/
├── public/
│   └── index.html ✅
├── src/
│   ├── components/
│   │   ├── CheckIn.js ✅
│   │   ├── Dashboard.js ✅
│   │   ├── EventDetails.js ✅
│   │   ├── Login.js ✅
│   │   └── Signup.js ✅
│   ├── api.js ✅
│   ├── App.css ✅
│   ├── App.js ✅
│   └── index.js ✅
├── .env ✅
├── .gitignore ✅
├── package.json ✅
└── vercel.json ✅
