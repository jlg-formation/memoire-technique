import { NavLink } from "react-router";
import { memo } from "react";

interface NavItemProps {
  to: string;
  children: React.ReactNode;
  isEnd?: boolean;
}

export const NavItem = memo(function NavItem({
  to,
  children,
  isEnd = false,
}: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={isEnd}
      className={({ isActive }) =>
        `mb-2 cursor-pointer rounded px-2 py-1 ${
          isActive ? "bg-blue-500 text-white" : "text-blue-500"
        }`
      }
    >
      {children}
    </NavLink>
  );
});
