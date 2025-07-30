import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useOpenAIKeyStore } from "../store/useOpenAIKeyStore";
import {
  importProjectJSON,
  importProjectZIP,
  exportProjectJSON,
  exportProjectZIP,
  downloadBlob,
} from "../lib/export";
import { extractPdfText } from "../lib/pdf";
import { extractDocxText } from "../lib/docx";
import { extractConsultationInfo } from "../lib/OpenAI";
import type { Project } from "../types/project";

function Projects() {
  const { projects, currentProject, addProject, deleteProject, setProject } =
    useProjectStore();
  const { apiKey } = useOpenAIKeyStore();

  const [consultationTitle, setConsultationTitle] = useState("");
  const [submissionDeadline, setSubmissionDeadline] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProject({
      id: crypto.randomUUID(),
      consultationTitle,
      submissionDeadline,
      creationDate: new Date().toISOString(),
      lastUpdateDate: new Date().toISOString(),
    });
    setConsultationTitle("");
    setSubmissionDeadline("");
  };

  const handleImport = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    let project: Project;
    if (file.name.endsWith(".zip")) {
      project = await importProjectZIP(file);
    } else {
      const json = await file.text();
      project = importProjectJSON(json);
    }
    addProject(project);
    e.target.value = "";
  };

  const handleRCFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !apiKey) return;
    setProcessing(true);
    const text = file.name.toLowerCase().endsWith(".docx")
      ? await extractDocxText(file)
      : await extractPdfText(file);
    try {
      const info = await extractConsultationInfo(text, apiKey);
      setConsultationTitle(info.consultationTitle ?? "");
      setSubmissionDeadline(info.submissionDeadline ?? "");
    } catch (err) {
      console.error(err);
    }
    setProcessing(false);
    e.target.value = "";
  };

  const handleExportJSON = (project: Project): void => {
    const json = exportProjectJSON(project);
    const blob = new Blob([json], { type: "application/json" });
    downloadBlob(blob, `${project.consultationTitle}.json`);
  };

  const handleExportZIP = async (project: Project): Promise<void> => {
    const blob = await exportProjectZIP(project);
    downloadBlob(blob, `${project.consultationTitle}.zip`);
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Projets</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleRCFileChange}
          className="w-full"
        />
        <input
          className="w-full border p-2"
          value={consultationTitle}
          onChange={(e) => setConsultationTitle(e.target.value)}
          placeholder="Titre de la consultation"
          required
        />
        <input
          className="w-full border p-2"
          type="date"
          value={submissionDeadline}
          onChange={(e) => setSubmissionDeadline(e.target.value)}
          placeholder="Date limite"
          required
        />
        {processing && <div>Analyse en cours...</div>}
        <button
          type="submit"
          className="cursor-pointer bg-blue-500 px-4 py-2 text-white"
        >
          Ajouter
        </button>
      </form>
      <input
        type="file"
        accept=".json,.zip"
        onChange={handleImport}
        className="w-full"
      />
      <ul className="space-y-2">
        {projects.map((project) => (
          <li key={project.id} className="space-y-1 border p-2">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setProject(project)}
                className="cursor-pointer text-left"
              >
                <div className="font-semibold">{project.consultationTitle}</div>
                <div className="text-sm text-gray-600">
                  Créé le {project.creationDate}
                </div>
                <div className="text-sm text-gray-600">
                  Modifié le {project.lastUpdateDate}
                </div>
                <div className="text-sm text-gray-600">
                  Date limite : {project.submissionDeadline}
                </div>
              </button>
              <button
                type="button"
                onClick={() => deleteProject(project.id)}
                className="cursor-pointer text-red-500"
              >
                Supprimer
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleExportJSON(project)}
                className="cursor-pointer rounded bg-green-500 px-2 py-1 text-white"
              >
                Export JSON
              </button>
              <button
                type="button"
                onClick={() => handleExportZIP(project)}
                className="cursor-pointer rounded bg-green-500 px-2 py-1 text-white"
              >
                Export ZIP
              </button>
            </div>
          </li>
        ))}
      </ul>
      {currentProject && (
        <div className="text-green-600">
          Projet sélectionné : {currentProject.consultationTitle}
        </div>
      )}
    </div>
  );
}

export default Projects;
