import React, { useState } from 'react';
import { guestsAPI } from '../api';
import { Smartphone, UserPlus } from 'lucide-react';

function PhoneContactPicker({ eventId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);

  const pickContacts = async () => {
    // Check if Contact Picker API is supported
    if (!('contacts' in navigator && 'ContactsManager' in window)) {
      alert('Contact picker not supported on this device. Please use Add Guest or Import CSV instead.');
      return;
    }

    try {
      const props = ['name', 'email', 'tel'];
      const contacts = await navigator.contacts.select(props, { multiple: true });
      
      setSelectedContacts(contacts);
      
      // Auto-import contacts
      await importContacts(contacts);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Contact picker error:', error);
      }
    }
  };

  const importContacts = async (contacts) => {
    setLoading(true);
    
    try {
      const guests = contacts.map(contact => ({
        name: contact.name?.[0] || 'Guest',
        email: contact.email?.[0] || '',
        phone: contact.tel?.[0] || '',
        category: 'General'
      }));

      // Import all guests
      for (const guest of guests) {
        await guestsAPI.create({
          ...guest,
          event_id: eventId
        });
      }

      alert(`Successfully added ${guests.length} guests`);
      onSuccess();
    } catch (error) {
      alert('Failed to import contacts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={pickContacts}
      disabled={loading}
      className="btn btn-secondary btn-md"
    >
      <Smartphone className="w-5 h-5" />
      {loading ? 'Importing...' : 'Import from Contacts'}
    </button>
  );
}

export default PhoneContactPicker;
