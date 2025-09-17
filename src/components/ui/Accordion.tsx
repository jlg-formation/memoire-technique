import React, { useState } from "react";

type AccordionProps = {
  title: React.ReactNode; // Updated to accept JSX elements
  children: React.ReactNode;
};

const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="rounded-lg border">
      <div
        className="flex cursor-pointer items-center justify-between bg-gray-100 p-2 font-bold"
        onClick={toggleAccordion}
      >
        {title}
        <span>{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && <div className="p-2">{children}</div>}
    </div>
  );
};

export default Accordion;
