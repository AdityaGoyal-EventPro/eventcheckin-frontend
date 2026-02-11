import React, { useState } from 'react';
import { eventsAPI } from '../api';
import { Archive, Trash2 } from 'lucide-react';

function DeleteEventButton({ event, user, guests, onDeleted }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const guestCount = guests?.length || event?.total_guests || 0;
  const checkedInCount = guests?.filter(g => g.checked_in).length || event?.checked_in_count || 0;

  // Determine which scenario we're in
  const isInstantDelete = guestCount === 0;
  const isArchiveOnly = checkedInCount > 0;
  // middle case: has guests but 0 check-ins → archive with delete option

  const handleAction = async () => {
    setLoading(true);
    try {
      const result = await eventsAPI.smartDelete(event.id, user.role);
      console.log('Smart delete result:', result.data);
      onDeleted();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to process');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  // ─── Button label & style based on scenario ───
  const buttonConfig = isInstantDelete
    ? { label: 'Delete Event', icon: Trash2, color: 'border-red-200 text-red-600 hover:bg-red-50' }
    : { label: 'Archive Event', icon: Archive, color: 'border-amber-200 text-amber-700 hover:bg-amber-50' };

  const Icon = buttonConfig.icon;

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium active:scale-[0.98] transition ${buttonConfig.color}`}
      >
        <Icon className="w-4 h-4" />
        {buttonConfig.label}
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:rounded-2xl rounded-t-2xl sm:max-w-md shadow-2xl">
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="w-9 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="p-6">
              {/* ── Scenario 1: Instant Delete (0 guests) ── */}
              {isInstantDelete && (
                <>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-center mb-2">Delete Event?</h3>
                  <p className="text-sm text-gray-600 text-center mb-6">
                    <strong>{event.name}</strong> has no guests and will be permanently deleted.
                  </p>
                </>
              )}

              {/* ── Scenario 2: Archive (guests, no check-ins) ── */}
              {!isInstantDelete && !isArchiveOnly && (
                <>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Archive className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-center mb-2">Archive Event?</h3>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    <strong>{event.name}</strong> has {guestCount} guest{guestCount !== 1 ? 's' : ''} and will be moved to archive.
                  </p>
                  <div className="space-y-2 mb-6">
                    <InfoCard emoji="📦" title="Moved to Archive" desc="Hidden from main dashboard" />
                    <InfoCard emoji="⏱️" title="30 Days to Restore" desc="Restore anytime within 30 days" />
                    <InfoCard emoji="👥" title="Guest Data is Safe" desc="All guest records are preserved" />
                  </div>
                </>
              )}

              {/* ── Scenario 3: Archive Only (has check-ins) ── */}
              {isArchiveOnly && (
                <>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Archive className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-center mb-2">Archive Event?</h3>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    <strong>{event.name}</strong> has {checkedInCount} check-in{checkedInCount !== 1 ? 's' : ''} and will be archived.
                  </p>
                  <div className="space-y-2 mb-6">
                    <InfoCard emoji="📦" title="Moved to Archive" desc="Hidden from main dashboard" />
                    <InfoCard emoji="⏱️" title="30 Days to Restore" desc="Restore anytime within 30 days" />
                    <InfoCard emoji="🔒" title="Data Protected" desc="Check-in history and guest records are preserved permanently" />
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm active:scale-[0.98] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={loading}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm active:scale-[0.98] transition text-white ${
                    isInstantDelete ? 'bg-red-600' : 'bg-amber-500'
                  }`}
                >
                  {loading
                    ? 'Processing...'
                    : isInstantDelete
                      ? 'Delete'
                      : 'Yes, Archive'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Small info card used in confirmation modals ───
function InfoCard({ emoji, title, desc }) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
      <span className="text-base mt-0.5">{emoji}</span>
      <div>
        <p className="text-xs font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
  );
}

export default DeleteEventButton;
