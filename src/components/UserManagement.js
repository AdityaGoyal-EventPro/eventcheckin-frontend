import React, { useState, useEffect } from 'react';
import { Search, UserCircle, Shield, Building } from 'lucide-react';

function UserManagement({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role
        }
      });
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-role': user.role
        },
        body: JSON.stringify({ status: newStatus })
      });
      loadUsers();
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('Approve this user? They will receive an email notification and can access the system.')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ User approved! Email notification sent.');
        loadUsers();
      } else {
        alert('Failed to approve user');
      }
    } catch (error) {
      alert('Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    const reason = window.prompt('Reason for rejection (optional - will be sent to user):');
    
    if (reason === null) return; // User cancelled
    
    if (!window.confirm('Reject this user? Their account will be deleted and they will receive an email notification.')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-role': user.role
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('❌ User rejected. Email notification sent.');
        loadUsers();
      } else {
        alert('Failed to reject user');
      }
    } catch (error) {
      alert('Failed to reject user');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const pendingUsers = users.filter(u => u.status === 'pending');
  const activeUsers = filteredUsers.filter(u => u.status === 'active');
  const suspendedUsers = filteredUsers.filter(u => u.status === 'suspended');

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-5 h-5 text-red-600" />;
      case 'venue': return <Building className="w-5 h-5 text-purple-600" />;
      default: return <UserCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-700',
      venue: 'bg-purple-100 text-purple-700',
      host: 'bg-blue-100 text-blue-700'
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      suspended: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="text-gray-600 mt-1">
          {users.length} total users • {pendingUsers.length} pending approval
        </p>
      </div>

      {/* PENDING APPROVALS - PRIORITY SECTION */}
      {pendingUsers.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">⏳</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-900">
                  Pending Approvals ({pendingUsers.length})
                </h3>
                <p className="text-sm text-amber-700">
                  Review and approve new venue manager accounts
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {pendingUsers.map(u => (
              <div key={u.id} className="bg-white rounded-lg p-4 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{u.name}</span>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          {u.role}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{u.email}</div>
                      {u.venue_name && (
                        <div className="text-sm text-gray-600 mt-1">
                          🏢 {u.venue_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(u.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-medium transition flex items-center gap-2"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleReject(u.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium transition flex items-center gap-2"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="host">Hosts</option>
            <option value="venue">Venues</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getRoleIcon(u.role)}
                      <div>
                        <div className="font-medium text-gray-900">{u.name}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(u.status)}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {u.venue_name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {u.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(u.id)}
                          className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 font-medium transition"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleReject(u.id)}
                          className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 font-medium transition"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    ) : u.status === 'active' ? (
                      <button
                        onClick={() => handleStatusChange(u.id, 'suspended')}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(u.id, 'active')}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p>No users found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
