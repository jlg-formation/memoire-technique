import React from "react";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  label?: string;
}

export function Select({
  options,
  placeholder,
  error,
  label,
  className = "",
  disabled,
  ...props
}: SelectProps) {
  const baseClasses = `
    w-full rounded-md border px-3 py-2 pr-10 text-gray-900 placeholder-gray-400
    transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    appearance-none bg-no-repeat bg-right bg-center
    ${
      disabled
        ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
        : "cursor-pointer bg-white border-gray-300 hover:border-gray-400"
    }
    ${error ? "border-red-500 focus:ring-red-500" : ""}
  `
    .replace(/\s+/g, " ")
    .trim();

  const chevronStyle = {
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: "right 0.5rem center",
    backgroundSize: "1.5em 1.5em",
  };

  return (
    <div className="flex flex-col">
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        className={`${baseClasses} ${className}`}
        style={chevronStyle}
        disabled={disabled}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
