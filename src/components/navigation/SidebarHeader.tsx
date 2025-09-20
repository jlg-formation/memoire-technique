import { memo, useCallback } from "react";
import { X } from "lucide-react";

interface SidebarHeaderProps {
  onClose: () => void;
}

export const SidebarHeader = memo(function SidebarHeader({
  onClose,
}: SidebarHeaderProps) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleClose}
          className="cursor-pointer p-4 hover:bg-gray-300 md:hidden"
        >
          <X size={16} />
        </button>
        <h2 className="p-4 text-lg font-bold">Menu</h2>
      </div>
    </div>
  );
});
