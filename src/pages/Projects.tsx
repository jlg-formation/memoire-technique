import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";

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
