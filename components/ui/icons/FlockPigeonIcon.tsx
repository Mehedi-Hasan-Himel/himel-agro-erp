import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Flock of Pigeons Icon (Total Active Flock Population)
 * Designed in matching 24x24 stroke aesthetic compatible with Lucide:
 * - Lead adult pigeon in foreground with authentic homing morphology
 * - Companion flock bird silhouette in background
 * Perfect representation for total flock inventory / live population count.
 */
export function FlockPigeonIcon({ className = "w-5 h-5", ...props }: IconProps) {
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
      {/* Background Flock Bird (Crown, Beak, Eye & Back Arc) */}
      <path d="M7 2.2c1.8-.8 3.5-.2 4.2 1 .2.4.4.9.2 1.5" />
      <path d="M11.6 4.8l2.2.8-2.2.8" />
      <circle cx="9.2" cy="3.5" r="0.6" fill="currentColor" />
      <path d="M7 2.2C5 3.8 3.5 6.2 3 9c-.3 1.8.2 3.5 1 5" />

      {/* Foreground Main Pigeon Crown & Forehead */}
      <path d="M15 4.5c1.8-1 3.8-.2 4.6 1.2 0 .5.3 1.2 0 1.8" />

      {/* Foreground Pigeon Beak & Cere */}
      <path d="M19.6 7.5L23 8.8l-3.4 1.2" />

      {/* Foreground Eye */}
      <circle cx="16.8" cy="6.5" r="0.75" fill="currentColor" />

      {/* Proud Breast & Lower Belly */}
      <path d="M19.6 10.2c.8 2.5.4 5.5-.8 7.6-1.5 2.2-4 3-6.6 2.6" />

      {/* Nape, Back & Long Tail Feathers */}
      <path d="M15 4.5c-1.5 1.5-2.4 3.8-2.6 6.2-.5 3-4.5 7.8-10.4 10l4.5-1" />

      {/* Folded Wing & Flight Bar */}
      <path d="M12 10.5c2.2 0 5 1.5 5.2 4.6.2 3-2.6 5.2-5.8 5.4" />
      <path d="M8.2 17.5c2-.5 4.4-1.5 5.2-3.6" />

      {/* Tail Under-feathers */}
      <path d="M2.5 21.2l5-2.2" />

      {/* Perched Feet & Claws */}
      <path d="M14.2 19.8v2.7h2.8M11 19.8v2.7h2" />
    </svg>
  );
}

export default FlockPigeonIcon;
