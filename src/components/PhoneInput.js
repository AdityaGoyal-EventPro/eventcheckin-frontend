import React, { useState, useEffect } from 'react';
import { Phone, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * PhoneInput Component - Reusable phone number input with validation
 * 
 * Features:
 * - Auto-formats to 10 digits
 * - Validates Indian mobile numbers (starts with 6,7,8,9)
 * - Shows real-time validation feedback
 * - Removes all non-numeric characters
 * - Works with controlled forms
 * 
 * Usage:
 * <PhoneInput 
 *   value={phone} 
 *   onChange={(phone) => setFormData({...formData, phone})}
 *   label="Mobile Number"
 *   required={true}
 * />
 */

function PhoneInput({ 
  value = '', 
  onChange, 
  label = 'Mobile Number',
  required = false,
  disabled = false,
  placeholder = '9876543210',
  showIcon = true,
  className = ''
}) {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    
    // Empty is OK if not required
    if (cleaned.length === 0) {
      if (required) {
        setError('Mobile number is required');
        return false;
      }
      setError('');
      return true;
    }
    
    // Check length
    if (cleaned.length < 10) {
      setError('Please enter 10 digits');
      return false;
    }
    
    if (cleaned.length > 10) {
      setError('Maximum 10 digits allowed');
      return false;
    }
    
    // Check first digit
    if (!['6', '7', '8', '9'].includes(cleaned[0])) {
      setError('Mobile number should start with 6, 7, 8, or 9');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleChange = (e) => {
    const input = e.target.value;
    
    // Remove all non-numeric characters
    const cleaned = input.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    
    // Update parent
    onChange(limited);
    
    // Validate if touched
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
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
        <span className="text-xs text-gray-500 font-normal ml-2">
          (10 digits only, no country code)
        </span>
      </label>
      
      <div className="relative">
        {/* +91 Prefix */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          {showIcon && <Phone className="w-5 h-5 text-gray-400" />}
          <span className="text-gray-500 font-medium">+91</span>
        </div>
        
        {/* Input */}
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full ${showIcon ? 'pl-24' : 'pl-16'} pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
            error && showValidation
              ? 'border-red-300 bg-red-50'
              : isValid && showValidation
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300'
          }`}
          placeholder={placeholder}
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
      
      {/* Error Message */}
      {error && showValidation && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      
      {/* Success Message */}
      {isValid && showValidation && (
        <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          Valid mobile number
        </p>
      )}
      
      {/* Helper Text */}
      <p className="mt-1 text-xs text-gray-500">
        📱 Enter 10 digits starting with 6, 7, 8, or 9
      </p>
    </div>
  );
}

export default PhoneInput;

/**
 * USAGE EXAMPLES:
 * 
 * 1. Simple Usage:
 * const [phone, setPhone] = useState('');
 * <PhoneInput value={phone} onChange={setPhone} />
 * 
 * 2. With Form Data:
 * const [formData, setFormData] = useState({ phone: '' });
 * <PhoneInput 
 *   value={formData.phone} 
 *   onChange={(phone) => setFormData({...formData, phone})}
 * />
 * 
 * 3. Required Field:
 * <PhoneInput 
 *   value={phone} 
 *   onChange={setPhone}
 *   required={true}
 * />
 * 
 * 4. Custom Label:
 * <PhoneInput 
 *   value={phone} 
 *   onChange={setPhone}
 *   label="Contact Number"
 * />
 * 
 * 5. No Icon:
 * <PhoneInput 
 *   value={phone} 
 *   onChange={setPhone}
 *   showIcon={false}
 * />
 */
