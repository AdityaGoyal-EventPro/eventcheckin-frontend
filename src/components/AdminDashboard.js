import React, { useState, useEffect } from 'react';
import { Users, Building2, Calendar, CheckCircle, Activity, Plus } from 'lucide-react';
import VenueManagement from './VenueManagement';
import UserManagement from './UserManagement';

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHosts: 0,
    totalVenues: 0,
    totalVenueLocations: 0,
    totalEvents: 0,
    totalCheckins: 0,
    upcomingEvents: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadRecentActivity();
    const interval = setInterval(() => {
      loadStats();
      loadRecentActivity();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/stats`, {
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role
        }
      });
      const data = await response.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/activity`, {
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role
        }
      });
      const data = await response.json();
      if (data.activity) {
        setRecentActivity(data.activity);
      }
    } catch (error) {
      console.error('Error loading activity:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-1">👑 Admin Dashboard</h1>
              <p className="text-indigo-100">Welcome back, {user.name}</p>
            </div>
            <button
              onClick={onLogout}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('venues')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'venues'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Venues
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'users'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Users
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} recentActivity={recentActivity} />
        )}
        {activeTab === 'venues' && (
          <VenueManagement user={user} />
        )}
        {activeTab === 'users' && (
          <UserManagement user={user} />
        )}
      </div>
    </div>
  );
}

// ============================================
// OVERVIEW TAB
// ============================================
function OverviewTab({ stats, recentActivity }) {
  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      detail: `${stats.totalHosts} hosts, ${stats.totalVenues} venues`
    },
    {
      label: 'Venue Locations',
      value: stats.totalVenueLocations,
      icon: Building2,
      color: 'bg-purple-500',
      detail: 'Active venues'
    },
    {
      label: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'bg-indigo-500',
      detail: `${stats.upcomingEvents} upcoming`
    },
    {
      label: 'Check-Ins',
      value: stats.totalCheckins,
      icon: CheckCircle,
      color: 'bg-green-500',
      detail: 'All time'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">System Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-gray-600 mb-1">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white border-2 border-gray-200 hover:border-indigo-500 rounded-xl p-6 text-left transition group">
            <div className="w-12 h-12 bg-indigo-100 group-hover:bg-indigo-600 rounded-lg flex items-center justify-center mb-4 transition">
              <Plus className="w-6 h-6 text-indigo-600 group-hover:text-white transition" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Create Venue</h3>
            <p className="text-sm text-gray-600">Add a new venue location</p>
          </button>

          <button className="bg-white border-2 border-gray-200 hover:border-indigo-500 rounded-xl p-6 text-left transition group">
            <div className="w-12 h-12 bg-purple-100 group-hover:bg-purple-600 rounded-lg flex items-center justify-center mb-4 transition">
              <Users className="w-6 h-6 text-purple-600 group-hover:text-white transition" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Manage Users</h3>
            <p className="text-sm text-gray-600">View and edit user accounts</p>
          </button>

          <button className="bg-white border-2 border-gray-200 hover:border-indigo-500 rounded-xl p-6 text-left transition group">
            <div className="w-12 h-12 bg-green-100 group-hover:bg-green-600 rounded-lg flex items-center justify-center mb-4 transition">
              <Activity className="w-6 h-6 text-green-600 group-hover:text-white transition" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">View Reports</h3>
            <p className="text-sm text-gray-600">Analytics and insights</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
