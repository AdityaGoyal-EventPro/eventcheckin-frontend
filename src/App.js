import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EventDetails from './components/EventDetails';
import VenueDashboard from './components/VenueDashboard';
import QRScanner from './components/QRScanner';
import AdminDashboard from './components/AdminDashboard';
import PendingApproval from './components/PendingApproval';
import ResetPassword from './components/ResetPassword';  // ✅ ADDED

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('Loaded user from localStorage:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    console.log('User logged in:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    console.log('User logged out');
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

        {/* ✅ ADDED: Reset Password Route (Public - No auth required) */}
        <Route 
          path="/reset-password" 
          element={<ResetPassword />} 
        />

        {/* Dashboard Route - Role-based redirect */}
        <Route 
          path="/" 
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.status === 'pending' ? (
              <PendingApproval user={user} onLogout={handleLogout} />
            ) : user.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : user.role === 'venue' ? (
              <VenueDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Dashboard user={user} onLogout={handleLogout} />
            )
          } 
        />

        {/* Admin Dashboard - Admin only */}
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

        {/* Event Details Route */}
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
