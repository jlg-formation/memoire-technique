/**
 * Utilities for extracting text content from various file formats
 */

/**
 * Extracts text content from a file based on its extension
 * Supports .docx and .pdf files
 *
 * @param file - The file to extract text from
 * @returns Promise that resolves to the extracted text content
 * @throws Error if the file format is not supported or extraction fails
 */
export async function extractTextFromFile(file: File): Promise<string> {
  if (file.name.toLowerCase().endsWith(".docx")) {
    const { extractDocxText } = await import("./docx");
    return await extractDocxText(file);
  }

  if (file.name.toLowerCase().endsWith(".pdf")) {
    const { extractPdfText } = await import("./pdf");
    return await extractPdfText(file);
  }

  throw new Error(`Format de fichier non supporté: ${file.name}`);
}

/**
 * Checks if a file is supported for text extraction
 *
 * @param fileName - The name of the file to check
 * @returns true if the file format is supported
 */
export function isSupportedFileFormat(fileName: string): boolean {
  const lowerName = fileName.toLowerCase();
  return lowerName.endsWith(".docx") || lowerName.endsWith(".pdf");
}
