import { memo } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useApiKeyValidation } from "../hooks/useApiKeyValidation";
import { SidebarHeader } from "./navigation/SidebarHeader";
import { PublicMenu } from "./navigation/PublicMenu";
import { ProjectMenu } from "./navigation/ProjectMenu";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = memo(function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { currentProject } = useProjectStore();
  const { isValid, isTested } = useApiKeyValidation();

  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-100 transition-transform md:static md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <SidebarHeader onClose={onClose} />
      <nav className="flex flex-col">
        <PublicMenu />
        {isTested && isValid && (
          <ProjectMenu currentProject={currentProject ?? undefined} />
        )}
      </nav>
    </div>
  );
});

export default Sidebar;
