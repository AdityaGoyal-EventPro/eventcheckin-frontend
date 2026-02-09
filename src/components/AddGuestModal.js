import React, { useState } from 'react';
import { X, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { guestsAPI } from '../api';

// Phone Input - SEPARATE +91 BOX (like Signup page!)
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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Mobile Number {required && <span className="text-red-500">*</span>}
        {!required && <span className="text-gray-500 text-xs ml-1">(Optional)</span>}
      </label>
      
      <p className="text-xs text-gray-500 mb-3">
        Enter 10 digits only, no country code
      </p>
      
      {/* SEPARATE BOX DESIGN - NO OVERLAP! */}
      <div className="flex gap-2">
        {/* +91 Box */}
        <div className="flex items-center gap-2 px-3 py-3 border border-gray-300 rounded-lg bg-gray-50">
          <Phone className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700 font-medium">+91</span>
        </div>
        
        {/* Phone Number Input */}
        <div className="flex-1 relative">
          <input
            type="tel"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-base ${
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
          
          {/* Validation Icon */}
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
      </div>
      
      {/* Error Message */}
      {error && showValidation && (
        <div className="mt-2 flex items-start gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Success Message */}
      {isValid && showValidation && (
        <div className="mt-2 flex items-start gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Valid mobile number</span>
        </div>
      )}
      
      {/* Helper Text */}
      <p className="mt-2 text-xs text-gray-500">
        📱 Must start with 6, 7, 8, or 9
      </p>
    </div>
  );
}

function AddGuestModal({ eventId, onClose, onGuestAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'General',
    plus_ones: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return (
      cleaned.length === 10 &&
      ['6', '7', '8', '9'].includes(cleaned[0])
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
      setError('Guest name is required');
      return;
    }

    if (!formData.phone || !validatePhone(formData.phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);

    try {
      await guestsAPI.create(eventId, formData);
      onGuestAdded();
    } catch (error) {
      console.error('Error adding guest:', error);
      setError('Failed to add guest. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Add Guest</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guest Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
              placeholder="john@example.com"
            />
          </div>

          {/* Phone Input - SEPARATE BOX DESIGN */}
          <PhoneInput
            value={formData.phone}
            onChange={(phone) => setFormData({...formData, phone})}
            required={true}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
            >
              <option value="General">General</option>
              <option value="VIP">VIP</option>
              <option value="VVIP">VVIP</option>
              <option value="Staff">Staff</option>
              <option value="Press">Press</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plus Ones
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={formData.plus_ones}
              onChange={(e) => setFormData({...formData, plus_ones: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-medium"
            >
              {submitting ? 'Adding...' : 'Add Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddGuestModal;
