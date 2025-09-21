import { useProjectStore } from "../store/useProjectStore";
import {
  exportProjectJSON,
  exportProjectZIP,
  downloadBlob,
} from "../lib/export";
import { executeDeleteAction } from "../lib/critical-actions";
import type { Project } from "../types/project";
import { useNavigate } from "react-router-dom";
import {
  ButtonPrimary,
  Button,
  ButtonLink,
  AccentButton,
} from "../components/ui";
import {
  Plus,
  Upload,
  Download,
  Archive,
  FileText,
  Calendar,
  DollarSign,
  Trash2,
  Edit3,
} from "lucide-react";

function Projects() {
  const {
    projects,
    currentProject,
    deleteProject,
    setProject,
    clearCurrentProject,
  } = useProjectStore();
  const navigate = useNavigate();

  const handleExportJSON = (project: Project): void => {
    const json = exportProjectJSON(project);
    const blob = new Blob([json], { type: "application/json" });
    downloadBlob(blob, `${project.consultationTitle}.json`);
  };

  const handleExportZIP = async (project: Project): Promise<void> => {
    const blob = await exportProjectZIP(project);
    downloadBlob(blob, `${project.consultationTitle}.zip`);
  };

  const handleEditProject = (project: Project): void => {
    navigate(`/projects/${project.slug}/edit`);
  };

  const handleProjectClick = (project: Project): void => {
    if (currentProject?.id === project.id) {
      // Si le projet est déjà sélectionné, le désélectionner
      clearCurrentProject();
    } else {
      // Sinon, le sélectionner
      setProject(project);
    }
  };

  // Suppression de handleCloseEdit, non utilisé

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
          <ButtonPrimary
            onClick={() => navigate("/projects/create")}
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nouveau
          </ButtonPrimary>

          <Button
            onClick={() => navigate("/projects/import")}
            className="flex items-center gap-2"
          >
            <Upload className="h-5 w-5" />
            Importer
          </Button>

          {/* Export buttons - visible only when a project is selected */}
          {currentProject && (
            <>
              <div className="mx-3 border-l border-gray-300"></div>
              <AccentButton
                onClick={() => handleExportJSON(currentProject)}
                className="flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
                Export JSON
              </AccentButton>
              <AccentButton
                onClick={() => handleExportZIP(currentProject)}
                className="flex items-center gap-2"
              >
                <Archive className="h-5 w-5" />
                Export ZIP
              </AccentButton>
            </>
          )}
        </div>

        {/* Selected Project Info */}
        <div className="mb-6 flex h-28 flex-col rounded-lg border border-blue-200 bg-blue-50 p-4">
          {currentProject ? (
            <>
              <div className="mb-1 flex-shrink-0 text-sm font-medium text-blue-900">
                Projet sélectionné :
              </div>
              <div
                className="line-clamp-3 flex-1 overflow-hidden text-sm leading-tight text-blue-800"
                title={currentProject.consultationTitle}
              >
                {currentProject.consultationTitle}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-blue-700 opacity-60">
              Aucun projet sélectionné
            </div>
          )}
        </div>

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-24 w-24 text-gray-400">
              <FileText className="h-full w-full" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Aucun projet
            </h3>
            <p className="mb-4 text-gray-500">
              Créez votre premier projet pour commencer.
            </p>
            <ButtonPrimary
              onClick={() => navigate("/projects/create")}
              className="inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouveau projet
            </ButtonPrimary>
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
                onClick={() => handleProjectClick(project)}
              >
                <div className="mb-4">
                  <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">
                    {project.consultationTitle}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Date limite :{" "}
                      {new Date(project.submissionDeadline).toLocaleDateString(
                        "fr-FR",
                      )}
                      {project.submissionTime && (
                        <span className="ml-1 text-gray-500">
                          à {project.submissionTime}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {(project.worksAmount || 0).toLocaleString("fr-FR")} € HT
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div>
                    Créé le{" "}
                    {new Date(project.creationDate).toLocaleDateString("fr-FR")}
                  </div>
                  {currentProject?.id === project.id && (
                    <div className="flex items-center gap-1">
                      <ButtonLink
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProject(project);
                        }}
                        className="rounded p-1 text-blue-500 hover:bg-blue-50"
                      >
                        <Edit3 className="h-4 w-4" />
                      </ButtonLink>
                      <ButtonLink
                        onClick={(e) => {
                          e.stopPropagation();
                          executeDeleteAction(
                            () => deleteProject(project.id),
                            project.consultationTitle,
                          );
                        }}
                        className="rounded p-1 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </ButtonLink>
                    </div>
                  )}
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
