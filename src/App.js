import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginSelection from './components/LoginSelection';
import HostLogin from './components/HostLogin';
import VenueLogin from './components/VenueLogin';
import Login from './components/Login';
import Signup from './components/Signup';
import AcceptInvite from './components/AcceptInvite';
import Dashboard from './components/Dashboard';
import VenueDashboard from './components/VenueDashboard';
import EventDetails from './components/EventDetails';
import CheckIn from './components/CheckIn';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <LoginSelection />} 
          />
          <Route 
            path="/login/host" 
            element={user ? <Navigate to="/dashboard" /> : <HostLogin onLogin={handleLogin} />} 
          />
          <Route 
            path="/login/venue" 
            element={user ? <Navigate to="/dashboard" /> : <VenueLogin onLogin={handleLogin} />} 
              
          />
          <Route 
            path="/signup" 
            element={user ? <Navigate to="/dashboard" /> : <Signup onSignup={handleLogin} />} 
          />
          <Route 
            path="/invite/:token" 
            element={<AcceptInvite onLogin={handleLogin} />} 
          />
          <Route 
            path="/signup/host" 
            element={user ? <Navigate to="/dashboard" /> : <Signup onSignup={handleLogin} role="host" />} 
          />
          <Route 
            path="/signup/venue" 
            element={user ? <Navigate to="/dashboard" /> : <Signup onSignup={handleLogin} role="venue" />} 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? (
                user.role === 'venue' ? (
                  <VenueDashboard user={user} onLogout={handleLogout} />
                ) : (
                  <Dashboard user={user} onLogout={handleLogout} />
                )
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/venue-dashboard" 
            element={user ? <VenueDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/event/:eventId" 
            element={user ? <EventDetails user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/checkin/:eventId" 
            element={user ? <CheckIn user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
