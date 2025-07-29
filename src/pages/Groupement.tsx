import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import type { GroupMember } from "../types/project";
import { extractPdfText } from "../lib/pdf";
import { summarize } from "../lib/openai";

function Groupement() {
  const { currentProject, updateCurrentProject } = useProjectStore();
  const [name, setName] = useState("");
  const [summaryWords, setSummaryWords] = useState(100);

  if (!currentProject) {
    return (
      <div className="p-4 text-red-500">Veuillez sélectionner un projet.</div>
    );
  }

  const members = currentProject.groupMembers ?? [];

  const updateMembers = (updated: GroupMember[]) => {
    updateCurrentProject({ groupMembers: updated });
  };

  const handleRateChange = (id: string, value: number) => {
    updateMembers(
      members.map((m) => (m.id === id ? { ...m, dailyRate: value } : m)),
    );
  };

  const handleFileChange = async (id: string, file?: File) => {
    if (!file) return;
    const text = await extractPdfText(file);
    updateMembers(
      members.map((m) =>
        m.id === id ? { ...m, cvText: text, cvSummary: undefined } : m,
      ),
    );
  };

  const handleSummarize = async (id: string) => {
    const member = members.find((m) => m.id === id);
    if (!member?.cvText) return;
    try {
      const summary = await summarize(
        member.cvText,
        summaryWords,
        import.meta.env.VITE_OPENAI_KEY,
      );
      updateMembers(
        members.map((m) => (m.id === id ? { ...m, cvSummary: summary } : m)),
      );
    } catch (err) {
      console.error(err);
    }
  };

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
        <div className="flex items-center space-x-2">
          <label className="font-semibold">Résumé en</label>
          <input
            type="number"
            className="w-20 border p-1"
            value={summaryWords}
            onChange={(e) => setSummaryWords(Number(e.target.value))}
          />
          <span>mots</span>
        </div>
        <ul className="space-y-1">
          {members.map((member) => (
            <li key={member.id} className="space-y-2 rounded border p-2">
              <div className="flex items-center justify-between">
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
              </div>
              <div className="flex space-x-2">
                <input
                  type="number"
                  className="w-24 border p-1"
                  value={member.dailyRate ?? ""}
                  onChange={(e) =>
                    handleRateChange(member.id, Number(e.target.value))
                  }
                  placeholder="TJM €"
                />
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    handleFileChange(member.id, e.target.files?.[0])
                  }
                />
                <button
                  type="button"
                  onClick={() => handleSummarize(member.id)}
                  className="bg-green-500 px-2 text-white"
                >
                  Résumer
                </button>
              </div>
              {member.cvSummary && (
                <textarea
                  className="mt-2 w-full border p-2"
                  readOnly
                  value={member.cvSummary}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Groupement;
