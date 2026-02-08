import AdminDashboard from './components/AdminDashboard';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EventDetails from './components/EventDetails';
import VenueDashboard from './components/VenueDashboard';
import QRScanner from './components/QRScanner';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
          } 
        />

        {/* Dashboard Route */}
        <Route 
          path="/" 
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role === 'venue' ? (
              <VenueDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Dashboard user={user} onLogout={handleLogout} />
            )
          } 
        />

        {/* Event Details Route - CRITICAL: Must have :id parameter */}
        <Route 
          path="/event/:id" 
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : (
              <EventDetails user={user} />
            )
          } 
        />

        {/* QR Scanner Route */}
        <Route 
          path="/scan/:id" 
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : (
              <QRScanner user={user} />
            )
          } 
        />
{/* Admin Route - Only for admin users */}
<Route 
  path="/admin" 
  element={
    !user ? (
      <Navigate to="/login" replace />
    ) : user.role === 'admin' ? (
      <AdminDashboard user={user} onLogout={handleLogout} />
    ) : (
      <Navigate to="/" replace />
    )
  } 
/>
        {/* Global QR Scanner (for venues) */}
        <Route 
          path="/scan" 
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : (
              <QRScanner user={user} />
            )
          } 
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
