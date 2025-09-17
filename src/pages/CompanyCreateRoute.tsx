import { useNavigate } from "react-router-dom";
import { useProjectStore } from "../store/useProjectStore";
import CompanyCreate from "./CompanyCreate";

function CompanyCreateRoute() {
  const navigate = useNavigate();
  const { updateCurrentProject } = useProjectStore();
  return (
    <CompanyCreate
      onClose={() => navigate(-1)}
      // Si besoin, on peut passer updateCurrentProject en prop
    />
  );
}

export default CompanyCreateRoute;
