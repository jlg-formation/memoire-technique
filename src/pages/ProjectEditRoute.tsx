import { useParams, useNavigate } from "react-router-dom";
import { useProjectStore } from "../store/useProjectStore";
import ProjectEdit from "./ProjectEdit";

function ProjectEditRoute() {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const navigate = useNavigate();
  const { projects } = useProjectStore();

  const project = projects.find((p) => p.slug === projectSlug);

  if (!project) {
    return (
      <div className="p-8 text-center text-red-600">
        Projet introuvable
        <button
          className="ml-4 rounded bg-blue-500 px-4 py-2 text-white"
          onClick={() => navigate("/projects")}
        >
          Retour aux projets
        </button>
      </div>
    );
  }

  return (
    <ProjectEdit project={project} onClose={() => navigate("/projects")} />
  );
}

export default ProjectEditRoute;
