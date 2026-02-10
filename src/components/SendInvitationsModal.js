import React, { useState } from 'react';
import { X, Mail, MessageSquare, Users, Filter, CheckSquare } from 'lucide-react';

function SendInvitationsModal({ event, guests, onClose, onSend }) {
  const [channels, setChannels] = useState({ email: true, sms: false });
  const [filter, setFilter] = useState('all');
  const [showCustomSelector, setShowCustomSelector] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [customFilter, setCustomFilter] = useState('all');
  const [sending, setSending] = useState(false);

  // Calculate counts for each filter
  const allCount = guests.length;
  const notInvitedCount = guests.filter(g => !g.invitation_sent).length;
  const notCheckedInCount = guests.filter(g => !g.checked_in).length;
  const vipCount = guests.filter(g => g.category === 'VIP').length;
  const generalCount = guests.filter(g => g.category === 'General').length;

  // Get filtered guests for custom selector
  const getFilteredCustomGuests = () => {
    switch (customFilter) {
      case 'vip':
        return guests.filter(g => g.category === 'VIP');
      case 'general':
        return guests.filter(g => g.category === 'General');
      case 'checked_in':
        return guests.filter(g => g.checked_in);
      case 'not_checked_in':
        return guests.filter(g => !g.checked_in);
      case 'invited':
        return guests.filter(g => g.invitation_sent);
      case 'not_invited':
        return guests.filter(g => !g.invitation_sent);
      default:
        return guests;
    }
  };

  const customGuests = getFilteredCustomGuests();

  const handleSend = async () => {
    setSending(true);
    try {
      await onSend({
        channels,
        filter,
        guest_ids: filter === 'custom' ? selectedGuests : []
      });
    } finally {
      setSending(false);
    }
  };

  const getRecipientCount = () => {
    if (filter === 'custom') {
      return selectedGuests.length;
    }
    
    switch (filter) {
      case 'not_invited': return notInvitedCount;
      case 'not_checked_in': return notCheckedInCount;
      case 'vip': return vipCount;
      case 'general': return generalCount;
      default: return allCount;
    }
  };

  const recipientCount = getRecipientCount();

  const toggleGuestSelection = (guestId) => {
    setSelectedGuests(prev => 
      prev.includes(guestId) 
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
  };

  const selectAll = () => {
    setSelectedGuests(customGuests.map(g => g.id));
  };

  const clearAll = () => {
    setSelectedGuests([]);
  };

  // Custom selector view
  if (showCustomSelector) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Select Guests</h3>
            <button
              onClick={() => setShowCustomSelector(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Filters */}
          <div className="p-6 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick Filters:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCustomFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  customFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({guests.length})
              </button>
              <button
                onClick={() => setCustomFilter('vip')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  customFilter === 'vip'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                VIP ({vipCount})
              </button>
              <button
                onClick={() => setCustomFilter('general')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  customFilter === 'general'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                General ({generalCount})
              </button>
              <button
                onClick={() => setCustomFilter('checked_in')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  customFilter === 'checked_in'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Checked In ({guests.filter(g => g.checked_in).length})
              </button>
              <button
                onClick={() => setCustomFilter('not_checked_in')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  customFilter === 'not_checked_in'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Not Checked In ({notCheckedInCount})
              </button>
              <button
                onClick={() => setCustomFilter('invited')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  customFilter === 'invited'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Invited ({guests.filter(g => g.invitation_sent).length})
              </button>
              <button
                onClick={() => setCustomFilter('not_invited')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  customFilter === 'not_invited'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Not Invited ({notInvitedCount})
              </button>
            </div>
          </div>

          {/* Guest List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedGuests.length === customGuests.length && customGuests.length > 0}
                        onChange={(e) => e.target.checked ? selectAll() : clearAll()}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customGuests.map(guest => (
                    <tr
                      key={guest.id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedGuests.includes(guest.id) ? 'bg-indigo-50' : ''
                      }`}
                      onClick={() => toggleGuestSelection(guest.id)}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedGuests.includes(guest.id)}
                          onChange={() => toggleGuestSelection(guest.id)}
                          className="rounded border-gray-300"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{guest.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          guest.category === 'VIP'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {guest.category || 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {guest.checked_in ? '✓ Checked In' : '✗ Not Checked In'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-gray-700">
                  Selected: <span className="text-indigo-600">{selectedGuests.length}</span> guests
                </p>
                <button
                  onClick={selectAll}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCustomSelector(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={() => setShowCustomSelector(false)}
                disabled={selectedGuests.length === 0}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                  selectedGuests.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Continue ({selectedGuests.length} selected)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main modal view
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Send Invitations</h3>
            <p className="text-sm text-gray-600 mt-1">{event.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Filter Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Who should receive this invitation?
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="radio"
                  name="filter"
                  value="all"
                  checked={filter === 'all'}
                  onChange={(e) => setFilter(e.target.value)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">All guests</span>
                  <span className="ml-2 text-sm text-gray-600">({allCount} people)</span>
                </div>
              </label>

              <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="radio"
                  name="filter"
                  value="not_invited"
                  checked={filter === 'not_invited'}
                  onChange={(e) => setFilter(e.target.value)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">Only guests who haven't been invited</span>
                  <span className="ml-2 text-sm text-gray-600">({notInvitedCount} people)</span>
                </div>
              </label>

              <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="radio"
                  name="filter"
                  value="not_checked_in"
                  checked={filter === 'not_checked_in'}
                  onChange={(e) => setFilter(e.target.value)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">Only guests not checked in</span>
                  <span className="ml-2 text-sm text-gray-600">({notCheckedInCount} people)</span>
                </div>
              </label>

              <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="radio"
                  name="filter"
                  value="vip"
                  checked={filter === 'vip'}
                  onChange={(e) => setFilter(e.target.value)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">Only VIP guests</span>
                  <span className="ml-2 text-sm text-gray-600">({vipCount} people)</span>
                </div>
              </label>

              <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="radio"
                  name="filter"
                  value="general"
                  checked={filter === 'general'}
                  onChange={(e) => setFilter(e.target.value)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">Only General guests</span>
                  <span className="ml-2 text-sm text-gray-600">({generalCount} people)</span>
                </div>
              </label>

              <label className="flex items-center p-3 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 cursor-pointer transition">
                <input
                  type="radio"
                  name="filter"
                  value="custom"
                  checked={filter === 'custom'}
                  onChange={(e) => setFilter(e.target.value)}
                  className="mr-3"
                />
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">Custom selection...</span>
                    {filter === 'custom' && selectedGuests.length > 0 && (
                      <span className="ml-2 text-sm text-indigo-600">({selectedGuests.length} selected)</span>
                    )}
                  </div>
                  {filter === 'custom' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowCustomSelector(true);
                      }}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                    >
                      Select Guests
                    </button>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Channel Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Send via:
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={channels.email}
                  onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
                  className="mr-3"
                />
                <Mail className="w-5 h-5 text-gray-600 mr-2" />
                <span className="font-medium text-gray-900">Email</span>
              </label>

              <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={channels.sms}
                  onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                  className="mr-3"
                />
                <MessageSquare className="w-5 h-5 text-gray-600 mr-2" />
                <span className="font-medium text-gray-900">SMS</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || (!channels.email && !channels.sms) || recipientCount === 0 || (filter === 'custom' && selectedGuests.length === 0)}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                sending || (!channels.email && !channels.sms) || recipientCount === 0 || (filter === 'custom' && selectedGuests.length === 0)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {sending ? 'Sending...' : `Send to ${recipientCount} Guest${recipientCount !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SendInvitationsModal;
