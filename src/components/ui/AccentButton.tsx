import React from "react";

interface AccentButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function AccentButton({
  children,
  className = "",
  disabled,
  ...props
}: AccentButtonProps) {
  return (
    <button
      className={`flex items-center justify-center gap-2 rounded-md border border-green-600 bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:border-green-700 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none ${
        disabled
          ? "cursor-not-allowed border-gray-400 bg-gray-400 text-gray-200"
          : "cursor-pointer"
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
