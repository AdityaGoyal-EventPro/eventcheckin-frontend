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
  
  getById: (eventId) =>
    api.get(`/api/events/${eventId}`),
  
  softDelete: (eventId, deletedBy) =>
    api.patch(`/api/events/${eventId}/delete`, { deleted_by: deletedBy }),
  
  hardDelete: (eventId) =>
    api.delete(`/api/events/${eventId}`),
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

// Invites API
export const invitesAPI = {
  create: (inviteData) =>
    api.post('/api/invites/create', inviteData),
  
  getAll: () =>
    api.get('/api/invites'),
  
  verify: (token) =>
    api.get(`/api/invites/verify/${token}`),
  
  accept: (token, password) =>
    api.post('/api/invites/accept', { token, password }),
  
  revoke: (inviteId) =>
    api.post(`/api/invites/revoke/${inviteId}`),
};

// Guests API
export const guestsAPI = {
  create: (guestData) => 
    api.post('/api/guests', guestData),
  
  getByEvent: (eventId) => 
    api.get(`/api/guests/event/${eventId}`),
  
  checkIn: (guestId, scannerName) => 
    api.post(`/api/guests/${guestId}/checkin`, { scanner_name: scannerName }),
  
  update: (guestId, guestData) =>
    api.patch(`/api/guests/${guestId}`, guestData),
  
  delete: (guestId) =>
    api.delete(`/api/guests/${guestId}`),
};

// Invitations API
export const invitationsAPI = {
  sendBulk: (eventId, channels) => 
    api.post('/api/invitations/send', { event_id: eventId, channels }),
  
  resend: (guestId, channels) => 
    api.post(`/api/invitations/resend/${guestId}`, { channels }),
};

export default api;
