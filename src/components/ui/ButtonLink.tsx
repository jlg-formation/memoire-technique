import React from "react";

interface ButtonLinkProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function ButtonLink({
  children,
  className = "",
  disabled,
  ...props
}: ButtonLinkProps) {
  return (
    <button
      className={`flex items-center justify-center gap-2 bg-transparent px-4 py-2 font-semibold text-blue-600 transition-colors hover:text-blue-800 hover:underline focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
        disabled
          ? "cursor-not-allowed text-gray-400 hover:no-underline"
          : "cursor-pointer"
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
