import { useState } from "react";
import { Edit3, Check, X } from "lucide-react";

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
  const [tempValue, setTempValue] = useState(value);

  const handleEdit = () => {
    if (disabled) return;
    setTempValue(value);
    setIsEditing(true);
  };

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    } else if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    }
  };

  const baseClassName = `w-full rounded-md border p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none ${className}`;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          value={isEditing ? tempValue : value}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          readOnly={!isEditing}
          disabled={disabled}
          className={`${baseClassName} ${
            !isEditing
              ? "cursor-default border-gray-200 bg-gray-50"
              : "border-gray-300 bg-white"
          } ${disabled ? "cursor-not-allowed opacity-50" : ""} pr-12`}
        />

        {!disabled && (
          <div className="absolute top-2 right-2 flex gap-1">
            {!isEditing ? (
              <button
                type="button"
                onClick={handleEdit}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:border-blue-300 hover:text-blue-600"
                title="Modifier"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-green-200 bg-green-50 text-green-600 transition-colors hover:bg-green-100"
                  title="Sauvegarder (Ctrl+Entrée)"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                  title="Annuler (Échap)"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {isEditing && (
        <div className="text-xs text-gray-500">
          Appuyez sur Ctrl+Entrée pour sauvegarder ou Échap pour annuler
        </div>
      )}
    </div>
  );
}
