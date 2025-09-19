import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

type AccordionProps = {
  title: React.ReactNode; // Updated to accept JSX elements
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "tertiary";
  defaultOpen?: boolean;
};

const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  variant = "primary",
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          container: "rounded-lg border border-slate-200 shadow-sm bg-white",
          header:
            "bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 hover:from-blue-100 hover:to-indigo-100",
          content: "bg-white",
        };
      case "secondary":
        return {
          container: "rounded-md border border-slate-150 bg-white",
          header:
            "bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-100 hover:from-slate-100 hover:to-gray-100",
          content: "bg-slate-25",
        };
      case "tertiary":
        return {
          container: "rounded border border-slate-100 bg-white",
          header:
            "bg-gradient-to-r from-amber-25 to-orange-25 border-b border-amber-100 hover:from-amber-50 hover:to-orange-50",
          content: "bg-white",
        };
      default:
        return {
          container: "rounded-lg border border-slate-200 shadow-sm bg-white",
          header:
            "bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 hover:from-blue-100 hover:to-indigo-100",
          content: "bg-white",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={styles.container}>
      <div
        className={`flex cursor-pointer items-center justify-between p-2 font-semibold text-slate-700 transition-all duration-200 sm:p-4 ${styles.header} ${isOpen ? "rounded-t-lg" : "rounded-lg"}`}
        onClick={toggleAccordion}
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-slate-500 transition-transform duration-200 sm:h-5 sm:w-5 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      {isOpen && (
        <div
          className={`p-2 transition-all duration-200 sm:p-4 ${styles.content} rounded-b-lg`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;
