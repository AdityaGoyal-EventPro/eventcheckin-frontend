import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://eventcheckin-backend-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/api/auth/login', { email, password }),
  
  signup: (userData) => 
    api.post('/api/auth/signup', userData),
};

// Events API
export const eventsAPI = {
  create: (eventData) => 
    api.post('/api/events', eventData),
  
  getAll: () => 
    api.get('/api/events'),
  
  getByHost: (hostId) => 
    api.get(`/api/events/host/${hostId}`),
  
  getByVenue: (venueId) => 
    api.get(`/api/events/venue/${venueId}`),
};

// Venues API
export const venuesAPI = {
  getAll: () =>
    api.get('/api/venues'),
  
  getById: (venueId) =>
    api.get(`/api/venues/${venueId}`),
  
  requestVenue: (venueData) =>
    api.post('/api/venues/request', venueData),
};

// Guests API
export const guestsAPI = {
  create: (guestData) => 
    api.post('/api/guests', guestData),
  
  getByEvent: (eventId) => 
    api.get(`/api/guests/event/${eventId}`),
  
  checkIn: (guestId, scannerName) => 
    api.post(`/api/guests/${guestId}/checkin`, { scanner_name: scannerName }),
};

// Invitations API
export const invitationsAPI = {
  sendBulk: (eventId, channels) => 
    api.post('/api/invitations/send', { event_id: eventId, channels }),
  
  resend: (guestId, channels) => 
    api.post(`/api/invitations/resend/${guestId}`, { channels }),
};

export default api;
