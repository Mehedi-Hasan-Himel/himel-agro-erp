import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Majestic Adult Pigeon (Cock / Male) Outlined Icon
 * Modeled directly from authentic homing/racing pigeon morphology:
 * - High rounded head with distinct cere & beak
 * - Proud puffed chest & iridescent crop curve
 * - Folded wing with flight bars & extended primary tail feathers
 * - Standing feet with forward claws
 * Sized and optimized in clean 24x24 outline stroke aesthetic.
 */
export function CockPigeonIcon({ className = "w-5 h-5", ...props }: IconProps) {
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
      {/* Crown & Forehead */}
      <path d="M15 2.5c2-1.2 4.2-.4 5 1.2 0 .5.3 1.3 0 2" />

      {/* Beak & Cere */}
      <path d="M20 5.8L23.5 7.2l-3.5 1.2" />

      {/* Eye */}
      <circle cx="17.2" cy="4.5" r="0.8" fill="currentColor" />

      {/* Proud Puffed Breast & Lower Belly */}
      <path d="M20 8.8c1 2.8.6 6-.8 8.2-1.6 2.4-4.2 3.2-6.8 2.8" />

      {/* Nape, Back & Long Tail Feathers */}
      <path d="M15 2.5c-1.6 1.6-2.5 4-2.8 6.5-.6 3.2-4.8 8-10.8 10.2l4.5-1" />

      {/* Folded Wing & Wing Bar */}
      <path d="M12.2 9c2.2 0 5.2 1.6 5.5 4.8.2 3.2-2.8 5.4-6 5.6" />
      <path d="M8 16.2c2.2-.6 4.6-1.6 5.5-3.8" />

      {/* Tail Under-feathers */}
      <path d="M1.5 20.5l5.5-2.5" />

      {/* Perched Feet & Toes */}
      <path d="M14.5 19.5v3h3M11 19.5v3h2.2" />
    </svg>
  );
}

export default CockPigeonIcon;
