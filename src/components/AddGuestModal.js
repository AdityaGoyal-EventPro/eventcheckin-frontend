import React, { useState } from 'react';
import { X, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { guestsAPI } from '../api';

function PhoneInput({ value = '', onChange, required = false, disabled = false }) {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 0) {
      if (required) { setError('Required'); return false; }
      setError(''); return true;
    }
    if (cleaned.length < 10) { setError('Enter 10 digits'); return false; }
    if (cleaned.length > 10) { setError('Max 10 digits'); return false; }
    if (!['6','7','8','9'].includes(cleaned[0])) { setError('Start with 6-9'); return false; }
    setError(''); return true;
  };

  const handleChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    onChange(cleaned);
    if (touched) validatePhone(cleaned);
  };

  const isValid = value.length === 10 && !error;
  const showValidation = touched && value.length > 0;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Mobile Number {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        <div className="flex items-center gap-1.5 px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 flex-shrink-0">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 font-medium text-sm">+91</span>
        </div>
        <div className="flex-1 relative">
          <input
            type="tel"
            value={value}
            onChange={handleChange}
            onBlur={() => { setTouched(true); validatePhone(value); }}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base bg-gray-50 ${
              error && showValidation ? 'border-red-300' : isValid && showValidation ? 'border-green-300' : 'border-gray-200'
            }`}
            placeholder="9876543210"
            maxLength="10"
            disabled={disabled}
            inputMode="numeric"
          />
          {showValidation && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {error ? <AlertCircle className="w-4 h-4 text-red-500" /> : isValid ? <CheckCircle className="w-4 h-4 text-green-500" /> : null}
            </div>
          )}
        </div>
      </div>
      {error && showValidation && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

function AddGuestModal({ eventId, onClose, onGuestAdded }) {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', category: 'General', plus_ones: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim()) { setError('Guest name is required'); return; }
    const cleaned = formData.phone.replace(/\D/g, '');
    if (!cleaned || cleaned.length !== 10 || !['6','7','8','9'].includes(cleaned[0])) {
      setError('Enter a valid 10-digit mobile number'); return;
    }

    setSubmitting(true);
    try {
      await guestsAPI.create({ ...formData, event_id: eventId });
      onGuestAdded();
    } catch (error) {
      setError('Failed to add guest. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 animate-fadeIn" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto modal-sheet safe-bottom"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center z-10">
          <h2 className="text-lg font-bold text-gray-900">Add Guest</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 text-base"
              placeholder="Guest name"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 text-base"
              placeholder="guest@email.com"
            />
          </div>

          <PhoneInput value={formData.phone} onChange={(phone) => setFormData({...formData, phone})} required={true} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
              >
                <option value="General">General</option>
                <option value="VIP">VIP</option>
                <option value="VVIP">VVIP</option>
                <option value="Staff">Staff</option>
                <option value="Press">Press</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Plus Ones</label>
              <input
                type="number"
                min="0" max="10"
                value={formData.plus_ones}
                onChange={(e) => setFormData({...formData, plus_ones: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={submitting}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-50 font-semibold">
              {submitting ? 'Adding...' : 'Add Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddGuestModal;
