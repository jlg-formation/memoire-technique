import { ArrowLeft, Check } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ButtonLink, ButtonPrimary, EditableTextArea } from "../components/ui";
import FileAIUpload from "../components/ui/FileAIUpload";
import { parseMobilizedPersonCV } from "../lib/mobilizedPersonCV";
import { useCurrentProject } from "../store/useCurrentProjectStore";
import type { MobilizedPerson, ParticipatingCompany } from "../types/project";

interface MobilizedPersonEditProps {
  person?: MobilizedPerson;
  company?: ParticipatingCompany;
  onSave?: (person: MobilizedPerson, shouldBeRepresentative?: boolean) => void;
}

interface CVParseResult {
  text: string;
  summary: string;
  name?: string;
}

// Type guard to validate CV parsing result
const isCVParseResult = (result: unknown): result is CVParseResult => {
  return (
    typeof result === "object" &&
    result !== null &&
    "text" in result &&
    "summary" in result &&
    typeof (result as CVParseResult).text === "string" &&
    typeof (result as CVParseResult).summary === "string"
  );
};
const validateRepresentativeId = (
  representativeId: string | undefined,
  mobilizedPeople: Array<{ id: string }>,
): string | undefined => {
  if (!representativeId) return undefined;

  // Prevent orphaned representative references
  const isValid = mobilizedPeople.some(
    (person) => person.id === representativeId,
  );

  return isValid ? representativeId : undefined;
};

function MobilizedPersonEdit({
  person: personProp,
  company: companyProp,
  onSave,
}: MobilizedPersonEditProps) {
  const { companySlug, personSlug } = useParams();
  const navigate = useNavigate();
  const { currentProject, updateCurrentProject } = useCurrentProject();

  const [personName, setPersonName] = useState("");
  const [dailyRate, setDailyRate] = useState(650);
  const [cvText, setCvText] = useState("");
  const [cvSummary, setCvSummary] = useState("");
  const [processing, setProcessing] = useState(false);
  const [shouldBeRepresentative, setShouldBeRepresentative] = useState(false);

  // Search for company/person in project data if not provided as props
  const company =
    companyProp ||
    currentProject?.participatingCompanies?.find((c) => c.slug === companySlug);
  const person =
    personProp || company?.mobilizedPeople?.find((p) => p.slug === personSlug);

  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleSave = useCallback(
    (updatedPerson: MobilizedPerson, shouldBeRepresentative?: boolean) => {
      try {
        if (onSave) {
          onSave(updatedPerson, shouldBeRepresentative);
          return;
        }

        if (!company || !person) return;

        const updatedPeople = (company.mobilizedPeople ?? []).map((p) =>
          p.id === person.id ? updatedPerson : p,
        );

        let representativeId = validateRepresentativeId(
          company.representativeId,
          updatedPeople,
        );

        if (shouldBeRepresentative) {
          representativeId = updatedPerson.id;
        }

        if (!representativeId && updatedPeople.length > 0) {
          // Fallback: assign first person as representative to avoid null state
          representativeId = updatedPeople[0].id;
        }

        const updatedCompany = {
          ...company,
          mobilizedPeople: updatedPeople,
          representativeId,
        };
        updateCurrentProject({
          participatingCompanies: currentProject?.participatingCompanies?.map(
            (c) => (c.id === company.id ? updatedCompany : c),
          ),
        });
        handleClose();
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de la personne:", error);
        throw error;
      }
    },
    [
      onSave,
      company,
      person,
      updateCurrentProject,
      currentProject,
      handleClose,
    ],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (!person) return;

        const updatedPerson: MobilizedPerson = {
          ...person,
          name: personName,
          dailyRate,
          cvText: cvText || undefined,
          cvSummary: cvSummary || undefined,
        };

        handleSave(updatedPerson, shouldBeRepresentative);
      } catch (error) {
        console.error("Erreur lors de la soumission du formulaire:", error);
        throw error;
      }
    },
    [
      person,
      personName,
      dailyRate,
      cvText,
      cvSummary,
      shouldBeRepresentative,
      handleSave,
    ],
  );

  const handleCVParse = useCallback(
    async (text: string): Promise<CVParseResult> => {
      try {
        setProcessing(true);
        const { summary, name } = await parseMobilizedPersonCV(text);
        return { text, summary, name };
      } catch (error) {
        console.error("Erreur lors du parsing du CV:", error);
        throw new Error("Impossible de traiter le CV. Veuillez réessayer.");
      }
    },
    [],
  );

  const handleCVResult = useCallback((result: unknown) => {
    try {
      if (!isCVParseResult(result)) {
        throw new Error("Résultat de parsing CV invalide");
      }

      setCvText(result.text);
      setCvSummary(result.summary);
      if (result.name) {
        setPersonName(result.name);
      }
    } catch (error) {
      console.error("Erreur lors du traitement du résultat:", error);
    } finally {
      setProcessing(false);
    }
  }, []);

  useEffect(() => {
    if (person) {
      setPersonName(person.name || "");
      setDailyRate(person.dailyRate || 650);
      setCvText(person.cvText || "");
      setCvSummary(person.cvSummary || "");
    }
  }, [person]);

  if (!company || !person) {
    throw new Error("Personne ou entreprise introuvable");
  }

  const isCurrentRepresentative = company.representativeId === person.id;

  return (
    <div className="min-h-screen space-y-6 p-2 sm:p-6">
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
          Éditer la personne mobilisée
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Modifiez les informations de la personne mobilisée
        </p>
      </div>

      <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
        <h3 className="mb-2 text-sm font-medium text-blue-900 sm:text-base">
          Télécharger un nouveau CV
        </h3>
        <p className="mb-3 text-xs text-blue-700 sm:text-sm">
          Importez un nouveau CV pour mettre à jour automatiquement les
          informations de la personne.
        </p>

        <div className="space-y-3">
          <FileAIUpload
            label="Joindre le CV de la personne"
            onParse={handleCVParse}
            onResult={handleCVResult}
            status=""
            setStatus={() => {}}
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-5"
        aria-disabled={processing}
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Nom et prénom de la personne *
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-base"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder="Saisissez le nom et prénom de la personne"
            disabled={processing}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Taux journalier HT (€) *
          </label>
          <input
            type="number"
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-base"
            value={dailyRate}
            onChange={(e) => setDailyRate(Number(e.target.value))}
            placeholder="650"
            required
            min="0"
            step="1"
          />
        </div>

        {cvSummary && (
          <EditableTextArea
            label="Résumé du CV"
            value={cvSummary}
            onChange={(value) => setCvSummary(value)}
            placeholder="Résumé du CV de la personne"
            disabled={processing}
            rows={6}
          />
        )}

        {!isCurrentRepresentative && (
          <div className="rounded-lg bg-green-50 p-4">
            <div className="flex items-center">
              <input
                id="representative-checkbox"
                type="checkbox"
                checked={shouldBeRepresentative}
                onChange={(e) => setShouldBeRepresentative(e.target.checked)}
                disabled={processing}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label
                htmlFor="representative-checkbox"
                className="ml-3 text-sm font-medium text-green-900"
              >
                Désigner cette personne comme représentant de l'entreprise
              </label>
            </div>
            <p className="mt-2 text-xs text-green-700">
              Le représentant de l'entreprise sera responsable de la
              coordination et sera affiché comme contact principal.
            </p>
          </div>
        )}

        {isCurrentRepresentative && (
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center">
              <div className="flex h-4 w-4 items-center justify-center rounded bg-blue-600">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="ml-3 text-sm font-medium text-blue-900">
                Cette personne est actuellement le représentant de l'entreprise
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 pb-4 sm:pb-0">
          <ButtonPrimary
            type="submit"
            disabled={processing || !personName.trim()}
            className="w-full px-6 py-3 sm:w-auto"
          >
            Mettre à jour la personne
          </ButtonPrimary>
        </div>
      </form>
    </div>
  );
}

export default MobilizedPersonEdit;
