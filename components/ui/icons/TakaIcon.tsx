import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Authentic Bangladeshi Taka (৳) Symbol
 * Renders the official Bengali currency sign (৳) in bold typography.
 */
export function TakaIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <text
        x="50%"
        y="52%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize="21"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans Bengali', 'SolaimanLipi', sans-serif"
      >
        ৳
      </text>
    </svg>
  );
}

export default TakaIcon;
