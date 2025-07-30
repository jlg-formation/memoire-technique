import { useProjectStore } from "../store/useProjectStore";

function Notation() {
  const { currentProject } = useProjectStore();

  if (!currentProject) {
    return (
      <div className="p-4 text-red-500">Veuillez sélectionner un projet.</div>
    );
  }

  const items = currentProject.notation ?? [];

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Notation</h1>
      {items.length ? (
        <table className="w-full table-auto border">
          <thead>
            <tr>
              <th className="border p-2 text-left">Aspect</th>
              <th className="border p-2">Points</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="border p-2">{item.label}</td>
                <td className="border p-2 text-center">{item.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>Aucune notation extraite.</div>
      )}
    </div>
  );
}

export default Notation;
