import type { Project } from "../types/project";

export function exportProjectJSON(project: Project): string {
  return JSON.stringify(project, null, 2);
}

export function importProjectJSON(json: string): Project {
  return JSON.parse(json) as Project;
}

// Placeholder for future JSZip integration
export async function exportProjectZIP(project: Project): Promise<Blob> {
  void project; // placeholder to avoid unused parameter lint error
  throw new Error("JSZip integration not implemented");
}
