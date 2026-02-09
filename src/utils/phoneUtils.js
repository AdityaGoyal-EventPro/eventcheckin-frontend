/**
 * Phone Validation Utilities
 * Use these functions across your entire app for consistent phone handling
 */

/**
 * Validate Indian mobile number
 * @param {string} phone - Phone number to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export function validatePhone(phone) {
  if (!phone) {
    return { isValid: false, error: 'Mobile number is required' };
  }

  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length !== 10) {
    return { 
      isValid: false, 
      error: cleaned.length < 10 
        ? 'Please enter 10 digits' 
        : 'Maximum 10 digits allowed'
    };
  }
  
  if (!['6', '7', '8', '9'].includes(cleaned[0])) {
    return { 
      isValid: false, 
      error: 'Mobile number should start with 6, 7, 8, or 9' 
    };
  }
  
  return { isValid: true, error: '' };
}

/**
 * Clean phone number - removes all non-numeric characters
 * @param {string} phone - Phone number to clean
 * @returns {string} Cleaned phone number (10 digits only)
 */
export function cleanPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.slice(0, 10); // Limit to 10 digits
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted as "+91 9876543210"
 */
export function formatPhoneDisplay(phone) {
  const cleaned = cleanPhone(phone);
  if (cleaned.length === 10) {
    return `+91 ${cleaned}`;
  }
  return phone;
}

/**
 * Format phone number for SMS (with country code)
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted as "919876543210"
 */
export function formatPhoneForSMS(phone) {
  const cleaned = cleanPhone(phone);
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

/**
 * Check if phone number is valid (quick check)
 * @param {string} phone - Phone number to check
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  const cleaned = cleanPhone(phone);
  return (
    cleaned.length === 10 &&
    ['6', '7', '8', '9'].includes(cleaned[0])
  );
}

/**
 * Validate phone number in CSV import
 * @param {string} phone - Phone number from CSV
 * @param {number} rowIndex - Row number for error reporting
 * @returns {object} { isValid: boolean, cleaned: string, error: string }
 */
export function validateCSVPhone(phone, rowIndex) {
  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      cleaned: '',
      error: `Row ${rowIndex + 1}: Phone number is required`
    };
  }

  const cleaned = cleanPhone(phone);
  
  // Check if started with +91 or 91
  const original = phone.replace(/\s/g, '');
  if (original.startsWith('+91') || original.startsWith('91')) {
    return {
      isValid: false,
      cleaned: cleaned,
      error: `Row ${rowIndex + 1}: Remove country code (+91). Enter only 10 digits.`
    };
  }
  
  const validation = validatePhone(cleaned);
  
  if (!validation.isValid) {
    return {
      isValid: false,
      cleaned: cleaned,
      error: `Row ${rowIndex + 1}: ${validation.error}`
    };
  }
  
  return {
    isValid: true,
    cleaned: cleaned,
    error: ''
  };
}

/**
 * USAGE EXAMPLES:
 * 
 * 1. Validate on form submit:
 * const { isValid, error } = validatePhone(formData.phone);
 * if (!isValid) {
 *   setError(error);
 *   return;
 * }
 * 
 * 2. Clean input as user types:
 * const handlePhoneChange = (e) => {
 *   const cleaned = cleanPhone(e.target.value);
 *   setPhone(cleaned);
 * }
 * 
 * 3. Display phone number:
 * <p>{formatPhoneDisplay(guest.phone)}</p>
 * // Shows: +91 9876543210
 * 
 * 4. Send SMS:
 * const smsPhone = formatPhoneForSMS(guest.phone);
 * // Returns: 919876543210
 * 
 * 5. Quick validation:
 * if (isValidPhone(phone)) {
 *   // Phone is valid
 * }
 * 
 * 6. CSV Import:
 * const result = validateCSVPhone(row.phone, index);
 * if (!result.isValid) {
 *   errors.push(result.error);
 * }
 * phoneNumber = result.cleaned;
 */
