import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import type { GroupMember } from "../types/project";

function Groupement() {
  const { currentProject, updateCurrentProject } = useProjectStore();
  const [name, setName] = useState("");

  if (!currentProject) {
    return (
      <div className="p-4 text-red-500">Veuillez sélectionner un projet.</div>
    );
  }

  const members = currentProject.groupMembers ?? [];

  const handleAdd = () => {
    if (!name.trim()) return;
    const newMember: GroupMember = { id: crypto.randomUUID(), name };
    updateCurrentProject({ groupMembers: [...members, newMember] });
    setName("");
  };

  const handleDelete = (id: string) => {
    updateCurrentProject({
      groupMembers: members.filter((m) => m.id !== id),
      mandataireId:
        currentProject.mandataireId === id
          ? undefined
          : currentProject.mandataireId,
    });
  };

  const handleMandataire = (id: string) => {
    updateCurrentProject({ mandataireId: id });
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Groupement</h1>
      <label className="block font-semibold">Type de groupement</label>
      <select
        className="w-full border p-2"
        value={currentProject.groupType ?? ""}
        onChange={(e) =>
          updateCurrentProject({
            groupType: e.target.value as "solidaire" | "conjoint",
          })
        }
      >
        <option value="">-- choisir --</option>
        <option value="solidaire">Solidaire</option>
        <option value="conjoint">Conjoint</option>
      </select>

      <div className="space-y-2">
        <label className="block font-semibold">Participants</label>
        <div className="flex space-x-2">
          <input
            className="flex-1 border p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de l'entreprise"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="bg-blue-500 px-4 py-2 text-white"
          >
            Ajouter
          </button>
        </div>
        <ul className="space-y-1">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="mandataire"
                  checked={currentProject.mandataireId === member.id}
                  onChange={() => handleMandataire(member.id)}
                />
                <span>{member.name}</span>
              </label>
              <button
                type="button"
                onClick={() => handleDelete(member.id)}
                className="text-red-500"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Groupement;
