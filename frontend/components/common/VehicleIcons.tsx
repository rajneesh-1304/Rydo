"use client";

import React from "react";

export const BikeIcon = ({ size = 32 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="34" r="8" stroke="#1f2937" strokeWidth="3" />
    <circle cx="36" cy="34" r="8" stroke="#1f2937" strokeWidth="3" />
    <path
      d="M12 34L20 22H32L36 34"
      stroke="#1f2937"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M26 14L20 22"
      stroke="#eab308"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M24 14H30"
      stroke="#1f2937"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M28 22L36 34"
      stroke="#1f2937"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="12" cy="34" r="3" fill="#eab308" />
    <circle cx="36" cy="34" r="3" fill="#eab308" />
  </svg>
);

export const AutoIcon = ({ size = 32 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Auto Rickshaw cabin */}
    <path
      d="M10 26L16 12H30L38 24V32H10V26Z"
      fill="#fde047"
      stroke="#1f2937"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Windshield */}
    <path
      d="M30 14L36 24H28V14H30Z"
      fill="#93c5fd"
      stroke="#1f2937"
      strokeWidth="2"
    />
    {/* Driver front */}
    <path
      d="M38 24H42V32H38V24Z"
      fill="#1f2937"
      stroke="#1f2937"
      strokeWidth="2"
    />
    {/* Wheels */}
    <circle cx="16" cy="34" r="6" fill="#374151" stroke="#111827" strokeWidth="2.5" />
    <circle cx="16" cy="34" r="2.5" fill="#e5e7eb" />
    <circle cx="36" cy="34" r="6" fill="#374151" stroke="#111827" strokeWidth="2.5" />
    <circle cx="36" cy="34" r="2.5" fill="#e5e7eb" />
  </svg>
);

export const MiniIcon = ({ size = 32 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 52 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Hatchback body */}
    <path
      d="M8 26L14 16H30L40 22L46 26V32H6V26H8Z"
      fill="#93c5fd"
      stroke="#1f2937"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Windows */}
    <path
      d="M16 18H28V24H14L16 18Z"
      fill="#dbeafe"
      stroke="#1f2937"
      strokeWidth="1.5"
    />
    <path
      d="M30 18H37L42 24H30V18Z"
      fill="#dbeafe"
      stroke="#1f2937"
      strokeWidth="1.5"
    />
    {/* Headlight */}
    <rect x="44" y="27" width="3" height="3" rx="1" fill="#facc15" />
    {/* Wheels */}
    <circle cx="15" cy="32" r="5.5" fill="#1f2937" stroke="#111827" strokeWidth="2" />
    <circle cx="15" cy="32" r="2" fill="#e5e7eb" />
    <circle cx="37" cy="32" r="5.5" fill="#1f2937" stroke="#111827" strokeWidth="2" />
    <circle cx="37" cy="32" r="2" fill="#e5e7eb" />
  </svg>
);

export const SedanIcon = ({ size = 32 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 56 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Sedan body */}
    <path
      d="M4 27L12 25L18 16H36L44 24L50 26V31H4V27Z"
      fill="#111827"
      stroke="#111827"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Roof line */}
    <path
      d="M19 18H35L41 24H16L19 18Z"
      fill="#60a5fa"
      stroke="#1f2937"
      strokeWidth="1.5"
    />
    {/* Yellow taxi badge or trim */}
    <rect x="25" y="14" width="8" height="3" rx="1" fill="#eab308" />
    {/* Headlight */}
    <circle cx="49" cy="27" r="1.5" fill="#fef08a" />
    {/* Tail light */}
    <circle cx="5" cy="27" r="1.5" fill="#ef4444" />
    {/* Wheels */}
    <circle cx="14" cy="31" r="5" fill="#374151" stroke="#111827" strokeWidth="2" />
    <circle cx="14" cy="31" r="2" fill="#9ca3af" />
    <circle cx="42" cy="31" r="5" fill="#374151" stroke="#111827" strokeWidth="2" />
    <circle cx="42" cy="31" r="2" fill="#9ca3af" />
  </svg>
);

export const TaxiiLogoPin = ({ size = 42 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M24 4C15.1634 4 8 11.1634 8 20C8 30.5 24 44 24 44C24 44 40 30.5 40 20C40 11.1634 32.8366 4 24 4Z"
      fill="#FFCC00"
    />
    <circle cx="24" cy="20" r="10" fill="#111827" />
    <path
      d="M18 22L20 18H28L30 22V24H18V22Z"
      fill="#FFCC00"
    />
    <circle cx="20.5" cy="24" r="1.2" fill="#ffffff" />
    <circle cx="27.5" cy="24" r="1.2" fill="#ffffff" />
  </svg>
);
