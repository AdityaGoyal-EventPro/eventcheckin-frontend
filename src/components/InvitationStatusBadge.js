import React from 'react';
import { Mail, MessageSquare, CheckCircle, AlertCircle, Eye } from 'lucide-react';

function InvitationStatusBadge({ guest }) {
  // Not sent yet
  if (!guest.invitation_sent) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
          <AlertCircle className="w-3 h-3" />
          <span>Not sent</span>
        </div>
      </div>
    );
  }

  // Format sent date/time
  const sentDate = new Date(guest.invitation_sent_at);
  const formattedDate = sentDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = sentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Get icon based on send method
  const getMethodIcon = () => {
    switch (guest.invitation_sent_via) {
      case 'email':
        return <Mail className="w-3 h-3" />;
      case 'sms':
        return <MessageSquare className="w-3 h-3" />;
      case 'both':
        return (
          <>
            <Mail className="w-3 h-3" />
            <MessageSquare className="w-3 h-3" />
          </>
        );
      default:
        return null;
    }
  };

  // Get method text
  const getMethodText = () => {
    switch (guest.invitation_sent_via) {
      case 'email':
        return 'Email';
      case 'sms':
        return 'SMS';
      case 'both':
        return 'Email & SMS';
      default:
        return 'Sent';
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Sent badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          <span>Sent via {getMethodText()}</span>
        </div>

        {/* Opened badge */}
        {guest.invitation_opened && (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            <Eye className="w-3 h-3" />
            <span>Opened</span>
            {guest.invitation_open_count > 1 && (
              <span className="ml-1">({guest.invitation_open_count}x)</span>
            )}
          </div>
        )}
      </div>

      {/* Date/time info */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        {getMethodIcon()}
        <span>{formattedDate} at {formattedTime}</span>
      </div>

      {/* Opened info */}
      {guest.invitation_opened && guest.invitation_opened_at && (
        <div className="text-xs text-gray-400">
          Last viewed: {new Date(guest.invitation_opened_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )}
    </div>
  );
}

export default InvitationStatusBadge;
