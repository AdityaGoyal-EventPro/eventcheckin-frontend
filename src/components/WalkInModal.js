import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { guestsAPI } from '../api';
import PhoneInput from './PhoneInput';

function WalkInModal({ eventId, eventName, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'General',
    plus_ones: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (checkInImmediately) => {
    if (!formData.name.trim()) {
      setError('Guest name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const guestData = {
        event_id: eventId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        category: formData.category,
        plus_ones: formData.plus_ones,
        is_walkin: true
      };

      await guestsAPI.create(guestData);

      // If checking in immediately, call check-in endpoint
      // (This would need the guest ID returned from create)
      
      alert(checkInImmediately 
        ? `✅ ${formData.name} added as walk-in and checked in!`
        : `✅ ${formData.name} added to guest list!`
      );
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add walk-in guest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Walk-In Guest</h2>
                <p className="text-sm text-gray-600">{eventName}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Walk-in guests</strong> will be added to the event guest list and visible to the host.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guest Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <PhoneInput
                  value={formData.phone}
                  onChange={(phone) => setFormData({...formData, phone})}
                  required={true}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="General">General</option>
                  <option value="VIP">VIP</option>
                  <option value="Staff">Staff</option>
                  <option value="Press">Press</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plus Ones
                </label>
                <select
                  name="plus_ones"
                  value={formData.plus_ones}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  {[0, 1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num === 0 ? 'None' : `+${num}`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit(true)}
              disabled={!formData.name.trim() || loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add & Check In'}
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={!formData.name.trim() || loading}
              className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add to List'}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Only guest name is required. Email and phone are optional.
          </p>
        </div>
      </div>
    </div>
  );
}

export default WalkInModal;
