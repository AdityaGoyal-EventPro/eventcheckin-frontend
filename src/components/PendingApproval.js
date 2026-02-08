import React from 'react';
import { Clock, Mail, Building2 } from 'lucide-react';

function PendingApproval({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Account Pending Approval
            </h1>
            <p className="text-white/90 text-sm">
              Your account is being reviewed
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Account Details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-gray-600">Email</div>
                      <div className="font-medium text-gray-900">{user.email}</div>
                    </div>
                  </div>

                  {user.venue_name && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-gray-600">Venue</div>
                        <div className="font-medium text-gray-900">{user.venue_name}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-gray-600">Status</div>
                      <div className="font-medium text-amber-600">Pending ⏳</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">ℹ️</span>
                  What's Next?
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>An admin will review your account request</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>This usually takes 24-48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>You'll receive an email notification when approved</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Once approved, you can login and access your venue dashboard</span>
                  </li>
                </ul>
              </div>

              {/* Contact Support */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Questions or concerns?
                </p>
                <a 
                  href="mailto:support@eventcheckin.com" 
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  Contact Support
                </a>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="w-full mt-6 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Thank you for your patience. We'll review your request as soon as possible.
        </p>
      </div>
    </div>
  );
}

export default PendingApproval;
