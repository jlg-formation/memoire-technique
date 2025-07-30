import { useProjectStore } from "../store/useProjectStore";

function Missions() {
  const { currentProject } = useProjectStore();

  if (!currentProject) {
    return (
      <div className="p-4 text-red-500">Veuillez sélectionner un projet.</div>
    );
  }

  const missions = currentProject.missions ?? [];

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Missions</h1>
      {missions.length ? (
        <ul className="list-disc pl-6">
          {missions.map((mission, idx) => (
            <li key={idx}>{mission}</li>
          ))}
        </ul>
      ) : (
        <div>Aucune mission détectée.</div>
      )}
    </div>
  );
}

export default Missions;
