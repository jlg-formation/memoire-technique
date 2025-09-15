import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Users } from "lucide-react";
import { ButtonLink, ButtonPrimary } from "../components/ui";
import FileAIUpload from "../components/ui/FileAIUpload";
import { summarize } from "../lib/OpenAI";
import { extractCompanyName } from "../lib/strings/extractCompanyName";
import { useProjectStore } from "../store/useProjectStore";
import { executeDeleteAction } from "../lib/critical-actions";
import type { ParticipatingCompany, MobilizedPerson } from "../types/project";
import MobilizedPersonCreate from "./MobilizedPersonCreate";
import MobilizedPersonEdit from "./MobilizedPersonEdit";

interface CompanyEditProps {
  company: ParticipatingCompany;
  onClose: () => void;
}

function CompanyEdit({ company, onClose }: CompanyEditProps) {
  const { currentProject, updateCurrentProject } = useProjectStore();

  const [companyName, setCompanyName] = useState("");
  const [presentationSummary, setPresentationSummary] = useState("");
  const [equipmentText, setEquipmentText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [summaryWords, setSummaryWords] = useState(100);
  const [isMandataire, setIsMandataire] = useState(false);

  // États pour la gestion des personnes mobilisées
  const [currentView, setCurrentView] = useState<
    "edit" | "person-create" | "person-edit"
  >("edit");
  const [selectedPerson, setSelectedPerson] = useState<MobilizedPerson | null>(
    null,
  );

  const companies: ParticipatingCompany[] =
    currentProject?.participatingCompanies ?? [];

  // Récupérer l'entreprise actuelle depuis le store pour avoir les données à jour
  const currentCompany = companies.find((c) => c.id === company.id) || company;

  // Initialiser les champs avec les données de l'entreprise
  useEffect(() => {
    setCompanyName(company.name || "");
    setPresentationSummary(company.presentationSummary || "");
    setEquipmentText(company.equipmentText || "");
    setIsMandataire(currentProject?.mandataireId === company.id);
  }, [company, currentProject]);

  // Fonctions de gestion des personnes mobilisées
  const handleCreatePerson = () => {
    setCurrentView("person-create");
  };

  const handleEditPerson = (person: MobilizedPerson) => {
    setSelectedPerson(person);
    setCurrentView("person-edit");
  };

  const handleSavePerson = (person: MobilizedPerson) => {
    const currentPeople = currentCompany.mobilizedPeople || [];
    const existingIndex = currentPeople.findIndex((p) => p.id === person.id);

    let updatedPeople: MobilizedPerson[];
    if (existingIndex >= 0) {
      // Modification d'une personne existante
      updatedPeople = currentPeople.map((p) =>
        p.id === person.id ? person : p,
      );
    } else {
      // Ajout d'une nouvelle personne
      updatedPeople = [...currentPeople, person];
    }

    const updatedCompany = {
      ...currentCompany,
      mobilizedPeople: updatedPeople,
    };
    const updatedCompanies = companies.map((c) =>
      c.id === company.id ? updatedCompany : c,
    );

    updateCurrentProject({ participatingCompanies: updatedCompanies });
    setCurrentView("edit");
  };

  const handleDeletePerson = (personId: string) => {
    const person = currentCompany.mobilizedPeople?.find(
      (p) => p.id === personId,
    );
    const personName = person?.name || "cette personne";

    executeDeleteAction(() => {
      const updatedPeople = (currentCompany.mobilizedPeople || []).filter(
        (p) => p.id !== personId,
      );
      const updatedCompany = {
        ...currentCompany,
        mobilizedPeople: updatedPeople,
      };
      const updatedCompanies = companies.map((c) =>
        c.id === company.id ? updatedCompany : c,
      );

      updateCurrentProject({ participatingCompanies: updatedCompanies });
    }, personName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCompany: ParticipatingCompany = {
      ...company,
      name: companyName,
      presentationSummary,
      equipmentText,
    };

    const updatedCompanies = companies.map((c) =>
      c.id === company.id ? updatedCompany : c,
    );

    const updatedProject: Partial<typeof currentProject> = {
      participatingCompanies: updatedCompanies,
    };

    // Gestion du mandataire pour les groupements
    if (currentProject?.groupType && currentProject.groupType !== "seule") {
      if (isMandataire) {
        // Cette entreprise devient mandataire
        Object.assign(updatedProject, {
          mandataireId: company.id,
          ...(currentProject.mandataireId !== company.id && {
            mandataireContactId: undefined,
          }),
        });
      } else if (currentProject.mandataireId === company.id) {
        // Cette entreprise n'est plus mandataire
        Object.assign(updatedProject, {
          mandataireId: undefined,
          mandataireContactId: undefined,
        });
      }
    }

    updateCurrentProject(updatedProject);
    onClose();
  };

  return (
    <>
      {currentView === "person-create" && (
        <MobilizedPersonCreate
          onClose={() => setCurrentView("edit")}
          onSave={handleSavePerson}
        />
      )}

      {currentView === "person-edit" && selectedPerson && (
        <MobilizedPersonEdit
          person={selectedPerson}
          onClose={() => setCurrentView("edit")}
          onSave={handleSavePerson}
        />
      )}

      {currentView === "edit" && (
        <div className="min-h-screen space-y-6 p-2 sm:p-6">
          {/* Header */}
          <div className="border-b pb-4">
            <div className="mb-2 flex items-center gap-3">
              <ButtonLink
                onClick={onClose}
                className="flex shrink-0 items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Précédent</span>
              </ButtonLink>
            </div>
            <h1 className="text-xl font-semibold text-gray-800 sm:text-2xl">
              Éditer l'entreprise
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Modifiez les informations de l'entreprise
            </p>
          </div>

          {/* Upload Section */}
          <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
            <h3 className="mb-2 text-sm font-medium text-blue-900 sm:text-base">
              Télécharger un nouveau fichier de présentation
            </h3>
            <p className="mb-3 text-xs text-blue-700 sm:text-sm">
              Importez un nouveau fichier de présentation pour mettre à jour
              automatiquement les informations de l'entreprise.
            </p>

            <div className="space-y-3">
              <FileAIUpload
                label="Joindre le fichier de présentation de l'entreprise"
                accept=".pdf,.docx,.md,.txt"
                parseLabel="Analyse du contenu avec l'IA..."
                onParse={async (text) => {
                  setProcessing(true);
                  const summary = await summarize(text, summaryWords);
                  return { text, summary };
                }}
                onResult={(result) => {
                  const { summary } = result as {
                    summary: string;
                  };
                  const name = extractCompanyName(summary);
                  setCompanyName(name);
                  setPresentationSummary(summary);
                  setProcessing(false);
                }}
                status={analysisStep}
                setStatus={setAnalysisStep}
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
                  disabled={processing}
                />
                <span className="text-sm text-blue-700 sm:text-base">mots</span>
              </div>
            </div>
          </div>

          {/* Equipment Upload Section */}
          <div className="rounded-lg bg-green-50 p-3 sm:p-4">
            <h3 className="mb-2 text-sm font-medium text-green-900 sm:text-base">
              Télécharger un nouveau fichier de matériel
            </h3>
            <p className="mb-3 text-xs text-green-700 sm:text-sm">
              Importez un nouveau fichier décrivant le matériel et les
              équipements de l'entreprise (optionnel).
            </p>

            <div className="space-y-3">
              <FileAIUpload
                label="Joindre le fichier de matériel de l'entreprise"
                accept=".pdf,.docx,.md,.txt"
                parseLabel="Lecture du fichier de matériel..."
                onParse={async (text) => {
                  return { text };
                }}
                onResult={(result) => {
                  const { text } = result as { text: string };
                  setEquipmentText(text);
                }}
                status=""
                setStatus={() => {}}
              />
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-5"
            aria-disabled={processing}
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nom de l'entreprise
              </label>
              <input
                className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-base"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Saisissez le nom de l'entreprise"
                disabled={processing}
                required
              />
            </div>

            {/* Checkbox Mandataire - uniquement pour les groupements */}
            {currentProject?.groupType &&
              currentProject.groupType !== "seule" && (
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="mandataire-edit"
                      checked={isMandataire}
                      onChange={(e) => setIsMandataire(e.target.checked)}
                      disabled={processing}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="mandataire-edit"
                      className="text-sm font-medium text-blue-900 sm:text-base"
                    >
                      Cette entreprise est le mandataire du groupement
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-blue-700 sm:text-sm">
                    Le mandataire est l'entreprise responsable de la
                    coordination du groupement et des relations avec le maître
                    d'ouvrage.
                  </p>
                </div>
              )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Résumé de présentation
              </label>
              <textarea
                className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-base"
                value={presentationSummary}
                onChange={(e) => setPresentationSummary(e.target.value)}
                placeholder="Résumé de la présentation"
                disabled={processing}
                rows={5}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description du matériel
              </label>
              <textarea
                className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-base"
                value={equipmentText}
                onChange={(e) => setEquipmentText(e.target.value)}
                placeholder="Description du matériel et des équipements de l'entreprise"
                disabled={processing}
                rows={8}
              />
            </div>

            <div className="flex justify-end pt-4 pb-4 sm:pb-0">
              <ButtonPrimary
                type="submit"
                disabled={processing}
                className="w-full px-6 py-3 sm:w-auto"
              >
                Mettre à jour l'entreprise
              </ButtonPrimary>
            </div>
          </form>

          {/* Section Personnes mobilisées */}
          <div className="space-y-6 border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Personnes mobilisées
                </h2>
              </div>
              <ButtonPrimary
                onClick={handleCreatePerson}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter une personne mobilisée
              </ButtonPrimary>
            </div>

            {/* Liste des personnes mobilisées */}
            {!currentCompany.mobilizedPeople ||
            currentCompany.mobilizedPeople.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Aucune personne mobilisée
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Commencez par ajouter une personne à mobiliser pour cette
                  entreprise.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {currentCompany.mobilizedPeople.map((person) => (
                  <div
                    key={person.id}
                    className="flex cursor-pointer flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
                    onClick={() => handleEditPerson(person)}
                  >
                    <div className="flex-1">
                      <h3 className="mb-2 font-semibold text-gray-900">
                        {person.name}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>Taux journalier:</span>
                          <span className="font-medium">
                            {person.dailyRate
                              ? `${person.dailyRate}€ HT`
                              : "Non défini"}
                          </span>
                        </div>
                        {person.cvSummary && (
                          <p className="mt-2 line-clamp-3 text-xs">
                            {person.cvSummary}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end border-t border-gray-100 pt-3">
                      <ButtonLink
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePerson(person.id);
                        }}
                        className="rounded p-1 text-red-500 hover:bg-red-50"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </ButtonLink>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default CompanyEdit;
