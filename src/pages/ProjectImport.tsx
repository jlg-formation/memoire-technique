import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { importProjectJSON, importProjectZIP } from "../lib/export";
import type { Project } from "../types/project";
import { ButtonLink } from "../components/ui";

interface ProjectImportProps {
  onClose: () => void;
}

function ProjectImport({ onClose }: ProjectImportProps) {
  const { addProject } = useProjectStore();
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <ButtonLink onClick={onClose} className="flex items-center gap-2">
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Précédent
          </ButtonLink>
          <h1 className="text-2xl font-semibold text-gray-800">
            Importer un projet
          </h1>
        </div>
      </div>

      {/* Import Zone */}
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Importez un projet existant au format JSON ou ZIP.
        </div>

        <div
          className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
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

          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            {importing ? (
              <div className="text-blue-600">Import en cours...</div>
            ) : (
              <>
                <div className="text-lg font-medium text-gray-700">
                  Glissez-déposez votre fichier ici
                </div>
                <div className="text-sm text-gray-500">
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
