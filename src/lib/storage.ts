import localforage from "localforage";
import type { Project } from "../types/project";
import { stripPdfFields } from "./sanitize";

const store = localforage.createInstance({ name: "projects" });

export async function loadProjects(): Promise<Project[]> {
  const projects: Project[] = [];
  await store.iterate<Project, void>((value) => {
    const obj = value as unknown as Record<string, string>;
    const normalized = {
      ...value,
      creationDate: obj.creationDate ?? obj.createdAt,
      lastUpdateDate: obj.lastUpdateDate ?? obj.updatedAt,
    } as Project;
    projects.push(stripPdfFields(normalized));
  });
  return projects;
}

export function saveProject(project: Project): Promise<void> {
  const updated = {
    ...project,
    lastUpdateDate: new Date().toISOString(),
  } satisfies Project;
  return store.setItem(updated.id, stripPdfFields(updated)).then(() => {});
}

export function deleteProject(id: string): Promise<void> {
  return store.removeItem(id);
}
