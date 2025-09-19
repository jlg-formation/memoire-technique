import { useParams, useNavigate } from "react-router-dom";
import { useCurrentProject } from "../store/useCurrentProjectStore";
import MobilizedPersonEdit from "./MobilizedPersonEdit";

function MobilizedPersonEditRoute() {
  const { companySlug, personSlug } = useParams();
  const navigate = useNavigate();
  const { currentProject, updateCurrentProject } = useCurrentProject();
  const company = currentProject.participatingCompanies?.find(
    (c) => c.slug === companySlug,
  );
  const person = company?.mobilizedPeople?.find((p) => p.slug === personSlug);
  if (!company || !person) return <div>Personne ou entreprise introuvable</div>;

  // Fonction utilitaire pour valider le representativeId
  const validateRepresentativeId = (
    representativeId: string | undefined,
    mobilizedPeople: Array<{ id: string }>,
  ): string | undefined => {
    if (!representativeId) return undefined;

    // Vérifier si le representativeId correspond à une personne mobilisée de l'entreprise
    const isValid = mobilizedPeople.some(
      (person) => person.id === representativeId,
    );

    return isValid ? representativeId : undefined;
  };

  return (
    <MobilizedPersonEdit
      person={person}
      company={company}
      onClose={() => navigate(-1)}
      onSave={(updatedPerson, shouldBeRepresentative) => {
        const updatedPeople = (company.mobilizedPeople ?? []).map((p) =>
          p.id === person.id ? updatedPerson : p,
        );

        // Valider le representativeId existant et l'effacer s'il n'est pas valide
        let representativeId = validateRepresentativeId(
          company.representativeId,
          updatedPeople,
        );

        // Gérer la désignation explicite comme représentant
        if (shouldBeRepresentative) {
          representativeId = updatedPerson.id;
        } else if (!representativeId && updatedPeople.length > 0) {
          // S'il n'y a pas de représentant valide et qu'il y a des personnes mobilisées, assigner la première
          representativeId = updatedPeople[0].id;
        }

        const updatedCompany = {
          ...company,
          mobilizedPeople: updatedPeople,
          representativeId,
        };
        updateCurrentProject({
          participatingCompanies: currentProject.participatingCompanies?.map(
            (c) => (c.id === company.id ? updatedCompany : c),
          ),
        });
        navigate(-1);
      }}
    />
  );
}

export default MobilizedPersonEditRoute;
