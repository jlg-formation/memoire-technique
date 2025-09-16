import { useState } from "react";
import { Edit3 } from "lucide-react";

interface EditableTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export function EditableTextArea({
  value,
  onChange,
  placeholder = "",
  rows = 4,
  className = "",
  disabled = false,
  label,
}: EditableTextAreaProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleToggleEdit = () => {
    if (disabled) return;
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const baseClassName = `w-full rounded-md border p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${className}`;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          readOnly={!isEditing}
          disabled={disabled}
          className={`${baseClassName} ${
            !isEditing
              ? "cursor-default resize-none overflow-hidden border-gray-200 bg-gray-50"
              : "resize-both overflow-auto border-gray-300 bg-white"
          } ${disabled ? "cursor-not-allowed opacity-50" : ""} pr-12`}
        />

        {!disabled && (
          <div className="absolute top-2 right-2">
            <button
              type="button"
              onClick={handleToggleEdit}
              className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
                !isEditing
                  ? "border-gray-200 bg-white text-gray-500 hover:border-blue-300 hover:text-blue-600"
                  : "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
              }`}
              title={isEditing ? "Passer en lecture seule" : "Modifier"}
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="text-xs text-gray-500">
          Appuyez sur Échap pour passer en lecture seule
        </div>
      )}
    </div>
  );
}
