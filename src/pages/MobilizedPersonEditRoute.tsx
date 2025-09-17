import { useParams, useNavigate } from "react-router-dom";
import { useProjectStore } from "../store/useProjectStore";
import MobilizedPersonEdit from "./MobilizedPersonEdit";

function MobilizedPersonEditRoute() {
  const { companySlug, personSlug } = useParams();
  const navigate = useNavigate();
  const { currentProject, updateCurrentProject } = useProjectStore();
  const company = currentProject?.participatingCompanies?.find(
    (c) => c.slug === companySlug,
  );
  const person = company?.mobilizedPeople?.find((p) => p.slug === personSlug);
  if (!company || !person) return <div>Personne ou entreprise introuvable</div>;
  return (
    <MobilizedPersonEdit
      person={person}
      onClose={() => navigate(-1)}
      onSave={(updatedPerson) => {
        const updatedPeople = (company.mobilizedPeople ?? []).map((p) =>
          p.id === person.id ? updatedPerson : p,
        );
        const updatedCompany = { ...company, mobilizedPeople: updatedPeople };
        updateCurrentProject({
          participatingCompanies: currentProject?.participatingCompanies?.map(
            (c) => (c.id === company.id ? updatedCompany : c),
          ),
        });
        navigate(-1);
      }}
    />
  );
}

export default MobilizedPersonEditRoute;
