import { memo } from "react";
import { NavItem } from "../ui/NavItem";

export const PublicMenu = memo(function PublicMenu() {
  return (
    <>
      <NavItem to="/" isEnd>
        Accueil
      </NavItem>
      <NavItem to="/parametres">Paramètres</NavItem>
    </>
  );
});
