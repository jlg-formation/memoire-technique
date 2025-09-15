import { useState } from "react";
import type { MobilizedPerson, ParticipatingCompany } from "../types/project";
import { summarize } from "../lib/OpenAI";
import FileAIUpload from "./ui/FileAIUpload";
import { ButtonPrimary, ButtonLink } from "./ui";
import { Trash2 } from "lucide-react";

interface MobilizedPeopleListProps {
  company: ParticipatingCompany;
  onUpdate: (people: MobilizedPerson[]) => void;
}

function MobilizedPeopleList({ company, onUpdate }: MobilizedPeopleListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [dailyRate, setDailyRate] = useState(650);
  const people = company.mobilizedPeople ?? [];

  const handleAdd = () => {
    setShowAddForm(true);
  };

  const handleAddFromCV = (result: unknown) => {
    const { text, summary, name } = result as {
      text: string;
      summary: string;
      name?: string;
    };
    const newPerson: MobilizedPerson = {
      id: crypto.randomUUID(),
      name: name || "Nom à définir",
      dailyRate,
      cvText: text,
      cvSummary: summary,
    };
    onUpdate([...people, newPerson]);
    setShowAddForm(false);
    setDailyRate(650);
  };

  const handleDelete = (id: string) => {
    onUpdate(people.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-lg font-semibold text-gray-800">
        Personnes mobilisées
      </h3>

      {/* Formulaire d'ajout */}
      {!showAddForm ? (
        <div className="rounded-lg bg-blue-50 p-4">
          <ButtonPrimary type="button" onClick={handleAdd} className="w-full">
            Ajout d'une personne
          </ButtonPrimary>
        </div>
      ) : (
        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="mb-3 text-sm font-medium text-blue-900">
            Ajouter une personne
          </h4>
          <div className="space-y-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                CV de la personne
              </label>
              <FileAIUpload
                accept=".pdf,.docx,.md,.txt"
                parseLabel="Analyse du CV avec l'IA..."
                onParse={async (text) => {
                  const summary = await summarize(text, 150);
                  // Extraire le nom depuis le résumé (première ligne souvent)
                  const firstLine = summary.split("\n")[0];
                  const nameMatch = firstLine.match(
                    /^([A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ][a-zàâäéèêëïîôöùûüç]+ [A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ][a-zàâäéèêëïîôöùûüç]+)/,
                  );
                  const name = nameMatch ? nameMatch[1] : undefined;
                  return { text, summary, name };
                }}
                onResult={handleAddFromCV}
                className="w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Taux journalier HT (€)
              </label>
              <input
                type="number"
                className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                placeholder="650"
              />
            </div>
            <ButtonLink
              type="button"
              onClick={() => setShowAddForm(false)}
              className="w-full text-center"
            >
              Annuler
            </ButtonLink>
          </div>
        </div>
      )}

      {/* Liste des personnes */}
      {people.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Personnes ajoutées ({people.length})
          </h4>
          <ul className="space-y-4">
            {people.map((person) => (
              <li
                key={person.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="space-y-4">
                  {/* En-tête avec nom et actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Nom de la personne
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        value={person.name}
                        onChange={(e) =>
                          onUpdate(
                            people.map((p) =>
                              p.id === person.id
                                ? { ...p, name: e.target.value }
                                : p,
                            ),
                          )
                        }
                      />
                    </div>
                    <ButtonLink
                      type="button"
                      onClick={() => handleDelete(person.id)}
                      className="ml-4 rounded p-1 text-red-500 hover:bg-red-50"
                      aria-label="Supprimer la personne"
                    >
                      <Trash2 className="h-5 w-5" />
                    </ButtonLink>
                  </div>

                  {/* Taux journalier */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Taux journalier HT (€)
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
                      placeholder="0"
                    />
                  </div>

                  {/* CV Upload */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      CV de la personne
                    </label>
                    <FileAIUpload
                      accept=".pdf,.docx,.md,.txt"
                      parseLabel="Analyse du CV avec l'IA..."
                      onParse={async (text) => {
                        const summary = await summarize(text, 150);
                        return { text, summary };
                      }}
                      onResult={(result) => {
                        const { text, summary } = result as {
                          text: string;
                          summary: string;
                        };
                        onUpdate(
                          people.map((p) =>
                            p.id === person.id
                              ? { ...p, cvText: text, cvSummary: summary }
                              : p,
                          ),
                        );
                      }}
                      className="w-full"
                    />
                  </div>

                  {/* Résumé du CV */}
                  {person.cvSummary && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Résumé du CV
                      </label>
                      <textarea
                        className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        value={person.cvSummary}
                        onChange={(e) =>
                          onUpdate(
                            people.map((p) =>
                              p.id === person.id
                                ? { ...p, cvSummary: e.target.value }
                                : p,
                            ),
                          )
                        }
                        rows={4}
                        placeholder="Résumé du CV..."
                      />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MobilizedPeopleList;
