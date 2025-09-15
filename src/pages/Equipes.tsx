import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import type { ParticipatingCompany } from "../types/project";
import { summarize } from "../lib/OpenAI";
import { extractPdfText } from "../lib/pdf";
import { extractDocxText } from "../lib/docx";
import { useOpenAIKeyStore } from "../store/useOpenAIKeyStore";
import MobilizedPeopleList from "../components/MobilizedPeopleList";
import { ButtonPrimary, AccentButton, ButtonLink } from "../components/ui";

function Equipes() {
  const { currentProject, updateCurrentProject } = useProjectStore();
  const { apiKey } = useOpenAIKeyStore();
  const [name, setName] = useState("");
  const [summaryWords, setSummaryWords] = useState(100);
  const [presentationFiles, setPresentationFiles] = useState<
    Record<string, File | undefined>
  >({});
  const [cvFiles, setCvFiles] = useState<Record<string, File | undefined>>({});

  // Ajout de l'état pour les sous-traitants si entreprise seule (déclaré une seule fois, avant tout return)
  const [subcontractorName, setSubcontractorName] = useState("");
  const [subcontractors, setSubcontractors] = useState<ParticipatingCompany[]>(
    [],
  );

  if (!currentProject) {
    return (
      <div className="p-4 text-red-500">Veuillez sélectionner un projet.</div>
    );
  }

  const companies = currentProject.participatingCompanies ?? [];

  const updateCompanies = (updated: ParticipatingCompany[]) => {
    updateCurrentProject({ participatingCompanies: updated });
  };

  const handlePresentationChange = async (
    id: string,
    file?: File,
  ): Promise<void> => {
    if (!file) {
      setPresentationFiles((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      return;
    }
    setPresentationFiles((prev) => ({ ...prev, [id]: file }));
    updateCompanies(
      companies.map((c) =>
        c.id === id
          ? {
              ...c,
              presentationText: undefined,
              presentationSummary: undefined,
            }
          : c,
      ),
    );
  };

  const handlePersonFileChange = async (
    companyId: string,
    personId: string,
    file?: File,
  ): Promise<void> => {
    if (!file) {
      setCvFiles((prev) => {
        const key = `${companyId}-${personId}`;
        const copy = { ...prev } as Record<string, File | undefined>;
        delete copy[key];
        return copy;
      });
      return;
    }
    setCvFiles((prev) => ({ ...prev, [`${companyId}-${personId}`]: file }));
    updateCompanies(
      companies.map((c) =>
        c.id === companyId
          ? {
              ...c,
              mobilizedPeople: (c.mobilizedPeople ?? []).map((p) =>
                p.id === personId
                  ? {
                      ...p,
                      cvText: undefined,
                      cvSummary: undefined,
                    }
                  : p,
              ),
            }
          : c,
      ),
    );
  };

  const handleSummarizePresentation = async (
    companyId: string,
  ): Promise<void> => {
    const file = presentationFiles[companyId];
    if (!file) return;
    const key = apiKey || import.meta.env.VITE_OPENAI_KEY;
    if (!key) {
      alert("Veuillez saisir votre clé OpenAI dans les paramètres.");
      return;
    }
    try {
      const text = file.name.toLowerCase().endsWith(".docx")
        ? await extractDocxText(file)
        : await extractPdfText(file);
      const summary = await summarize(text, summaryWords, key);
      updateCompanies(
        companies.map((c) =>
          c.id === companyId
            ? { ...c, presentationText: text, presentationSummary: summary }
            : c,
        ),
      );
      setPresentationFiles((prev) => {
        const copy = { ...prev };
        delete copy[companyId];
        return copy;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSummarizePerson = async (
    companyId: string,
    personId: string,
  ): Promise<void> => {
    const keyRef = `${companyId}-${personId}`;
    const file = cvFiles[keyRef];
    if (!file) return;
    const key = apiKey || import.meta.env.VITE_OPENAI_KEY;
    if (!key) {
      alert("Veuillez saisir votre clé OpenAI dans les paramètres.");
      return;
    }
    try {
      const text = file.name.toLowerCase().endsWith(".docx")
        ? await extractDocxText(file)
        : await extractPdfText(file);
      const summary = await summarize(text, summaryWords, key);
      updateCompanies(
        companies.map((c) =>
          c.id === companyId
            ? {
                ...c,
                mobilizedPeople: (c.mobilizedPeople ?? []).map((p) =>
                  p.id === personId
                    ? { ...p, cvText: text, cvSummary: summary }
                    : p,
                ),
              }
            : c,
        ),
      );
      setCvFiles((prev) => {
        const copy = { ...prev } as Record<string, File | undefined>;
        delete copy[keyRef];
        return copy;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEquipmentChange = async (
    id: string,
    file?: File,
  ): Promise<void> => {
    if (!file) {
      updateCompanies(
        companies.map((c) =>
          c.id === id ? { ...c, equipmentText: undefined } : c,
        ),
      );
      return;
    }
    const text = file.name.toLowerCase().endsWith(".docx")
      ? await extractDocxText(file)
      : await extractPdfText(file);
    updateCompanies(
      companies.map((c) => (c.id === id ? { ...c, equipmentText: text } : c)),
    );
  };

  const handleAddCompany = () => {
    if (!name.trim()) return;
    const newCompany: ParticipatingCompany = { id: crypto.randomUUID(), name };
    updateCurrentProject({
      participatingCompanies: [...companies, newCompany],
    });
    setName("");
  };

  const handleDeleteCompany = (id: string) => {
    updateCurrentProject({
      participatingCompanies: companies.filter((c) => c.id !== id),
      mandataireId:
        currentProject.mandataireId === id
          ? undefined
          : currentProject.mandataireId,
      mandataireContactId:
        currentProject.mandataireId === id
          ? undefined
          : currentProject.mandataireContactId,
    });
  };

  const handleMandataire = (id: string) => {
    const mandataire = companies.find((c) => c.id === id);
    const people = mandataire?.mobilizedPeople ?? [];
    const contactId = people.some(
      (p) => p.id === currentProject.mandataireContactId,
    )
      ? currentProject.mandataireContactId
      : undefined;
    updateCurrentProject({ mandataireId: id, mandataireContactId: contactId });
  };

  // ...existing code...

  // Ajout d'une option "seule" dans le select
  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6">
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
          value={currentProject.groupType ?? ""}
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
            {currentProject.groupType === "seule"
              ? "Entreprise principale"
              : "Entreprises participantes"}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="flex-1 rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-base"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                currentProject.groupType === "seule"
                  ? "Nom de l'entreprise principale"
                  : "Nom de l'entreprise"
              }
            />
            <ButtonPrimary
              type="button"
              onClick={handleAddCompany}
              className="text-sm sm:text-base"
            >
              Ajouter
            </ButtonPrimary>
          </div>

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
            currentProject.groupType !== undefined &&
            currentProject.groupType !== "seule" && (
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
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-3">
                    {companies.length > 1 &&
                      currentProject.groupType !== undefined &&
                      currentProject.groupType !== "seule" && (
                        <input
                          type="radio"
                          name="mandataire"
                          checked={currentProject.mandataireId === company.id}
                          onChange={() => handleMandataire(company.id)}
                          className="h-4 w-4 cursor-pointer text-blue-600 focus:ring-blue-500"
                        />
                      )}
                    <span className="text-sm font-medium text-gray-900 sm:text-base">
                      {company.name}
                    </span>
                  </label>
                  <ButtonLink
                    type="button"
                    onClick={() => handleDeleteCompany(company.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Supprimer
                  </ButtonLink>
                </div>

                {/* Présentation de l'entreprise */}
                <div className="space-y-3 rounded-md bg-gray-50 p-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Présentation de l'entreprise
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={(e) =>
                        handlePresentationChange(
                          company.id,
                          e.target.files?.[0],
                        )
                      }
                      className="flex-1 cursor-pointer rounded-md border border-gray-300 bg-white p-2 text-sm file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white"
                    />
                    <AccentButton
                      type="button"
                      onClick={() => handleSummarizePresentation(company.id)}
                      className="text-sm"
                    >
                      Résumer
                    </AccentButton>
                  </div>
                  {company.presentationSummary && (
                    <textarea
                      className="mt-2 w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      readOnly
                      value={company.presentationSummary}
                      rows={4}
                    />
                  )}
                </div>

                {/* Moyens matériels */}
                <div className="space-y-3 rounded-md bg-gray-50 p-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Moyens matériels
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) =>
                      handleEquipmentChange(company.id, e.target.files?.[0])
                    }
                    className="w-full cursor-pointer rounded-md border border-gray-300 bg-white p-2 text-sm file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white"
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
                  onFileChange={handlePersonFileChange}
                  onSummarize={handleSummarizePerson}
                  onUpdate={(updated) => {
                    if (
                      currentProject.mandataireId === company.id &&
                      !updated.some(
                        (p) => p.id === currentProject.mandataireContactId,
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

                {currentProject.mandataireId === company.id &&
                  currentProject.groupType !== undefined &&
                  currentProject.groupType !== "seule" && (
                    <div className="space-y-3 rounded-md bg-blue-50 p-3">
                      <label className="block text-sm font-medium text-blue-900">
                        Personne responsable
                      </label>
                      <select
                        className="w-full cursor-pointer rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-base"
                        value={currentProject.mandataireContactId ?? ""}
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
          {currentProject.groupType === "seule" && companies.length === 1 && (
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
