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

  const baseClassName = `w-full rounded-md border pb-3 pl-3 pt-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${className}`;

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
              ? "cursor-default resize-none overflow-hidden border-gray-200 bg-gray-50 pr-12"
              : "resize-both overflow-auto border-gray-300 bg-white pr-16"
          } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        />

        {!disabled && (
          <button
            type="button"
            onClick={handleToggleEdit}
            className={`absolute top-2 right-6 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-all duration-200 ${
              !isEditing
                ? "bg-gray-100/80 text-gray-400 backdrop-blur-sm hover:bg-gray-200 hover:text-gray-600"
                : "bg-blue-100/90 text-blue-600 shadow-sm backdrop-blur-sm hover:bg-blue-200"
            }`}
            title={isEditing ? "Passer en lecture seule" : "Modifier"}
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
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
