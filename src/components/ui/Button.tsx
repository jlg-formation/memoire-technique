import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
        disabled
          ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
          : "cursor-pointer"
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
