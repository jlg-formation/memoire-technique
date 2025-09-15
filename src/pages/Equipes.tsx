import { Trash2 } from "lucide-react";
import { useState } from "react";
import MobilizedPeopleList from "../components/MobilizedPeopleList";
import { ButtonLink, ButtonPrimary } from "../components/ui";
import FileAIUpload from "../components/ui/FileAIUpload";
import { summarize } from "../lib/OpenAI";
import { extractCompanyName } from "../lib/strings/extractCompanyName";
import { useProjectStore } from "../store/useProjectStore";
import type { ParticipatingCompany } from "../types/project";

function Equipes() {
  const { currentProject, updateCurrentProject } = useProjectStore();
  const [summaryWords, setSummaryWords] = useState(100);
  const [subcontractorName, setSubcontractorName] = useState("");
  const [subcontractors, setSubcontractors] = useState<ParticipatingCompany[]>(
    [],
  );

  const companies: ParticipatingCompany[] =
    currentProject?.participatingCompanies ?? [];

  const updateCompanies = (newCompanies: ParticipatingCompany[]) => {
    updateCurrentProject({ participatingCompanies: newCompanies });
  };

  const handleDeleteCompany = (id: string) => {
    updateCurrentProject({
      participatingCompanies: companies.filter((c) => c.id !== id),
      mandataireId:
        currentProject && currentProject.mandataireId === id
          ? undefined
          : currentProject?.mandataireId,
      mandataireContactId:
        currentProject && currentProject.mandataireId === id
          ? undefined
          : currentProject?.mandataireContactId,
    });
  };

  return (
    <div className="min-h-screen space-y-6 p-2 sm:p-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-xl font-semibold text-gray-800 sm:text-2xl">
          Equipes
        </h1>
      </div>

      {/* Type d'équipe Section */}
      <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
        <label className="mb-2 block text-sm font-medium text-gray-700 sm:text-base">
          Type d'équipe
        </label>
        <select
          className="w-full cursor-pointer rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-base"
          value={currentProject?.groupType ?? ""}
          onChange={(e) => {
            updateCurrentProject({
              groupType: e.target.value as "solidaire" | "conjoint" | "seule",
            });
            setSubcontractors([]);
          }}
        >
          <option value="">-- choisir --</option>
          <option value="seule">Entreprise seule</option>
          <option value="solidaire">Solidaire</option>
          <option value="conjoint">Conjoint</option>
        </select>
      </div>

      {/* Entreprises participantes Section */}
      <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-blue-900 sm:text-base">
            {currentProject?.groupType === "seule"
              ? "Entreprise principale"
              : "Entreprises participantes"}
          </label>
          <FileAIUpload
            label="Joindre le fichier de présentation de l'entreprise"
            accept=".pdf,.docx,.md,.txt"
            onParse={async (text) => {
              const summary = await summarize(text, summaryWords);
              return { text, summary };
            }}
            onResult={(result) => {
              // Cast result to expected shape
              const { text, summary } = result as {
                text: string;
                summary: string;
              };
              const name = extractCompanyName(summary);
              const newCompany: ParticipatingCompany = {
                id: crypto.randomUUID(),
                name,
                presentationText: text,
                presentationSummary: summary,
              };
              if (currentProject?.groupType === "seule") {
                // Remplace l'entreprise principale
                updateCurrentProject({
                  participatingCompanies: [newCompany],
                });
              } else {
                // Ajoute à la liste
                updateCurrentProject({
                  participatingCompanies: [...companies, newCompany],
                });
              }
            }}
            parseLabel="Analyse du contenu avec l'IA..."
            className="mb-4"
          />

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium text-blue-800 sm:text-base">
              Résumé en
            </label>
            <input
              type="number"
              className="w-20 rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              value={summaryWords}
              onChange={(e) => setSummaryWords(Number(e.target.value))}
            />
            <span className="text-sm text-blue-700 sm:text-base">mots</span>
          </div>

          {/* Mandataire uniquement si groupement */}
          {companies.length > 1 &&
            currentProject?.groupType !== undefined &&
            currentProject?.groupType !== "seule" && (
              <p className="text-sm font-medium text-blue-900 sm:text-base">
                Sélectionnez le mandataire
              </p>
            )}
          <ul className="space-y-4">
            {companies.map((company) => (
              <li
                key={company.id}
                className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  {companies.length > 1 &&
                    currentProject?.groupType !== undefined &&
                    currentProject?.groupType !== "seule" && (
                      <input
                        type="radio"
                        name="mandataire"
                        checked={currentProject?.mandataireId === company.id}
                        onChange={() => {
                          // Sélection du mandataire
                          updateCurrentProject({
                            mandataireId: company.id,
                            mandataireContactId: undefined,
                          });
                        }}
                        className="h-4 w-4 cursor-pointer text-blue-600 focus:ring-blue-500"
                      />
                    )}
                  <input
                    type="text"
                    className="w-full rounded border px-2 py-1 text-sm font-medium text-gray-900 sm:text-base"
                    value={company.name}
                    onChange={(e) => {
                      updateCompanies(
                        companies.map((c) =>
                          c.id === company.id
                            ? { ...c, name: e.target.value }
                            : c,
                        ),
                      );
                    }}
                  />
                  <ButtonLink
                    type="button"
                    onClick={() => handleDeleteCompany(company.id)}
                    className="rounded p-1 text-red-500 hover:bg-red-50"
                    aria-label="Supprimer l'entreprise"
                  >
                    <Trash2 className="h-5 w-5" />
                  </ButtonLink>
                </div>

                {/* Présentation de l'entreprise : désormais gérée par FileAIUpload, résumé éditable */}
                {company.presentationSummary && (
                  <div className="space-y-3 rounded-md bg-gray-50 p-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Présentation de l'entreprise
                    </label>
                    <textarea
                      className="mt-2 w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      value={company.presentationSummary}
                      rows={4}
                      onChange={(e) => {
                        updateCompanies(
                          companies.map((c) =>
                            c.id === company.id
                              ? { ...c, presentationSummary: e.target.value }
                              : c,
                          ),
                        );
                      }}
                    />
                  </div>
                )}

                {/* Moyens matériels */}
                <div className="space-y-3 rounded-md bg-gray-50 p-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Moyens matériels
                  </label>
                  <FileAIUpload
                    label="Joindre le fichier des moyens matériels"
                    accept=".pdf,.docx,.md,.txt"
                    parseLabel="Analyse du contenu avec l'IA..."
                    onParse={async (text) => {
                      // On peut résumer ou juste stocker le texte
                      return { text };
                    }}
                    onResult={(result) => {
                      const { text } = result as { text: string };
                      updateCompanies(
                        companies.map((c) =>
                          c.id === company.id
                            ? { ...c, equipmentText: text }
                            : c,
                        ),
                      );
                    }}
                    className="mb-2"
                  />
                  {company.equipmentText && (
                    <textarea
                      className="mt-2 w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      readOnly
                      value={company.equipmentText}
                      rows={4}
                    />
                  )}
                </div>

                <MobilizedPeopleList
                  company={company}
                  onUpdate={(updated) => {
                    if (
                      currentProject?.mandataireId === company.id &&
                      !updated.some(
                        (p) => p.id === currentProject?.mandataireContactId,
                      )
                    ) {
                      updateCurrentProject({ mandataireContactId: undefined });
                    }
                    updateCompanies(
                      companies.map((c) =>
                        c.id === company.id
                          ? { ...c, mobilizedPeople: updated }
                          : c,
                      ),
                    );
                  }}
                />

                {currentProject?.mandataireId === company.id &&
                  currentProject?.groupType !== undefined &&
                  currentProject?.groupType !== "seule" && (
                    <div className="space-y-3 rounded-md bg-blue-50 p-3">
                      <label className="block text-sm font-medium text-blue-900">
                        Personne responsable
                      </label>
                      <select
                        className="w-full cursor-pointer rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-base"
                        value={currentProject?.mandataireContactId ?? ""}
                        onChange={(e) =>
                          updateCurrentProject({
                            mandataireContactId: e.target.value || undefined,
                          })
                        }
                      >
                        <option value="">-- choisir --</option>
                        {(company.mobilizedPeople ?? []).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
              </li>
            ))}
          </ul>

          {/* Sous-traitants si entreprise seule */}
          {currentProject?.groupType === "seule" && companies.length === 1 && (
            <div className="mt-6 rounded-lg bg-gray-100 p-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sous-traitants
              </label>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <input
                  className="flex-1 rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-base"
                  value={subcontractorName}
                  onChange={(e) => setSubcontractorName(e.target.value)}
                  placeholder="Nom du sous-traitant"
                />
                <ButtonPrimary
                  type="button"
                  onClick={() => {
                    if (!subcontractorName.trim()) return;
                    setSubcontractors([
                      ...subcontractors,
                      { id: crypto.randomUUID(), name: subcontractorName },
                    ]);
                    setSubcontractorName("");
                  }}
                  className="text-sm sm:text-base"
                >
                  Ajouter
                </ButtonPrimary>
              </div>
              <ul className="space-y-2">
                {subcontractors.map((sc) => (
                  <li
                    key={sc.id}
                    className="flex items-center justify-between rounded border bg-white p-2"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {sc.name}
                    </span>
                    <ButtonLink
                      type="button"
                      onClick={() =>
                        setSubcontractors(
                          subcontractors.filter((s) => s.id !== sc.id),
                        )
                      }
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Supprimer
                    </ButtonLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Equipes;
