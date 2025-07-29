import { create } from "zustand";
import type { Project } from "../types/project";
import {
  loadProjects,
  saveProject as persistProject,
  deleteProject as removeProject,
} from "../lib/storage";

type ProjectStore = {
  projects: Project[];
  currentProject: Project | null;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  setProject: (project: Project) => void;
};

export const useProjectStore = create<ProjectStore>((set) => {
  // Load persisted projects on initialization
  void loadProjects().then((projects) => set({ projects }));

  return {
    projects: [],
    currentProject: null,
    addProject: (project) => {
      set((state) => ({ projects: [...state.projects, project] }));
      void persistProject(project);
    },
    deleteProject: (id) => {
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject:
          state.currentProject?.id === id ? null : state.currentProject,
      }));
      void removeProject(id);
    },
    setProject: (project) => set({ currentProject: project }),
  };
});
