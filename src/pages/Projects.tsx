import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import {
  importProjectJSON,
  importProjectZIP,
  exportProjectJSON,
  exportProjectZIP,
  downloadBlob,
} from "../lib/export";
import type { Project } from "../types/project";

function Projects() {
  const { projects, currentProject, addProject, deleteProject, setProject } =
    useProjectStore();

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProject({
      id: crypto.randomUUID(),
      title,
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setTitle("");
    setStartDate("");
    setEndDate("");
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

  const handleExportJSON = (project: Project): void => {
    const json = exportProjectJSON(project);
    const blob = new Blob([json], { type: "application/json" });
    downloadBlob(blob, `${project.title}.json`);
  };

  const handleExportZIP = async (project: Project): Promise<void> => {
    const blob = await exportProjectZIP(project);
    downloadBlob(blob, `${project.title}.zip`);
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Projets</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          className="w-full border p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre"
          required
        />
        <input
          type="date"
          className="w-full border p-2"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <input
          type="date"
          className="w-full border p-2"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
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
                <div className="font-semibold">{project.title}</div>
                <div className="text-sm text-gray-600">
                  {project.startDate} – {project.endDate}
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
          Projet sélectionné : {currentProject.title}
        </div>
      )}
    </div>
  );
}

export default Projects;
