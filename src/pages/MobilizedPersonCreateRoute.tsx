import { useParams, useNavigate } from "react-router-dom";
import { useProjectStore } from "../store/useProjectStore";
import MobilizedPersonCreate from "./MobilizedPersonCreate";

function MobilizedPersonCreateRoute() {
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const { currentProject, updateCurrentProject } = useProjectStore();
  const company = currentProject?.participatingCompanies?.find(
    (c) => c.slug === companySlug,
  );
  if (!company) return <div>Entreprise introuvable</div>;
  return (
    <MobilizedPersonCreate
      company={company}
      onClose={() => navigate(-1)}
      onSave={(person) => {
        const updated = {
          ...company,
          mobilizedPeople: [...(company.mobilizedPeople ?? []), person],
        };
        updateCurrentProject({
          participatingCompanies: currentProject?.participatingCompanies?.map(
            (c) => (c.id === company.id ? updated : c),
          ),
        });
        navigate(-1);
      }}
    />
  );
}

export default MobilizedPersonCreateRoute;
