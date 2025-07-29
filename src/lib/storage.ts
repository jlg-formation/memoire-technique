import localforage from "localforage";
import type { Project } from "../types/project";

const store = localforage.createInstance({ name: "projects" });

export async function loadProjects(): Promise<Project[]> {
  const projects: Project[] = [];
  await store.iterate<Project, void>((value) => {
    projects.push(value);
  });
  return projects;
}

export function saveProject(project: Project): Promise<void> {
  return store.setItem(project.id, project).then(() => {});
}

export function deleteProject(id: string): Promise<void> {
  return store.removeItem(id);
}
