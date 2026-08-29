import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: Option[];
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, options, helperText, id, children, ...props },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            {label}
            {props.required && <span className="text-rose-600 ml-1 font-black">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer",
            error ? "border-rose-500 focus:border-rose-600 focus:ring-rose-500/25" : "border-slate-300",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-xs text-rose-700 font-semibold">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-slate-600 font-medium">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
