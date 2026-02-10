import React, { useState } from 'react';
import { guestsAPI } from '../api';
import { Smartphone } from 'lucide-react';

function PhoneContactPicker({ eventId, onSuccess }) {
  const [loading, setLoading] = useState(false);

  // Clean phone number function
  const cleanPhoneNumber = (phoneStr) => {
    if (!phoneStr) return '';
    
    // Remove all non-digit characters
    let cleaned = phoneStr.replace(/\D/g, '');
    
    // Remove leading country codes
    if (cleaned.startsWith('91') && cleaned.length > 10) {
      cleaned = cleaned.substring(2);
    } else if (cleaned.startsWith('+91')) {
      cleaned = cleaned.substring(3);
    }
    
    // Take only first 10 digits
    return cleaned.substring(0, 10);
  };

  const pickContacts = async () => {
    // Check if Contact Picker API is supported
    if (!('contacts' in navigator && 'ContactsManager' in window)) {
      alert('Contact picker not supported on this device. Please use Add Guest or Import CSV instead.');
      return;
    }

    try {
      const props = ['name', 'email', 'tel'];
      const contacts = await navigator.contacts.select(props, { multiple: true });
      
      if (contacts.length === 0) {
        return; // User cancelled
      }
      
      // Auto-import contacts
      await importContacts(contacts);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Contact picker error:', error);
        alert('Failed to pick contacts. Please try again.');
      }
    }
  };

  const importContacts = async (contacts) => {
    setLoading(true);
    
    try {
      const guests = contacts.map(contact => ({
        name: contact.name?.[0] || 'Guest',
        email: contact.email?.[0] || '',
        phone: cleanPhoneNumber(contact.tel?.[0] || ''),
        category: 'General'
      }));

      // Import all guests
      let successCount = 0;
      let failedCount = 0;

      for (const guest of guests) {
        try {
          await guestsAPI.create({
            ...guest,
            event_id: eventId
          });
          successCount++;
        } catch (error) {
          console.error('Failed to add guest:', guest.name, error);
          failedCount++;
        }
      }

      // Show result
      if (failedCount > 0) {
        alert(`Added ${successCount} guests successfully. ${failedCount} failed to add.`);
      } else {
        alert(`Successfully added ${successCount} guest${successCount !== 1 ? 's' : ''}! 🎉`);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Import contacts error:', error);
      alert('Failed to import contacts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={pickContacts}
      disabled={loading}
      className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-indigo-500 rounded-xl p-4 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Smartphone className="w-5 h-5 text-indigo-600" />
      <span className="font-medium">{loading ? 'Importing...' : 'Import from Contacts'}</span>
    </button>
  );
}

export default PhoneContactPicker;
