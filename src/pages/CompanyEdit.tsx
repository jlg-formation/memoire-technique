import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Users, Trash2 } from "lucide-react";
import { ButtonLink, ButtonPrimary, EditableTextArea } from "../components/ui";
import FileAIUpload from "../components/ui/FileAIUpload";
import { summarize } from "../lib/OpenAI";
import { extractCompanyName } from "../lib/strings/extractCompanyName";
import { useCurrentProject } from "../store/useCurrentProjectStore";
import { executeDeleteAction } from "../lib/critical-actions";
import { uniqueSlug } from "../lib/strings/slugify";
import type { ParticipatingCompany, MobilizedPerson } from "../types/project";

function CompanyEdit() {
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const { currentProject, updateCurrentProject } = useCurrentProject();

  const [companyName, setCompanyName] = useState("");
  const [presentationSummary, setPresentationSummary] = useState("");
  const [equipmentText, setEquipmentText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [summaryWords, setSummaryWords] = useState(100);
  // Suppression de la gestion du mandataire ici

  // États pour la gestion des personnes mobilisées - simplifiés
  // Note: La gestion des vues multiples est déplacée vers le routing

  // Chercher l'entreprise via les params d'URL
  const company = currentProject?.participatingCompanies?.find(
    (c) => c.slug === companySlug,
  );

  // Initialiser les champs avec les données de l'entreprise
  useEffect(() => {
    if (company) {
      setCompanyName(company.name || "");
      setPresentationSummary(company.presentationSummary || "");
      setEquipmentText(company.equipmentText || "");
    }
    // La gestion du mandataire est déplacée dans Equipes.tsx
  }, [company, currentProject]);

  if (!company) return <div>Entreprise introuvable</div>;

  const handleClose = () => {
    navigate(-1);
  };

  const companies: ParticipatingCompany[] =
    currentProject?.participatingCompanies ?? [];

  // Récupérer l'entreprise actuelle depuis le store pour avoir les données à jour
  const currentCompany = companies.find((c) => c.id === company.id) || company;

  // Fonction utilitaire pour valider le representativeId
  const validateRepresentativeId = (
    representativeId: string | undefined,
    mobilizedPeople: MobilizedPerson[],
  ): string | undefined => {
    if (!representativeId) return undefined;

    // Vérifier si le representativeId correspond à une personne mobilisée de l'entreprise
    const isValid = mobilizedPeople.some(
      (person) => person.id === representativeId,
    );

    return isValid ? representativeId : undefined;
  };

  // Fonctions de gestion des personnes mobilisées
  const handleCreatePerson = () => {
    navigate(`/equipes/entreprise/${company.slug}/personne/ajouter`);
  };

  const handleEditPerson = (person: MobilizedPerson) => {
    navigate(
      `/equipes/entreprise/${company.slug}/personne/${person.slug}/edit`,
    );
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

      // Valider le representativeId et l'effacer s'il correspond à la personne supprimée ou s'il n'est pas valide
      let representativeId = validateRepresentativeId(
        currentCompany.representativeId,
        updatedPeople,
      );

      // Si pas de représentant valide et qu'il reste des personnes, assigner la première
      if (!representativeId && updatedPeople.length > 0) {
        representativeId = updatedPeople[0].id;
      }

      const updatedCompany = {
        ...currentCompany,
        mobilizedPeople: updatedPeople,
        representativeId,
      };
      const updatedCompanies = companies.map((c) =>
        c.id === company.id ? updatedCompany : c,
      );

      updateCurrentProject({ participatingCompanies: updatedCompanies });
    }, personName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Générer un slug unique à partir du nom modifié
    const otherSlugs = companies
      .filter((c) => c.id !== company.id)
      .map((c) => c.slug ?? "");
    const newSlug = uniqueSlug(companyName, otherSlugs);
    const updatedCompany = {
      ...currentCompany,
      name: companyName,
      slug: newSlug,
      presentationSummary,
      equipmentText,
    };
    const updatedCompanies = companies.map((c) =>
      c.id === company.id ? updatedCompany : c,
    );
    updateCurrentProject({ participatingCompanies: updatedCompanies });
    handleClose();
  };

  return (
    <div className="min-h-screen space-y-6 p-2 sm:p-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="mb-2 flex items-center gap-3">
          <ButtonLink
            onClick={handleClose}
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
        <div className="space-y-3">
          <FileAIUpload
            label="Présentation"
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
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nom de l'entreprise
            </label>
            <input
              className="w-full rounded-md border border-gray-300 bg-white p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-base"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Saisissez le nom de l'entreprise"
              disabled={processing}
              required
            />
          </div>

          <EditableTextArea
            label="Résumé de présentation"
            value={presentationSummary}
            onChange={(value) => setPresentationSummary(value)}
            placeholder="Résumé de la présentation"
            disabled={processing}
            rows={5}
          />
        </div>
      </div>

      {/* Equipment Upload Section */}
      <div className="rounded-lg bg-green-50 p-3 sm:p-4">
        <div className="space-y-3">
          <FileAIUpload
            label="Matériel"
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
          <EditableTextArea
            label="Description du matériel"
            value={equipmentText}
            onChange={(value) => setEquipmentText(value)}
            placeholder="Description du matériel et des équipements de l'entreprise"
            disabled={processing}
            rows={8}
          />
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-5"
        aria-disabled={processing}
      >
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
                    <Trash2 className="h-4 w-4" />
                  </ButtonLink>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyEdit;
