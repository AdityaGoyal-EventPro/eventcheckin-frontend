import React from 'react';

function Logo({ size = 'md', showTagline = false, variant = 'default' }) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg', tagline: 'text-xs' },
    md: { icon: 32, text: 'text-2xl', tagline: 'text-sm' },
    lg: { icon: 48, text: 'text-4xl', tagline: 'text-base' },
    xl: { icon: 64, text: 'text-5xl', tagline: 'text-lg' }
  };

  const config = sizes[size];

  // Logo SVG - Modern check-in icon
  const LogoIcon = () => (
    <svg
      width={config.icon}
      height={config.icon}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gradient Definition */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#6366F1', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Ticket/Badge Shape */}
      <rect
        x="8"
        y="12"
        width="48"
        height="40"
        rx="8"
        fill="url(#logoGradient)"
      />
      
      {/* Check Mark */}
      <path
        d="M22 32L28 38L42 24"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Decorative dots */}
      <circle cx="16" cy="20" r="2" fill="white" opacity="0.6" />
      <circle cx="48" cy="20" r="2" fill="white" opacity="0.6" />
      <circle cx="16" cy="44" r="2" fill="white" opacity="0.6" />
      <circle cx="48" cy="44" r="2" fill="white" opacity="0.6" />
    </svg>
  );

  const textColor = variant === 'light' ? 'text-white' : 'text-gray-900';
  const taglineColor = variant === 'light' ? 'text-gray-200' : 'text-gray-600';

  return (
    <div className="flex items-center gap-3">
      <LogoIcon />
      <div>
        <div className={`${config.text} font-bold ${textColor} leading-none`}>
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Check-In
          </span>
          {' '}
          <span className={textColor}>Pro</span>
        </div>
        {showTagline && (
          <div className={`${config.tagline} ${taglineColor} mt-1`}>
            Effortless Event Management
          </div>
        )}
      </div>
    </div>
  );
}

// Simple text-only version for tight spaces
export function LogoText({ variant = 'default' }) {
  const textColor = variant === 'light' ? 'text-white' : 'text-gray-900';
  
  return (
    <div className="text-xl font-bold">
      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Check-In
      </span>
      {' '}
      <span className={textColor}>Pro</span>
    </div>
  );
}

// Icon only version
export function LogoIcon({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#6366F1', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect x="8" y="12" width="48" height="40" rx="8" fill="url(#logoGradient)" />
      <path
        d="M22 32L28 38L42 24"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="20" r="2" fill="white" opacity="0.6" />
      <circle cx="48" cy="20" r="2" fill="white" opacity="0.6" />
      <circle cx="16" cy="44" r="2" fill="white" opacity="0.6" />
      <circle cx="48" cy="44" r="2" fill="white" opacity="0.6" />
    </svg>
  );
}

export default Logo;
