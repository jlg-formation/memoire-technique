// Expose for FileAIUpload
if (typeof window !== "undefined") {
  // @ts-expect-error: Expose for FileAIUpload usage
  window.extractPdfText = extractPdfText;
}
import * as pdfjsLib from "pdfjs-dist";
import type {
  TextItem,
  TextMarkedContent,
} from "pdfjs-dist/types/src/display/api";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/memoire-technique/pdf.worker.mjs";

/**
 * Lit le texte d'un fichier PDF dans le navigateur
 */
export async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = (content.items as Array<TextItem | TextMarkedContent>)
      .filter((item): item is TextItem => "str" in item)
      .map((item) => item.str);
    text += strings.join(" ") + "\n";
  }

  return text.trim();
}
