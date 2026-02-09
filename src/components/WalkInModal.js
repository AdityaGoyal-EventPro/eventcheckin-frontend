import React, { useState } from 'react';
import { X, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { guestsAPI } from '../api';

// Inline PhoneInput component
function PhoneInput({ value = '', onChange, required = false, disabled = false }) {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 0) {
      if (required) {
        setError('Mobile number is required');
        return false;
      }
      setError('');
      return true;
    }
    
    if (cleaned.length < 10) {
      setError('Please enter 10 digits');
      return false;
    }
    
    if (cleaned.length > 10) {
      setError('Maximum 10 digits allowed');
      return false;
    }
    
    if (!['6', '7', '8', '9'].includes(cleaned[0])) {
      setError('Mobile number should start with 6, 7, 8, or 9');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleChange = (e) => {
    const input = e.target.value;
    const cleaned = input.replace(/\D/g, '');
    const limited = cleaned.slice(0, 10);
    
    onChange(limited);
    
    if (touched) {
      validatePhone(limited);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    validatePhone(value);
  };

  const isValid = value.length === 10 && !error;
  const showValidation = touched && value.length > 0;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Mobile Number {required && <span className="text-red-500">*</span>}
        {!required && <span className="text-gray-500 text-xs ml-1">(Optional)</span>}
        <span className="text-xs text-gray-500 font-normal ml-2">
          (10 digits, no country code)
        </span>
      </label>
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 font-medium text-sm">+91</span>
        </div>
        
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full pl-20 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
            error && showValidation
              ? 'border-red-300 bg-red-50'
              : isValid && showValidation
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300'
          }`}
          placeholder="9876543210"
          maxLength="10"
          disabled={disabled}
          required={required}
        />
        
        {showValidation && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {error ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : isValid ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : null}
          </div>
        )}
      </div>
      
      {error && showValidation && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      
      {isValid && showValidation && (
        <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Valid mobile number
        </p>
      )}
      
      <p className="mt-1 text-xs text-gray-500">
        📱 10 digits starting with 6, 7, 8, or 9
      </p>
    </div>
  );
}

function WalkInModal({ eventId, onClose, onWalkInAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Guest name is required');
      return;
    }

    setSubmitting(true);

    try {
      const response = await guestsAPI.addWalkIn(eventId, formData);
      const newGuest = response.data.guest;
      onWalkInAdded(newGuest);
    } catch (error) {
      console.error('Walk-in error:', error);
      alert('Failed to register walk-in guest');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Register Walk-In Guest</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guest Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter guest name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="guest@email.com"
            />
          </div>

          {/* Phone Input with Validation - NO wristband color */}
          <PhoneInput
            value={formData.phone}
            onChange={(phone) => setFormData({...formData, phone})}
            required={false}
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Register Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WalkInModal;
