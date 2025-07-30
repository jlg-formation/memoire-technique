import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { extractPdfText } from "../lib/pdf";
import { extractDocxText } from "../lib/docx";
import type { MarketDocument, MarketDocumentType } from "../types/project";

function MarketDocs() {
  const { currentProject, updateCurrentProject } = useProjectStore();
  const [docType, setDocType] = useState<MarketDocumentType>("RC");

  if (!currentProject) {
    return (
      <div className="p-4 text-red-500">Veuillez sélectionner un projet.</div>
    );
  }

  const docs = currentProject.marketDocuments ?? [];

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = file.name.toLowerCase().endsWith(".docx")
      ? await extractDocxText(file)
      : await extractPdfText(file);
    const doc: MarketDocument = {
      id: crypto.randomUUID(),
      name: file.name,
      type: docType,
      text,
    };
    updateCurrentProject({ marketDocuments: [...docs, doc] });
    setDocType("RC");
    e.target.value = "";
  };

  const handleDelete = (id: string): void => {
    updateCurrentProject({ marketDocuments: docs.filter((d) => d.id !== id) });
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Pièces de marché</h1>
      <div className="flex gap-2">
        <select
          className="border p-2"
          value={docType}
          onChange={(e) => setDocType(e.target.value as MarketDocumentType)}
        >
          <option value="RC">RC</option>
          <option value="CCTP">CCTP</option>
          <option value="CCAP">CCAP</option>
          <option value="AE">AE</option>
          <option value="AUTRE">Autre</option>
        </select>
        <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
      </div>
      <ul className="space-y-2">
        {docs.map((doc) => (
          <li key={doc.id} className="space-y-1 border p-2">
            <div className="flex justify-between">
              <div className="font-semibold">
                {doc.name} ({doc.type})
              </div>
              <button
                type="button"
                onClick={() => handleDelete(doc.id)}
                className="cursor-pointer text-red-500"
              >
                Supprimer
              </button>
            </div>
            <textarea className="w-full border p-2" readOnly value={doc.text} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MarketDocs;
