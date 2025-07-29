import { create } from "zustand";
import type { Project } from "../types/project";

type ProjectStore = {
  projects: Project[];
  currentProject: Project | null;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  setProject: (project: Project) => void;
};

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  currentProject: null,
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject:
        state.currentProject?.id === id ? null : state.currentProject,
    })),
  setProject: (project) => set({ currentProject: project }),
}));
