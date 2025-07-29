export async function extractPdfText(file: File): Promise<string> {
  // pdf.js integration is not available in this environment.
  // Fallback to simple text extraction.
  return file.text();
}
