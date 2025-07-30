import type { Project } from "../types/project";

export function stripPdfFields(project: Project): Project {
  const clone: Project = JSON.parse(JSON.stringify(project));
  clone.participatingCompanies?.forEach((company) => {
    delete (company as unknown as Record<string, unknown>).presentationFile;
    company.mobilizedPeople?.forEach((person) => {
      delete (person as unknown as Record<string, unknown>).cvFile;
    });
  });
  return clone;
}
