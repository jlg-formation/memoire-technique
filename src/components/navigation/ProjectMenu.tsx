import { memo } from "react";
import { NavItem } from "../ui/NavItem";
import type { Project } from "../../types/project";

interface ProjectMenuProps {
  currentProject: Project | undefined;
}

export const ProjectMenu = memo(function ProjectMenu({
  currentProject,
}: ProjectMenuProps) {
  return (
    <>
      <NavItem to="/projects">
        {currentProject?.nomCourt
          ? `Projet : ${currentProject.nomCourt}`
          : "Projets"}
      </NavItem>
      {currentProject && (
        <>
          <NavItem to="/documents">Pièces marché</NavItem>
          <NavItem to="/notation">Notation</NavItem>
          <NavItem to="/equipes">Equipes</NavItem>
          <NavItem to="/missions">Missions</NavItem>
          <NavItem to="/planning">Planning</NavItem>
          <NavItem to="/memoire">Mémoire</NavItem>
          <NavItem to="/debug">Debug</NavItem>
        </>
      )}
    </>
  );
});
