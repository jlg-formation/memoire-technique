import { useState } from "react";
import { useCurrentProject } from "../store/useCurrentProjectStore";
import { executeDeleteAction } from "../lib/critical-actions";
import type { ParticipatingCompany, MobilizedPerson } from "../types/project";
import CompanyCreate from "./CompanyCreate";
import CompanyEdit from "./CompanyEdit";
import MobilizedPersonCreate from "./MobilizedPersonCreate";
import MobilizedPersonEdit from "./MobilizedPersonEdit";
import { ButtonPrimary, ButtonLink, Select } from "../components/ui";
import { Plus, Building2, Trash2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Equipes() {
  const navigate = useNavigate();
  const { currentProject, updateCurrentProject } = useCurrentProject();

  const [currentView, setCurrentView] = useState<
    "list" | "create" | "edit" | "person-create" | "person-edit"
  >("list");
  const [editingCompany, setEditingCompany] =
    useState<ParticipatingCompany | null>(null);
  const [selectedCompany, setSelectedCompany] =
    useState<ParticipatingCompany | null>(null);
  const [editingPerson, setEditingPerson] = useState<MobilizedPerson | null>(
    null,
  );

  const companies: ParticipatingCompany[] =
    currentProject?.participatingCompanies ?? [];

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

  const handleDeleteCompany = (id: string, companyName: string) => {
    executeDeleteAction(() => {
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
    }, companyName);
  };

  const handleCloseEdit = (): void => {
    setEditingCompany(null);
    setCurrentView("list");
  };

  const handleDeletePerson = (
    company: ParticipatingCompany,
    personId: string,
    personName: string,
  ): void => {
    executeDeleteAction(() => {
      const updatedPeople = (company.mobilizedPeople ?? []).filter(
        (p) => p.id !== personId,
      );

      // Valider le representativeId et l'effacer s'il correspond à la personne supprimée ou s'il n'est pas valide
      let representativeId = validateRepresentativeId(
        company.representativeId,
        updatedPeople,
      );

      // Si pas de représentant valide et qu'il reste des personnes, assigner la première
      if (!representativeId && updatedPeople.length > 0) {
        representativeId = updatedPeople[0].id;
      }

      const updatedCompanies = companies.map((c) =>
        c.id === company.id
          ? { ...c, mobilizedPeople: updatedPeople, representativeId }
          : c,
      );
      updateCurrentProject({ participatingCompanies: updatedCompanies });
    }, `la personne ${personName}`);
  };

  const handleSavePerson = (
    person: MobilizedPerson,
    shouldBeRepresentative?: boolean,
  ): void => {
    if (!selectedCompany) return;

    const existingPeople = selectedCompany.mobilizedPeople ?? [];
    let updatedPeople: MobilizedPerson[];

    if (currentView === "person-edit" && editingPerson) {
      // Mise à jour d'une personne existante
      updatedPeople = existingPeople.map((p) =>
        p.id === editingPerson.id ? person : p,
      );
    } else {
      // Ajout d'une nouvelle personne
      updatedPeople = [...existingPeople, person];
    }

    // Valider le representativeId existant et l'effacer s'il n'est pas valide
    let representativeId = validateRepresentativeId(
      selectedCompany.representativeId,
      updatedPeople,
    );

    // Gérer la désignation explicite comme représentant
    if (shouldBeRepresentative) {
      representativeId = person.id;
    } else if (!representativeId && updatedPeople.length > 0) {
      // S'il n'y a pas de représentant valide et qu'il y a des personnes mobilisées, assigner la première ou la nouvelle
      representativeId =
        currentView === "person-edit" && editingPerson ? person.id : person.id;
    }

    const updatedCompanies = companies.map((c) =>
      c.id === selectedCompany.id
        ? { ...c, mobilizedPeople: updatedPeople, representativeId }
        : c,
    );

    updateCurrentProject({ participatingCompanies: updatedCompanies });
    setSelectedCompany(null);
    setEditingPerson(null);
    setCurrentView("list");
  };

  const handleClosePerson = (): void => {
    setSelectedCompany(null);
    setEditingPerson(null);
    setCurrentView("list");
  };

  if (currentView === "create") {
    return <CompanyCreate onClose={() => setCurrentView("list")} />;
  }

  if (currentView === "edit" && editingCompany) {
    return <CompanyEdit company={editingCompany} onClose={handleCloseEdit} />;
  }

  if (currentView === "person-create" && selectedCompany) {
    return (
      <MobilizedPersonCreate
        company={selectedCompany}
        onClose={handleClosePerson}
        onSave={handleSavePerson}
      />
    );
  }

  if (currentView === "person-edit" && selectedCompany && editingPerson) {
    return (
      <MobilizedPersonEdit
        person={editingPerson}
        company={selectedCompany}
        onClose={handleClosePerson}
        onSave={handleSavePerson}
      />
    );
  }

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-800">Équipes</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Type d'équipe Section */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <Select
            label="Type d'équipe"
            placeholder="-- choisir --"
            options={[
              { value: "seule", label: "Entreprise seule" },
              { value: "solidaire", label: "Groupement Solidaire" },
              { value: "conjoint", label: "Groupement Conjoint" },
            ]}
            value={currentProject?.groupType ?? ""}
            onChange={(e) => {
              updateCurrentProject({
                groupType: e.target.value as "solidaire" | "conjoint" | "seule",
              });
            }}
            className="text-sm sm:text-base"
          />
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <ButtonPrimary
            onClick={() => navigate("/equipes/entreprise/create")}
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nouvelle entreprise
          </ButtonPrimary>
        </div>

        {/* Entreprises List */}
        {companies.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-24 w-24 text-gray-400">
              <Building2 className="h-full w-full" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Aucune entreprise
            </h3>
            <p className="mb-4 text-gray-500">
              Ajoutez votre première entreprise pour commencer.
            </p>
            <ButtonPrimary
              onClick={() => navigate("/equipes/entreprise/create")}
              className="inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvelle entreprise
            </ButtonPrimary>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <div
                key={company.id}
                className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
              >
                {/* Partie haute cliquable pour édition */}
                <div
                  className="-m-2 flex-1 cursor-pointer rounded-md p-2 transition-colors hover:bg-gray-50"
                  onClick={() =>
                    navigate(`/equipes/entreprise/${company.slug}/edit`)
                  }
                >
                  <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">
                    {company.name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    {currentProject?.mandataireId === company.id && (
                      <div className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        Mandataire
                      </div>
                    )}
                  </div>
                  {company.presentationSummary && (
                    <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                      {company.presentationSummary}
                    </p>
                  )}
                </div>

                {/* Section Personnes mobilisées */}
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">
                      Personnes mobilisées
                    </h4>
                    <ButtonLink
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/equipes/entreprise/${company.slug}/personne/ajouter`,
                        );
                      }}
                      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                    >
                      <UserPlus className="h-3 w-3" />
                      Ajouter
                    </ButtonLink>
                  </div>

                  {/* Liste des personnes */}
                  {company.mobilizedPeople &&
                  company.mobilizedPeople.length > 0 ? (
                    <div className="space-y-2">
                      {company.mobilizedPeople.map((person) => (
                        <div
                          key={person.id}
                          className={`flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors ${
                            company.representativeId === person.id
                              ? "bg-green-100 hover:bg-green-200"
                              : "bg-gray-50 hover:bg-gray-100"
                          }`}
                          onClick={() =>
                            navigate(
                              `/equipes/entreprise/${company.slug}/personne/${person.slug}/edit`,
                            )
                          }
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-gray-900">
                              {person.name}
                            </p>
                            {person.dailyRate && (
                              <p className="text-xs text-gray-500">
                                {person.dailyRate}€/jour
                              </p>
                            )}
                          </div>
                          <div className="ml-2">
                            <ButtonLink
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePerson(
                                  company,
                                  person.id,
                                  person.name,
                                );
                              }}
                              className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </ButtonLink>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">
                      Aucune personne mobilisée
                    </p>
                  )}
                </div>

                {/* Actions entreprise - seule la suppression */}
                <div className="mt-3 flex items-center justify-end border-t border-gray-100 pt-3">
                  <ButtonLink
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCompany(company.id, company.name);
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

        {/* Mandataire Selection - Only for groupments */}
        {companies.length > 1 &&
          currentProject?.groupType !== undefined &&
          currentProject?.groupType !== "seule" && (
            <div className="mt-6 rounded-lg bg-blue-50 p-4">
              <h3 className="mb-3 text-sm font-medium text-blue-900">
                Sélection du mandataire
              </h3>
              <p className="mb-3 text-xs text-blue-700">
                Pour un groupement, vous devez désigner une entreprise
                mandataire qui sera responsable de la coordination.
              </p>
              <Select
                label=""
                placeholder="-- Sélectionnez le mandataire --"
                options={companies.map((company) => ({
                  value: company.id,
                  label: company.name,
                }))}
                value={currentProject?.mandataireId ?? ""}
                onChange={(e) => {
                  updateCurrentProject({
                    mandataireId: e.target.value,
                    mandataireContactId: undefined,
                  });
                }}
                className="text-sm"
              />
            </div>
          )}
      </div>
    </div>
  );
}

export default Equipes;
