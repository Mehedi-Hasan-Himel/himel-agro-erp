import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Pigeon Sale / Market Tag Icon
 * Styled in 24x24 stroke aesthetic compatible with Lucide icon system.
 */
export function PigeonSaleIcon({ className = "w-4 h-4", ...props }: IconProps) {
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
      {/* Pigeon Silhouette */}
      <path d="M11 5a2.5 2.5 0 0 0-3.5 2.3c0 .5.2 1 .4 1.4" />
      <path d="M7.5 6L5 7.2l2.5 1" />
      <circle cx="9.5" cy="6" r="0.6" fill="currentColor" />
      <path d="M11 5c2 .5 3.2 2 3.2 4.5 0 2.2-1.5 4.2-3.8 4.8H5L3.5 15.5 4.5 13c-.6-.8-1-1.8-1-2.8 0-2.2 1.5-4 3.8-4.5" />
      <path d="M6 15v2.5M8.5 15v2.5" />
      
      {/* Price / Sale Tag Badge on Right */}
      <path d="M14 11l5-5 4 4-5 5-4-4z" />
      <circle cx="19.5" cy="8.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

export default PigeonSaleIcon;
