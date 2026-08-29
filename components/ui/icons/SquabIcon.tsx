import React from "react";

export interface SquabIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Authentic Pigeon Squab / Baby Pigeon Icon
 * Styled in matching 24x24 stroke aesthetic compatible with Lucide icon system.
 */
export function SquabIcon({ className = "w-4 h-4", ...props }: SquabIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Baby Pigeon Head */}
      <path d="M14 8.5a3.5 3.5 0 1 0-7 0c0 1.1.5 2.1 1.3 2.8" />
      
      {/* Young Pigeon Beak */}
      <path d="M7 8L3.5 9.5L7 11" />
      
      {/* Eye */}
      <circle cx="11.5" cy="8" r="0.75" fill="currentColor" />
      
      {/* Young Squab Body & Soft Feather Curve */}
      <path d="M14 8.5c3.3 0 6 2.5 6 6 0 3-2.5 5.5-6 5.5H9c-3.3 0-5.5-2.2-5.5-5 0-1.5.5-2.8 1.5-3.8" />
      
      {/* Little Wing Bud */}
      <path d="M11 14c2.2 0 4.2 1 4.8 2.8" />
      
      {/* Nestling Feet */}
      <path d="M9 20v2M13 20v2" />
    </svg>
  );
}

export default SquabIcon;
