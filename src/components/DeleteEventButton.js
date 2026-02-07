import React, { useState } from 'react';
import { eventsAPI } from '../api';
import { Trash2, AlertTriangle } from 'lucide-react';

function DeleteEventButton({ event, user, onDeleted }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    
    try {
      await eventsAPI.softDelete(event.id, user.role);
      onDeleted();
    } catch (error) {
      alert('Failed to delete event');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const isDeletedByOther = event.deleted_by && event.deleted_by !== user.role;

  if (isDeletedByOther) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-amber-900">Event Deletion Pending</h4>
            <p className="text-sm text-amber-700 mt-1">
              {event.deleted_by === 'host' ? 'The host' : 'The venue'} has deleted this event.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={async () => {
                  await eventsAPI.hardDelete(event.id);
                  onDeleted();
                }}
                className="btn btn-danger btn-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="btn btn-danger btn-md"
      >
        <Trash2 className="w-5 h-5" />
        Delete Event
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Delete Event?</h3>
              <p className="text-gray-600 mb-6">
                <strong>{event.name}</strong> will be marked for deletion.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-danger flex-1"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DeleteEventButton;
