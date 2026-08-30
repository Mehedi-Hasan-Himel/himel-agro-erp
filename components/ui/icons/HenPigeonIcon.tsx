import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Graceful Female Hen Pigeon Outlined Icon
 * Pairs harmoniously with CockPigeonIcon in the same 24x24 stroke aesthetic:
 * - Gentle rounded crown, delicate beak & cere wattle
 * - Graceful neck & brooding breast curve
 * - Layered wing feathers & tapered tail
 * - Perched feet with forward claws
 */
export function HenPigeonIcon({ className = "w-5 h-5", ...props }: IconProps) {
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
      <path d="M15 2.8c1.8-1 3.8-.2 4.6 1.2 0 .5.3 1.2 0 1.8" />

      {/* Beak & Cere */}
      <path d="M19.6 5.8L23 7.2l-3.4 1.2" />

      {/* Eye */}
      <circle cx="16.8" cy="4.8" r="0.75" fill="currentColor" />

      {/* Gentle Brooding Breast & Lower Belly */}
      <path d="M19.6 8.8c.8 2.6.4 5.6-.8 7.8-1.5 2.2-4 3-6.6 2.6" />

      {/* Nape, Back & Long Tail Feathers */}
      <path d="M15 2.8c-1.5 1.5-2.4 3.8-2.6 6.2-.5 3-4.5 7.8-10.4 10l4.5-1" />

      {/* Folded Wing & Gentle Feather Arc */}
      <path d="M12 9.2c2.2 0 5 1.5 5.2 4.6.2 3-2.6 5.2-5.8 5.4" />
      <path d="M8.2 16.2c2-.5 4.4-1.5 5.2-3.6" />

      {/* Tail Under-feathers */}
      <path d="M2 20.2l5.2-2.4" />

      {/* Perched Feet & Claws */}
      <path d="M14.2 19.5v3h2.8M11 19.5v3h2" />
    </svg>
  );
}

export default HenPigeonIcon;
