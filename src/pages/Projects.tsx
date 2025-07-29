import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { importProjectJSON } from "../lib/export";

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
    const json = await file.text();
    const project = importProjectJSON(json);
    addProject(project);
    e.target.value = "";
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
        <button type="submit" className="bg-blue-500 px-4 py-2 text-white">
          Ajouter
        </button>
        <input
          type="file"
          accept="application/json"
          onChange={handleImport}
          className="w-full"
        />
      </form>
      <ul className="space-y-2">
        {projects.map((project) => (
          <li key={project.id} className="flex justify-between border p-2">
            <button
              type="button"
              onClick={() => setProject(project)}
              className="text-left"
            >
              <div className="font-semibold">{project.title}</div>
              <div className="text-sm text-gray-600">
                {project.startDate} – {project.endDate}
              </div>
            </button>
            <button
              type="button"
              onClick={() => deleteProject(project.id)}
              className="text-red-500"
            >
              Supprimer
            </button>
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
