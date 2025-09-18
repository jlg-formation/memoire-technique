import { create } from "zustand";
import type { Project } from "../types/project";
import { stripPdfFields } from "../lib/sanitize";
import {
  loadProjects,
  saveProject as persistProject,
  deleteProject as removeProject,
} from "../lib/storage";

const CURRENT_PROJECT_KEY = "current_project_id";

type ProjectStore = {
  projects: Project[];
  currentProject: Project | null;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  setProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  updateCurrentProject: (data: Partial<Project>) => void;
};

export const useProjectStore = create<ProjectStore>((set) => {
  // Load persisted projects on initialization
  void loadProjects().then((projects) => {
    const savedId = localStorage.getItem(CURRENT_PROJECT_KEY);
    set({
      projects,
      currentProject: savedId
        ? (projects.find((p) => p.id === savedId) ?? null)
        : null,
    });
  });

  return {
    projects: [],
    currentProject: null,
    addProject: (project) => {
      const clean = stripPdfFields(project);
      set((state) => ({ projects: [...state.projects, clean] }));
      void persistProject(clean);
    },
    deleteProject: (id) => {
      set((state) => {
        const current =
          state.currentProject?.id === id ? null : state.currentProject;
        if (!current) {
          localStorage.removeItem(CURRENT_PROJECT_KEY);
        }
        return {
          projects: state.projects.filter((p) => p.id !== id),
          currentProject: current,
        };
      });
      void removeProject(id);
    },
    setProject: (project) => {
      const clean = stripPdfFields(project);
      localStorage.setItem(CURRENT_PROJECT_KEY, clean.id);
      set({ currentProject: clean });
    },
    updateProject: (project) => {
      const clean = stripPdfFields({
        ...project,
        lastUpdateDate: new Date().toISOString(),
      });
      void persistProject(clean);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === clean.id ? clean : p)),
        currentProject:
          state.currentProject?.id === clean.id ? clean : state.currentProject,
      }));
    },
    updateCurrentProject: (data) => {
      set((state) => {
        if (!state.currentProject) return state;

        const updated = stripPdfFields({
          ...state.currentProject,
          ...data,
          lastUpdateDate: new Date().toISOString(),
        });
        void persistProject(updated);
        return {
          projects: state.projects.map((p) =>
            p.id === updated.id ? updated : p,
          ),
          currentProject: updated,
        };
      });
    },
  };
});
