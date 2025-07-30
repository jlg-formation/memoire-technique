export async function extractDocxText(file: File): Promise<string> {
  console.warn(
    "DOCX extraction not implemented due to missing dependencies",
    file.name,
  );
  return "";
}
