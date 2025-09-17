import { useParams, useNavigate } from "react-router-dom";
import { useProjectStore } from "../store/useProjectStore";
import CompanyEdit from "./CompanyEdit";

function CompanyEditRoute() {
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const { currentProject } = useProjectStore();
  const company = currentProject?.participatingCompanies?.find(
    (c) => c.slug === companySlug,
  );
  if (!company) return <div>Entreprise introuvable</div>;
  return <CompanyEdit company={company} onClose={() => navigate(-1)} />;
}

export default CompanyEditRoute;
