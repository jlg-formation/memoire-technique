import { useProjectStore } from "../store/useProjectStore";

function Memoire() {
  const { currentProject } = useProjectStore();

  if (!currentProject) {
    return (
      <div className="p-4 text-red-500">Veuillez sélectionner un projet.</div>
    );
  }

  return (
    <div className="prose mx-auto p-4">
      {currentProject.memoHtml ? (
        <div dangerouslySetInnerHTML={{ __html: currentProject.memoHtml }} />
      ) : (
        <div>Aucun mémoire technique disponible.</div>
      )}
    </div>
  );
}

export default Memoire;
