import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, QrCode, ArrowRight } from 'lucide-react';

function LoginSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <QrCode className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Event Check-In Pro</h1>
          <p className="text-xl text-purple-100">Modern guest list management & check-in system</p>
        </div>

        {/* Login Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Host Login Card */}
          <div 
            onClick={() => navigate('/login/host')}
            className="group bg-white rounded-2xl shadow-2xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Event Host</h2>
              <p className="text-gray-600 mb-6">
                Manage your events, guest lists, and invitations
              </p>
              
              <ul className="text-left space-y-2 mb-8 w-full">
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Create and manage events
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Import guest lists
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Send invitations
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Track attendance
                </li>
              </ul>

              <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 group-hover:from-purple-700 group-hover:to-purple-800 transition-all">
                Continue as Host
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Venue Login Card */}
          <div 
            onClick={() => navigate('/login/venue')}
            className="group bg-white rounded-2xl shadow-2xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Venue Staff</h2>
              <p className="text-gray-600 mb-6">
                Scan QR codes and manage check-ins at your venue
              </p>
              
              <ul className="text-left space-y-2 mb-8 w-full">
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Global QR scanning
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Multi-event check-ins
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Real-time activity feed
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Walk-in registration
                </li>
              </ul>

              <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 group-hover:from-blue-700 group-hover:to-blue-800 transition-all">
                Continue as Venue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-purple-100 text-sm">
            Secure, fast, and reliable event management
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginSelection;
