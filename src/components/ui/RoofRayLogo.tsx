import React from 'react';

interface RoofRayLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

export const RoofRayLogo: React.FC<RoofRayLogoProps> = ({
  size = 32,
  className = '',
  showWordmark = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Geometric Rooftop + Solar Ray SVG Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 group-hover:scale-105"
        aria-label="RoofRay Logo"
      >
        <defs>
          {/* Luminous Sun Gradient */}
          <linearGradient id="rr-sun-gradient" x1="16" y1="4" x2="16" y2="15" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Roof Crest & Ridge Gradient */}
          <linearGradient id="rr-ridge-gradient" x1="5" y1="11" x2="27" y2="21" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          {/* Photovoltaic Array Outline Gradient */}
          <linearGradient id="rr-pv-gradient" x1="8" y1="16" x2="24" y2="27" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Deep Navy Container Backdrop */}
          <linearGradient id="rr-bg-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
        </defs>

        {/* Squircle Base with Deep Navy Backdrop */}
        <rect width="32" height="32" rx="8" fill="url(#rr-bg-gradient)" />
        <rect
          x="0.75"
          y="0.75"
          width="30.5"
          height="30.5"
          rx="7.25"
          stroke="#334155"
          strokeOpacity="0.7"
          strokeWidth="1.5"
        />

        {/* Ambient Sun Glow */}
        <circle cx="16" cy="11.5" r="5" fill="#f59e0b" fillOpacity="0.18" />

        {/* Radiant Solar Rays emitting above Rooftop */}
        <line x1="16" y1="3" x2="16" y2="5.5" stroke="#fbbf24" strokeWidth="1.75" strokeLinecap="round" />
        <line x1="9.5" y1="5.5" x2="11.2" y2="7.5" stroke="#fbbf24" strokeWidth="1.75" strokeLinecap="round" />
        <line x1="22.5" y1="5.5" x2="20.8" y2="7.5" stroke="#fbbf24" strokeWidth="1.75" strokeLinecap="round" />
        <line x1="4.8" y1="10.5" x2="7.2" y2="11.5" stroke="#fbbf24" strokeWidth="1.75" strokeLinecap="round" />
        <line x1="27.2" y1="10.5" x2="24.8" y2="11.5" stroke="#fbbf24" strokeWidth="1.75" strokeLinecap="round" />

        {/* Rising Golden Sun */}
        <circle cx="16" cy="11.5" r="4.25" fill="url(#rr-sun-gradient)" />

        {/* Photovoltaic Solar Panel Array Structure */}
        <polygon
          points="8,21 16,14 24,21 22.5,27 9.5,27"
          fill="#090d16"
          stroke="url(#rr-pv-gradient)"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />

        {/* Solar Cell Grid Lines (Photovoltaic Strings) */}
        <line x1="16" y1="14.5" x2="16" y2="26.5" stroke="#38bdf8" strokeWidth="1.1" strokeOpacity="0.85" />
        <line x1="12" y1="23.5" x2="20" y2="23.5" stroke="#38bdf8" strokeWidth="0.9" strokeOpacity="0.75" />
        <line x1="10.5" y1="26.2" x2="21.5" y2="26.2" stroke="#38bdf8" strokeWidth="0.7" strokeOpacity="0.5" />

        {/* Crisp Geometric Rooftop Ridge & Gable */}
        <path
          d="M4.5 21L16 11L27.5 21"
          stroke="url(#rr-ridge-gradient)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Optional Integrated Wordmark */}
      {showWordmark && (
        <span className="text-lg font-bold tracking-tight text-white font-sans">
          Roof<span className="text-amber-400">Ray</span>
        </span>
      )}
    </div>
  );
};
