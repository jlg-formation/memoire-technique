import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import {
  exportProjectJSON,
  exportProjectZIP,
  downloadBlob,
} from "../lib/export";
import type { Project } from "../types/project";
import ProjectCreate from "./ProjectCreate";
import ProjectImport from "./ProjectImport";

function Projects() {
  const { projects, currentProject, deleteProject, setProject } =
    useProjectStore();

  const [currentView, setCurrentView] = useState<"list" | "create" | "import">(
    "list",
  );

  const handleExportJSON = (project: Project): void => {
    const json = exportProjectJSON(project);
    const blob = new Blob([json], { type: "application/json" });
    downloadBlob(blob, `${project.consultationTitle}.json`);
  };

  const handleExportZIP = async (project: Project): Promise<void> => {
    const blob = await exportProjectZIP(project);
    downloadBlob(blob, `${project.consultationTitle}.zip`);
  };

  if (currentView === "create") {
    return <ProjectCreate onClose={() => setCurrentView("list")} />;
  }

  if (currentView === "import") {
    return <ProjectImport onClose={() => setCurrentView("list")} />;
  }

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-800">Projets</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setCurrentView("create")}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nouveau
          </button>

          <button
            onClick={() => setCurrentView("import")}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Importer
          </button>

          {/* Export buttons - visible only when a project is selected */}
          {currentProject && (
            <>
              <div className="mx-3 border-l border-gray-300"></div>
              <button
                onClick={() => handleExportJSON(currentProject)}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white transition-colors hover:bg-green-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export JSON
              </button>
              <button
                onClick={() => handleExportZIP(currentProject)}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white transition-colors hover:bg-green-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                Export ZIP
              </button>
            </>
          )}
        </div>

        {/* Selected Project Info */}
        {currentProject && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="text-sm font-medium text-blue-900">
              Projet sélectionné :
            </div>
            <div className="text-blue-800">
              {currentProject.consultationTitle}
            </div>
          </div>
        )}

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-24 w-24 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Aucun projet
            </h3>
            <p className="mb-4 text-gray-500">
              Créez votre premier projet pour commencer.
            </p>
            <button
              onClick={() => setCurrentView("create")}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nouveau projet
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`cursor-pointer rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md ${
                  currentProject?.id === project.id
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setProject(project)}
              >
                <div className="mb-4">
                  <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">
                    {project.consultationTitle}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Date limite :{" "}
                      {new Date(project.submissionDeadline).toLocaleDateString(
                        "fr-FR",
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      {(project.worksAmount || 0).toLocaleString("fr-FR")} € HT
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div>
                    Créé le{" "}
                    {new Date(project.creationDate).toLocaleDateString("fr-FR")}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                    className="rounded p-1 text-red-500 hover:bg-red-50"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Projects;
