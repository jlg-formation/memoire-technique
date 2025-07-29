import { create } from "zustand";
import type { Project } from "../types/project";

type ProjectStore = {
  currentProject: Project | null;
  setProject: (project: Project) => void;
};

export const useProjectStore = create<ProjectStore>((set) => ({
  currentProject: null,
  setProject: (project) => set({ currentProject: project }),
}));
