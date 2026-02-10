import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Phone, CheckCircle } from 'lucide-react';
import { guestsAPI } from '../api';

function EditGuestModal({ guest, onClose, onGuestUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'General',
    plus_ones: 0
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [phoneValid, setPhoneValid] = useState(false);

  // Pre-fill form with existing guest data
  useEffect(() => {
    if (guest) {
      setFormData({
        name: guest.name || '',
        email: guest.email || '',
        phone: guest.phone || '',
        category: guest.category || 'General',
        plus_ones: guest.plus_ones || 0
      });
      
      // Validate pre-filled phone
      if (guest.phone) {
        validatePhone(guest.phone);
      }
    }
  }, [guest]);

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 0) {
      setPhoneValid(false);
      return false;
    }
    
    if (cleaned.length !== 10) {
      setErrors(prev => ({ ...prev, phone: 'Must be exactly 10 digits' }));
      setPhoneValid(false);
      return false;
    }
    
    const firstDigit = cleaned[0];
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
      setErrors(prev => ({ ...prev, phone: 'Must start with 6, 7, 8, or 9' }));
      setPhoneValid(false);
      return false;
    }
    
    setErrors(prev => ({ ...prev, phone: '' }));
    setPhoneValid(true);
    return true;
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // Remove all non-digits
    value = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    value = value.slice(0, 10);
    
    setFormData(prev => ({ ...prev, phone: value }));
    validatePhone(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = errors.phone || 'Invalid phone number';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      // Update guest
      await guestsAPI.update(guest.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone,
        category: formData.category,
        plus_ones: parseInt(formData.plus_ones) || 0
      });
      
      // Success
      onGuestUpdated();
    } catch (error) {
      console.error('Error updating guest:', error);
      setErrors({ submit: error.response?.data?.error || 'Failed to update guest' });
      setLoading(false);
    }
  };

  if (!guest) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Edit Guest</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guest Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John Doe"
              autoFocus
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="john@example.com"
            />
          </div>

          {/* Mobile Number - SEPARATE +91 BOX */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number <span className="text-red-500">*</span>
              <span className="text-gray-400 text-xs ml-2">(10 digits, no country code)</span>
            </label>
            
            <div className="flex gap-2">
              {/* +91 Box */}
              <div className="flex items-center gap-2 px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="font-medium">+91</span>
              </div>
              
              {/* Phone Input */}
              <div className="flex-1 relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.phone ? 'border-red-500' : phoneValid ? 'border-green-500' : 'border-gray-300'
                  }`}
                  placeholder="9876543210"
                  maxLength="10"
                />
                {phoneValid && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Helper Text */}
            {!errors.phone && !phoneValid && formData.phone.length === 0 && (
              <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                Enter 10 digits only, no country code
              </p>
            )}
            
            {/* Validation Message */}
            {phoneValid && (
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Valid mobile number
              </p>
            )}
            
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.phone}
              </p>
            )}
            
            {/* Format Rules */}
            {formData.phone.length > 0 && !phoneValid && (
              <p className="text-gray-500 text-xs mt-1">
                📱 Must start with 6, 7, 8, or 9
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="General">General</option>
              <option value="VIP">VIP</option>
              <option value="VVIP">VVIP</option>
              <option value="Staff">Staff</option>
              <option value="Media">Media</option>
            </select>
          </div>

          {/* Plus Ones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plus Ones
            </label>
            <input
              type="number"
              value={formData.plus_ones}
              onChange={(e) => setFormData({ ...formData, plus_ones: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
              max="10"
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !phoneValid}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                'Update Guest'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditGuestModal;
