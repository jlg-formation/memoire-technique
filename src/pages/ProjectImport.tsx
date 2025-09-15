import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { importProjectJSON, importProjectZIP } from "../lib/export";
import type { Project } from "../types/project";
import { ButtonLink } from "../components/ui";
import { ArrowLeft, Upload } from "lucide-react";

interface ProjectImportProps {
  onClose: () => void;
}

function ProjectImport({ onClose }: ProjectImportProps) {
  const { addProject, setProject } = useProjectStore();
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleImport = async (file: File): Promise<void> => {
    if (!file) return;

    setImporting(true);
    try {
      let project: Project;
      if (file.name.endsWith(".zip")) {
        project = await importProjectZIP(file);
      } else {
        const json = await file.text();
        project = importProjectJSON(json);
      }
      addProject(project);
      setProject(project);
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'import:", error);
      alert(
        "Erreur lors de l'import du projet. Vérifiez que le fichier est valide.",
      );
    } finally {
      setImporting(false);
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImport(file);
    }
    e.target.value = "";
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith(".json") || file.name.endsWith(".zip"))) {
      await handleImport(file);
    }
  };

  return (
    <div className="min-h-screen space-y-6 p-2 sm:p-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="mb-2 flex items-center gap-3">
          <ButtonLink
            onClick={onClose}
            className="flex shrink-0 items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Précédent</span>
          </ButtonLink>
        </div>
        <h1 className="text-xl font-semibold text-gray-800 sm:text-2xl">
          Importer un projet
        </h1>
      </div>

      {/* Import Zone */}
      <div className="space-y-4">
        <div className="text-xs text-gray-600 sm:text-sm">
          Importez un projet existant au format JSON ou ZIP.
        </div>

        <div
          className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors sm:p-8 ${
            dragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".json,.zip"
            onChange={handleFileChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            disabled={importing}
          />

          <div className="space-y-3 sm:space-y-4">
            <div className="mx-auto h-10 w-10 text-gray-400 sm:h-12 sm:w-12">
              <Upload className="h-full w-full" />
            </div>

            {importing ? (
              <div className="text-sm text-blue-600 sm:text-base">
                Import en cours...
              </div>
            ) : (
              <>
                <div className="text-base font-medium text-gray-700 sm:text-lg">
                  Glissez-déposez votre fichier ici
                </div>
                <div className="text-xs text-gray-500 sm:text-sm">
                  ou cliquez pour sélectionner un fichier
                </div>
                <div className="text-xs text-gray-400">
                  Formats acceptés : .json, .zip
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectImport;
