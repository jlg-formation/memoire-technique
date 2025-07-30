import { useState } from "react";
import type { MobilizedPerson, ParticipatingCompany } from "../types/project";

interface MobilizedPeopleListProps {
  company: ParticipatingCompany;
  onFileChange: (companyId: string, personId: string, file?: File) => void;
  onSummarize: (companyId: string, personId: string) => void;
  onUpdate: (people: MobilizedPerson[]) => void;
}

function MobilizedPeopleList({
  company,
  onFileChange,
  onSummarize,
  onUpdate,
}: MobilizedPeopleListProps) {
  const [personName, setPersonName] = useState("");
  const [dailyRate, setDailyRate] = useState(0);
  const people = company.mobilizedPeople ?? [];

  const handleAdd = () => {
    if (!personName.trim()) return;
    const newPerson: MobilizedPerson = {
      id: crypto.randomUUID(),
      name: personName,
      dailyRate,
    };
    onUpdate([...people, newPerson]);
    setPersonName("");
    setDailyRate(0);
  };

  const handleDelete = (id: string) => {
    onUpdate(people.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-2 border-t pt-2">
      <label className="font-semibold">Personnes mobilisées</label>
      <div className="flex space-x-2">
        <input
          className="flex-1 border p-1"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          placeholder="Nom de la personne"
        />
        <input
          type="number"
          className="w-24 border p-1"
          value={dailyRate}
          onChange={(e) => setDailyRate(Number(e.target.value))}
          placeholder="Taux HT"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="cursor-pointer bg-blue-500 px-2 text-white"
        >
          Ajouter
        </button>
      </div>
      <ul className="space-y-1">
        {people.map((person) => (
          <li key={person.id} className="space-y-1 rounded border p-2">
            <div className="flex items-center justify-between">
              <span>{person.name}</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  className="w-24 border p-1"
                  value={person.dailyRate ?? 0}
                  onChange={(e) =>
                    onUpdate(
                      people.map((p) =>
                        p.id === person.id
                          ? { ...p, dailyRate: Number(e.target.value) }
                          : p,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() => handleDelete(person.id)}
                  className="cursor-pointer text-red-500"
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="flex space-x-2">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) =>
                  onFileChange(company.id, person.id, e.target.files?.[0])
                }
                className="rounded border border-gray-300 bg-gray-100 p-2"
              />
              <button
                type="button"
                onClick={() => onSummarize(company.id, person.id)}
                className="cursor-pointer bg-green-500 px-2 text-white"
              >
                Résumer
              </button>
            </div>
            {person.cvSummary && (
              <textarea
                className="mt-2 w-full border p-2"
                readOnly
                value={person.cvSummary}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MobilizedPeopleList;
