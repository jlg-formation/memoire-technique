import { useNavigate } from "react-router-dom";
import CompanyCreate from "./CompanyCreate";

function CompanyCreateRoute() {
  const navigate = useNavigate();
  return (
    <CompanyCreate
      onClose={() => navigate(-1)}
      // Si besoin, on peut passer updateCurrentProject en prop
    />
  );
}

export default CompanyCreateRoute;
