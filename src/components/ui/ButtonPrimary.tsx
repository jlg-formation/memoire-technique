import React from "react";

interface ButtonPrimaryProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function ButtonPrimary({
  children,
  className = "",
  disabled,
  ...props
}: ButtonPrimaryProps) {
  return (
    <button
      className={`rounded-md border border-blue-600 bg-blue-600 px-4 py-2 font-medium text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
        disabled
          ? "cursor-not-allowed border-gray-400 bg-gray-400 text-gray-200"
          : "cursor-pointer hover:border-blue-700 hover:bg-blue-700"
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
